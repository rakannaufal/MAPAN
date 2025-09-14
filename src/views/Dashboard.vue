<script setup>
import { computed, onMounted, nextTick } from "vue";
import { useFinanceStore } from "@/store/finance";
import { Doughnut as DoughnutChart, Line as LineChart } from "vue-chartjs";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import feather from "feather-icons";

Chart.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const financeStore = useFinanceStore();
const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const closestGoal = computed(() => {
  if (!financeStore.goals || financeStore.goals.length === 0) return null;
  return (
    [...financeStore.goals]
      .map((g) => ({
        ...g,
        progress:
          g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0,
      }))
      .filter((g) => g.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0] || null
  );
});

const doughnutChartData = computed(() => {
  const expenses = financeStore.expenseByCategory;
  const labels = Object.keys(expenses);
  const data = Object.values(expenses);
  const colors = [
    "#1A237E",
    "#4CAF50",
    "#EF5350",
    "#FFC107",
    "#2196F3",
    "#9C27B0",
    "#795548",
  ];
  return {
    labels,
    datasets: [{ backgroundColor: colors, data }],
  };
});

const lineChartData = computed(() => financeStore.netWorthTrend);
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "right" } },
};
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

onMounted(() => {
  nextTick(() => feather.replace());
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Dashboard</h1>
    <div v-if="financeStore.loading" class="loading-indicator">
      Memuat data...
    </div>
    <div v-else>
      <div class="dashboard-grid">
        <div class="card summary-card fade-in">
          <div class="icon-wrapper bg-blue">
            <i data-feather="trending-up"></i>
          </div>
          <div class="text-content">
            <h3>Kekayaan Bersih</h3>
            <p
              class="amount"
              :class="financeStore.netWorth >= 0 ? 'green' : 'red'"
            >
              {{ formatCurrency(financeStore.netWorth) }}
            </p>
          </div>
        </div>
        <div class="card summary-card fade-in" style="animation-delay: 100ms">
          <div class="icon-wrapper bg-green">
            <i data-feather="arrow-down-circle"></i>
          </div>
          <div class="text-content">
            <h3>Pemasukan Bulan Ini</h3>
            <p class="amount green">
              {{ formatCurrency(financeStore.currentMonthCashFlow.income) }}
            </p>
          </div>
        </div>
        <div class="card summary-card fade-in" style="animation-delay: 200ms">
          <div class="icon-wrapper bg-red">
            <i data-feather="arrow-up-circle"></i>
          </div>
          <div class="text-content">
            <h3>Pengeluaran Bulan Ini</h3>
            <p class="amount red">
              {{ formatCurrency(financeStore.currentMonthCashFlow.expense) }}
            </p>
          </div>
        </div>
        <div class="card summary-card fade-in" style="animation-delay: 300ms">
          <div class="icon-wrapper bg-yellow"><i data-feather="flag"></i></div>
          <div class="text-content">
            <h3>Target Terdekat</h3>
            <template v-if="closestGoal">
              <p class="goal-name">{{ closestGoal.name }}</p>
              <div class="progress-details">
                <div class="progress-bar-container">
                  <div
                    class="progress-bar"
                    :style="{ width: closestGoal.progress + '%' }"
                  ></div>
                </div>
                <span class="percentage-text"
                  >{{ closestGoal.progress.toFixed(1) }}%</span
                >
              </div>
            </template>
            <template v-else>
              <p class="no-data-small">Belum ada target.</p>
            </template>
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card chart-card fade-in" style="animation-delay: 400ms">
          <h3>Tren Kekayaan Bersih</h3>
          <div class="chart-wrapper">
            <LineChart
              v-if="lineChartData.labels.length"
              :data="lineChartData"
              :options="lineChartOptions"
            />
            <p v-else class="no-data">
              Data tidak cukup untuk menampilkan tren.
            </p>
          </div>
        </div>
        <div class="card chart-card fade-in" style="animation-delay: 500ms">
          <h3>Pengeluaran per Kategori</h3>
          <div class="chart-wrapper">
            <DoughnutChart
              v-if="doughnutChartData.labels.length"
              :data="doughnutChartData"
              :options="chartOptions"
            />
            <p v-else class="no-data">Belum ada data pengeluaran.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}
.page-title {
  font-size: 32px;
  margin-bottom: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
.loading-indicator {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 20px;
}
.icon-wrapper {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.icon-wrapper i {
  width: 24px;
  height: 24px;
}
.icon-wrapper.bg-blue {
  background-color: var(--primary-color);
}
.icon-wrapper.bg-green {
  background-color: var(--accent-green);
}
.icon-wrapper.bg-red {
  background-color: var(--accent-red);
}
.icon-wrapper.bg-yellow {
  background-color: #f6ad55;
}
.text-content {
  width: 100%;
}
.text-content h3 {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}
.text-content .amount {
  font-size: 24px;
  font-weight: 600;
}
.text-content .amount.green {
  color: var(--accent-green);
}
.text-content .amount.red {
  color: var(--accent-red);
}
.goal-name {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}
.progress-details {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}
.progress-bar-container {
  flex-grow: 1;
  width: 100%;
  background-color: #e9ecef;
  border-radius: 99px;
  height: 8px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 99px;
  transition: width 0.5s ease-in-out;
}
.percentage-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}
.no-data-small {
  font-size: 14px;
  color: var(--text-secondary);
}
.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 24px;
}
@media (min-width: 1024px) {
  .chart-grid {
    grid-template-columns: 2fr 1fr;
  }
}
.chart-card h3 {
  font-size: 18px;
  margin-bottom: 16px;
}
.chart-wrapper {
  position: relative;
  height: 350px;
}
.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px 0;
}
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 24px;
  }
}
@media (max-width: 1024px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
