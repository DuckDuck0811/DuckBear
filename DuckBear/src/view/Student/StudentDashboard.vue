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
        <section class="hero-panel mb-10">
          <div class="hero-copy">
            <h1>Chào em, bắt đầu một ngày học thật tốt.</h1>
            <p>
              Theo dõi lớp học, bài tập và những việc cần hoàn thành ở một nơi.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <v-btn
                class="hero-action primary-action"
                @click="joinDialog = true"
                prepend-icon="mdi-account-plus"
                >Tham gia lớp học</v-btn
              >
              <v-btn
                class="hero-action ghost-action"
                variant="text"
                prepend-icon="mdi-history"
                @click="router.push({ name: 'student-history' })"
                >Lịch sử làm bài</v-btn
              >
            </div>
          </div>
          <div class="hero-figure" aria-hidden="true">
            <v-icon size="50">mdi-duck</v-icon>
          </div>
        </section>

        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-6"
          variant="tonal"
          >{{ errorMessage }}</v-alert
        >
        <v-alert
          v-if="successMessage"
          type="success"
          class="mb-6"
          variant="tonal"
          >{{ successMessage }}</v-alert
        >

        <section class="ledger mb-10">
          <div class="ledger-item">
            <strong>{{ classes.length }}</strong>
            <span>Lớp đang học</span>
          </div>
          <div class="ledger-divider" />
          <div class="ledger-item">
            <strong>{{ assignments.length }}</strong>
            <span>Bài cần làm</span>
          </div>
          <div class="ledger-divider" />
          <div class="ledger-item">
            <strong>0%</strong>
            <span>Tiến độ tuần này</span>
          </div>
        </section>

        <section class="section-block mb-10">
          <div class="section-heading">
            <div>
              <h2>Lớp của em</h2>
              <p class="section-sub">Các lớp em đã tham gia.</p>
            </div>
            <v-btn
              class="outline-action"
              variant="outlined"
              prepend-icon="mdi-account-plus"
              @click="joinDialog = true"
              >Tham gia lớp</v-btn
            >
          </div>

          <div v-if="classes.length" class="class-grid">
            <article
              v-for="(member, index) in classes"
              :key="member.id"
              class="class-card"
              :class="`spine-${index % 3}`"
            >
              <h3>{{ member.className }}</h3>
              <p>Đã tham gia {{ formatDate(member.joinedAt) }}</p>
              <button class="text-link">
                Mở lớp <v-icon size="16">mdi-arrow-right</v-icon>
              </button>
            </article>
          </div>
          <v-empty-state
            v-else
            icon="mdi-account-school-outline"
            title="Em chưa tham gia lớp nào"
            text="Tham gia lớp để nhận bài tập từ giáo viên."
          />
        </section>

        <section class="section-block mb-10">
          <div class="section-heading">
            <div>
              <h2>Học tập</h2>
              <p class="section-sub">
                Đi đến tài liệu, hồ sơ và trợ lý học tập.
              </p>
            </div>
          </div>
          <div class="tab-row">
            <button
              class="tab-card"
              @click="router.push({ name: 'student-resources' })"
            >
              <v-icon size="22">mdi-book-open-variant</v-icon>
              <span>Tài liệu</span>
            </button>
            <button
              class="tab-card"
              @click="router.push({ name: 'student-profile' })"
            >
              <v-icon size="22">mdi-account-circle</v-icon>
              <span>Hồ sơ</span>
            </button>
            <button
              class="tab-card"
              @click="router.push({ name: 'student-ai' })"
            >
              <v-icon size="22">mdi-robot-happy</v-icon>
              <span>AI hỗ trợ</span>
            </button>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <div>
              <h2>Bài tập được giao</h2>
              <p class="section-sub">Chọn một bài để bắt đầu làm.</p>
            </div>
            <span class="count-pill">{{ assignments.length }} bài</span>
          </div>

          <div v-if="loading" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="assignments.length" class="assignment-list">
            <article
              v-for="assignment in assignments"
              :key="assignment.id"
              class="assignment-row"
            >
              <div class="assignment-icon">
                <v-icon>mdi-clipboard-text-outline</v-icon>
              </div>
              <div class="assignment-info">
                <h3>{{ assignment.title }}</h3>
                <p class="assignment-class">
                  {{ assignment.className || "Bài tập chung" }}
                </p>
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
                @click="startAssignment(assignment.id)"
                >Bắt đầu làm <v-icon end>mdi-arrow-right</v-icon></v-btn
              >
            </article>
          </div>
          <v-empty-state
            v-else
            icon="mdi-inbox-outline"
            title="Chưa có bài tập"
            text="Khi giáo viên giao bài, bài tập sẽ xuất hiện ở đây."
          />
        </section>

        <v-dialog v-model="joinDialog" max-width="480">
          <v-card class="join-dialog">
            <v-card-title>Tham gia lớp học</v-card-title>
            <v-card-text>
              <p class="text-body-2 mb-4 dialog-hint">
                Chọn lớp do giáo viên tạo để tham gia.
              </p>
              <v-select
                v-model="classToJoin"
                :items="availableClasses"
                item-title="name"
                item-value="id"
                label="Lớp học"
                variant="outlined"
                :loading="classesLoading"
                no-data-text="Chưa có lớp học để tham gia"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="joinDialog = false">Hủy</v-btn>
              <v-btn
                class="primary-action"
                :disabled="!classToJoin"
                :loading="joining"
                @click="joinClass"
                >Tham gia</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getStudentAssignmentsApi } from "@/api/assignment";
import { getClassesApi, getMyClassesApi, joinClassApi } from "@/api/class";

const router = useRouter();
const authStore = useAuthStore();
const assignments = ref([]);
const classes = ref([]);
const availableClasses = ref([]);
const classToJoin = ref(null);
const joinDialog = ref(false);
const loading = ref(true);
const classesLoading = ref(false);
const joining = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function startAssignment(id) {
  router.push({ name: "student-assignment", params: { id } });
}

function logout() {
  authStore.logout();
  router.push({ name: "login" });
}

async function loadClasses() {
  classesLoading.value = true;
  try {
    const [myClassesResponse, allClassesResponse] = await Promise.all([
      getMyClassesApi(),
      getClassesApi(),
    ]);
    classes.value = myClassesResponse.data;
    const joinedIds = new Set(classes.value.map((item) => item.classId));
    availableClasses.value = allClassesResponse.data.filter(
      (item) => !joinedIds.has(item.id),
    );
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được danh sách lớp";
  } finally {
    classesLoading.value = false;
  }
}

async function joinClass() {
  joining.value = true;
  try {
    await joinClassApi(classToJoin.value);
    successMessage.value = "Đã tham gia lớp học.";
    joinDialog.value = false;
    classToJoin.value = null;
    await loadClasses();
    assignments.value = (await getStudentAssignmentsApi()).data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể tham gia lớp";
  } finally {
    joining.value = false;
  }
}

onMounted(async () => {
  try {
    const [assignmentResponse] = await Promise.all([
      getStudentAssignmentsApi(),
      loadClasses(),
    ]);
    assignments.value = assignmentResponse.data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được dữ liệu học tập";
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

/* ---------- Masthead ---------- */
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

/* ---------- Hero ---------- */
.hero-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 40px;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  background: #f8faff;
}
.hero-copy {
  max-width: 560px;
}
.hero-panel h1 {
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 38px);
  line-height: 1.2;
  letter-spacing: -0.3px;
  color: #202124;
}
.hero-panel p {
  max-width: 460px;
  margin: 12px 0 24px;
  color: #5f6368;
  font-size: 15px;
  line-height: 1.6;
}
.hero-action {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: none !important;
}
.primary-action {
  background: #1a73e8 !important;
  color: #fff !important;
}
.primary-action:hover {
  background: #1558b0 !important;
}
.ghost-action {
  color: #1a73e8 !important;
}
.outline-action {
  border-color: #dadce0 !important;
  color: #3c4043 !important;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
}
.hero-figure {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  color: #1a73e8;
  background: #e8f0fe;
}

/* ---------- Ledger ---------- */
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

/* ---------- Section headings ---------- */
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.section-heading h2 {
  font-weight: 700;
  font-size: 20px;
  color: #202124;
}
.section-sub {
  margin-top: 3px;
  color: #5f6368;
  font-size: 13px;
}
.count-pill {
  padding: 5px 14px;
  border-radius: 20px;
  background: #e8f0fe;
  color: #1a73e8;
  font-size: 13px;
  font-weight: 600;
}

/* ---------- Classes (Google Classroom style banner card) ---------- */
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.class-card {
  overflow: hidden;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  background: #fff;
  transition: box-shadow 140ms ease;
}
.class-card:hover {
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.15);
}
.class-card::before {
  display: block;
  height: 64px;
  content: "";
}
.spine-0::before {
  background: #1a73e8;
}
.spine-1::before {
  background: #12805c;
}
.spine-2::before {
  background: #a8380d;
}
.class-card h3 {
  margin: 14px 16px 0;
  font-weight: 700;
  font-size: 16px;
  color: #202124;
}
.class-card p {
  margin: 4px 16px 14px;
  color: #5f6368;
  font-size: 13px;
}
.text-link {
  margin: 0 16px 14px;
  background: none;
  border: none;
  padding: 0;
  color: #1a73e8;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ---------- Quick nav tabs ---------- */
.tab-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}
.tab-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  background: #fff;
  color: #202124;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background 140ms ease;
}
.tab-card:hover {
  border-color: #1a73e8;
  background: #f8faff;
}
.tab-card .v-icon {
  color: #1a73e8;
}

/* ---------- Assignments (Azota-style list rows) ---------- */
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
.assignment-class {
  margin: 2px 0 6px;
  color: #5f6368;
  font-size: 13px;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
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

/* ---------- Dialog ---------- */
.join-dialog {
  background: #fff !important;
}
.dialog-hint {
  color: #5f6368;
}

/* ---------- Responsive ---------- */
@media (max-width: 700px) {
  .hero-panel {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 22px;
  }
  .hero-figure {
    display: none;
  }
  .ledger {
    flex-direction: column;
    gap: 16px;
  }
  .ledger-divider {
    display: none;
  }
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }
  .assignment-row {
    flex-wrap: wrap;
  }
  .row-action {
    width: 100%;
  }
}
</style>
