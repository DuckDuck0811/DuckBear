<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      flat
      color="white"
      height="76"
      class="px-6"
      style="border-bottom: 1px solid #edf0f5"
    >
      <v-container class="d-flex align-center" style="max-width: 1400px">
        <div class="d-flex align-center">
          <div class="logo-badge">
            <v-icon color="white" size="24">mdi-school</v-icon>
          </div>
          <div class="ml-3">
            <div
              class="text-subtitle-1 font-weight-bold"
              style="color: #1a2540"
            >
              Tên App
            </div>
            <div class="text-caption" style="color: #8a93a6">Classroom</div>
          </div>
        </div>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="#4366f0"
          rounded="pill"
          class="text-none px-8"
          @click="router.push('/register')"
        >
          <v-icon size="20" class="mr-2">mdi-account-plus</v-icon>
          Đăng ký
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-bg">
      <v-container style="max-width: 1200px; position: relative; z-index: 1">
        <v-row class="py-0" align="center">
          <!-- Left Section -->
          <v-col cols="12" md="6" class="d-flex flex-column justify-center">
            <h1 class="page-title">
              <span class="title-highlight">Đăng nhập</span>
            </h1>
            <p class="page-subtitle mt-4">
              Chọn vai trò của bạn để tiếp tục với trải nghiệm phù hợp nhất.
            </p>

            <!-- Stats Section -->
            <div class="stats-section mt-4">
              <div class="stat-item">
                <div class="stat-number">{{ stats.studentCount }}</div>
                <div class="stat-label">Học sinh</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.teacherCount }}</div>
                <div class="stat-label">Giáo viên</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.classCount }}</div>
                <div class="stat-label">Lớp học</div>
              </div>
            </div>

            <!-- Decorative Illustration -->
            <div class="illustration-wrap mt-6">
              <img
                src="/bag.png"
                alt="Minh họa đăng nhập"
                class="login-illustration"
              />
            </div>
          </v-col>

          <!-- Right Section - Role Selection -->
          <v-col cols="12" md="6">
            <v-row class="ga-6">
              <!-- Student Card -->
              <v-col cols="12" sm="6">
                <v-card
                  flat
                  class="role-card pa-8 text-center"
                  :class="{ 'role-card--active': activeRole === 'STUDENT' }"
                  @click="selectRole('STUDENT')"
                  @mouseenter="activeRole = 'STUDENT'"
                  @mouseleave="activeRole = null"
                >
                  <!-- Icon Background -->
                  <div class="role-image-wrap">
                    <img
                      src="/student.png"
                      alt="Học sinh"
                      class="role-avatar-img"
                    />
                    <div class="role-badge role-badge--blue">
                      <v-icon size="20" color="white">mdi-school</v-icon>
                    </div>
                  </div>

                  <div class="role-content mt-8">
                    <h3 class="role-title">Học sinh</h3>
                    <p class="role-description mt-2">
                      Đăng nhập để vào lớp học và học tập cùng bạn bè.
                    </p>
                  </div>

                  <v-btn
                    color="#4366f0"
                    variant="flat"
                    block
                    class="mt-6 role-btn text-none font-weight-600"
                    rounded="lg"
                    size="large"
                    @click.stop="router.push('/login/student')"
                  >
                    <v-icon size="20" class="mr-2">mdi-school</v-icon>
                    Tôi là học sinh
                  </v-btn>
                </v-card>
              </v-col>

              <!-- Teacher Card -->
              <v-col cols="12" sm="6">
                <v-card
                  flat
                  class="role-card pa-8 text-center"
                  :class="{ 'role-card--active': activeRole === 'TEACHER' }"
                  @click="selectRole('TEACHER')"
                  @mouseenter="activeRole = 'TEACHER'"
                  @mouseleave="activeRole = null"
                >
                  <!-- Icon Background -->
                  <div class="role-image-wrap">
                    <img
                      src="/teacher.png"
                      alt="Giáo viên"
                      class="role-avatar-img"
                    />
                    <div class="role-badge role-badge--orange">
                      <v-icon size="20" color="white">mdi-briefcase</v-icon>
                    </div>
                  </div>

                  <div class="role-content mt-8">
                    <h3 class="role-title">Giáo viên</h3>
                    <p class="role-description mt-2">
                      Đăng nhập để quản lý lớp học và theo dõi tiến độ học tập.
                    </p>
                  </div>

                  <v-btn
                    color="#ff9656"
                    variant="flat"
                    block
                    class="mt-6 role-btn text-none font-weight-600"
                    rounded="lg"
                    size="large"
                    @click.stop="router.push('/login/teacher')"
                  >
                    <v-icon size="20" class="mr-2">mdi-briefcase</v-icon>
                    Tôi là giáo viên
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getStats } from "@/service/statsService";

const router = useRouter();
const activeRole = ref(null);
const stats = ref({
  studentCount: "...",
  teacherCount: "...",
  classCount: "...",
});

const selectRole = (role) => {
  activeRole.value = role;
};

// Fetch stats khi component mount
onMounted(async () => {
  const data = await getStats();
  stats.value = data;
});
</script>

<style scoped>
/* Logo Badge */
.logo-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4366f0, #6c7fff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(67, 102, 240, 0.3);
  flex-shrink: 0;
}

/* Background */
.main-bg {
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(67, 102, 240, 0.08),
      transparent 35%
    ),
    radial-gradient(
      circle at 95% 80%,
      rgba(255, 150, 86, 0.06),
      transparent 40%
    ),
    linear-gradient(180deg, #fbfcfe 0%, #f8fafd 100%);
  min-height: auto;
  position: relative;
  overflow: hidden;
}

/* Typography */
.greeting-text {
  font-size: 1rem;
  font-weight: 500;
  color: #8a93a6;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.page-title {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 0;
}

.page-title::after {
  display: none; /* Ẩn underline */
}

.title-highlight {
  color: #4366f0;
}

.page-subtitle {
  font-size: 0.95rem; /* Match với ảnh */
  color: #6b7383;
  font-weight: 400;
  line-height: 1.5;
  max-width: 100%;
}

/* Decorative Elements */
.illustration-wrap {
  max-width: 480px;
  margin-top: -60px;
}

.login-illustration {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 30px 50px rgba(67, 102, 240, 0.12));
}

/* Role Cards */
.role-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e9ecf3;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  box-shadow: 0 2px 8px rgba(26, 37, 64, 0.06);
  position: relative;
  overflow: hidden;
}

.role-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4366f0, #6c7fff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-card--active {
  border-color: #4366f0;
  box-shadow: 0 24px 48px -12px rgba(67, 102, 240, 0.25);
  transform: translateY(-8px);
}

.role-card--active::before {
  opacity: 1;
}

.role-card:hover:not(.role-card--active) {
  box-shadow: 0 8px 24px rgba(26, 37, 64, 0.08);
  border-color: #d0d6e8;
}

/* Role Image */
/* Role Image */
.role-image-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(160deg, #eef1ff, #f7f9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.role-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.role-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.role-badge--blue {
  background: linear-gradient(135deg, #4366f0, #6c7fff);
}

.role-badge--orange {
  background: linear-gradient(135deg, #ff9656, #ffb380);
}

/* Role Content */
.role-content {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.role-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2540;
  margin: 0;
}

.role-description {
  font-size: 0.9rem;
  color: #8a93a6;
  line-height: 1.5;
  margin: 0;
}

/* Role Button */
.role-btn {
  box-shadow: 0 8px 20px -6px rgba(67, 102, 240, 0.35) !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.role-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -8px rgba(67, 102, 240, 0.4) !important;
}

.teacher-bg ~ .role-content ~ .role-btn {
  box-shadow: 0 8px 20px -6px rgba(255, 150, 86, 0.35) !important;
}

.teacher-bg ~ .role-content ~ .role-btn:hover {
  box-shadow: 0 12px 28px -8px rgba(255, 150, 86, 0.4) !important;
}

/* Security Note */
.security-note {
  text-align: center;
  color: #8a93a6;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(67, 102, 240, 0.04);
  border-radius: 12px;
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
  border: 1px solid rgba(67, 102, 240, 0.08);
}

/* Responsive */
@media (max-width: 960px) {
  .page-title {
    font-size: 2.5rem;
  }

  .decorator-group {
    display: none;
  }

  .page-subtitle {
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2rem;
  }

  .greeting-text {
    font-size: 0.9rem;
  }

  .role-card {
    padding: 24px !important;
  }

  .avatar-bg {
    width: 100px;
    height: 100px;
  }

  .role-title {
    font-size: 1.1rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.greeting-text,
.page-title,
.page-subtitle {
  animation: slideIn 0.6s ease-out forwards;
}

.greeting-text {
  animation-delay: 0.1s;
}

.page-title {
  animation-delay: 0.2s;
}

.page-subtitle {
  animation-delay: 0.3s;
}
/* Stats Section */
.stats-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
  margin-top: 8px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #4366f0;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #8a93a6;
  margin-top: 6px;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e9ecf3;
}

@media (max-width: 600px) {
  .stats-section {
    gap: 12px;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .stat-divider {
    height: 30px;
  }
}
</style>
