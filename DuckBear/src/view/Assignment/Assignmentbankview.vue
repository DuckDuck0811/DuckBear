<template>
  <div class="page-wrap">
    <div class="page-heading">
      <div>
        <div class="eyebrow">BÀI TẬP</div>
        <h1>Ngân hàng đề</h1>
        <p>Quản lý các đề đã tạo và mở lại nội dung để kiểm tra.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push({ name: 'teacher-assignments-create' })">Tạo đề mới</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-5">{{ errorMessage }}</v-alert>
    <div v-if="loading" class="text-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <v-empty-state v-else-if="!assignments.length" icon="mdi-clipboard-text-outline" title="Chưa có đề nào" text="Tạo đề đầu tiên để giao cho học sinh." />

    <v-row v-else>
      <v-col v-for="assignment in assignments" :key="assignment.id" cols="12" md="6" lg="4">
        <v-card class="assignment-card h-100" elevation="1">
          <v-card-item>
            <template #prepend><v-avatar color="primary" variant="tonal"><v-icon>mdi-clipboard-text-outline</v-icon></v-avatar></template>
            <v-card-title>{{ assignment.title }}</v-card-title>
            <v-card-subtitle>{{ assignment.className || "Đề công khai" }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <div class="meta-row"><span><v-icon size="16">mdi-help-circle-outline</v-icon> {{ assignment.totalQuestions }} câu</span><span v-if="assignment.timeLimit"><v-icon size="16">mdi-clock-outline</v-icon> {{ assignment.timeLimit }} phút</span></div>
            <div class="text-caption text-medium-emphasis mt-4">{{ deadlineText(assignment.deadline) }}</div>
            <v-chip size="small" class="mt-3" :color="assignment.status === 'private' ? 'primary' : 'success'" variant="tonal">
              {{ assignment.status === "private" ? "Giao cho lớp" : "Công khai" }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="tonal" color="primary" @click="openDetail(assignment)"><v-icon start>mdi-eye-outline</v-icon> Xem đề</v-btn>
            <v-spacer />
            <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="removeAssignment(assignment)" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="detailDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center"><span>{{ selectedAssignment?.title }}</span><v-spacer /><v-btn icon="mdi-close" variant="text" @click="detailDialog = false" /></v-card-title>
        <v-card-text>
          <div v-if="detailLoading" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
          <v-list v-else-if="detail?.questions?.length" lines="three" border rounded>
            <v-list-item v-for="(question, index) in detail.questions" :key="question.id" :title="questionTitle(question, index)" :subtitle="questionSubtitle(question)" />
          </v-list>
          <v-empty-state v-else icon="mdi-help-circle-outline" title="Đề chưa có câu hỏi" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { deleteAssignmentApi, getAssignmentDetailApi, getTeacherAssignmentsApi } from "@/api/assignment";

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
  return value ? `Hạn nộp: ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))}` : "Không đặt hạn nộp";
}

function questionTitle(question, index) {
  return `Câu ${index + 1}. ${question.content}`;
}

function questionSubtitle(question) {
  return `${question.type} · ${question.difficulty} · ${question.options?.length || 0} phương án`;
}

async function loadAssignments() {
  loading.value = true;
  try { assignments.value = (await getTeacherAssignmentsApi(authStore.userId)).data; }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được ngân hàng đề"; }
  finally { loading.value = false; }
}

async function openDetail(assignment) {
  selectedAssignment.value = assignment;
  detail.value = null;
  detailDialog.value = true;
  detailLoading.value = true;
  try { detail.value = (await getAssignmentDetailApi(assignment.id)).data; }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được chi tiết đề"; }
  finally { detailLoading.value = false; }
}

async function removeAssignment(assignment) {
  if (!window.confirm(`Xóa đề “${assignment.title}”?`)) return;
  try { await deleteAssignmentApi(assignment.id); assignments.value = assignments.value.filter((item) => item.id !== assignment.id); }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể xóa đề"; }
}

onMounted(loadAssignments);
</script>

<style scoped>
.page-wrap { padding: 28px; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.eyebrow { color: #3d5afe; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; }
.page-heading h1 { color: #1a2540; font-size: 28px; margin-top: 6px; }
.page-heading p { color: #7c8496; margin-top: 6px; }
.assignment-card { border-radius: 14px; }
.meta-row { display: flex; gap: 18px; color: #687286; font-size: 14px; }
@media (max-width: 600px) { .page-wrap { padding: 16px; } .page-heading { align-items: start; flex-direction: column; } }
</style>
