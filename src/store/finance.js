import { defineStore } from "pinia";
import { ref, computed } from "vue";
import supabase from "@/supabaseClient";

export const useFinanceStore = defineStore("finance", () => {
  const user = ref(null);
  const transactions = ref([]);
  const goals = ref([]);
  const budgets = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const netWorth = computed(() => {
    return transactions.value.reduce(
      (acc, tx) =>
        tx.type === "Pemasukan" ? acc + tx.amount : acc - tx.amount,
      0
    );
  });

  const currentMonthCashFlow = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let income = 0;
    let expense = 0;
    transactions.value
      .filter((tx) => new Date(tx.date) >= startOfMonth)
      .forEach((tx) => {
        if (tx.type === "Pemasukan") income += tx.amount;
        else expense += tx.amount;
      });
    return { income, expense };
  });

  const expenseByCategory = computed(() => {
    const expenseMap = new Map();
    transactions.value
      .filter((tx) => tx.type === "Pengeluaran")
      .forEach((tx) => {
        let key = tx.category;
        if (tx.category === "Tabungan Target" && tx.notes) {
          const targetName = tx.notes.replace("Menambah dana ke target: ", "");
          key = `Tabungan: ${targetName}`;
        }
        expenseMap.set(key, (expenseMap.get(key) || 0) + tx.amount);
      });
    return Object.fromEntries(expenseMap);
  });

  const netWorthTrend = computed(() => {
    if (transactions.value.length < 2)
      return { labels: [], datasets: [{ data: [] }] };
    const sortedTxs = [...transactions.value].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let runningBalance = 0;
    const dataPoints = sortedTxs.map((tx) => {
      runningBalance += tx.type === "Pemasukan" ? tx.amount : -tx.amount;
      return {
        date: new Date(tx.date).toLocaleDateString("id-ID", {
          month: "short",
          day: "2-digit",
        }),
        balance: runningBalance,
      };
    });
    return {
      labels: dataPoints.map((p) => p.date),
      datasets: [
        {
          label: "Kekayaan Bersih",
          data: dataPoints.map((p) => p.balance),
          borderColor: "var(--primary-color)",
          backgroundColor: "rgba(26, 35, 126, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  });

  const processedBudgets = computed(() => {
    const period = budgets.value.length > 0 ? budgets.value[0].period : "";
    const start = new Date(period);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const actualSpending = transactions.value
      .filter((tx) => {
        const txDate = new Date(tx.date);
        return tx.type === "Pengeluaran" && txDate >= start && txDate <= end;
      })
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

    const budgetItems = budgets.value
      .map((budget) => {
        const spent = actualSpending[budget.category] || 0;
        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const budgetedCategories = new Set(budgets.value.map((b) => b.category));
    const unbudgetedSpending = Object.entries(actualSpending)
      .filter(([category]) => !budgetedCategories.has(category))
      .map(([category, spent]) => ({ category, spent }));

    return { budgetItems, unbudgetedSpending };
  });

  function handleAuthStateChange() {
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session ? session.user : null;
      if (user.value) {
        fetchAllData();
      } else {
        transactions.value = [];
        goals.value = [];
        budgets.value = [];
      }
    });
  }

  async function fetchAllData() {
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    try {
      const [txs, gls, bgs] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false }),
        supabase
          .from("goals")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase.from("budgets").select("*").eq("period", currentPeriod),
      ]);
      if (txs.error) throw txs.error;
      if (gls.error) throw gls.error;
      if (bgs.error) throw bgs.error;
      transactions.value = txs.data || [];
      goals.value = gls.data || [];
      budgets.value = bgs.data || [];
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function addTransaction(transaction) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...transaction, user_id: user.value.id })
      .select()
      .single();
    if (error) throw error;
    transactions.value.unshift(data);
  }

  async function updateTransaction(id, updatedData) {
    const { id: txId, created_at, user_id, ...dataToUpdate } = updatedData;
    const { data, error } = await supabase
      .from("transactions")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const index = transactions.value.findIndex((tx) => tx.id === id);
    if (index !== -1) {
      transactions.value[index] = data;
    }
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    transactions.value = transactions.value.filter((t) => t.id !== id);
  }

  async function addGoal(goal) {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: user.value.id })
      .select()
      .single();
    if (error) throw error;
    goals.value.push(data);
  }

  async function updateGoal(id, updatedData) {
    const { id: goalId, created_at, user_id, ...dataToUpdate } = updatedData;
    const { data, error } = await supabase
      .from("goals")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const index = goals.value.findIndex((g) => g.id === id);
    if (index !== -1) {
      goals.value[index] = data;
    }
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
    goals.value = goals.value.filter((g) => g.id !== id);
  }

  async function addFundsToGoal(goalId, amountToAdd) {
    if (!amountToAdd || amountToAdd <= 0) {
      throw new Error("Jumlah harus lebih besar dari nol.");
    }
    const { data: currentGoal, error: fetchError } = await supabase
      .from("goals")
      .select("current_amount, name")
      .eq("id", goalId)
      .single();
    if (fetchError) throw fetchError;
    const newCurrentAmount = currentGoal.current_amount + amountToAdd;
    const { data: updatedGoal, error: updateError } = await supabase
      .from("goals")
      .update({ current_amount: newCurrentAmount })
      .eq("id", goalId)
      .select()
      .single();
    if (updateError) throw updateError;
    await addTransaction({
      amount: amountToAdd,
      category: "Tabungan Target",
      type: "Pengeluaran",
      date: new Date().toISOString().slice(0, 10),
      notes: `Menambah dana ke target: ${updatedGoal.name}`,
    });
    const index = goals.value.findIndex((g) => g.id === goalId);
    if (index !== -1) {
      goals.value[index] = updatedGoal;
    }
  }

  async function fetchBudgetsForPeriod(period) {
    const { data, error: fetchError } = await supabase
      .from("budgets")
      .select("*")
      .eq("period", period);
    if (fetchError) throw fetchError;
    budgets.value = data || [];
  }

  async function addOrUpdateBudget(budgetData) {
    const { data: result, error } = await supabase
      .from("budgets")
      .upsert({ ...budgetData, user_id: user.value.id })
      .select()
      .single();
    if (error) throw error;
    const index = budgets.value.findIndex(
      (b) => b.period === result.period && b.category === result.category
    );
    if (index !== -1) {
      budgets.value[index] = result;
    } else {
      budgets.value.push(result);
    }
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) throw error;
    budgets.value = budgets.value.filter((b) => b.id !== id);
  }

  async function copyBudgetsFromLastMonth(currentPeriod, lastPeriod) {
    const { data: lastMonthBudgets, error: fetchError } = await supabase
      .from("budgets")
      .select("category, amount, type")
      .eq("period", lastPeriod);
    if (fetchError) throw fetchError;
    if (lastMonthBudgets.length === 0) {
      alert(
        "Tidak ada anggaran yang ditemukan di bulan sebelumnya untuk disalin."
      );
      return;
    }
    const newBudgets = lastMonthBudgets.map((b) => ({
      ...b,
      period: currentPeriod,
      user_id: user.value.id,
    }));
    const { data: inserted, error: insertError } = await supabase
      .from("budgets")
      .insert(newBudgets)
      .select();
    if (insertError) throw insertError;
    budgets.value = inserted;
  }

  return {
    user,
    transactions,
    goals,
    budgets,
    loading,
    error,
    netWorth,
    currentMonthCashFlow,
    expenseByCategory,
    netWorthTrend,
    processedBudgets,
    handleAuthStateChange,
    fetchAllData,
    signOut,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addFundsToGoal,
    fetchBudgetsForPeriod,
    addOrUpdateBudget,
    deleteBudget,
    copyBudgetsFromLastMonth,
  };
});
