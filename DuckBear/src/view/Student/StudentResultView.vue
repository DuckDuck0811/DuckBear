<template>
  <v-app>
    <v-main class="result-shell">
      <v-container max-width="1000" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">
          Quay lại lịch sử
        </v-btn>

        <v-alert v-if="errorMessage" type="error" class="mb-5">{{ errorMessage }}</v-alert>

        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="result">
          <v-card class="mb-6" elevation="1">
            <v-card-item>
              <v-card-title class="text-h4">Kết quả bài làm</v-card-title>
              <v-card-subtitle>{{ result.totalQuestions }} câu hỏi · {{ result.correctCount }}/{{ result.totalQuestions }} đúng</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="score-panel">
                <div class="score-value">{{ result.score !== null ? `${result.score}/10` : 'Chưa chấm' }}</div>
                <div class="score-status">{{ result.status === 'graded' ? 'Đã chấm' : result.status }}</div>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-for="(item, index) in result.answers" :key="item.questionId" class="mb-4" elevation="1">
            <v-card-item>
              <v-card-title class="text-subtitle-1">Câu {{ index + 1 }}. {{ item.questionContent }}</v-card-title>
            </v-card-item>
            <v-card-text>
              <div class="answer-box">
                <div><strong>Đáp án của bạn:</strong> {{ formatAnswer(item) || 'Không trả lời' }}</div>
                <div v-if="item.correctAnswerText"><strong>Đáp án đúng:</strong> {{ item.correctAnswerText }}</div>
                <div v-if="item.isCorrect !== null" :class="item.isCorrect ? 'correct' : 'incorrect'">
                  {{ item.isCorrect ? 'Đúng' : 'Sai' }}
                  <span v-if="item.scoreEarned !== null">· {{ item.scoreEarned }}/1</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSubmissionResultApi } from "@/api/submission";

const route = useRoute();
const router = useRouter();
const result = ref(null);
const loading = ref(true);
const errorMessage = ref("");

function formatAnswer(item) {
  if (item.selectedOptionId) return `Lựa chọn ${item.selectedOptionId}`;
  if (item.answerText) return item.answerText;
  return "";
}

function goBack() {
  router.push({ name: "student-history" });
}

onMounted(async () => {
  try {
    const { data } = await getSubmissionResultApi(Number(route.params.submissionId));
    result.value = data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không thể xem kết quả bài làm";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.result-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.score-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0 8px;
}
.score-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2f51d9;
}
.score-status {
  color: #687286;
  font-weight: 600;
}
.answer-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.correct {
  color: #1e9d5d;
  font-weight: 700;
}
.incorrect {
  color: #d64b4b;
  font-weight: 700;
}
</style>
