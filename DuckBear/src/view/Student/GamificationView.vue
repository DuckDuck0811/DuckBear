<template>
  <div class="gv">
    <header class="gv__header">
      <h1 class="gv__title">Thành tích học tập</h1>
      <p class="gv__subtitle">
        Điểm thưởng, huy hiệu và chuỗi ngày học của bạn
      </p>
    </header>

    <GamificationWidget
      :user-id="userId"
      :show-detail-link="false"
      class="gv__widget"
    />

    <nav class="gv__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="gv__tab"
        :class="{ 'gv__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="activeTab === 'overview'" class="gv__panel">
      <div class="gv__overview-grid">
        <div class="gv__overview-card">
          <span class="gv__overview-label">Chuỗi dài nhất</span>
          <span class="gv__overview-value"
            >{{ summary?.longestStreak ?? 0 }} ngày</span
          >
        </div>
        <div class="gv__overview-card">
          <span class="gv__overview-label">Tổng huy hiệu</span>
          <span class="gv__overview-value">{{
            summary?.badges?.length ?? 0
          }}</span>
        </div>
        <div class="gv__overview-card">
          <span class="gv__overview-label">Thứ hạng hiện tại</span>
          <span class="gv__overview-value">#{{ summary?.rank ?? "–" }}</span>
        </div>
      </div>
    </section>

    <section v-else-if="activeTab === 'history'" class="gv__panel">
      <div v-if="historyLoading" class="gv__state">Đang tải…</div>
      <div v-else-if="!history.length" class="gv__state">
        Chưa có giao dịch điểm nào
      </div>
      <ul v-else class="gv__history">
        <li v-for="item in history" :key="item.id" class="gv__history-row">
          <div>
            <div class="gv__history-reason">
              {{ item.reason || "Hoạt động học tập" }}
            </div>
            <div class="gv__history-date">{{ formatDate(item.createdAt) }}</div>
          </div>
          <div
            class="gv__history-points"
            :class="{ 'gv__history-points--neg': item.points < 0 }"
          >
            {{ item.points > 0 ? "+" : "" }}{{ item.points }}
          </div>
        </li>
      </ul>
      <div class="gv__pagination">
        <button :disabled="historyPage === 0" @click="changeHistoryPage(-1)">
          ← Trước
        </button>
        <span>Trang {{ historyPage + 1 }}</span>
        <button
          :disabled="historyPage + 1 >= historyTotalPages"
          @click="changeHistoryPage(1)"
        >
          Sau →
        </button>
      </div>
    </section>

    <section v-else-if="activeTab === 'badges'" class="gv__panel">
      <div v-if="badgesLoading" class="gv__state">Đang tải…</div>
      <BadgeGrid v-else :badges="allBadges" :earned="summary?.badges ?? []" />
    </section>

    <section v-else-if="activeTab === 'leaderboard'" class="gv__panel">
      <div class="gv__scope-switch">
        <button
          v-for="opt in scopeOptions"
          :key="opt.value"
          class="gv__scope-btn"
          :class="{ 'gv__scope-btn--active': leaderboardScope === opt.value }"
          @click="setScope(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <div v-if="leaderboardLoading" class="gv__state">Đang tải…</div>
      <LeaderboardTable
        v-else
        :entries="leaderboard"
        :current-user-id="userId"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { computed } from "vue";
import { useAuthStore } from "@/store/auth";
import { getMyClassesApi } from "@/api/class";
import { getStudentProfileByUserIdApi } from "@/api/studentProfile";
import GamificationWidget from "@/components/GamificationWidget.vue";
import BadgeGrid from "@/components/BadgeGrid.vue";
import LeaderboardTable from "@/components/LeaderboardTable.vue";
import { useGamification } from "@/service/useGamification";
import * as gamificationApi from "@/api/gamification";
import "@/styles/gamification-tokens.css";

const props = defineProps({
  userId: { type: [String, Number], default: null },
  classId: { type: [String, Number], default: null },
  gradeLevel: { type: [String, Number], default: null },
});

const authStore = useAuthStore();
const userId = computed(
  () => props.userId || authStore.userId || Number(localStorage.getItem("userId")),
);
const studentClassId = ref(props.classId);
const studentGradeLevel = ref(props.gradeLevel);

const tabs = [
  { key: "overview", label: "Tổng quan" },
  { key: "history", label: "Lịch sử điểm" },
  { key: "badges", label: "Huy hiệu" },
  { key: "leaderboard", label: "Bảng xếp hạng" },
];
const activeTab = ref("overview");

const { summary, loadSummary } = useGamification(userId);

// Lịch sử điểm
const history = ref([]);
const historyLoading = ref(false);
const historyPage = ref(0);
const historyTotalPages = ref(1);

async function loadHistory() {
  historyLoading.value = true;
  try {
    const res = await gamificationApi.getPointsHistory(userId.value, {
      page: historyPage.value,
    });
    const data = res.data ?? res;
    history.value = data.content ?? [];
    historyTotalPages.value = data.totalPages ?? 1;
  } finally {
    historyLoading.value = false;
  }
}

function changeHistoryPage(delta) {
  historyPage.value += delta;
  loadHistory();
}

// Huy hiệu
const allBadges = ref([]);
const badgesLoading = ref(false);

async function loadBadges() {
  badgesLoading.value = true;
  try {
    const response = await gamificationApi.getAllBadges();
    allBadges.value = response.data ?? response;
  } finally {
    badgesLoading.value = false;
  }
}

// Bảng xếp hạng
const scopeOptions = [
  { value: "global", label: "Toàn trường" },
  { value: "class", label: "Lớp của tôi" },
  { value: "grade", label: "Khối của tôi" },
];
const leaderboardScope = ref("global");
const leaderboard = ref([]);
const leaderboardLoading = ref(false);

async function loadLeaderboard() {
  leaderboardLoading.value = true;
  try {
    const scopeId =
      leaderboardScope.value === "class"
        ? studentClassId.value
        : leaderboardScope.value === "grade"
          ? studentGradeLevel.value
          : null;
    const response = await gamificationApi.getLeaderboard({
      scope: leaderboardScope.value,
      scopeId,
      limit: 20,
    });
    leaderboard.value = response.data ?? response;
  } finally {
    leaderboardLoading.value = false;
  }
}

function setScope(scope) {
  leaderboardScope.value = scope;
  loadLeaderboard();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

watch(activeTab, (tab) => {
  if (tab === "history" && !history.value.length) loadHistory();
  if (tab === "badges" && !allBadges.value.length) loadBadges();
  if (tab === "leaderboard" && !leaderboard.value.length) loadLeaderboard();
});

async function loadStudentContext() {
  if (!userId.value) return;
  try {
    const [classesResponse, profileResponse] = await Promise.all([
      getMyClassesApi(),
      getStudentProfileByUserIdApi(userId.value),
    ]);
    studentClassId.value ||= classesResponse.data?.[0]?.classId ?? null;
    studentGradeLevel.value ||= profileResponse.data?.gradeLevel ?? null;
  } catch {
    // Global leaderboard remains available when class/profile context is missing.
  }
}

onMounted(async () => {
  await Promise.all([loadStudentContext(), loadSummary()]);
});
</script>

<style scoped>
.gv {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 32px 20px 60px;
  font-family: var(--gam-font);
  background: var(--gam-paper);
}

.gv__header {
  margin-bottom: 20px;
}

.gv__title {
  font-size: 28px;
  font-weight: 800;
  color: var(--gam-ink);
  margin: 0 0 4px;
}

.gv__subtitle {
  font-size: 14px;
  color: var(--gam-slate);
  margin: 0;
}

.gv__widget {
  margin-bottom: 24px;
}

.gv__tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--gam-line);
  margin-bottom: 20px;
}

.gv__tab {
  font-family: var(--gam-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--gam-slate);
  background: none;
  border: none;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.gv__tab--active {
  color: var(--gam-ink);
  border-bottom-color: var(--gam-gold);
}

.gv__panel {
  background: var(--gam-surface);
  border: 1px solid var(--gam-line);
  border-radius: var(--gam-radius-md);
  padding: 20px;
}

.gv__overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.gv__overview-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--gam-paper);
  border-radius: var(--gam-radius-sm);
}

.gv__overview-label {
  font-size: 12px;
  color: var(--gam-slate);
}

.gv__overview-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--gam-ink);
}

.gv__state {
  text-align: center;
  color: var(--gam-slate);
  padding: 24px 0;
  font-size: 14px;
}

.gv__history {
  list-style: none;
  margin: 0;
  padding: 0;
}

.gv__history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gam-line);
}

.gv__history-row:last-child {
  border-bottom: none;
}

.gv__history-reason {
  font-size: 14px;
  color: var(--gam-ink);
}

.gv__history-date {
  font-size: 12px;
  color: var(--gam-slate);
  margin-top: 2px;
}

.gv__history-points {
  font-weight: 700;
  color: var(--gam-sage);
}

.gv__history-points--neg {
  color: var(--gam-ember);
}

.gv__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--gam-slate);
}

.gv__pagination button {
  font-family: var(--gam-font);
  border: 1px solid var(--gam-line);
  background: var(--gam-surface);
  border-radius: var(--gam-radius-sm);
  padding: 6px 12px;
  cursor: pointer;
}

.gv__pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.gv__scope-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.gv__scope-btn {
  font-family: var(--gam-font);
  font-size: 13px;
  font-weight: 600;
  color: var(--gam-ink-soft);
  background: var(--gam-paper);
  border: 1px solid var(--gam-line);
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
}

.gv__scope-btn--active {
  background: var(--gam-ink);
  color: #fff;
  border-color: var(--gam-ink);
}
</style>
