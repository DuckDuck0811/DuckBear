<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">BÀI TẬP & ĐỀ THI</div>
        <h1 class="t-page-title">Ngân hàng đề</h1>
        <p class="t-page-subtitle">Quản lý các đề thi đã giao, theo dõi hạn nộp và mở lại nội dung đề bài.</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        style="border-radius: 8px; font-weight: 600; flex-shrink: 0"
        @click="router.push({ name: 'teacher-assignments-create' })"
      >
        Tạo đề mới
      </v-btn>
    </div>

    <!-- Alert -->
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-5" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <!-- Quick Stat Overview Bar -->
    <v-row class="mb-4">
      <v-col cols="6" sm="4">
        <div class="t-stat-card d-flex align-center ga-3">
          <div class="stat-icon-box" style="background: #eef3ff">
            <v-icon color="#4F7CFF" size="20">mdi-archive-outline</v-icon>
          </div>
          <div>
            <div class="t-stat-value">{{ assignments.length }}</div>
            <div class="t-stat-label">Tổng số đề thi</div>
          </div>
        </div>
      </v-col>
      <v-col cols="6" sm="4">
        <div class="t-stat-card d-flex align-center ga-3">
          <div class="stat-icon-box" style="background: #f0fdf4">
            <v-icon color="#22C55E" size="20">mdi-clock-check-outline</v-icon>
          </div>
          <div>
            <div class="t-stat-value" style="color: #22C55E">{{ activeAssignmentsCount }}</div>
            <div class="t-stat-label">Đề đang mở</div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="4">
        <div class="t-stat-card d-flex align-center ga-3">
          <div class="stat-icon-box" style="background: #fffbeb">
            <v-icon color="#F59E0B" size="20">mdi-google-classroom</v-icon>
          </div>
          <div>
            <div class="t-stat-value" style="color: #F59E0B">{{ assignedClassesCount }}</div>
            <div class="t-stat-label">Lớp đã được giao đề</div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filters & Search Bar -->
    <div class="t-filter-bar mb-5">
      <v-row dense>
        <v-col cols="12" sm="6" md="5">
          <v-text-field
            v-model="searchKeyword"
            placeholder="Tìm theo tên bài tập..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
          />
        </v-col>
        <v-col cols="6" sm="3" md="4">
          <v-select
            v-model="selectedClassFilter"
            :items="classFilterOptions"
            placeholder="Tất cả các lớp"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
          />
        </v-col>
        <v-col cols="6" sm="3" md="3">
          <v-select
            v-model="selectedStatusFilter"
            :items="[
              { title: 'Tất cả trạng thái', value: 'all' },
              { title: 'Đang mở nộp', value: 'active' },
              { title: 'Đã hết hạn', value: 'expired' },
            ]"
            item-title="title"
            item-value="value"
            placeholder="Trạng thái"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredAssignments.length" class="t-empty-state">
      <v-icon icon="mdi-clipboard-text-outline" size="48" color="#9CA3AF" />
      <p class="t-empty-title">Không tìm thấy bài tập nào</p>
      <p class="t-empty-desc">Thử tìm kiếm với từ khóa khác hoặc tạo đề mới ngay.</p>
      <v-btn
        color="primary"
        variant="flat"
        class="text-none"
        style="border-radius: 8px"
        @click="router.push({ name: 'teacher-assignments-create' })"
      >
        Tạo đề mới
      </v-btn>
    </div>

    <!-- Assignment Cards Grid -->
    <v-row v-else>
      <v-col
        v-for="(assignment, idx) in filteredAssignments"
        :key="assignment.id"
        cols="12"
        md="6"
        lg="4"
      >
        <div class="assignment-card t-card t-card-hover h-100">
          <!-- Card Header Banner with Gradient & Badges -->
          <div
            class="assignment-banner"
            :style="{ background: getCardTheme(idx).gradient }"
          >
            <div class="banner-pattern" />

            <div class="banner-content">
              <div class="d-flex align-center ga-2">
                <span class="banner-class-pill">
                  <v-icon size="13" color="#4F7CFF" start>mdi-google-classroom</v-icon>
                  {{ assignment.className || "Đề công khai" }}
                </span>
              </div>

              <!-- Status Badge -->
              <span
                v-if="isExpired(assignment.deadline)"
                class="banner-status-pill status--expired"
              >
                Đã hết hạn
              </span>
              <span
                v-else
                class="banner-status-pill status--active"
              >
                Đang mở
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="assignment-body">
            <h3 class="assignment-title" :title="assignment.title">
              {{ assignment.title }}
            </h3>

            <!-- Meta attributes -->
            <div class="assignment-meta-row">
              <span class="meta-pill">
                <v-icon size="14" color="#64748B">mdi-help-circle-outline</v-icon>
                {{ assignment.totalQuestions }} câu hỏi
              </span>
              <span class="meta-pill">
                <v-icon size="14" color="#64748B">mdi-clock-outline</v-icon>
                {{ assignment.timeLimit || 45 }} phút
              </span>
            </div>

            <!-- Deadline info -->
            <div class="assignment-deadline">
              <v-icon size="15" :color="isExpired(assignment.deadline) ? '#EF4444' : '#F59E0B'" start>
                mdi-calendar-clock
              </v-icon>
              <span>{{ deadlineText(assignment.deadline) }}</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="assignment-actions">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              class="text-none flex-1"
              style="border-radius: 7px; font-weight: 600"
              @click="openDetail(assignment)"
            >
              <v-icon start size="16">mdi-eye-outline</v-icon>
              Xem đề
            </v-btn>

            <v-btn
              v-if="assignment.classId"
              variant="text"
              color="primary"
              size="small"
              class="text-none flex-1"
              style="border-radius: 7px; font-weight: 600"
              :to="{ name: 'ClassDashboard', params: { classId: assignment.classId } }"
            >
              <v-icon start size="16">mdi-clipboard-check-outline</v-icon>
              Chấm bài
            </v-btn>

            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="error"
              title="Xóa đề"
              @click="removeAssignment(assignment)"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Detail dialog -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card style="border-radius: 16px">
        <v-card-title class="d-flex align-center px-5 pt-5 pb-2">
          <div>
            <div class="t-eyebrow" style="margin-bottom: 2px">CHI TIẾT ĐỀ THI</div>
            <span class="t-dialog-title">{{ selectedAssignment?.title }}</span>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailDialog = false" />
        </v-card-title>

        <v-card-text class="px-5">
          <div v-if="detailLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <v-list v-else-if="detail?.questions?.length" lines="three" border rounded class="t-card">
            <v-list-item
              v-for="(question, index) in detail.questions"
              :key="question.id"
              :title="questionTitle(question, index)"
              :subtitle="questionSubtitle(question)"
            >
              <template #prepend>
                <v-avatar color="#eef3ff" size="32" class="mr-3">
                  <span class="font-weight-700" style="color: #4F7CFF; font-size: 13px">
                    {{ index + 1 }}
                  </span>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="t-empty-state" style="margin: 0">
            <v-icon icon="mdi-help-circle-outline" size="40" color="#9CA3AF" />
            <p class="t-empty-title">Đề chưa có câu hỏi nào</p>
          </div>
        </v-card-text>
        <div class="pb-3" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import {
  deleteAssignmentApi,
  getAssignmentDetailApi,
  getTeacherAssignmentsApi,
} from "@/api/assignment";

const router = useRouter();
const authStore = useAuthStore();
const assignments = ref([]);
const selectedAssignment = ref(null);
const detail = ref(null);
const loading = ref(true);
const detailLoading = ref(false);
const detailDialog = ref(false);
const errorMessage = ref("");

// Search & Filter state
const searchKeyword = ref("");
const selectedClassFilter = ref("Tất cả các lớp");
const selectedStatusFilter = ref("all");

// Card Banner Themes
const cardThemes = [
  { gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" },
  { gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" },
  { gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)" },
  { gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" },
  { gradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)" },
  { gradient: "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)" },
];

function getCardTheme(idx) {
  return cardThemes[idx % cardThemes.length];
}

function isExpired(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function deadlineText(value) {
  return value
    ? `Hạn nộp: ${new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))}`
    : "Không giới hạn thời gian nộp";
}

function questionTitle(question, index) {
  return `Câu ${index + 1}. ${question.content}`;
}

function questionSubtitle(question) {
  return `${question.type} · ${question.difficulty} · ${question.options?.length || 0} phương án`;
}

const activeAssignmentsCount = computed(() => {
  return assignments.value.filter((a) => !isExpired(a.deadline)).length;
});

const assignedClassesCount = computed(() => {
  const classes = new Set(assignments.value.map((a) => a.className).filter(Boolean));
  return classes.size;
});

const classFilterOptions = computed(() => {
  const set = new Set(assignments.value.map((a) => a.className).filter(Boolean));
  return ["Tất cả các lớp", ...Array.from(set)];
});

const filteredAssignments = computed(() => {
  return assignments.value.filter((a) => {
    if (searchKeyword.value.trim()) {
      const q = searchKeyword.value.toLowerCase();
      if (!a.title?.toLowerCase().includes(q)) return false;
    }
    if (selectedClassFilter.value !== "Tất cả các lớp") {
      if (a.className !== selectedClassFilter.value) return false;
    }
    if (selectedStatusFilter.value === "active") {
      if (isExpired(a.deadline)) return false;
    } else if (selectedStatusFilter.value === "expired") {
      if (!isExpired(a.deadline)) return false;
    }
    return true;
  });
});

async function loadAssignments() {
  loading.value = true;
  try {
    assignments.value = (
      await getTeacherAssignmentsApi(authStore.userId)
    ).data || [];
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được ngân hàng đề";
  } finally {
    loading.value = false;
  }
}

async function openDetail(assignment) {
  selectedAssignment.value = assignment;
  detail.value = null;
  detailDialog.value = true;
  detailLoading.value = true;
  try {
    detail.value = (await getAssignmentDetailApi(assignment.id)).data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được chi tiết đề";
  } finally {
    detailLoading.value = false;
  }
}

async function removeAssignment(assignment) {
  if (!window.confirm(`Xóa đề "${assignment.title}"?`)) return;
  try {
    await deleteAssignmentApi(assignment.id);
    assignments.value = assignments.value.filter(
      (item) => item.id !== assignment.id,
    );
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể xóa đề";
  }
}

onMounted(loadAssignments);
</script>

<style scoped>
.stat-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assignment-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
}

.assignment-banner {
  height: 64px;
  position: relative;
  padding: 12px 16px;
  overflow: hidden;
}

.banner-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-class-pill {
  background: #ffffff;
  color: #1e293b;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.banner-status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.status--active {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.status--expired {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.assignment-body {
  padding: 16px;
  flex: 1;
}

.assignment-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
  line-height: 1.35;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.assignment-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.assignment-deadline {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.assignment-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px 12px;
  border-top: 1px solid #f1f5f9;
}

.t-dialog-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1d2e;
}
</style>
