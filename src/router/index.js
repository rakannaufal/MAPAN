import { createRouter, createWebHistory } from "vue-router";
import supabase from "@/supabaseClient";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("@/views/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/auth", name: "Auth", component: () => import("@/views/Auth.vue") },
  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("@/views/Transactions.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/goals",
    name: "Goals",
    component: () => import("@/views/Goals.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/budgets",
    name: "Budgets",
    component: () => import("@/views/Budgets.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    name: "Reports",
    component: () => import("@/views/Reports.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth && !session) {
    next({ name: "Auth" });
  } else if (to.name === "Auth" && session) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
