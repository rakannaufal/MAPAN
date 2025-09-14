<template>
  <aside class="sidebar no-print" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <h1 class="logo">MAPAN</h1>
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
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-email">{{ userEmail }}</span>
        </div>
      </div>
      <button @click="logout" class="logout-button">
        <i data-feather="log-out" class="nav-icon"></i>
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { useFinanceStore } from "@/store/finance";
import feather from "feather-icons";

const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close-sidebar"]);

const financeStore = useFinanceStore();
const router = useRouter();

const userName = computed(() => {
  if (financeStore.user && financeStore.user.email) {
    return financeStore.user.email.split("@")[0];
  }
  return "Pengguna";
});

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase();
});

const userEmail = computed(() => {
  return financeStore.user?.email || "";
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

<style scoped>
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
}
.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}
.sidebar-nav {
  flex-grow: 1;
  margin-top: 24px;
  padding: 0 16px;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  font-weight: 500;
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
.sidebar-footer {
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
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

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
}
.logout-button:hover {
  background-color: #f3f4f6;
}

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
