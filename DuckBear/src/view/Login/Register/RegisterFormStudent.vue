<template>
  <v-app>
    <v-app-bar
      flat
      color="white"
      height="76"
      class="px-4"
      style="border-bottom: 1px solid #edf0f5"
    >
      <v-container class="d-flex align-center" style="max-width: 1200px">
        <div class="d-flex align-center">
          <div class="logo-badge">
            <v-icon color="white" size="20">mdi-school</v-icon>
          </div>
          <div class="ml-3">
            <div
              class="text-subtitle-1 font-weight-bold"
              style="line-height: 1.1; color: #1a2540"
            >
              Tên App
            </div>
            <div
              class="text-caption"
              style="line-height: 1; color: #8a93a6; letter-spacing: 0.02em"
            >
              Classroom
            </div>
          </div>
        </div>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="#3d5afe"
          rounded="pill"
          class="text-none px-6"
          >Đăng nhập</v-btn
        >
      </v-container>
    </v-app-bar>

    <v-main class="main-bg">
      <v-container
        class="py-2"
        style="max-width: 640px; position: relative; z-index: 1"
      >
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-0 back-btn text-none"
          style="margin-left: -16px"
          @click="router.push('/register')"
        >
          Quay lại
        </v-btn>

        <div class="text-center mb-3">
          <div class="icon-badge mx-auto mb-1">
            <v-icon color="white" size="18">mdi-account-school</v-icon>
          </div>
          <h1 class="page-title">Đăng ký học sinh</h1>
          <p class="page-subtitle mt-1">Điền thông tin để hoàn tất đăng ký</p>
        </div>

        <v-card flat class="pa-8 form-card">
          <v-form ref="formRef" @submit.prevent="handleSubmit">
            <div class="field-label">Họ và tên</div>
            <v-text-field
              v-model="form.fullName"
              placeholder="Nguyễn Văn A"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-account-outline"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-4"
            />

            <div class="field-label">Email</div>
            <v-text-field
              v-model="form.email"
              placeholder="ban@email.com"
              type="email"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-email-outline"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-4"
            />

            <div class="field-label">Mật khẩu</div>
            <v-text-field
              v-model="form.password"
              placeholder="Ít nhất 6 ký tự"
              type="password"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-lock-outline"
              :rules="[(v) => (v && v.length >= 6) || 'Ít nhất 6 ký tự']"
              class="mb-4"
            />

            <v-row class="mb-1" dense>
              <v-col cols="12" sm="6">
                <div class="field-label">Khối lớp</div>
                <v-select
                  v-model="form.gradeLevel"
                  :items="gradeLevels"
                  placeholder="Chọn khối"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-google-classroom"
                  :rules="[(v) => !!v || 'Vui lòng chọn khối lớp']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <div class="field-label">Ngày sinh</div>
                <v-text-field
                  v-model="form.dateOfBirth"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-calendar-blank-outline"
                />
              </v-col>
            </v-row>

            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              density="compact"
              rounded="lg"
              class="mb-4 mt-2"
            >
              {{ errorMsg }}
            </v-alert>

            <v-btn
              type="submit"
              color="#3d5afe"
              variant="flat"
              block
              size="large"
              :loading="loading"
              rounded="lg"
              class="submit-btn text-none mt-2"
            >
              Đăng ký học sinh
            </v-btn>
            <div class="text-center mt-4">
              <span class="footer-text">Đã có tài khoản? </span>
              <a class="login-link" @click="router.push('/login')">Đăng nhập</a>
            </div>
          </v-form>
        </v-card>
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

const gradeLevels = Array.from({ length: 12 }, (_, i) => i + 1);

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  gradeLevel: null,
  dateOfBirth: "",
});

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    await authStore.register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: "student",
      gradeLevel: form.gradeLevel,
      dateOfBirth: form.dateOfBirth,
    });
    router.push("/login");
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || "Đăng ký thất bại, thử lại nhé";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
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

.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, #3d5afe, #6c7fff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px -6px rgba(61, 90, 254, 0.4);
}

.back-btn {
  color: #6b7383 !important;
}

.main-bg {
  background:
    radial-gradient(circle at 15% 0%, rgba(61, 90, 254, 0.06), transparent 45%),
    radial-gradient(
      circle at 100% 20%,
      rgba(255, 150, 90, 0.05),
      transparent 40%
    ),
    #fbfcfe;
  min-height: 100%;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a2540;
  letter-spacing: -0.01em;
}

.page-subtitle {
  color: #6b7383;
  font-size: 1rem;
  font-weight: 500;
}

.field-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #4a5468;
  margin-bottom: 6px;
  letter-spacing: 0.01em;
}

.form-card {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecf3;
  box-shadow: 0 8px 30px -10px rgba(20, 30, 60, 0.08);
}

:deep(.v-field) {
  background-color: #fbfcfe;
}

:deep(.v-field--focused) {
  background-color: #ffffff;
}

.submit-btn {
  box-shadow: 0 8px 18px -6px rgba(61, 90, 254, 0.4) !important;
  font-weight: 600;
  height: 50px !important;
}

.footer-text {
  font-size: 0.875rem;
  color: #6b7383;
}

.login-link {
  font-size: 0.875rem;
  font-weight: 700;
  color: #3d5afe;
  cursor: pointer;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
