<script setup>
import { ref, watch, nextTick, computed, onMounted } from "vue";
import { useFinanceStore } from "@/store/finance";
import feather from "feather-icons";

const financeStore = useFinanceStore();
const showForm = ref(false);
const editingTxId = ref(null);

// Fungsi untuk mendapatkan waktu saat ini dalam format HH:MM
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
};

const initialFormState = {
  date: new Date().toISOString().slice(0, 10),
  time: getCurrentTime(), // Tambahkan waktu saat ini
  category: "",
  amount: null,
  type: "Pengeluaran",
  notes: "",
};
const formTx = ref({ ...initialFormState });
const formattedAmount = ref("");
const newCategoryName = ref("");

const expenseCategories = [
  "Makanan",
  "Jajan",
  "Transportasi",
  "Tagihan",
  "Hiburan",
  "Belanja",
  "Pendidikan",
  "Kesehatan",
  "Tabungan Target",
  "Lainnya",
];
const incomeCategories = [
  "Gaji",
  "Jajan",
  "Bonus",
  "Freelance",
  "Investasi",
  "Hadiah",
  "Lainnya",
];
const currentCategories = computed(() => {
  return formTx.value.type === "Pemasukan"
    ? incomeCategories
    : expenseCategories;
});

const showNewCategoryInput = computed(() => {
  return formTx.value.category === "Lainnya";
});

const resetForm = () => {
  editingTxId.value = null;
  formTx.value = { ...initialFormState, time: getCurrentTime() };
  formattedAmount.value = "";
  newCategoryName.value = "";
  showForm.value = false;
};

const handleAddNew = () => {
  resetForm();
  showForm.value = true;
};

const startEdit = (tx) => {
  const txDate = new Date(tx.transaction_at);
  formTx.value = {
    ...tx,
    date: txDate.toISOString().slice(0, 10),
    time: txDate.toTimeString().slice(0, 5),
  };

  formattedAmount.value = new Intl.NumberFormat("id-ID").format(tx.amount);
  editingTxId.value = tx.id;
  const standardCategories =
    tx.type === "Pemasukan" ? incomeCategories : expenseCategories;
  if (!standardCategories.includes(tx.category)) {
    formTx.value.category = "Lainnya";
    newCategoryName.value = tx.category;
  } else {
    newCategoryName.value = "";
  }
  showForm.value = true;
};

watch(
  () => formTx.value.type,
  (newType, oldType) => {
    if (newType !== oldType) {
      formTx.value.category = "";
      newCategoryName.value = "";
    }
  }
);

watch(formattedAmount, (newValue) => {
  if (!newValue) {
    formTx.value.amount = null;
    return;
  }
  const numericValue = parseInt(newValue.replace(/\D/g, ""), 10);
  if (!isNaN(numericValue)) {
    formTx.value.amount = numericValue;
    const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
    if (formattedAmount.value !== formatted) formattedAmount.value = formatted;
  } else {
    formTx.value.amount = null;
  }
});

const handleSubmit = async () => {
  const dataToSave = { ...formTx.value };
  if (dataToSave.category === "Lainnya") {
    if (!newCategoryName.value.trim()) {
      alert("Nama kategori baru tidak boleh kosong.");
      return;
    }
    dataToSave.category = newCategoryName.value.trim();
  }

  // Gabungkan tanggal dan waktu menjadi satu timestamp ISO
  const combinedDateTime = new Date(`${dataToSave.date}T${dataToSave.time}`);
  dataToSave.transaction_at = combinedDateTime.toISOString();

  // Hapus properti date dan time yang terpisah
  delete dataToSave.date;
  delete dataToSave.time;

  try {
    if (editingTxId.value) {
      await financeStore.updateTransaction(editingTxId.value, dataToSave);
    } else {
      await financeStore.addTransaction(dataToSave);
    }
    resetForm();
  } catch (e) {
    alert(e.message);
  }
};

const handleDelete = async (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
    try {
      await financeStore.deleteTransaction(id);
    } catch (e) {
      alert(e.message);
    }
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
watch(
  () => financeStore.transactions,
  () => nextTick(() => feather.replace()),
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Transaksi</h1>
      <button class="button button-primary" @click="handleAddNew">
        <i data-feather="plus" style="margin-right: 8px; width: 18px"></i>
        Tambah Transaksi
      </button>
    </div>

    <div v-if="showForm" class="card form-card fade-in">
      <form @submit.prevent="handleSubmit">
        <h3 class="form-title">
          {{ editingTxId ? "Edit Transaksi" : "Transaksi Baru" }}
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Jenis</label
            ><select v-model="formTx.type" class="form-select">
              <option>Pengeluaran</option>
              <option>Pemasukan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah (Rp)</label
            ><input
              v-model="formattedAmount"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              class="form-input text-right"
            />
          </div>
          <div class="form-group">
            <label>Kategori</label
            ><select v-model="formTx.category" class="form-select" required>
              <option disabled value="">Pilih Kategori</option>
              <option v-for="cat in currentCategories" :key="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div v-if="showNewCategoryInput" class="form-group fade-in">
            <label>Nama Kategori Baru</label
            ><input
              v-model="newCategoryName"
              type="text"
              placeholder="Contoh: Donasi"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label>Tanggal</label
            ><input
              v-model="formTx.date"
              type="date"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Waktu</label
            ><input
              v-model="formTx.time"
              type="time"
              required
              class="form-input"
            />
          </div>
          <div class="form-group full-width">
            <label>Catatan (Opsional)</label
            ><textarea
              v-model="formTx.notes"
              class="form-textarea"
              rows="2"
            ></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="button button-secondary"
            @click="resetForm"
          >
            Batal
          </button>
          <button type="submit" class="button button-primary">
            {{ editingTxId ? "Perbarui" : "Simpan" }}
          </button>
        </div>
      </form>
    </div>

    <div class="card table-container">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Kategori</th>
            <th>Keterangan</th>
            <th class="text-right">Jumlah</th>
            <th class="action-header">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="financeStore.loading">
            <td colspan="5" class="state-cell">Memuat...</td>
          </tr>
          <tr v-else-if="financeStore.transactions.length === 0">
            <td colspan="5" class="state-cell">Belum ada transaksi.</td>
          </tr>
          <tr v-for="tx in financeStore.transactions" :key="tx.id">
            <td>{{ formatDateTime(tx.transaction_at) }}</td>
            <td>{{ tx.category }}</td>
            <td class="notes-cell">{{ tx.notes }}</td>
            <td
              class="text-right"
              :class="tx.type === 'Pemasukan' ? 'green' : 'red'"
            >
              {{ tx.type === "Pemasukan" ? "+" : "-" }}
              {{ formatCurrency(tx.amount) }}
            </td>
            <td class="action-cell">
              <div class="action-buttons-wrapper">
                <button
                  class="action-btn edit-btn"
                  @click="startEdit(tx)"
                  title="Edit"
                >
                  <i data-feather="edit-2"></i>
                </button>
                <button
                  class="action-btn delete-btn"
                  @click="handleDelete(tx.id)"
                  title="Hapus"
                >
                  <i data-feather="trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in {
  animation: fadeIn 0.3s ease-out;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
}
.form-card {
  margin-bottom: 24px;
}
.form-title {
  font-size: 18px;
  margin-bottom: 24px;
  font-weight: 600;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.table-container {
  overflow-x: auto;
}
.transaction-table {
  width: 100%;
  border-collapse: collapse;
}
.transaction-table th,
.transaction-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  vertical-align: middle;
}
.transaction-table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
}
.transaction-table tbody tr:last-child td {
  border-bottom: none;
}
.notes-cell {
  white-space: normal;
  max-width: 300px;
}
.state-cell {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
.text-right {
  text-align: right;
}
.green {
  color: var(--accent-green);
  font-weight: 600;
}
.red {
  color: var(--accent-red);
  font-weight: 600;
}
.action-header {
  text-align: center;
  width: 120px;
}
.action-cell {
  text-align: center;
}
.action-buttons-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
  padding: 6px;
  border-radius: 50%;
}
.action-btn:hover {
  background-color: #f3f4f6;
}
.edit-btn:hover {
  color: var(--primary-color);
}
.delete-btn:hover {
  color: var(--accent-red);
}
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
}
</style>
