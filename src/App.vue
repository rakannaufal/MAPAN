<script setup>
import { onMounted, ref, watch } from "vue";
import { useFinanceStore } from "@/store/finance";
import Sidebar from "@/components/Sidebar.vue";
import MobileHeader from "@/components/MobileHeader.vue";

const financeStore = useFinanceStore();

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

watch(isSidebarOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
});

onMounted(() => {
  financeStore.handleAuthStateChange();
});
</script>

<template>
  <div v-if="financeStore.user" class="app-layout">
    <MobileHeader @toggle-sidebar="toggleSidebar" />
    <Sidebar :is-open="isSidebarOpen" @close-sidebar="toggleSidebar" />
    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
    <main class="main-content">
      <router-view />
    </main>
  </div>

  <div v-else>
    <router-view />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 32px;
  overflow-y: auto;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  .main-content {
    padding: 24px 16px;
    padding-top: 80px;
  }
  .sidebar-overlay {
    display: block;
  }
}
</style>
