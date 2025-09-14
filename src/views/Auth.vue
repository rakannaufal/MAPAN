<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="auth-header">
        <h1 class="logo">Mapan</h1>
        <p class="subtitle">
          {{ isLogin ? "Masuk untuk melanjutkan" : "Buat akun baru Anda" }}
        </p>
      </div>

      <div class="auth-content card">
        <form class="auth-form" @submit.prevent="handleAuth">
          <div class="form-group">
            <label for="email">Alamat Email</label>
            <input
              v-model="email"
              id="email"
              type="email"
              required
              class="form-input"
              placeholder="anda@email.com"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              v-model="password"
              id="password"
              type="password"
              required
              class="form-input"
              placeholder="••••••••"
            />
          </div>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button
            type="submit"
            class="button button-primary auth-submit-button"
            :disabled="loading"
          >
            <span v-if="loading">Memproses...</span>
            <span v-else>{{ isLogin ? "Masuk" : "Daftar Akun" }}</span>
          </button>
        </form>

        <div class="divider"><span>Atau</span></div>

        <button
          @click.prevent="isLogin = !isLogin"
          class="button button-secondary toggle-button"
        >
          {{ isLogin ? "Buat Akun Baru" : "Sudah Punya Akun? Masuk" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import supabase from "@/supabaseClient";

const router = useRouter();
const email = ref("");
const password = ref("");
const isLogin = ref(true);
const loading = ref(false);
const errorMessage = ref("");

const handleAuth = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    let error;
    if (isLogin.value) {
      ({ error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      }));
      if (error) throw error;
      router.push("/");
    } else {
      ({ error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      }));
      if (!error) {
        alert("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
        isLogin.value = true; // Langsung ubah ke mode login setelah daftar
      }
      if (error) throw error;
    }
  } catch (e) {
    errorMessage.value = e.message || "Terjadi kesalahan.";
  } finally {
    loading.value = false;
  }
};
</script>

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

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
  padding: 20px;
}

.auth-box {
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-out;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.subtitle {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 16px;
}

.auth-content.card {
  padding: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.auth-submit-button,
.toggle-button {
  width: 100%;
  padding-top: 12px;
  padding-bottom: 12px;
}

.button-secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.button-secondary:hover:not(:disabled) {
  background-color: #f7fafc;
  color: var(--text-primary);
  transform: translateY(0);
  box-shadow: none;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: var(--text-secondary);
  font-size: 14px;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}
.divider:not(:empty)::before {
  margin-right: 0.75em;
}
.divider:not(:empty)::after {
  margin-left: 0.75em;
}

.error-text {
  color: var(--accent-red);
  font-size: 14px;
  text-align: center;
  margin-top: -8px;
  margin-bottom: 8px;
}
</style>
