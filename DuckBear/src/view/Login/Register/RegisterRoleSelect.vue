<template>
  <v-app>
    <!-- Header -->
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
        class="py-9"
        style="max-width: 900px; position: relative; z-index: 1"
      >
        <div class="text-center mb-12">
          <h1 class="page-title">Đăng ký tài khoản mới</h1>
          <p class="page-subtitle mt-3">Chọn vai trò để tiếp tục</p>
        </div>

        <v-row justify="center">
          <v-col cols="12" sm="6" md="5">
            <v-card
              flat
              class="pa-8 text-center role-card"
              :class="{ 'role-card--active': hoverRole === 'student' }"
              @click="selectRole('student')"
              @mouseenter="hoverRole = 'student'"
              @mouseleave="hoverRole = null"
            >
              <div class="role-image-wrap">
                <img src="/student.png" alt="Học sinh" class="role-image" />
              </div>
              <div class="role-label mt-5">Học sinh</div>
              <div class="role-desc">
                Tham gia lớp học, làm bài tập và theo dõi tiến độ
              </div>
              <v-btn
                color="#3d5afe"
                variant="flat"
                block
                class="mt-6 role-btn text-none"
                rounded="lg"
                >Tôi là học sinh</v-btn
              >
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="5">
            <v-card
              flat
              class="pa-8 text-center role-card"
              :class="{ 'role-card--active': hoverRole === 'teacher' }"
              @click="selectRole('teacher')"
              @mouseenter="hoverRole = 'teacher'"
              @mouseleave="hoverRole = null"
            >
              <div class="role-image-wrap">
                <img src="/teacher.png" alt="Giáo viên" class="role-image" />
              </div>
              <div class="role-label mt-5">Giáo viên</div>
              <div class="role-desc">
                Tạo lớp học, giao bài tập và quản lý học sinh
              </div>
              <v-btn
                color="#3d5afe"
                variant="flat"
                block
                class="mt-6 role-btn text-none"
                rounded="lg"
                >Tôi là giáo viên</v-btn
              >
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const hoverRole = ref(null);

function selectRole(role) {
  router.push(`/register/${role.toLowerCase()}`);
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
  font-size: 2.1rem;
  font-weight: 700;
  color: #1a2540;
  letter-spacing: -0.01em;
}

.page-subtitle {
  color: #6b7383;
  font-size: 1rem;
  font-weight: 500;
}

.role-card {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecf3;
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  box-shadow: 0 1px 2px rgba(20, 30, 60, 0.04);
}

.role-card--active {
  border-color: #3d5afe;
  box-shadow: 0 20px 40px -12px rgba(61, 90, 254, 0.28);
  transform: translateY(-6px);
}

.role-image-wrap {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(160deg, #eef1ff, #f7f9ff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-image {
  width: 92px;
  height: 92px;
  object-fit: contain;
}

.role-label {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a2540;
}

.role-desc {
  font-size: 0.85rem;
  color: #8a93a6;
  margin-top: 4px;
  line-height: 1.4;
  padding: 0 8px;
}

.role-btn {
  box-shadow: 0 8px 18px -6px rgba(61, 90, 254, 0.4) !important;
  font-weight: 600;
}
</style>
