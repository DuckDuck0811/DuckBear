<template>
  <v-app>
    <v-main class="student-shell">
      <header class="masthead">
        <div class="masthead-inner">
          <div class="brand">
            <span class="brand-mark"><v-icon size="18">mdi-duck</v-icon></span>
            <span class="brand-name">Duckbear <em>Classroom</em></span>
          </div>
          <v-btn
            class="logout-button"
            variant="text"
            prepend-icon="mdi-logout"
            @click="logout"
            >Đăng xuất</v-btn
          >
        </div>
      </header>

      <v-container class="py-8" max-width="1120">
        <button class="back-link mb-6" @click="router.back()">
          <v-icon size="18">mdi-arrow-left</v-icon> Quay lại
        </button>

        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-6"
          variant="tonal"
          >{{ errorMessage }}</v-alert
        >

        <div v-if="loading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <!-- Class banner -->
          <section class="class-banner mb-8">
            <div class="banner-spine" :class="`spine-${spineIndex}`" />
            <div class="banner-body">
              <h1>{{ classInfo.className }}</h1>
              <div class="banner-meta">
                <span v-if="classInfo.teacherName">
                  <v-icon size="16">mdi-account-tie-outline</v-icon>
                  GV: {{ classInfo.teacherName }}
                </span>
                <span v-if="classInfo.gradeLevel">
                  <v-icon size="16">mdi-school-outline</v-icon>
                  Khối {{ classInfo.gradeLevel }}
                </span>
                <span v-if="classInfo.joinedAt">
                  <v-icon size="16">mdi-calendar-check-outline</v-icon>
                  Tham gia {{ formatDate(classInfo.joinedAt) }}
                </span>
              </div>
            </div>
          </section>

          <!-- Ledger -->
          <section class="ledger mb-8">
            <div class="ledger-item">
              <strong>{{ classAssignments.length }}</strong>
              <span>Bài tập của lớp</span>
            </div>
            <div class="ledger-divider" />
            <div class="ledger-item">
              <strong>{{ pendingCount }}</strong>
              <span>Chưa hoàn thành</span>
            </div>
            <div class="ledger-divider" />
            <div class="ledger-item">
              <strong>{{ classmates.length || "—" }}</strong>
              <span>Thành viên</span>
            </div>
          </section>

          <!-- Tabs -->
          <v-tabs v-model="activeTab" class="tabs-bar mb-6" color="#1a73e8">
            <v-tab value="assignments">Bài tập</v-tab>
            <v-tab value="members">Thành viên</v-tab>
          </v-tabs>

          <!-- Assignments tab -->
          <section v-if="activeTab === 'assignments'" class="section-block">
            <div v-if="classAssignments.length" class="assignment-list">
              <article
                v-for="assignment in classAssignments"
                :key="assignment.id"
                class="assignment-row"
              >
                <div class="assignment-icon">
                  <v-icon>mdi-clipboard-text-outline</v-icon>
                </div>
                <div class="assignment-info">
                  <h3>{{ assignment.title }}</h3>
                  <div class="meta-row">
                    <span
                      ><v-icon size="16">mdi-help-circle-outline</v-icon>
                      {{ assignment.totalQuestions }} câu</span
                    >
                    <span v-if="assignment.timeLimit"
                      ><v-icon size="16">mdi-clock-outline</v-icon>
                      {{ assignment.timeLimit }} phút</span
                    >
                    <span v-if="assignment.deadline" class="deadline">
                      <v-icon size="15">mdi-calendar-clock-outline</v-icon>
                      Hạn {{ formatDate(assignment.deadline) }}</span
                    >
                  </div>
                </div>
                <v-btn
                  class="primary-action row-action"
                  @click="startAssignment(assignment)"
                  >Bắt đầu làm <v-icon end>mdi-arrow-right</v-icon></v-btn
                >
              </article>
            </div>
            <v-empty-state
              v-else
              icon="mdi-inbox-outline"
              title="Lớp chưa có bài tập"
              text="Khi giáo viên giao bài cho lớp này, bài tập sẽ xuất hiện ở đây."
            />
          </section>

          <!-- Members tab -->
          <section v-else class="section-block">
            <div v-if="classmates.length" class="member-list">
              <article
                v-for="mate in classmates"
                :key="mate.id"
                class="member-row"
              >
                <v-avatar size="36" class="member-avatar">
                  <v-img v-if="mate.avatarUrl" :src="mate.avatarUrl" />
                  <span v-else>{{ initials(mate.fullName) }}</span>
                </v-avatar>
                <div class="member-info">
                  <h4>{{ mate.fullName || mate.email }}</h4>
                  <p v-if="mate.email">{{ mate.email }}</p>
                </div>
              </article>
            </div>
            <v-empty-state
              v-else
              icon="mdi-account-group-outline"
              title="Chưa có danh sách thành viên"
              text="Danh sách thành viên lớp sẽ hiển thị khi có dữ liệu."
            />
          </section>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getStudentAssignmentsApi } from "@/api/assignment";
import { getMyClassesApi } from "@/api/class";
// If your backend already exposes a dedicated endpoint for a single class
// (details + member list), add it to src/api/class.js, e.g.:
//   export const getClassDetailApi = (classId) => request.get(`/classes/${classId}`);
//   export const getClassMembersApi = (classId) => request.get(`/classes/${classId}/members`);
// and uncomment the import + calls below. Without them, this page still
// works by deriving what it can from the APIs already used on the dashboard.
// import { getClassDetailApi, getClassMembersApi } from "@/api/class";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const errorMessage = ref("");
const activeTab = ref("assignments");

const classInfo = ref({
  className: route.query.className || "",
  teacherName: "",
  gradeLevel: null,
  joinedAt: route.query.joinedAt || null,
});
const classAssignments = ref([]);
const classmates = ref([]);

const spineIndex = computed(() => {
  const id = String(route.params.id || "");
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return sum % 3;
});

const pendingCount = computed(
  () => classAssignments.value.filter((a) => !a.completed).length,
);

function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function inferGradeFromText(value) {
  if (!value && value !== 0) return null;
  const match = String(value).match(/\d+/);
  if (!match) return null;
  const grade = Number(match[0]);
  return Number.isInteger(grade) && grade >= 1 && grade <= 12 ? grade : null;
}

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function startAssignment(assignment) {
  router.push({
    name: "student-assignment-play",
    params: { id: assignment.id },
    query: {
      gradeLevel: classInfo.value.gradeLevel ?? undefined,
      className: classInfo.value.className,
    },
  });
}

function logout() {
  authStore.logout();
  router.push({ name: "login" });
}

async function loadClassInfo() {
  // Try to enrich basic info (teacher, grade, exact join date) from the
  // membership list, matching either by classId or membership id, since
  // the dashboard can pass either depending on what was available.
  try {
    const { data } = await getMyClassesApi();
    const member = data.find(
      (item) =>
        String(item.classId) === String(route.params.id) ||
        String(item.id) === String(route.params.id),
    );
    if (member) {
      classInfo.value.className = member.className;
      classInfo.value.joinedAt = member.joinedAt;
      classInfo.value.teacherName =
        member.teacherName || member.teacherFullName || "";
      classInfo.value.gradeLevel =
        member.gradeLevel || inferGradeFromText(member.className);
    } else if (!classInfo.value.gradeLevel) {
      classInfo.value.gradeLevel = inferGradeFromText(
        classInfo.value.className,
      );
    }
  } catch (error) {
    // Non-fatal: we already have className/joinedAt from the query string.
    if (!classInfo.value.gradeLevel) {
      classInfo.value.gradeLevel = inferGradeFromText(
        classInfo.value.className,
      );
    }
  }

  // Uncomment once a dedicated members endpoint exists on the backend:
  // try {
  //   const { data } = await getClassMembersApi(route.params.id);
  //   classmates.value = data;
  // } catch (error) {
  //   classmates.value = [];
  // }
}

async function loadAssignments() {
  const { data } = await getStudentAssignmentsApi();
  classAssignments.value = data.filter((assignment) =>
    assignment.classId
      ? String(assignment.classId) === String(route.params.id)
      : assignment.className === classInfo.value.className,
  );
}

onMounted(async () => {
  try {
    await loadClassInfo();
    await loadAssignments();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được thông tin lớp học";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.student-shell {
  min-height: 100vh;
  background: #ffffff;
  font-family: "Inter", "Roboto", sans-serif;
  color: #202124;
}

.masthead {
  border-bottom: 1px solid #e8eaed;
  background: #ffffff;
}
.masthead-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1120px;
  margin: 0 auto;
  padding: 14px 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #202124;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #fff;
  background: #1a73e8;
}
.brand-name em {
  font-style: normal;
  font-weight: 500;
  color: #5f6368;
}
.logout-button {
  color: #5f6368;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  color: #5f6368;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.back-link:hover {
  color: #1a73e8;
}

/* Class banner */
.class-banner {
  overflow: hidden;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  background: #fff;
}
.banner-spine {
  height: 84px;
}
.spine-0 {
  background: #1a73e8;
}
.spine-1 {
  background: #12805c;
}
.spine-2 {
  background: #a8380d;
}
.banner-body {
  padding: 18px 24px 22px;
}
.banner-body h1 {
  font-weight: 700;
  font-size: 24px;
  color: #202124;
}
.banner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 10px;
  color: #5f6368;
  font-size: 13px;
}
.banner-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Ledger */
.ledger {
  display: flex;
  align-items: center;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 18px 4px;
}
.ledger-item {
  flex: 1;
  text-align: center;
}
.ledger-item strong {
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: #202124;
}
.ledger-item span {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: #5f6368;
}
.ledger-divider {
  width: 1px;
  height: 32px;
  background: #e8eaed;
}

.tabs-bar {
  border-bottom: 1px solid #e8eaed;
}

/* Assignments */
.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.assignment-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  transition: border-color 140ms ease;
}
.assignment-row:hover {
  border-color: #dadce0;
}
.assignment-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  color: #1a73e8;
  background: #e8f0fe;
}
.assignment-info {
  flex: 1;
  min-width: 0;
}
.assignment-info h3 {
  font-weight: 600;
  font-size: 15px;
  color: #202124;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 4px;
  color: #5f6368;
  font-size: 12px;
}
.meta-row span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.deadline {
  padding: 2px 8px;
  border-radius: 12px;
  color: #a8380d;
  background: #fce8e6;
  font-weight: 600;
}
.row-action {
  flex-shrink: 0;
}
.primary-action {
  background: #1a73e8 !important;
  color: #fff !important;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  box-shadow: none !important;
}

/* Members */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.member-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid #e8eaed;
  border-radius: 10px;
}
.member-avatar {
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 700;
  font-size: 13px;
}
.member-info h4 {
  font-weight: 600;
  font-size: 14px;
  color: #202124;
}
.member-info p {
  margin-top: 2px;
  color: #5f6368;
  font-size: 12px;
}

@media (max-width: 700px) {
  .ledger {
    flex-direction: column;
    gap: 16px;
  }
  .ledger-divider {
    display: none;
  }
  .assignment-row {
    flex-wrap: wrap;
  }
  .row-action {
    width: 100%;
  }
}
</style>
  