<template>
  <v-app>
    <v-main class="history-shell">
      <v-container max-width="1100" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">
          Về dashboard
        </v-btn>

        <v-card class="mb-6" elevation="1">
          <v-card-item>
            <v-card-title class="text-h4">Lịch sử làm bài</v-card-title>
            <v-card-subtitle>Danh sách lần nộp và điểm số của bạn.</v-card-subtitle>
          </v-card-item>
        </v-card>

        <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>

        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-row v-else-if="submissions.length">
          <v-col v-for="item in submissions" :key="item.id" cols="12" md="6">
            <v-card class="history-card" elevation="1">
              <v-card-item>
                <template #prepend>
                  <div class="history-icon">
                    <v-icon>mdi-clipboard-check-outline</v-icon>
                  </div>
                </template>
                <v-card-title>{{ item.assignmentTitle }}</v-card-title>
                <v-card-subtitle>
                  Lần làm {{ item.attemptNumber }} · {{ item.status === 'graded' ? 'Đã chấm' : item.status }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <div class="history-meta">
                  <span><v-icon size="16">mdi-calendar-clock</v-icon> {{ formatDate(item.submittedAt || item.startedAt) }}</span>
                  <span><v-icon size="16">mdi-star-circle</v-icon> {{ item.score !== null ? `${item.score}/10` : 'Chưa có điểm' }}</span>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn color="primary" variant="tonal" @click="viewResult(item.id)">Xem chi tiết</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-empty-state v-else icon="mdi-history" title="Chưa có bài làm nào" text="Bạn sẽ thấy toàn bộ lịch sử bài tập ở đây." />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getMySubmissionsApi } from "@/api/submission";

const router = useRouter();
const submissions = ref([]);
const loading = ref(true);
const errorMessage = ref("");

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

function viewResult(submissionId) {
  router.push({ name: "student-result", params: { submissionId } });
}

onMounted(async () => {
  try {
    const { data } = await getMySubmissionsApi();
    submissions.value = data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không tải được lịch sử làm bài";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.history-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.history-card {
  border-radius: 16px;
}
.history-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #3566d4;
  background: #edf2ff;
}
.history-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #687286;
  font-size: 14px;
}
</style>
