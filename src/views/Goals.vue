<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { useFinanceStore } from "@/store/finance";
import { getGoalSuggestion } from "@/services/aiAssistant.js";
import feather from "feather-icons";

const financeStore = useFinanceStore();

// State untuk form Tambah/Edit Target
const showForm = ref(false);
const editingGoalId = ref(null);
const initialFormState = {
  name: "",
  target_amount: null,
  current_amount: 0,
  target_date: null,
};
const formGoal = ref({ ...initialFormState });
const formattedTargetAmount = ref("");
const formattedCurrentAmount = ref("");

// State untuk modal "Tambah Dana"
const showAddFundsModal = ref(false);
const selectedGoal = ref(null);
const amountToAdd = ref(null);
const formattedAmountToAdd = ref("");

// State untuk Modal Asisten AI
const showAiModal = ref(false);
const aiSuggestionFrequency = ref("weekly"); // 'daily', 'weekly', 'monthly'

// Computed property untuk menghitung rekomendasi AI secara reaktif
const aiAnalysisResult = computed(() => {
  if (!showAiModal.value || !selectedGoal.value) {
    return null;
  }
  return getGoalSuggestion(
    {
      targetAmount: selectedGoal.value.target_amount,
      currentAmount: selectedGoal.value.current_amount,
      targetDate: selectedGoal.value.target_date,
      monthlyIncome: financeStore.currentMonthCashFlow.income,
      monthlyExpense: financeStore.currentMonthCashFlow.expense,
    },
    aiSuggestionFrequency.value
  );
});

// --- FUNGSI-FUNGSI UTAMA ---

// Membersihkan form Tambah/Edit Target
const resetForm = () => {
  editingGoalId.value = null;
  formGoal.value = { ...initialFormState };
  formattedTargetAmount.value = "";
  formattedCurrentAmount.value = "";
  showForm.value = false;
};

// Menampilkan form untuk target baru
const handleAddNew = () => {
  resetForm();
  showForm.value = true;
};

// Menampilkan form dan mengisinya dengan data untuk diedit
const startEdit = (goal) => {
  formGoal.value = { ...goal };
  formattedTargetAmount.value = new Intl.NumberFormat("id-ID").format(
    goal.target_amount
  );
  formattedCurrentAmount.value = new Intl.NumberFormat("id-ID").format(
    goal.current_amount
  );
  editingGoalId.value = goal.id;
  showForm.value = true;
};

// Membuka modal "Tambah Dana"
const openAddFundsModal = (goal) => {
  selectedGoal.value = goal;
  amountToAdd.value = null;
  formattedAmountToAdd.value = "";
  showAddFundsModal.value = true;
};

// Menangani submit penambahan dana dari modal
const handleAddFunds = async () => {
  if (!selectedGoal.value || !amountToAdd.value) return;
  try {
    await financeStore.addFundsToGoal(selectedGoal.value.id, amountToAdd.value);
    showAddFundsModal.value = false;
  } catch (e) {
    alert(e.message);
  }
};

// Menangani submit form Tambah/Edit Target
const handleSubmit = async () => {
  try {
    if (editingGoalId.value) {
      await financeStore.updateGoal(editingGoalId.value, formGoal.value);
    } else {
      await financeStore.addGoal(formGoal.value);
    }
    resetForm();
  } catch (e) {
    alert(e.message);
  }
};

// Menangani penghapusan target
const handleDelete = async (id) => {
  if (confirm("Yakin ingin menghapus target ini?")) {
    try {
      await financeStore.deleteGoal(id);
    } catch (e) {
      alert(e.message);
    }
  }
};

// Fungsi untuk membuka modal AI
const openAiAssistant = (goal) => {
  selectedGoal.value = goal;
  aiSuggestionFrequency.value = "weekly"; // Reset ke default saat membuka
  showAiModal.value = true;
};

// Fungsi untuk menerapkan saran AI
const applyAiSuggestion = () => {
  if (aiAnalysisResult.value && aiAnalysisResult.value.suggestion > 0) {
    openAddFundsModal(selectedGoal.value);
    formattedAmountToAdd.value = new Intl.NumberFormat("id-ID").format(
      aiAnalysisResult.value.suggestion
    );
    showAiModal.value = false;
  }
};

// --- WATCHERS UNTUK FORMAT ANGKA REAL-TIME ---
watch(formattedTargetAmount, (newValue) => {
  if (!newValue) {
    formGoal.value.target_amount = null;
    return;
  }
  const numericValue = parseInt(newValue.replace(/\D/g, ""), 10);
  if (!isNaN(numericValue)) {
    formGoal.value.target_amount = numericValue;
    const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
    if (formattedTargetAmount.value !== formatted)
      formattedTargetAmount.value = formatted;
  } else {
    formGoal.value.target_amount = null;
  }
});

watch(formattedCurrentAmount, (newValue) => {
  if (!newValue) {
    formGoal.value.current_amount = 0;
    return;
  }
  const numericValue = parseInt(newValue.replace(/\D/g, ""), 10);
  if (!isNaN(numericValue)) {
    formGoal.value.current_amount = numericValue;
    const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
    if (formattedCurrentAmount.value !== formatted)
      formattedCurrentAmount.value = formatted;
  } else {
    formGoal.value.current_amount = 0;
  }
});

watch(formattedAmountToAdd, (newValue) => {
  if (!newValue) {
    amountToAdd.value = null;
    return;
  }
  const numericValue = parseInt(newValue.replace(/\D/g, ""), 10);
  if (!isNaN(numericValue)) {
    amountToAdd.value = numericValue;
    const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
    if (formattedAmountToAdd.value !== formatted) {
      formattedAmountToAdd.value = formatted;
    }
  } else {
    amountToAdd.value = null;
  }
});

// --- FUNGSI BANTU & LIFECYCLE HOOK ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const calculateDaysRemaining = (targetDate) => {
  if (!targetDate) return null;
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return "Terlewat";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} hari lagi`;
};

watch(
  () => [financeStore.goals, showAiModal.value, showForm.value],
  () => {
    nextTick(() => {
      feather.replace();
    });
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Target</h1>
      <button class="button button-primary" @click="handleAddNew">
        <i data-feather="plus" style="margin-right: 8px; width: 18px"></i>
        Tambah Target
      </button>
    </div>

    <div v-if="showForm" class="card form-card fade-in">
      <form @submit.prevent="handleSubmit">
        <h3 class="form-title">
          {{ editingGoalId ? "Edit Target" : "Target Baru" }}
        </h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Nama Target</label>
            <input
              v-model="formGoal.name"
              type="text"
              placeholder="Contoh: Dana Darurat"
              required
              class="form-input"
            />
          </div>
          <div v-if="editingGoalId" class="form-group">
            <label>Dana Saat Ini (Rp)</label>
            <input
              v-model="formattedCurrentAmount"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              class="form-input text-right"
            />
          </div>
          <div class="form-group">
            <label>Jumlah Target (Rp)</label>
            <input
              v-model="formattedTargetAmount"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              class="form-input text-right"
            />
          </div>
          <div class="form-group">
            <label>Tanggal Tercapai</label>
            <input
              v-model="formGoal.target_date"
              type="date"
              class="form-input"
            />
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
            {{ editingGoalId ? "Perbarui" : "Simpan" }}
          </button>
        </div>
      </form>
    </div>

    <div class="goals-grid">
      <div v-if="financeStore.loading" class="loading-indicator">Memuat...</div>
      <div v-else-if="financeStore.goals.length === 0" class="card no-goals">
        Belum ada target yang dibuat. Klik 'Tambah Target' untuk memulai.
      </div>
      <div
        v-for="goal in financeStore.goals"
        :key="goal.id"
        class="card goal-card"
      >
        <div class="goal-header">
          <h3>{{ goal.name }}</h3>
          <div class="action-buttons">
            <button
              class="action-btn edit-btn"
              @click="startEdit(goal)"
              title="Edit"
            >
              <i data-feather="edit-2"></i>
            </button>
            <button
              class="action-btn delete-btn"
              @click="handleDelete(goal.id)"
              title="Hapus"
            >
              <i data-feather="trash"></i>
            </button>
          </div>
        </div>
        <div class="goal-meta">
          <p class="goal-amount">
            {{ formatCurrency(goal.current_amount) }} /
            <span>{{ formatCurrency(goal.target_amount) }}</span>
          </p>
          <div v-if="goal.target_date" class="target-date-row">
            <p class="target-date">
              <i data-feather="calendar" class="icon-xs"></i>
              Target:
              {{
                new Date(goal.target_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }}
            </p>
            <span class="days-remaining">{{
              calculateDaysRemaining(goal.target_date)
            }}</span>
          </div>
        </div>
        <div class="progress-bar-container">
          <div
            class="progress-bar"
            :style="{
              width:
                goal.target_amount > 0
                  ? (goal.current_amount / goal.target_amount) * 100 + '%'
                  : '0%',
            }"
          ></div>
        </div>
        <p class="percentage-label">
          {{
            goal.target_amount > 0
              ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1)
              : 0
          }}% tercapai
        </p>
        <div class="goal-footer">
          <button
            class="button button-secondary ai-btn"
            @click="openAiAssistant(goal)"
          >
            <i data-feather="cpu" class="icon-sm"></i>
            Saran AI
          </button>
          <button
            class="button button-primary add-funds-btn"
            @click="openAddFundsModal(goal)"
          >
            <i data-feather="plus"></i>
            Tambah Dana
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAddFundsModal"
      class="modal-overlay"
      @click.self="showAddFundsModal = false"
    >
      <div class="modal-content card fade-in">
        <h3 class="form-title">Tambah Dana ke Target</h3>
        <p class="modal-subtitle">
          Menambah dana ke: <strong>{{ selectedGoal.name }}</strong>
        </p>
        <form @submit.prevent="handleAddFunds">
          <div class="form-group">
            <label>Jumlah (Rp)</label>
            <input
              v-model="formattedAmountToAdd"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              class="form-input text-right"
              autofocus
            />
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="button button-secondary"
              @click="showAddFundsModal = false"
            >
              Batal
            </button>
            <button type="submit" class="button button-primary">
              Tambahkan
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="showAiModal"
      class="modal-overlay"
      @click.self="showAiModal = false"
    >
      <div class="modal-content card fade-in">
        <h3 class="form-title">
          <i data-feather="cpu" class="icon-sm"></i> Asisten Finansial
        </h3>
        <div class="frequency-switcher">
          <button
            @click="aiSuggestionFrequency = 'daily'"
            :class="{ active: aiSuggestionFrequency === 'daily' }"
          >
            Harian
          </button>
          <button
            @click="aiSuggestionFrequency = 'weekly'"
            :class="{ active: aiSuggestionFrequency === 'weekly' }"
          >
            Mingguan
          </button>
          <button
            @click="aiSuggestionFrequency = 'monthly'"
            :class="{ active: aiSuggestionFrequency === 'monthly' }"
          >
            Bulanan
          </button>
        </div>
        <div v-if="aiAnalysisResult" class="ai-suggestion">
          <p v-html="aiAnalysisResult.message"></p>
        </div>
        <div v-else class="loading-indicator"><p>Menganalisis...</p></div>
        <div class="form-actions">
          <button
            type="button"
            class="button button-secondary"
            @click="showAiModal = false"
          >
            Tutup
          </button>
          <button
            v-if="aiAnalysisResult && aiAnalysisResult.suggestion > 0"
            type="button"
            class="button button-primary"
            @click="applyAiSuggestion"
          >
            Setuju & Tambah Dana
          </button>
        </div>
      </div>
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
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
.text-right {
  text-align: right;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.goal-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-right: 16px;
  word-break: break-word;
}
.action-buttons {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
  padding: 4px;
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
.goal-meta {
  margin: 16px 0 8px 0;
}
.goal-amount {
  font-size: 20px;
  font-weight: 600;
}
.goal-amount span {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}
.target-date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.target-date {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  margin: 0;
}
.days-remaining {
  font-size: 12px;
  font-weight: 500;
  background-color: #e2e8f0;
  color: var(--text-third);
  padding: 2px 8px;
  border-radius: 99px;
}
.progress-bar-container {
  width: 100%;
  background-color: #e9ecef;
  border-radius: 99px;
  height: 12px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background-color: var(--accent-green);
  border-radius: 99px;
  transition: width 0.5s ease;
}
.percentage-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  text-align: right;
}
.loading-indicator,
.no-goals {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}
.goal-footer {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  display: flex;
  gap: 12px;
}
.add-funds-btn,
.ai-btn {
  flex: 1;
}
.ai-btn {
  background-color: #e2e8f0;
  color: var(--text-third);
}
.ai-btn:hover {
  background-color: #cbd5e0;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}
.modal-content {
  width: 100%;
  max-width: 400px;
}
.modal-subtitle {
  margin-bottom: 24px;
  color: var(--text-secondary);
}
.ai-suggestion p {
  line-height: 1.7;
  color: var(--text-primary);
}
.ai-suggestion strong {
  color: var(--primary-color);
  font-weight: 600;
}
.icon-xs {
  width: 14px;
  height: 14px;
  margin-right: 6px;
}
.icon-sm {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
.frequency-switcher {
  display: flex;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}
.frequency-switcher button {
  flex: 1;
  background: none;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.frequency-switcher button.active {
  background-color: var(--surface-color);
  color: var(--primary-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
