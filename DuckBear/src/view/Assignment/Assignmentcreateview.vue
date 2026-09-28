<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">BÀI TẬP</div>
        <h1 class="t-page-title">Tạo và giao đề</h1>
        <p class="t-page-subtitle">Chọn lớp, nội dung và câu hỏi để học sinh nhận được bài.</p>
      </div>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        class="text-none"
        style="border-color: #e8ecf4; color: #6b7280; border-radius: 8px; flex-shrink: 0"
        @click="router.push({ name: 'teacher-assignments-bank' })"
      >
        Ngân hàng đề
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-5" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-card class="t-card" style="max-width: 920px">
      <v-card-text class="pa-6">
        <div class="t-field-label">Tên bài tập</div>
        <v-text-field
          v-model="form.title"
          variant="outlined"
          density="comfortable"
          placeholder="VD: Kiểm tra chương 1 - Toán 6"
          class="mb-4"
        />

        <v-row>
          <v-col cols="12" md="6">
            <div class="t-field-label">Giao cho lớp</div>
            <v-select
              v-model="form.classId"
              :items="classes"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="t-field-label">Loại đề</div>
            <v-select
              v-model="form.genType"
              :items="generationTypes"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="t-field-label">Bài học</div>
            <v-select
              v-model="form.lessonIds"
              :items="lessons"
              item-title="title"
              item-value="id"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="t-field-label">Câu hỏi</div>
            <v-select
              v-model="form.questionIds"
              :items="questions"
              item-title="content"
              item-value="id"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              :hint="`${form.questionIds.length}/50 câu`"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" md="4">
            <div class="t-field-label">Thời gian (phút)</div>
            <v-text-field
              v-model.number="form.timeLimit"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="4">
            <div class="t-field-label">Số lần làm tối đa</div>
            <v-text-field
              v-model.number="form.maxAttempts"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="4">
            <div class="t-field-label">Hạn nộp</div>
            <v-text-field
              v-model="form.deadline"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-5"
          style="border-radius: 10px"
        >
          Bài tập này sẽ được giao riêng cho lớp đã chọn. Học sinh sẽ thấy trong mục "Bài tập của tôi".
        </v-alert>

        <v-btn
          color="primary"
          size="large"
          block
          :loading="saving"
          style="border-radius: 10px; font-weight: 600; letter-spacing: 0"
          @click="saveAssignment"
        >
          <v-icon start>mdi-send-check</v-icon>
          Tạo và giao bài
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
const form = reactive({
  title: "",
  classId: null,
  genType: "single_lesson",
  lessonIds: [],
  questionIds: [],
  timeLimit: 30,
  maxAttempts: 1,
  deadline: "",
  status: "private",
});

async function saveAssignment() {
  if (
    !form.title ||
    !form.classId ||
    !form.lessonIds.length ||
    !form.questionIds.length
  ) {
    errorMessage.value =
      "Vui lòng nhập tên, lớp, bài học và ít nhất một câu hỏi";
    return;
  }
  if (form.questionIds.length > 50) {
    errorMessage.value = "Một đề chỉ được tối đa 50 câu";
    return;
  }
  saving.value = true;
  try {
    await createAssignmentApi({
      ...form,
      teacherId: authStore.userId,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    });
    router.push({ name: "teacher-assignments-bank" });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể tạo bài tập";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const [classResponse, lessonResponse, questionResponse] = await Promise.all(
      [getClassesApi(), getLessonsApi(), getQuestionsApi()],
    );
    classes.value = classResponse.data;
    lessons.value = lessonResponse.data;
    questions.value = questionResponse.data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được dữ liệu tạo đề";
  }
});
</script>
