<template>
  <div class="page-wrap">
    <div class="page-heading">
      <div>
        <div class="eyebrow">BÀI TẬP</div>
        <h1>Tạo và giao đề</h1>
        <p>Chọn lớp, nội dung và câu hỏi để học sinh nhận được bài.</p>
      </div>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'teacher-assignments-bank' })">Ngân hàng đề</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-5">{{ errorMessage }}</v-alert>
    <v-card max-width="900" elevation="1" class="form-card">
      <v-card-text class="pa-6">
        <v-text-field v-model="form.title" label="Tên bài tập" variant="outlined" class="mb-3" />
        <v-row>
          <v-col cols="12" md="6">
            <v-select v-model="form.classId" :items="classes" item-title="name" item-value="id" label="Giao cho lớp" variant="outlined" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.genType" :items="generationTypes" item-title="title" item-value="value" label="Loại đề" variant="outlined" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.lessonIds" :items="lessons" item-title="title" item-value="id" label="Bài học" multiple chips variant="outlined" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.questionIds" :items="questions" item-title="content" item-value="id" label="Câu hỏi" multiple chips variant="outlined" :hint="`${form.questionIds.length}/50 câu`" persistent-hint />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="form.timeLimit" type="number" min="1" label="Thời gian (phút)" variant="outlined" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="form.maxAttempts" type="number" min="1" label="Số lần làm tối đa" variant="outlined" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.deadline" type="datetime-local" label="Hạn nộp" variant="outlined" /></v-col>
        </v-row>
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
          Bài tập này sẽ được giao riêng cho lớp đã chọn.
        </v-alert>
        <v-btn color="primary" size="large" block :loading="saving" @click="saveAssignment">
          <v-icon start>mdi-send-check</v-icon> Tạo và giao bài
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getClassesApi } from "@/api/class";
import { createAssignmentApi } from "@/api/assignment";
import { getLessonsApi } from "@/api/lesson";
import { getQuestionsApi } from "@/api/question";

const router = useRouter();
const authStore = useAuthStore();
const classes = ref([]);
const lessons = ref([]);
const questions = ref([]);
const saving = ref(false);
const errorMessage = ref("");
const generationTypes = [
  { title: "Một bài học", value: "single_lesson" },
  { title: "Nhiều bài học", value: "multi_lesson" },
  { title: "Toàn bộ sách", value: "full_book" },
];
const form = reactive({ title: "", classId: null, genType: "single_lesson", lessonIds: [], questionIds: [], timeLimit: 30, maxAttempts: 1, deadline: "", status: "private" });

async function saveAssignment() {
  if (!form.title || !form.classId || !form.lessonIds.length || !form.questionIds.length) {
    errorMessage.value = "Vui lòng nhập tên, lớp, bài học và ít nhất một câu hỏi";
    return;
  }
  if (form.questionIds.length > 50) { errorMessage.value = "Một đề chỉ được tối đa 50 câu"; return; }
  saving.value = true;
  try {
    await createAssignmentApi({ ...form, teacherId: authStore.userId, deadline: form.deadline ? new Date(form.deadline).toISOString() : null });
    router.push({ name: "teacher-assignments-bank" });
  } catch (error) { errorMessage.value = error.response?.data?.message || "Không thể tạo bài tập"; }
  finally { saving.value = false; }
}

onMounted(async () => {
  try {
    const [classResponse, lessonResponse, questionResponse] = await Promise.all([getClassesApi(), getLessonsApi(), getQuestionsApi()]);
    classes.value = classResponse.data;
    lessons.value = lessonResponse.data;
    questions.value = questionResponse.data;
  } catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được dữ liệu tạo đề"; }
});
</script>

<style scoped>
.page-wrap { padding: 28px; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.eyebrow { color: #3d5afe; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; }
.page-heading h1 { color: #1a2540; font-size: 28px; margin-top: 6px; }
.page-heading p { color: #7c8496; margin-top: 6px; }
.form-card { border-radius: 14px; }
@media (max-width: 600px) { .page-wrap { padding: 16px; } .page-heading { align-items: start; flex-direction: column; } }
</style>
