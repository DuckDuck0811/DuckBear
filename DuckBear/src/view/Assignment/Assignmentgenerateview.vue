<template>
  <div class="page-wrap">
    <div class="page-heading">
      <div>
        <div class="eyebrow">TRỢ LÝ SOẠN ĐỀ</div>
        <h1>Sinh câu hỏi bằng AI</h1>
        <p>AI chỉ sử dụng nội dung bài học bạn cung cấp để tạo câu hỏi ôn tập.</p>
      </div>
      <v-icon color="primary" size="42">mdi-creation</v-icon>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-5">{{ errorMessage }}</v-alert>
    <v-alert v-if="successMessage" type="success" class="mb-5">{{ successMessage }}</v-alert>

    <v-card class="generator-card mb-6" elevation="1">
      <v-card-title>Thông tin bài học</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4"><v-text-field v-model="form.subjectName" label="Môn học" variant="outlined" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.chapterName" label="Chương" variant="outlined" /></v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="form.lessonId"
              :items="lessons"
              item-title="displayTitle"
              item-value="id"
              label="Bài học để lưu câu hỏi"
              variant="outlined"
              :loading="loadingLessons"
              no-data-text="Chưa có bài học"
              @update:model-value="selectLesson"
            />
          </v-col>
          <v-col cols="12"><v-text-field v-model="form.lessonName" label="Tên bài học hiển thị cho AI" variant="outlined" /></v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.lessonContent"
              label="Nội dung bài học"
              variant="outlined"
              rows="8"
              counter="30000"
              hint="Hãy dán ít nhất 100 ký tự nội dung sách. AI chỉ được hỏi những kiến thức xuất hiện trong phần này."
              persistent-hint
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="generator-card mb-6" elevation="1">
      <v-card-title>Cấu hình câu hỏi</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4"><v-text-field v-model.number="form.numberOfQuestions" type="number" min="1" max="50" label="Số lượng câu" variant="outlined" /></v-col>
          <v-col cols="12" sm="4"><v-select v-model="form.questionType" :items="questionTypes" item-title="title" item-value="value" label="Loại câu hỏi" variant="outlined" /></v-col>
          <v-col cols="12" sm="4"><v-btn color="primary" size="large" block class="mt-1" :loading="generating" @click="generate"><v-icon start>mdi-auto-fix</v-icon>Sinh câu hỏi</v-btn></v-col>
        </v-row>
        <div class="difficulty-grid">
          <v-text-field v-model.number="form.easyPercent" type="number" min="0" max="100" suffix="%" label="Nhận biết" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.mediumPercent" type="number" min="0" max="100" suffix="%" label="Hiểu / Vận dụng" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.hardPercent" type="number" min="0" max="100" suffix="%" label="Vận dụng cao" variant="outlined" density="comfortable" />
        </div>
        <div class="text-caption" :class="difficultyTotal === 100 ? 'text-success' : 'text-error'">Tổng phân bổ: {{ difficultyTotal }}% (phải bằng 100%)</div>
      </v-card-text>
    </v-card>

    <template v-if="questions.length">
      <div class="preview-heading"><h2>Xem trước {{ questions.length }} câu hỏi</h2><v-btn color="success" :loading="saving" :disabled="!form.lessonId" @click="saveQuestions"><v-icon start>mdi-content-save</v-icon>Lưu vào ngân hàng</v-btn></div>
      <v-card v-for="(question, index) in questions" :key="index" class="question-card mb-4" elevation="1">
        <v-card-title class="question-title">Câu {{ index + 1 }} <v-chip size="small" class="ml-2" color="primary" variant="tonal">{{ question.difficulty }}</v-chip></v-card-title>
        <v-card-text>
          <v-textarea v-model="question.content" label="Nội dung" variant="outlined" auto-grow rows="2" class="mb-3" />
          <v-text-field v-if="question.type === 'multiple_choice' || question.type === 'true_false'" v-model="question.correct_answer" label="Đáp án đúng (key)" variant="outlined" class="mb-3" />
          <v-textarea v-if="question.type === 'short_answer' || question.type === 'essay'" v-model="question.sample_answer" label="Đáp án mẫu" variant="outlined" rows="2" class="mb-3" />
          <v-list v-if="question.options?.length" density="compact" border rounded class="mb-3">
            <v-list-item v-for="option in question.options" :key="option.key" :title="`${option.key}. ${option.text}`" />
          </v-list>
          <v-textarea v-model="question.explanation" label="Giải thích" variant="outlined" rows="2" />
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getLessonsApi } from "@/api/lesson";
import { getLessonsByChapterApi } from "@/api/lesson";
import { getChaptersByBookApi } from "@/api/chapter";
import { generateQuestionsApi, saveGeneratedQuestionsApi } from "@/api/ai";

const lessons = ref([]);
const questions = ref([]);
const loadingLessons = ref(false);
const generating = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const questionTypes = [
  { title: "Trắc nghiệm 4 lựa chọn", value: "multiple_choice" },
  { title: "Đúng / Sai", value: "true_false" },
  { title: "Trả lời ngắn", value: "short_answer" },
  { title: "Tự luận", value: "essay" },
];
const form = reactive({ subjectName: "", chapterName: "", lessonId: null, lessonName: "", lessonContent: "", numberOfQuestions: 10, questionType: "multiple_choice", easyPercent: 40, mediumPercent: 40, hardPercent: 20 });
const difficultyTotal = computed(() => Number(form.easyPercent || 0) + Number(form.mediumPercent || 0) + Number(form.hardPercent || 0));

function selectLesson(lessonId) {
  const lesson = lessons.value.find((item) => item.id === lessonId);
  if (!lesson) return;
  form.lessonName = lesson.title;
  form.chapterName = lesson.chapterTitle || "";
  if (!form.subjectName) form.subjectName = "Toán học";
}

async function generate() {
  errorMessage.value = ""; successMessage.value = "";
  if (!form.lessonContent.trim() || !form.lessonName.trim()) { errorMessage.value = "Vui lòng nhập tên và nội dung bài học"; return; }
  if (form.lessonContent.trim().length < 100) { errorMessage.value = "Nội dung bài học phải có ít nhất 100 ký tự để AI không bịa kiến thức"; return; }
  if (difficultyTotal.value !== 100) { errorMessage.value = "Tỷ lệ độ khó phải cộng bằng 100%"; return; }
  generating.value = true;
  try {
    questions.value = (await generateQuestionsApi({ ...form })).data.questions || [];
    if (!questions.value.length) {
      errorMessage.value = "AI không tìm thấy đủ kiến thức trong nội dung bài học để tạo câu hỏi. Hãy dán nội dung chi tiết hơn.";
      return;
    }
    successMessage.value = "Đã sinh câu hỏi dựa trên nội dung bài học, hãy kiểm tra trước khi lưu.";
  }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể sinh câu hỏi"; }
  finally { generating.value = false; }
}

async function saveQuestions() {
  saving.value = true; errorMessage.value = "";
  try { await saveGeneratedQuestionsApi({ lessonId: form.lessonId, questions: questions.value }); successMessage.value = "Đã lưu câu hỏi vào ngân hàng."; }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể lưu câu hỏi"; }
  finally { saving.value = false; }
}

onMounted(async () => {
  loadingLessons.value = true;
  try {
    const response = await getLessonsApi();
    const allLessons = Array.isArray(response.data) ? response.data : (response.data?.value || []);
    lessons.value = allLessons.map((lesson) => ({
      ...lesson,
      displayTitle: lesson.chapterTitle ? `${lesson.chapterTitle} / ${lesson.title}` : lesson.title,
    }));

    // Fallback for installations where the general lesson endpoint returns an empty list.
    if (!lessons.value.length) {
      const chapterResponse = await getChaptersByBookApi(7);
      const chapters = Array.isArray(chapterResponse.data)
        ? chapterResponse.data
        : (chapterResponse.data?.value || []);
      const lessonResponses = await Promise.all(
        chapters.map((chapter) => getLessonsByChapterApi(chapter.id)),
      );
      lessons.value = lessonResponses.flatMap((lessonResponse, index) => {
        const chapter = chapters[index];
        const chapterLessons = Array.isArray(lessonResponse.data)
          ? lessonResponse.data
          : (lessonResponse.data?.value || []);
        return chapterLessons.map((lesson) => ({
          ...lesson,
          chapterTitle: lesson.chapterTitle || chapter.title,
          displayTitle: `${lesson.chapterTitle || chapter.title} / ${lesson.title}`,
        }));
      });
    }
  }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được danh sách bài học"; }
  finally { loadingLessons.value = false; }
});
</script>

<style scoped>
.page-wrap { padding: 28px; }
.page-heading, .preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.eyebrow { color: #3d5afe; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; }
.page-heading h1 { color: #1a2540; font-size: 28px; margin-top: 6px; }
.page-heading p { color: #7c8496; margin-top: 6px; }
.generator-card, .question-card { border-radius: 14px; }
.difficulty-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.question-title { color: #1a2540; }
@media (max-width: 600px) { .page-wrap { padding: 16px; } .difficulty-grid { grid-template-columns: 1fr; } .page-heading, .preview-heading { align-items: start; flex-direction: column; } }
</style>
