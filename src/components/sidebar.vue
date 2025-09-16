<script setup>
import { onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { useFinanceStore } from "@/store/finance";
import feather from "feather-icons";

// --- PERUBAHAN #1: Impor file logo dari folder assets ---
import logoMapan from "../assets/mapan.png";

// Props dan emits untuk fungsionalitas mobile
const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close-sidebar"]);

const financeStore = useFinanceStore();
const router = useRouter();

const appVersion = "1.0.0";

const userName = computed(() => {
  if (financeStore.user && financeStore.user.email) {
    return financeStore.user.email.split("@")[0];
  }
  return "Pengguna";
});

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase();
});

const navItems = [
  { name: "Dashboard", path: "/", icon: "home" },
  { name: "Transaksi", path: "/transactions", icon: "list" },
  { name: "Target", path: "/goals", icon: "flag" },
  { name: "Anggaran", path: "/budgets", icon: "target" },
  { name: "Laporan", path: "/reports", icon: "bar-chart-2" },
];

const logout = async () => {
  await financeStore.signOut();
  router.push("/auth");
};

const handleNavLinkClick = () => {
  if (props.isOpen) {
    emit("close-sidebar");
  }
};

onMounted(() => {
  nextTick(() => {
    feather.replace();
  });
});
</script>

<template>
  <aside class="sidebar no-print" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <!-- --- PERUBAHAN #2: Ganti <h1> dengan <img> --- -->
      <img :src="logoMapan" alt="Mapan Logo" class="logo-img" />
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

        <li>
          <button @click="logout" class="nav-link logout-button">
            <i data-feather="log-out" class="nav-icon"></i>
            <span>Keluar</span>
          </button>
        </li>
      </ul>

      <div class="app-version">Mapan v{{ appVersion }}</div>
    </nav>
  </aside>
</template>

<style scoped>
/* --- PERUBAHAN #3: Hapus style .logo dan tambahkan .logo-img --- */
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

.sidebar-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.logo-img {
  max-width: 100px; /* Atur lebar maksimum logo */
  height: auto; /* Jaga rasio aspek gambar */
  margin: 0 auto; /* Posisikan di tengah */
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

/* Navigasi */
.sidebar-nav {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
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

.app-version {
  margin-top: auto;
  padding-top: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  user-select: none;
}

/* Aturan untuk mobile */
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
