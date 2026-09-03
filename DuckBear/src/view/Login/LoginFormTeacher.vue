<template>
  <v-app>
    <v-main class="main-bg">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        class="text-none back-btn"
        size="small"
        @click="router.push('/login')"
      >
        Quay lại
      </v-btn>

      <v-container style="max-width: 1100px; position: relative; z-index: 1">
        <v-row class="py-4" align="stretch" justify="center">
          <!-- Left Panel - Illustration -->
          <v-col cols="12" md="5">
            <div class="left-panel pa-8 h-100 d-flex flex-column">
              <div class="d-flex align-center">
                <div class="logo-badge">
                  <v-icon color="white" size="20">mdi-school</v-icon>
                </div>
                <div class="ml-3">
                  <div
                    class="text-subtitle-1 font-weight-bold"
                    style="color: #1a2540"
                  >
                    Tên App
                  </div>
                  <div class="text-caption" style="color: #8a93a6">
                    Classroom
                  </div>
                </div>
              </div>

              <div class="mt-10">
                <h2 class="welcome-title">
                  Chào mừng bạn
                  <span class="text-primary-highlight">trở lại!</span> 👋
                </h2>
                <p class="welcome-subtitle mt-3">
                  Đăng nhập để quản lý lớp học và theo dõi tiến độ học sinh.
                </p>
              </div>

              <div class="illustration-wrap mt-auto">
                <img src="/bag.png" alt="" class="login-illustration" />
              </div>
            </div>
          </v-col>

          <!-- Right Panel - Form -->
          <v-col cols="12" md="6">
            <v-card flat class="form-card pa-10 h-100">
              <div class="text-center mb-8">
                <div class="avatar-circle mx-auto">
                  <v-icon size="44" color="#ff9656">mdi-briefcase</v-icon>
                </div>
                <h1 class="page-title mt-4">
                  Đăng nhập <span class="title-highlight">giáo viên</span>
                </h1>
                <p class="page-subtitle mt-1">
                  Vui lòng nhập thông tin tài khoản của bạn
                </p>
              </div>

              <v-form ref="formRef" @submit.prevent="handleSubmit">
                <div class="field-label mb-1">Email</div>
                <v-text-field
                  v-model="form.email"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[(v) => !!v || 'Không được để trống']"
                  class="mb-4"
                />

                <div class="field-label mb-1">Mật khẩu</div>
                <v-text-field
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="[(v) => !!v || 'Không được để trống']"
                  class="mb-2"
                />

                <div class="d-flex align-center justify-space-between mb-4">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Ghi nhớ đăng nhập"
                    density="compact"
                    hide-details
                    color="#ff9656"
                  />
                  <router-link
                    to="/forgot-password"
                    class="text-decoration-none font-weight-medium"
                    style="color: #ff9656; font-size: 0.9rem"
                  >
                    Quên mật khẩu?
                  </router-link>
                </div>

                <v-alert
                  v-if="errorMsg"
                  type="error"
                  density="compact"
                  class="mb-4"
                >
                  {{ errorMsg }}
                </v-alert>

                <v-btn
                  type="submit"
                  color="#ff9656"
                  variant="flat"
                  block
                  size="large"
                  :loading="loading"
                  rounded="lg"
                  class="submit-btn text-none"
                >
                  <v-icon size="20" class="mr-2">mdi-login</v-icon>
                  Đăng nhập
                </v-btn>

                <div class="divider-text my-6">
                  <span>Hoặc đăng nhập với</span>
                </div>

                <div class="d-flex ga-3">
                  <v-btn
                    variant="outlined"
                    block
                    size="large"
                    class="text-none social-btn"
                    disabled
                  >
                    <v-icon size="20" class="mr-2" color="#4285F4"
                      >mdi-google</v-icon
                    >
                    Google
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    block
                    size="large"
                    class="text-none social-btn"
                    disabled
                  >
                    <v-icon size="20" class="mr-2" color="#00A4EF"
                      >mdi-microsoft</v-icon
                    >
                    Microsoft
                  </v-btn>
                </div>

                <div class="text-center mt-6">
                  Chưa có tài khoản?
                  <router-link
                    to="/register/teacher"
                    class="text-decoration-none font-weight-bold"
                    style="color: #ff9656"
                  >
                    Đăng ký ngay
                  </router-link>
                </div>
              </v-form>
            </v-card>
          </v-col>
        </v-row>

        <div class="security-note mb-6">
          <v-icon size="18" color="#4366f0">mdi-shield-check</v-icon>
          Bảo mật thông tin của bạn là ưu tiên hàng đầu của chúng tôi.
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const errorMsg = ref("");
const formRef = ref(null);
const showPassword = ref(false);
const rememberMe = ref(true);

const form = reactive({
  email: "",
  password: "",
});

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    const data = await authStore.login(form);

    if (data.role !== "teacher") {
      authStore.logout();
      errorMsg.value =
        "Tài khoản này không phải giáo viên, vui lòng đăng nhập ở trang học sinh";
      return;
    }

    router.push({ name: "teacher-books" });
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || "Đăng nhập thất bại, thử lại nhé";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.back-btn {
  position: absolute;
  top: 16px;
  left: 24px;
  z-index: 10;
}

.logo-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3d5afe, #6c7fff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(61, 90, 254, 0.3);
}

.main-bg {
  background: #fbfcfe;
  min-height: auto;
  padding-top: 0;
}

.left-panel {
  background: linear-gradient(160deg, #fff4ec, #fff8f2);
  border-radius: 24px;
}

.welcome-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a2540;
  line-height: 1.3;
}

.text-primary-highlight {
  color: #ff9656;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: #6b7383;
  line-height: 1.5;
}

.illustration-wrap {
  max-width: 340px;
}

.login-illustration {
  width: 100%;
  height: auto;
  display: block;
}

.form-card {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecf3;
  box-shadow: 0 8px 30px -10px rgba(20, 30, 60, 0.08);
}

.avatar-circle {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff4ec, #fff8f2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a2540;
}

.title-highlight {
  color: #ff9656;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #8a93a6;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2540;
}

.submit-btn {
  box-shadow: 0 8px 18px -6px rgba(255, 150, 86, 0.4) !important;
  font-weight: 600;
  height: 50px !important;
}

.divider-text {
  position: relative;
  text-align: center;
  color: #8a93a6;
  font-size: 0.85rem;
}

.divider-text::before,
.divider-text::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 38%;
  height: 1px;
  background: #e9ecf3;
}

.divider-text::before {
  left: 0;
}

.divider-text::after {
  right: 0;
}

.social-btn {
  height: 48px !important;
  border-color: #e9ecf3 !important;
  color: #1a2540 !important;
}

.security-note {
  text-align: center;
  color: #8a93a6;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
