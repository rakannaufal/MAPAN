// File: src/services/aiAssistant.js

// --- Fungsi Pembantu ---
function roundToSensibleAmount(amount) {
  if (amount <= 0) return 0;
  if (amount < 10000) return Math.ceil(amount / 1000) * 1000;
  if (amount < 50000) return Math.ceil(amount / 5000) * 5000;
  if (amount < 250000) return Math.ceil(amount / 10000) * 10000;
  return Math.ceil(amount / 25000) * 25000;
}

function formatBoldCurrency(amount) {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
  return `<strong>${formatted}</strong>`;
}

// --- FUNGSI UTAMA DENGAN LOGIKA FINAL ---

/**
 * Menganalisis kondisi keuangan dan memberikan rekomendasi tabungan.
 * @param {object} financialData - Data keuangan pengguna.
 * @param {string} frequency - Frekuensi tabungan ('daily', 'weekly', 'monthly').
 * @returns {object} - Objek berisi rekomendasi.
 */
export function getGoalSuggestion(financialData, frequency = "weekly") {
  const {
    targetAmount,
    currentAmount,
    targetDate,
    monthlyIncome,
    monthlyExpense,
  } = financialData;

  const amountNeeded = targetAmount - currentAmount;
  if (amountNeeded <= 0) {
    return {
      status: "COMPLETED",
      suggestion: 0,
      message: "Selamat! Target ini sudah tercapai.",
    };
  }

  if (!targetDate) {
    return {
      status: "NO_DATE",
      suggestion: 0,
      message: "Tentukan tanggal target untuk mendapatkan rekomendasi.",
    };
  }

  const now = new Date();
  const endDate = new Date(targetDate);
  const daysRemaining = (endDate - now) / (1000 * 60 * 60 * 24);

  if (daysRemaining <= 1) {
    return {
      status: "OVERDUE",
      suggestion: 0,
      message:
        "Tanggal target sudah terlalu dekat atau terlewat. Silakan perbarui tanggalnya.",
    };
  }

  // 1. Tentukan pembagi dan unit waktu berdasarkan frekuensi
  let timeDivider, timeUnit;
  switch (frequency) {
    case "daily":
      timeDivider = daysRemaining;
      timeUnit = "hari";
      break;
    case "monthly":
      timeDivider =
        (endDate.getFullYear() - now.getFullYear()) * 12 +
          (endDate.getMonth() - now.getMonth()) || 1;
      timeUnit = "bulan";
      break;
    case "weekly":
    default:
      timeDivider = daysRemaining / 7;
      timeUnit = "minggu";
      break;
  }

  if (timeDivider <= 0) timeDivider = 1;

  // 2. Hitung KEBUTUHAN tabungan berdasarkan frekuensi
  const requiredSavings = roundToSensibleAmount(amountNeeded / timeDivider);

  // 3. Hitung KEMAMPUAN menabung bulanan (sisa uang)
  const monthlyDiscretionaryIncome = monthlyIncome - monthlyExpense;
  const SAFETY_BUFFER_PERCENTAGE = 0.2;
  const savingsCapacity =
    monthlyDiscretionaryIncome * (1 - SAFETY_BUFFER_PERCENTAGE);

  let suggestion = requiredSavings;
  let status = "REALISTIC";
  let message = "";

  // 4. Logika Cerdas: Bandingkan kebutuhan dengan kapasitas & berikan saran yang jelas
  if (monthlyDiscretionaryIncome <= 0) {
    status = "UNREALISTIC";
    message =
      "Arus kas bulanan Anda negatif. Sulit untuk merekomendasikan tabungan saat ini. Coba fokus untuk mengurangi pengeluaran terlebih dahulu.";
    suggestion = 0;
  } else {
    // Konversi kebutuhan ke basis bulanan untuk perbandingan yang adil
    let requiredMonthlyEquivalent;
    if (frequency === "daily")
      requiredMonthlyEquivalent = requiredSavings * 30.44;
    else if (frequency === "weekly")
      requiredMonthlyEquivalent = requiredSavings * 4.33;
    else requiredMonthlyEquivalent = requiredSavings;

    if (requiredMonthlyEquivalent <= savingsCapacity) {
      status = "IDEAL";
      message = `Rencana ini sangat realistis! Anda cukup menyisihkan ${formatBoldCurrency(
        requiredSavings
      )} per <strong>${timeUnit}</strong>. Ini masih menyisakan ruang yang cukup untuk kebutuhan lain.`;
    } else if (requiredMonthlyEquivalent <= monthlyDiscretionaryIncome) {
      status = "CHALLENGING";
      message = `Bisa dicapai, tapi butuh komitmen! Anda perlu menyisihkan ${formatBoldCurrency(
        requiredSavings
      )} per <strong>${timeUnit}</strong>. Rencana ini akan menggunakan hampir seluruh sisa uang Anda.`;
    } else {
      status = "NEEDS_ADJUSTMENT";
      const monthsNeeded = Math.ceil(amountNeeded / savingsCapacity);
      const newTargetDate = new Date();
      newTargetDate.setMonth(newTargetDate.getMonth() + monthsNeeded);
      const newDateFormatted = newTargetDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });

      let alternativeSuggestion = 0;
      if (frequency === "daily")
        alternativeSuggestion = roundToSensibleAmount(savingsCapacity / 30.44);
      else if (frequency === "weekly")
        alternativeSuggestion = roundToSensibleAmount(savingsCapacity / 4.33);
      else alternativeSuggestion = roundToSensibleAmount(savingsCapacity);

      suggestion = alternativeSuggestion > 0 ? alternativeSuggestion : 0;
      message = `Target ini belum realistis. Kebutuhan Anda (${formatBoldCurrency(
        requiredSavings
      )} per ${timeUnit}) melebihi sisa uang bulanan Anda. <br><br>Saran kami: coba tabung sesuai kapasitas Anda yaitu sekitar ${formatBoldCurrency(
        suggestion
      )} per <strong>${timeUnit}</strong>. Dengan begitu, target Anda akan tercapai sekitar bulan <strong>${newDateFormatted}</strong>.`;
    }
  }

  return { status, suggestion, message };
}
