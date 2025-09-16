<script setup>
import { onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { useFinanceStore } from "@/store/finance";
import feather from "feather-icons";

// Props dan emits untuk fungsionalitas mobile
const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close-sidebar"]);

const financeStore = useFinanceStore();
const router = useRouter();

// --- PERUBAHAN #1: Menambahkan variabel untuk versi aplikasi ---
const appVersion = "1.0.0"; // Mudah diubah di sini jika ada update

// Computed properties untuk menampilkan info pengguna
const userName = computed(() => {
  if (financeStore.user && financeStore.user.email) {
    return financeStore.user.email.split("@")[0];
  }
  return "Pengguna";
});

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase();
});

// Daftar item navigasi utama
const navItems = [
  { name: "Dashboard", path: "/", icon: "home" },
  { name: "Transaksi", path: "/transactions", icon: "list" },
  { name: "Target", path: "/goals", icon: "flag" },
  { name: "Anggaran", path: "/budgets", icon: "target" },
  { name: "Laporan", path: "/reports", icon: "bar-chart-2" },
];

// Fungsi untuk logout
const logout = async () => {
  await financeStore.signOut();
  router.push("/auth");
};

// Menutup sidebar mobile saat link di-klik
const handleNavLinkClick = () => {
  if (props.isOpen) {
    emit("close-sidebar");
  }
};

// Merender ikon saat komponen dimuat
onMounted(() => {
  nextTick(() => {
    feather.replace();
  });
});
</script>

<template>
  <aside class="sidebar no-print" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <h1 class="logo">MAPAN</h1>
    </div>

    <div class="user-profile-section">
      <div class="avatar">{{ userInitial }}</div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-email">{{ financeStore.user?.email || "" }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <!-- Looping untuk item navigasi utama -->
        <li v-for="item in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="nav-link"
            @click="handleNavLinkClick"
          >
            <i :data-feather="item.icon" class="nav-icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </li>

        <li class="nav-divider"></li>

        <!-- Tombol Logout -->
        <li>
          <button @click="logout" class="nav-link logout-button">
            <i data-feather="log-out" class="nav-icon"></i>
            <span>Keluar</span>
          </button>
        </li>
      </ul>

      <!-- --- PERUBAHAN #2: Menambahkan elemen untuk versi aplikasi --- -->
      <div class="app-version">Mapan v{{ appVersion }}</div>
    </nav>
  </aside>
</template>

<style scoped>
/* Main container for the sidebar */
.sidebar {
  width: 256px;
  background-color: var(--surface-color);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1001;
}

/* Header section containing the logo */
.sidebar-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

/* Bagian profil pengguna */
.user-profile-section {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}
.user-info {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-name {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.user-email {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Navigasi sekarang mengisi semua sisa ruang */
.sidebar-nav {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column; /* Penting untuk mendorong versi ke bawah */
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Styling untuk semua item di navigasi (link dan tombol) */
.nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  font-weight: 500;
  font-family: var(--font-family);
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}
.nav-link:hover {
  background-color: #f3f4f6;
  text-decoration: none;
  color: var(--primary-color);
}
.nav-link.router-link-exact-active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(26, 35, 126, 0.2);
}
.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 16px;
}

.nav-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 16px 16px;
}

.logout-button:hover {
  background-color: #fef2f2;
  color: var(--accent-red);
}

/* --- STYLE BARU #3: Untuk teks versi aplikasi --- */
.app-version {
  margin-top: auto; /* Ajaib! Mendorong elemen ini ke paling bawah */
  padding-top: 16px; /* Memberi jarak dari elemen di atasnya */
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  user-select: none; /* Mencegah teks bisa di-highlight */
}

/* Aturan untuk mobile (tidak berubah) */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    transform: translateX(-100%);
    border-right: 1px solid var(--border-color);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
