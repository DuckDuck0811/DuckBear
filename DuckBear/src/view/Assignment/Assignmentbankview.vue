<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">BÀI TẬP</div>
        <h1 class="t-page-title">Ngân hàng đề</h1>
        <p class="t-page-subtitle">Quản lý các đề đã tạo và mở lại nội dung để kiểm tra.</p>
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

    <v-alert v-if="errorMessage" type="error" class="mb-5" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty -->
    <div v-else-if="!assignments.length" class="t-empty-state">
      <v-icon icon="mdi-clipboard-text-outline" size="48" color="#9CA3AF" class="t-empty-icon" />
      <p class="t-empty-title">Chưa có đề nào</p>
      <p class="t-empty-desc">Tạo đề đầu tiên để giao cho học sinh.</p>
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

    <!-- Assignment grid -->
    <v-row v-else>
      <v-col
        v-for="assignment in assignments"
        :key="assignment.id"
        cols="12"
        md="6"
        lg="4"
      >
        <div class="assignment-card t-card t-card-hover h-100">
          <!-- Card header stripe -->
          <div class="card-stripe" />

          <div class="card-body">
            <div class="card-top">
              <div class="card-icon-wrap">
                <v-icon icon="mdi-clipboard-text-outline" size="20" color="#4F7CFF" />
              </div>
              <v-chip
                size="small"
                :color="assignment.status === 'private' ? 'primary' : 'success'"
                variant="tonal"
                style="font-size: 11px; font-weight: 600"
              >
                {{ assignment.status === "private" ? "Giao cho lớp" : "Công khai" }}
              </v-chip>
            </div>

            <p class="card-title">{{ assignment.title }}</p>
            <p class="card-sub">{{ assignment.className || "Đề công khai" }}</p>

            <div class="card-meta">
              <span class="meta-item">
                <v-icon size="14" color="#9CA3AF">mdi-help-circle-outline</v-icon>
                {{ assignment.totalQuestions }} câu
              </span>
              <span v-if="assignment.timeLimit" class="meta-item">
                <v-icon size="14" color="#9CA3AF">mdi-clock-outline</v-icon>
                {{ assignment.timeLimit }} phút
              </span>
            </div>

            <p class="card-deadline">{{ deadlineText(assignment.deadline) }}</p>
          </div>

          <div class="card-actions">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              class="text-none"
              style="border-radius: 7px; font-weight: 600"
              @click="openDetail(assignment)"
            >
              <v-icon start size="16">mdi-eye-outline</v-icon>
              Xem đề
            </v-btn>
            <v-spacer />
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="error"
              @click="removeAssignment(assignment)"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Detail dialog -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card style="border-radius: 14px">
        <v-card-title class="d-flex align-center px-5 pt-5 pb-2">
          <span class="t-dialog-title">{{ selectedAssignment?.title }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailDialog = false" />
        </v-card-title>
        <v-card-text class="px-5">
          <div v-if="detailLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <v-list v-else-if="detail?.questions?.length" lines="three" border rounded>
            <v-list-item
              v-for="(question, index) in detail.questions"
              :key="question.id"
              :title="questionTitle(question, index)"
              :subtitle="questionSubtitle(question)"
            />
          </v-list>
          <div v-else class="t-empty-state" style="margin: 0">
            <v-icon icon="mdi-help-circle-outline" size="40" color="#9CA3AF" />
            <p class="t-empty-title">Đề chưa có câu hỏi</p>
          </div>
        </v-card-text>
        <div class="pb-3" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
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

function deadlineText(value) {
  return value
    ? `Hạn nộp: ${new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))}`
    : "Không đặt hạn nộp";
}

function questionTitle(question, index) {
  return `Câu ${index + 1}. ${question.content}`;
}

function questionSubtitle(question) {
  return `${question.type} · ${question.difficulty} · ${question.options?.length || 0} phương án`;
}

async function loadAssignments() {
  loading.value = true;
  try {
    assignments.value = (
      await getTeacherAssignmentsApi(authStore.userId)
    ).data;
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
.assignment-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.card-stripe {
  height: 4px;
  background: linear-gradient(90deg, #4f7cff, #7ba3ff);
  flex-shrink: 0;
}

.card-body {
  padding: 16px;
  flex: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-weight: 700;
  font-size: 14px;
  color: #1a1d2e;
  margin-bottom: 3px;
  line-height: 1.4;
}

.card-sub {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  gap: 14px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.card-deadline {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  padding: 10px 16px 12px;
  border-top: 1px solid #f0f2f8;
}
</style>
