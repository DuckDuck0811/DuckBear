<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">TÀI KHOẢN</div>
        <h1 class="t-page-title">Hồ sơ cá nhân</h1>
        <p class="t-page-subtitle">
          Quản lý thông tin tài khoản, bảo mật mật khẩu và thiết lập giảng dạy.
        </p>
      </div>
    </div>

    <v-alert
      v-if="successMsg"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="successMsg = ''"
    >
      {{ successMsg }}
    </v-alert>

    <v-row>
      <!-- Left Column: Avatar & Summary Card -->
      <v-col cols="12" md="4">
        <div class="t-card text-center pa-6 mb-5">
          <v-avatar size="88" color="#EEF3FF" class="profile-avatar mb-3">
            <v-icon size="48" color="#4F7CFF">mdi-account-tie</v-icon>
          </v-avatar>

          <h2 class="profile-name">{{ profile.fullName || "Giáo viên DuckBear" }}</h2>
          <p class="profile-email mb-3">{{ profile.email }}</p>

          <div class="d-flex justify-center mb-4">
            <span class="t-badge t-badge--accent">
              <v-icon start size="14">mdi-shield-check-outline</v-icon>
              Tài khoản Giáo viên
            </span>
          </div>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-around text-center">
            <div>
              <div class="stat-number">4</div>
              <div class="text-caption text-secondary">Lớp học</div>
            </div>
            <v-divider vertical />
            <div>
              <div class="stat-number">24</div>
              <div class="text-caption text-secondary">Bài tập</div>
            </div>
            <v-divider vertical />
            <div>
              <div class="stat-number">142</div>
              <div class="text-caption text-secondary">Học sinh</div>
            </div>
          </div>
        </div>

        <div class="t-card pa-5">
          <div class="section-title mb-3">Thông tin hệ thống</div>
          <div class="meta-row">
            <span class="text-muted">Mã định danh (ID):</span>
            <span class="font-weight-600">#{{ authStore.userId || "001" }}</span>
          </div>
          <div class="meta-row">
            <span class="text-muted">Vai trò:</span>
            <span class="font-weight-600">Giáo viên (Teacher)</span>
          </div>
          <div class="meta-row">
            <span class="text-muted">Trạng thái:</span>
            <span class="t-badge t-badge--success">Đang hoạt động</span>
          </div>
        </div>
      </v-col>

      <!-- Right Column: Edit Profile & Password -->
      <v-col cols="12" md="8">
        <!-- Personal Information Card -->
        <div class="t-card pa-6 mb-5">
          <div class="section-title mb-1">Thông tin chi tiết</div>
          <p class="text-caption text-secondary mb-5">
            Cập nhật tên hiển thị và thông tin liên hệ của bạn.
          </p>

          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Họ và tên *</div>
              <v-text-field
                v-model="profile.fullName"
                variant="outlined"
                density="comfortable"
                placeholder="VD: Thầy Nguyễn Văn A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Địa chỉ Email *</div>
              <v-text-field
                v-model="profile.email"
                variant="outlined"
                density="comfortable"
                readonly
                disabled
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Số điện thoại</div>
              <v-text-field
                v-model="profile.phone"
                variant="outlined"
                density="comfortable"
                placeholder="VD: 0912 345 678"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Tổ bộ môn / Chuyên môn</div>
              <v-text-field
                v-model="profile.subject"
                variant="outlined"
                density="comfortable"
                placeholder="VD: Tổ Toán - Tin học"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12">
              <div class="t-field-label">Đơn vị công tác (Trường học)</div>
              <v-text-field
                v-model="profile.school"
                variant="outlined"
                density="comfortable"
                placeholder="VD: THPT Chuyên DuckBear"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none"
              style="border-radius: 8px; font-weight: 600"
              @click="saveProfile"
            >
              Lưu thay đổi
            </v-btn>
          </div>
        </div>

        <!-- Security / Password Card -->
        <div class="t-card pa-6">
          <div class="section-title mb-1">Đổi mật khẩu</div>
          <p class="text-caption text-secondary mb-5">
            Đảm bảo sử dụng mật khẩu mạnh để bảo vệ tài khoản giảng dạy của bạn.
          </p>

          <v-row dense>
            <v-col cols="12">
              <div class="t-field-label">Mật khẩu hiện tại</div>
              <v-text-field
                v-model="passwords.current"
                type="password"
                variant="outlined"
                density="comfortable"
                placeholder="••••••••"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Mật khẩu mới</div>
              <v-text-field
                v-model="passwords.new"
                type="password"
                variant="outlined"
                density="comfortable"
                placeholder="Tối thiểu 6 ký tự"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Xác nhận mật khẩu mới</div>
              <v-text-field
                v-model="passwords.confirm"
                type="password"
                variant="outlined"
                density="comfortable"
                placeholder="Nhập lại mật khẩu mới"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none"
              style="border-radius: 8px; font-weight: 600"
              @click="changePassword"
            >
              Cập nhật mật khẩu
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();
const successMsg = ref("");

const profile = reactive({
  fullName: "Thầy Giáo Viên",
  email: authStore.email || "teacher@duckbear.edu.vn",
  phone: "0988 123 456",
  subject: "Tổ Toán - Khoa học Tự nhiên",
  school: "Trường THPT DuckBear",
});

const passwords = reactive({
  current: "",
  new: "",
  confirm: "",
});

function saveProfile() {
  successMsg.value = "Đã cập nhật thông tin hồ sơ thành công!";
  setTimeout(() => {
    successMsg.value = "";
  }, 3500);
}

function changePassword() {
  if (!passwords.new || passwords.new !== passwords.confirm) {
    alert("Mật khẩu mới không khớp hoặc đang để trống!");
    return;
  }
  successMsg.value = "Đổi mật khẩu thành công!";
  passwords.current = "";
  passwords.new = "";
  passwords.confirm = "";
  setTimeout(() => {
    successMsg.value = "";
  }, 3500);
}
</script>

<style scoped>
.profile-avatar {
  border: 3px solid #eef3ff;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1d2e;
}

.profile-email {
  font-size: 13px;
  color: #64748b;
}

.stat-number {
  font-size: 20px;
  font-weight: 800;
  color: #4f7cff;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}

.meta-row:last-child {
  border-bottom: none;
}
</style>
