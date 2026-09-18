<!--
  AssignmentPlayGrade10.vue
  Giao diện làm bài kiểu "Chia theo phần" — dành riêng cho LỚP 10.
  Câu hỏi được nhóm theo loại (trắc nghiệm / điền khuyết / nối-ghép / kéo thả / tự luận)
  thành các Phần I, II, III... giống cấu trúc đề thi chuẩn, mỗi phần có hướng dẫn riêng.
  Giữ nguyên logic nghiệp vụ (API, state, answerFor, submit) như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade10.vue
-->
<template>
  <div class="paper-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-spinner"></div>
      <p class="state-text">Đang sắp xếp đề bài theo từng phần...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <p class="state-text">Không thể mở bài tập</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="btn primary" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="tier-icon">{{ tier.emoji }}</div>
      <h1 class="result-title">{{ tier.label }}</h1>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} câu
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="btn primary" @click="goBack">Về danh sách bài tập</button>
    </div>

    <!-- ================= MAIN PLAY (CHIA THEO PHẦN) ================= -->
    <div v-else-if="detail" class="paper-screen">
      <header class="paper-header">
        <button class="back-link" @click="goBack">⬅ Danh sách</button>
        <div class="header-text">
          <h1 class="assignment-title">{{ detail.info.title }}</h1>
          <p class="header-sub">
            {{ sections.length }} phần · {{ detail.questions.length }} câu
          </p>
        </div>
        <div class="progress-pill">
          <span
            class="progress-fill"
            :style="{ width: overallPercent + '%' }"
          ></span>
          <span class="progress-label"
            >{{ answeredCount }}/{{ detail.questions.length }}</span
          >
        </div>
      </header>

      <!-- Điều hướng nhanh giữa các phần -->
      <nav class="section-nav" aria-label="Điều hướng các phần">
        <a
          v-for="section in sections"
          :key="'nav-' + section.key"
          :href="'#section-' + section.key"
          class="section-pill"
        >
          Phần {{ section.roman }}
          <span class="pill-count"
            >{{ sectionDone(section) }}/{{ section.items.length }}</span
          >
        </a>
      </nav>

      <!-- Nội dung từng phần -->
      <section
        v-for="section in sections"
        :key="section.key"
        :id="'section-' + section.key"
        class="paper-section"
      >
        <div class="section-heading">
          <h2 class="section-title">
            Phần {{ section.roman }}. {{ section.title }}
          </h2>
          <p class="section-instruction">{{ section.instruction }}</p>
        </div>

        <article
          v-for="item in section.items"
          :key="item.question.id"
          class="question-block"
        >
          <p class="question-text">
            <span class="question-number">Câu {{ item.index + 1 }}.</span>
            {{ item.question.content }}
          </p>

          <div v-if="item.question.options?.length" class="choice-list">
            <button
              v-for="(option, idx) in item.question.options"
              :key="option.id"
              type="button"
              class="choice-row"
              :class="{
                selected:
                  answerFor(item.question).selectedOptionId === option.id,
              }"
              @click="selectOption(item.question, option.id)"
            >
              <span class="choice-tag">{{ letters[idx] }}</span>
              <span>{{ option.content }}</span>
            </button>
          </div>

          <textarea
            v-else
            v-model="answerFor(item.question).answerText"
            class="answer-textarea"
            :rows="section.key === 'essay' ? 6 : 3"
            placeholder="Nhập câu trả lời..."
          />
        </article>
      </section>

      <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>

      <!-- Thanh nộp bài cố định -->
      <div class="submit-bar">
        <span class="submit-progress"
          >Đã làm {{ answeredCount }}/{{ detail.questions.length }} câu</span
        >
        <button class="btn primary" :disabled="submitting" @click="submit">
          {{ submitting ? "Đang nộp..." : "Nộp bài" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAssignmentDetailApi } from "@/api/assignment";
import { startSubmissionApi, submitSubmissionApi } from "@/api/submission";

const route = useRoute();
const router = useRouter();

const detail = ref(null);
const submission = ref(null);
const result = ref(null);
const answers = reactive({});
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");

const letters = ["A", "B", "C", "D", "E", "F"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// Thứ tự chuẩn của các phần trong một đề thi, khớp với các loại câu hỏi
// hiện có trong hệ thống (multiple_choice | fill_blank | essay | matching | drag_drop).
const SECTION_ORDER = [
  "multiple_choice",
  "fill_blank",
  "matching",
  "drag_drop",
  "essay",
];
const SECTION_TITLES = {
  multiple_choice: "Trắc nghiệm",
  fill_blank: "Điền khuyết",
  matching: "Nối / ghép đáp án",
  drag_drop: "Kéo thả",
  essay: "Tự luận",
};
const SECTION_INSTRUCTIONS = {
  multiple_choice: "Chọn một phương án đúng nhất cho mỗi câu hỏi.",
  fill_blank: "Điền từ hoặc cụm từ thích hợp vào chỗ trống.",
  matching: "Nối các ý tương ứng với nhau sao cho hợp lý.",
  drag_drop: "Kéo và thả đáp án vào đúng vị trí.",
  essay: "Trình bày câu trả lời bằng đoạn văn rõ ràng, mạch lạc.",
};

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "🎓", label: "Hoàn thành xuất sắc!" };
  if (score >= 5) return { emoji: "📄", label: "Đạt yêu cầu" };
  return { emoji: "📚", label: "Cần ôn tập thêm" };
});

// Nhóm câu hỏi theo loại thành các phần, chỉ tạo phần cho loại thực sự có
// trong đề, đánh số La Mã liên tục theo thứ tự SECTION_ORDER.
const sections = computed(() => {
  if (!detail.value) return [];
  const groups = {};
  detail.value.questions.forEach((question, index) => {
    const key = question.type || "essay";
    if (!groups[key]) groups[key] = [];
    groups[key].push({ question, index });
  });

  const orderedKeys = SECTION_ORDER.filter((key) => groups[key]?.length);
  Object.keys(groups).forEach((key) => {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  });

  return orderedKeys.map((key, i) => ({
    key,
    roman: ROMAN[i] || String(i + 1),
    title: SECTION_TITLES[key] || "Phần khác",
    instruction:
      SECTION_INSTRUCTIONS[key] || "Hoàn thành các câu hỏi bên dưới.",
    items: groups[key],
  }));
});

function answerFor(question) {
  if (!answers[question.id]) {
    answers[question.id] = {
      questionId: question.id,
      selectedOptionId: null,
      answerText: "",
    };
  }
  return answers[question.id];
}
function isAnswered(question) {
  const a = answers[question.id];
  return !!(a && (a.selectedOptionId || a.answerText?.trim()));
}
function selectOption(question, optionId) {
  answerFor(question).selectedOptionId = optionId;
}

function sectionDone(section) {
  return section.items.filter((item) => isAnswered(item.question)).length;
}

const answeredCount = computed(() => {
  if (!detail.value) return 0;
  return detail.value.questions.filter((q) => isAnswered(q)).length;
});
const overallPercent = computed(() => {
  if (!detail.value || detail.value.questions.length === 0) return 0;
  return Math.round(
    (answeredCount.value / detail.value.questions.length) * 100,
  );
});

function goBack() {
  router.push({ name: "student-dashboard" });
}

async function submit() {
  submitting.value = true;
  errorMessage.value = "";
  try {
    const payload = detail.value.questions.map((question) =>
      answerFor(question),
    );
    const response = await submitSubmissionApi(submission.value.id, payload);
    result.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không thể nộp bài";
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const assignmentId = Number(route.params.id);
    const [detailResponse, submissionResponse] = await Promise.all([
      getAssignmentDetailApi(assignmentId),
      startSubmissionApi(assignmentId),
    ]);
    detail.value = detailResponse.data;
    submission.value = submissionResponse.data;
    detail.value.questions.forEach(answerFor);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap");

.paper-shell {
  min-height: 100vh;
  background: #eef1f4;
  font-family: "Inter", sans-serif;
  color: #22252b;
  padding: 24px 16px 100px;
}

.state-screen {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #f5e9e9;
  border-top-color: #7a2e2e;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
}
.state-text {
  font-family: "Lora", serif;
  font-weight: 700;
  font-size: 1.1rem;
}
.state-subtext {
  color: #5b6169;
}

.result-screen {
  gap: 6px;
}
.tier-icon {
  font-size: 3.4rem;
}
.result-title {
  font-family: "Lora", serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 4px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: #7a2e2e;
  margin-bottom: 10px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.primary {
  color: #fff;
  background: #7a2e2e;
}
.btn.primary:hover:not(:disabled) {
  background: #642424;
}

.paper-screen {
  max-width: 760px;
  margin: 0 auto;
}

.paper-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.back-link {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  color: #22252b;
  flex: 0 0 auto;
}
.header-text {
  flex: 1;
  min-width: 160px;
}
.assignment-title {
  font-family: "Lora", serif;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.header-sub {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #5b6169;
}
.progress-pill {
  position: relative;
  width: 140px;
  height: 30px;
  border-radius: 999px;
  background: #fff;
  overflow: hidden;
  flex: 0 0 auto;
}
.progress-fill {
  position: absolute;
  inset: 0;
  width: 0%;
  background: #f5e9e9;
  transition: width 0.25s ease;
}
.progress-label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.78rem;
  font-weight: 600;
  color: #22252b;
}

.section-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 22px;
}
.section-pill {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #dadfe3;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #22252b;
  text-decoration: none;
  scroll-margin-top: 12px;
}
.section-pill:hover {
  border-color: #7a2e2e;
}
.pill-count {
  color: #5b6169;
  font-weight: 500;
}

.paper-section {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #dadfe3;
  padding: 22px 24px;
  margin-bottom: 20px;
  scroll-margin-top: 12px;
}

.section-heading {
  border-left: 3px solid #7a2e2e;
  padding-left: 14px;
  margin-bottom: 18px;
}
.section-title {
  font-family: "Lora", serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0 0 4px;
}
.section-instruction {
  margin: 0;
  font-style: italic;
  font-size: 0.9rem;
  color: #5b6169;
}

.question-block {
  padding: 16px 0;
  border-top: 1px solid #eceff2;
}
.question-block:first-of-type {
  border-top: none;
  padding-top: 0;
}
.question-text {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 14px;
}
.question-number {
  font-weight: 700;
  color: #7a2e2e;
  margin-right: 4px;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.choice-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dadfe3;
  background: #fbfbfa;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 0.94rem;
  text-align: left;
  cursor: pointer;
  color: #22252b;
}
.choice-row:hover {
  border-color: #7a2e2e;
}
.choice-row.selected {
  border-color: #7a2e2e;
  background: #f5e9e9;
}
.choice-tag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #7a2e2e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  flex: 0 0 auto;
}

.answer-textarea {
  display: block;
  width: 100%;
  border: 1px solid #dadfe3;
  border-radius: 10px;
  padding: 11px 13px;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.answer-textarea:focus {
  border-color: #7a2e2e;
}

.inline-error {
  color: #c0392b;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.submit-bar {
  position: sticky;
  bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #22252b;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 10px 30px rgba(34, 37, 43, 0.25);
}
.submit-progress {
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .paper-section {
    padding: 18px 16px;
  }
  .submit-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .submit-bar .btn {
    width: 100%;
  }
}
</style>
