<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">TRỢ LÝ SOẠN ĐỀ</div>
        <h1 class="t-page-title">Sinh câu hỏi bằng AI</h1>
        <p class="t-page-subtitle">AI chỉ sử dụng nội dung bài học bạn cung cấp để tạo câu hỏi ôn tập.</p>
      </div>
      <div class="ai-badge">
        <v-icon color="#4F7CFF" size="20">mdi-creation</v-icon>
        <span>AI Generator</span>
      </div>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-5" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" class="mb-5" closable @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <!-- Step 1: Lesson info -->
    <div class="section-header">
      <div class="step-badge">1</div>
      <span class="section-title">Thông tin bài học</span>
    </div>
    <v-card class="t-card mb-5">
      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" md="4">
            <div class="t-field-label">Môn học</div>
            <v-text-field
              v-model="form.subjectName"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Toán học"
            />
          </v-col>
          <v-col cols="12" md="4">
            <div class="t-field-label">Chương</div>
            <v-text-field
              v-model="form.chapterName"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Chương 1"
            />
          </v-col>
          <v-col cols="12" md="4">
            <div class="t-field-label">Bài học để lưu câu hỏi</div>
            <v-select
              v-model="form.lessonId"
              :items="lessons"
              item-title="displayTitle"
              item-value="id"
              variant="outlined"
              density="comfortable"
              :loading="loadingLessons"
              no-data-text="Chưa có bài học"
              @update:model-value="selectLesson"
            />
          </v-col>
          <v-col cols="12">
            <div class="t-field-label">Tên bài học hiển thị cho AI</div>
            <v-text-field
              v-model="form.lessonName"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Bài 1: Tập hợp và các phép toán"
            />
          </v-col>
          <v-col cols="12">
            <div class="t-field-label">Nội dung bài học</div>
            <v-textarea
              v-model="form.lessonContent"
              variant="outlined"
              rows="8"
              counter="30000"
              placeholder="Dán nội dung sách vào đây (ít nhất 100 ký tự). AI chỉ tạo câu hỏi từ nội dung này."
              persistent-hint
              hint="AI chỉ được hỏi những kiến thức xuất hiện trong phần này."
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Step 2: Config -->
    <div class="section-header">
      <div class="step-badge">2</div>
      <span class="section-title">Cấu hình câu hỏi</span>
    </div>
    <v-card class="t-card mb-6">
      <v-card-text class="pa-5">
        <v-row align="end">
          <v-col cols="12" sm="4">
            <div class="t-field-label">Số lượng câu</div>
            <v-text-field
              v-model.number="form.numberOfQuestions"
              type="number"
              min="1"
              max="50"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <div class="t-field-label">Loại câu hỏi</div>
            <v-select
              v-model="form.questionType"
              :items="questionTypes"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              color="primary"
              size="large"
              block
              :loading="generating"
              style="border-radius: 9px; font-weight: 600; letter-spacing: 0"
              @click="generate"
            >
              <v-icon start>mdi-auto-fix</v-icon>
              Sinh câu hỏi
            </v-btn>
          </v-col>
        </v-row>

        <div class="difficulty-section">
          <p class="difficulty-label">Phân bổ độ khó</p>
          <div class="difficulty-grid">
            <div class="difficulty-item">
              <span class="diff-tag diff-tag--easy">Nhận biết</span>
              <v-text-field
                v-model.number="form.easyPercent"
                type="number"
                min="0"
                max="100"
                suffix="%"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
            <div class="difficulty-item">
              <span class="diff-tag diff-tag--medium">Hiểu / Vận dụng</span>
              <v-text-field
                v-model.number="form.mediumPercent"
                type="number"
                min="0"
                max="100"
                suffix="%"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
            <div class="difficulty-item">
              <span class="diff-tag diff-tag--hard">Vận dụng cao</span>
              <v-text-field
                v-model.number="form.hardPercent"
                type="number"
                min="0"
                max="100"
                suffix="%"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
          </div>
          <p
            class="difficulty-total"
            :class="difficultyTotal === 100 ? 'total--ok' : 'total--error'"
          >
            Tổng: {{ difficultyTotal }}% {{ difficultyTotal === 100 ? "✓" : "(phải bằng 100%)" }}
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Step 3: Preview -->
    <template v-if="questions.length">
      <div class="preview-heading">
        <div class="section-header" style="margin-bottom: 0">
          <div class="step-badge">3</div>
          <span class="section-title">Xem trước {{ questions.length }} câu hỏi</span>
        </div>
        <v-btn
          color="success"
          variant="flat"
          :loading="saving"
          :disabled="!form.lessonId"
          style="border-radius: 8px; font-weight: 600"
          @click="saveQuestions"
        >
          <v-icon start>mdi-content-save</v-icon>
          Lưu vào ngân hàng
        </v-btn>
      </div>

      <v-card
        v-for="(question, index) in questions"
        :key="index"
        class="t-card mb-4"
      >
        <v-card-text class="pa-5">
          <div class="question-header">
            <span class="question-num">Câu {{ index + 1 }}</span>
            <v-chip
              size="small"
              color="primary"
              variant="tonal"
              style="font-size: 11px; font-weight: 600"
            >
              {{ question.difficulty }}
            </v-chip>
          </div>
          <v-textarea
            v-model="question.content"
            label="Nội dung"
            variant="outlined"
            auto-grow
            rows="2"
            class="mb-3 mt-3"
          />
          <v-text-field
            v-if="question.type === 'multiple_choice' || question.type === 'true_false'"
            v-model="question.correct_answer"
            label="Đáp án đúng (key)"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-textarea
            v-if="question.type === 'short_answer' || question.type === 'essay'"
            v-model="question.sample_answer"
            label="Đáp án mẫu"
            variant="outlined"
            rows="2"
            class="mb-3"
          />
          <v-list v-if="question.options?.length" density="compact" border rounded class="mb-3">
            <v-list-item
              v-for="option in question.options"
              :key="option.key"
              :title="`${option.key}. ${option.text}`"
            />
          </v-list>
          <v-textarea
            v-model="question.explanation"
            label="Giải thích"
            variant="outlined"
            rows="2"
          />
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  getLessonByIdApi,
  getLessonsApi,
  getLessonsByChapterApi,
} from "@/api/lesson";
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
const form = reactive({
  subjectName: "",
  chapterName: "",
  lessonId: null,
  lessonName: "",
  lessonContent: "",
  numberOfQuestions: 10,
  questionType: "multiple_choice",
  easyPercent: 40,
  mediumPercent: 40,
  hardPercent: 20,
});
const difficultyTotal = computed(
  () =>
    Number(form.easyPercent || 0) +
    Number(form.mediumPercent || 0) +
    Number(form.hardPercent || 0),
);

async function selectLesson(lessonId) {
  const lesson = lessons.value.find(
    (item) => String(item.id) === String(lessonId),
  );
  if (!lesson) return;
  form.lessonName = lesson.title;
  form.chapterName = lesson.chapterTitle || "";
  if (!form.subjectName) form.subjectName = "Toán học";

  const selectedLessonId = lesson.id;
  if (lesson.content?.trim()) {
    form.lessonContent = lesson.content;
    return;
  }

  form.lessonContent = "";
  try {
    const response = await getLessonByIdApi(lesson.id);
    if (String(form.lessonId) === String(selectedLessonId)) {
      form.lessonContent = response.data?.content || "";
    }
  } catch (error) {
    if (String(form.lessonId) === String(selectedLessonId)) {
      errorMessage.value =
        error.response?.data?.message || "Không tải được nội dung bài học";
    }
  }
}

async function generate() {
  errorMessage.value = "";
  successMessage.value = "";
  if (!form.lessonContent.trim() || !form.lessonName.trim()) {
    errorMessage.value = "Vui lòng nhập tên và nội dung bài học";
    return;
  }
  if (form.lessonContent.trim().length < 100) {
    errorMessage.value =
      "Nội dung bài học phải có ít nhất 100 ký tự để AI không bịa kiến thức";
    return;
  }
  if (difficultyTotal.value !== 100) {
    errorMessage.value = "Tỷ lệ độ khó phải cộng bằng 100%";
    return;
  }
  generating.value = true;
  try {
    questions.value =
      (await generateQuestionsApi({ ...form })).data.questions || [];
    if (!questions.value.length) {
      errorMessage.value =
        "AI không tìm thấy đủ kiến thức trong nội dung bài học để tạo câu hỏi. Hãy dán nội dung chi tiết hơn.";
      return;
    }
    successMessage.value =
      "Đã sinh câu hỏi dựa trên nội dung bài học, hãy kiểm tra trước khi lưu.";
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể sinh câu hỏi";
  } finally {
    generating.value = false;
  }
}

async function saveQuestions() {
  saving.value = true;
  errorMessage.value = "";
  try {
    await saveGeneratedQuestionsApi({
      lessonId: form.lessonId,
      questions: questions.value,
    });
    successMessage.value = "Đã lưu câu hỏi vào ngân hàng.";
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể lưu câu hỏi";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  loadingLessons.value = true;
  try {
    const response = await getLessonsApi();
    const allLessons = Array.isArray(response.data)
      ? response.data
      : response.data?.value || [];
    lessons.value = allLessons.map((lesson) => ({
      ...lesson,
      displayTitle: lesson.chapterTitle
        ? `${lesson.title} / ${lesson.chapterTitle}`
        : lesson.title,
    }));

    if (!lessons.value.length) {
      const chapterResponse = await getChaptersByBookApi(7);
      const chapters = Array.isArray(chapterResponse.data)
        ? chapterResponse.data
        : chapterResponse.data?.value || [];
      const lessonResponses = await Promise.all(
        chapters.map((chapter) => getLessonsByChapterApi(chapter.id)),
      );
      lessons.value = lessonResponses.flatMap((lessonResponse, index) => {
        const chapter = chapters[index];
        const chapterLessons = Array.isArray(lessonResponse.data)
          ? lessonResponse.data
          : lessonResponse.data?.value || [];
        return chapterLessons.map((lesson) => ({
          ...lesson,
          chapterTitle: lesson.chapterTitle || chapter.title,
          displayTitle: `${lesson.title} / ${lesson.chapterTitle || chapter.title}`,
        }));
      });
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được danh sách bài học";
  } finally {
    loadingLessons.value = false;
  }
});
</script>

<style scoped>
/* Section header */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.step-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #4f7cff;
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1d2e;
}

/* AI badge */
.ai-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: #eef3ff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4f7cff;
  flex-shrink: 0;
}

/* Difficulty */
.difficulty-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f8;
}

.difficulty-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1d2e;
  margin-bottom: 12px;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.difficulty-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diff-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  width: fit-content;
}

.diff-tag--easy {
  background: #f0fdf4;
  color: #15803d;
}

.diff-tag--medium {
  background: #fffbeb;
  color: #b45309;
}

.diff-tag--hard {
  background: #fef2f2;
  color: #b91c1c;
}

.difficulty-total {
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
}

.total--ok {
  color: #15803d;
}

.total--error {
  color: #ef4444;
}

/* Preview */
.preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-num {
  font-size: 14px;
  font-weight: 700;
  color: #1a1d2e;
}

@media (max-width: 600px) {
  .difficulty-grid {
    grid-template-columns: 1fr;
  }

  .preview-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
