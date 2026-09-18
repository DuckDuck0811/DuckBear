<template>
  <v-app>
    <v-main class="assignment-shell">
      <v-container max-width="900" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">
          Danh sách bài tập
        </v-btn>

        <v-alert v-if="errorMessage" type="error" class="mb-6">
          {{ errorMessage }}
        </v-alert>
        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="result">
          <v-card class="result-card pa-8 text-center">
            <v-icon size="56" color="success">mdi-check-circle-outline</v-icon>
            <h1 class="text-h4 font-weight-bold mt-4">Đã nộp bài</h1>
            <div v-if="result.score !== null" class="score">{{ result.score }}/10</div>
            <p class="text-body-1 text-medium-emphasis">
              Đúng {{ result.correctCount }} / {{ result.totalQuestions }} câu
            </p>
            <v-btn color="primary" class="mt-6" @click="goBack">Về danh sách bài tập</v-btn>
          </v-card>
        </template>

        <template v-else-if="detail">
          <v-card class="mb-6" elevation="1">
            <v-card-item>
              <v-card-title class="text-h4">{{ detail.info.title }}</v-card-title>
              <v-card-subtitle class="mt-2">
                {{ detail.info.totalQuestions }} câu
                <span v-if="detail.info.timeLimit"> · {{ detail.info.timeLimit }} phút</span>
              </v-card-subtitle>
            </v-card-item>
          </v-card>

          <v-card v-for="(question, index) in detail.questions" :key="question.id" class="question-card mb-4" elevation="1">
            <v-card-item>
              <v-card-title class="text-subtitle-1 question-title">
                Câu {{ index + 1 }}. {{ question.content }}
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-radio-group v-if="question.options?.length" v-model="answerFor(question).selectedOptionId">
                <v-radio v-for="option in question.options" :key="option.id" :label="option.content" :value="option.id" />
              </v-radio-group>
              <v-textarea
                v-else
                v-model="answerFor(question).answerText"
                label="Câu trả lời"
                variant="outlined"
                rows="3"
                hide-details
              />
            </v-card-text>
          </v-card>

          <v-btn color="primary" size="large" block :loading="submitting" @click="submit">
            Nộp bài
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
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

function answerFor(question) {
  if (!answers[question.id]) {
    answers[question.id] = { questionId: question.id, selectedOptionId: null, answerText: "" };
  }
  return answers[question.id];
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

async function submit() {
  submitting.value = true;
  errorMessage.value = "";
  try {
    const payload = detail.value.questions.map((question) => answerFor(question));
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
    errorMessage.value = error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.assignment-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.question-card,
.result-card {
  border-radius: 16px;
}
.question-title {
  white-space: normal;
  line-height: 1.5;
}
.score {
  color: #3f51b5;
  font-size: 3.5rem;
  font-weight: 800;
  margin: 1rem 0;
}
</style>
