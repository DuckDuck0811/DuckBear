<template>
  <v-app>
    <v-main class="student-shell">
      <v-container class="py-8" max-width="1120">
        <header class="hero-panel mb-8">
          <div class="hero-copy">
            <div class="eyebrow">DUCKBEAR CLASSROOM</div>
            <h1>Chào em, bắt đầu một ngày học thật tốt.</h1>
            <p>Theo dõi lớp học, bài tập và những việc cần hoàn thành ở một nơi.</p>
            <div class="d-flex flex-wrap gap-3">
              <v-btn class="hero-action" color="primary" prepend-icon="mdi-account-plus" @click="joinDialog = true">Tham gia lớp học</v-btn>
              <v-btn class="hero-action" variant="tonal" color="primary" prepend-icon="mdi-history" @click="router.push({ name: 'student-history' })">Lịch sử làm bài</v-btn>
            </div>
          </div>
          <div class="hero-mark"><v-icon size="76">mdi-school-outline</v-icon><span>HỌC<br />MỖI NGÀY</span></div>
          <v-btn class="logout-button" variant="text" prepend-icon="mdi-logout" @click="logout">Đăng xuất</v-btn>
        </header>

        <v-alert v-if="errorMessage" type="error" class="mb-6">{{ errorMessage }}</v-alert>
        <v-alert v-if="successMessage" type="success" class="mb-6">{{ successMessage }}</v-alert>

        <div class="stats-row mb-8">
          <div class="stat-card"><div class="stat-icon blue"><v-icon>mdi-google-classroom</v-icon></div><div><strong>{{ classes.length }}</strong><span>Lớp đang học</span></div></div>
          <div class="stat-card"><div class="stat-icon amber"><v-icon>mdi-clipboard-text-outline</v-icon></div><div><strong>{{ assignments.length }}</strong><span>Bài cần làm</span></div></div>
          <div class="stat-card"><div class="stat-icon green"><v-icon>mdi-progress-check</v-icon></div><div><strong>0%</strong><span>Tiến độ tuần này</span></div></div>
        </div>

        <section class="section-block mb-8">
          <div class="section-heading"><div><h2>Lớp của em</h2><p class="text-medium-emphasis">Các lớp em đã tham gia.</p></div><v-btn color="primary" prepend-icon="mdi-account-plus" @click="joinDialog = true">Tham gia lớp</v-btn></div>
          <v-row v-if="classes.length">
            <v-col v-for="(member, index) in classes" :key="member.id" cols="12" sm="6" md="4"><v-card class="class-card h-100" elevation="0"><div class="class-stripe" :class="`stripe-${index % 3}`"></div><v-card-item><template #prepend><v-avatar class="class-avatar" :class="`avatar-${index % 3}`"><v-icon>mdi-google-classroom</v-icon></v-avatar></template><v-card-title>{{ member.className }}</v-card-title><v-card-subtitle>Đã tham gia {{ formatDate(member.joinedAt) }}</v-card-subtitle></v-card-item><v-card-actions><v-btn variant="text" size="small" color="primary">Mở lớp <v-icon end>mdi-arrow-right</v-icon></v-btn></v-card-actions></v-card></v-col>
          </v-row>
          <v-empty-state v-else icon="mdi-account-school-outline" title="Em chưa tham gia lớp nào" text="Tham gia lớp để nhận bài tập từ giáo viên." />
        </section>

        <section class="section-block mb-8">
          <div class="section-heading"><div><h2>Học tập</h2><p class="text-medium-emphasis">Đi đến tài liệu, hồ sơ và trợ lý học tập.</p></div></div>
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="quick-card" elevation="0" @click="router.push({ name: 'student-resources' })">
                <v-card-item>
                  <template #prepend><v-avatar color="#edf2ff" class="quick-icon"><v-icon color="primary">mdi-book-open-variant</v-icon></v-avatar></template>
                  <v-card-title>Tài liệu</v-card-title>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="quick-card" elevation="0" @click="router.push({ name: 'student-profile' })">
                <v-card-item>
                  <template #prepend><v-avatar color="#edf2ff" class="quick-icon"><v-icon color="primary">mdi-account-circle</v-icon></v-avatar></template>
                  <v-card-title>Hồ sơ</v-card-title>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="quick-card" elevation="0" @click="router.push({ name: 'student-ai' })">
                <v-card-item>
                  <template #prepend><v-avatar color="#edf2ff" class="quick-icon"><v-icon color="primary">mdi-robot-happy</v-icon></v-avatar></template>
                  <v-card-title>AI hỗ trợ</v-card-title>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <section class="section-block">
          <div class="section-heading"><div><h2>Bài tập được giao</h2><p class="text-medium-emphasis">Chọn một bài để bắt đầu làm.</p></div><v-chip color="primary" variant="tonal">{{ assignments.length }} bài</v-chip></div>
          <div v-if="loading" class="text-center py-12"><v-progress-circular indeterminate color="primary" /></div>
          <v-row v-else-if="assignments.length">
            <v-col v-for="assignment in assignments" :key="assignment.id" cols="12" md="6" lg="4"><v-card class="assignment-card h-100" elevation="0"><v-card-item><template #prepend><div class="assignment-icon"><v-icon>mdi-clipboard-text-outline</v-icon></div></template><v-card-title>{{ assignment.title }}</v-card-title><v-card-subtitle>{{ assignment.className || "Bài tập chung" }}</v-card-subtitle></v-card-item><v-card-text><div class="meta-row"><span><v-icon size="16">mdi-help-circle-outline</v-icon> {{ assignment.totalQuestions }} câu</span><span v-if="assignment.timeLimit"><v-icon size="16">mdi-clock-outline</v-icon> {{ assignment.timeLimit }} phút</span></div><div v-if="assignment.deadline" class="deadline mt-4"><v-icon size="15">mdi-calendar-clock-outline</v-icon> Hạn {{ formatDate(assignment.deadline) }}</div></v-card-text><v-card-actions><v-btn color="primary" block @click="startAssignment(assignment.id)">Bắt đầu làm <v-icon end>mdi-arrow-right</v-icon></v-btn></v-card-actions></v-card></v-col>
          </v-row>
          <v-empty-state v-else icon="mdi-inbox-outline" title="Chưa có bài tập" text="Khi giáo viên giao bài, bài tập sẽ xuất hiện ở đây." />
        </section>

        <v-dialog v-model="joinDialog" max-width="520"><v-card><v-card-title>Tham gia lớp học</v-card-title><v-card-text><p class="text-body-2 text-medium-emphasis mb-4">Chọn lớp do giáo viên tạo để tham gia.</p><v-select v-model="classToJoin" :items="availableClasses" item-title="name" item-value="id" label="Lớp học" variant="outlined" :loading="classesLoading" no-data-text="Chưa có lớp học để tham gia" /></v-card-text><v-card-actions><v-spacer /><v-btn @click="joinDialog = false">Hủy</v-btn><v-btn color="primary" :disabled="!classToJoin" :loading="joining" @click="joinClass">Tham gia</v-btn></v-card-actions></v-card></v-dialog>
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
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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
    const [myClassesResponse, allClassesResponse] = await Promise.all([getMyClassesApi(), getClassesApi()]);
    classes.value = myClassesResponse.data;
    const joinedIds = new Set(classes.value.map((item) => item.classId));
    availableClasses.value = allClassesResponse.data.filter((item) => !joinedIds.has(item.id));
  } catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được danh sách lớp"; }
  finally { classesLoading.value = false; }
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
  } catch (error) { errorMessage.value = error.response?.data?.message || "Không thể tham gia lớp"; }
  finally { joining.value = false; }
}

onMounted(async () => {
  try {
    const [assignmentResponse] = await Promise.all([getStudentAssignmentsApi(), loadClasses()]);
    assignments.value = assignmentResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không tải được dữ liệu học tập";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.student-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.hero-panel { position: relative; display: flex; min-height: 260px; align-items: center; justify-content: space-between; overflow: hidden; padding: 42px 48px; border: 1px solid #e1e7f2; border-radius: 24px; background: linear-gradient(115deg, #ffffff 0%, #f7f9ff 62%, #eef3ff 100%); box-shadow: 0 18px 45px rgba(30, 55, 105, 0.08); }
.hero-panel::after { position: absolute; right: 11%; bottom: -110px; width: 310px; height: 310px; border: 1px solid #d9e3ff; border-radius: 50%; content: ""; }
.hero-copy { position: relative; z-index: 1; max-width: 610px; }
.eyebrow { color: #3566d4; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; }
.hero-panel h1 { max-width: 560px; color: #15203a; font-size: clamp(29px, 4vw, 47px); line-height: 1.08; letter-spacing: -0.5px; margin-top: 10px; }
.hero-panel p { max-width: 500px; color: #66728a; font-size: 16px; line-height: 1.6; margin: 14px 0 24px; }
.hero-action { border-radius: 10px; box-shadow: 0 9px 18px rgba(48, 92, 208, 0.2); }
.hero-mark { position: relative; z-index: 1; display: grid; place-items: center; width: 164px; height: 164px; border: 1px solid #d7e2ff; border-radius: 50%; color: #3566d4; background: rgba(255, 255, 255, 0.65); }
.hero-mark span { color: #7a8bad; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.35; text-align: center; }
.logout-button { position: absolute; top: 18px; right: 22px; z-index: 2; color: #68758c; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; min-height: 92px; padding: 18px 20px; border: 1px solid #e4e8f0; border-radius: 15px; background: #fff; }
.stat-card strong { display: block; color: #16213a; font-size: 25px; line-height: 1.1; }
.stat-card span { display: block; color: #788399; font-size: 12px; margin-top: 5px; }
.stat-icon { display: grid; place-items: center; width: 45px; height: 45px; border-radius: 12px; }
.stat-icon.blue { color: #3566d4; background: #eaf0ff; }
.stat-icon.amber { color: #bd7b17; background: #fff4dc; }
.stat-icon.green { color: #21845b; background: #e5f7ed; }
.section-heading { margin-bottom: 18px; }
.section-heading h2 { color: #182238; font-size: 22px; }
.section-heading p { margin-top: 4px; }
.class-card, .assignment-card { position: relative; overflow: hidden; border: 1px solid #e3e8f1; border-radius: 15px; background: #fff; transition: transform 160ms ease, box-shadow 160ms ease; }
.class-card:hover, .assignment-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(34, 57, 100, 0.1) !important; }
.class-stripe { height: 5px; }
.stripe-0 { background: #3566d4; }
.stripe-1 { background: #ed9c38; }
.stripe-2 { background: #42a879; }
.class-avatar { color: #3566d4; background: #edf2ff; }
.avatar-1 { color: #bd7b17; background: #fff4dc; }
.avatar-2 { color: #21845b; background: #e5f7ed; }
.assignment-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; color: #3566d4; background: #edf2ff; }
.meta-row { display: flex; gap: 18px; color: #687286; font-size: 14px; }
.deadline { display: flex; align-items: center; gap: 5px; color: #a56a15; font-size: 12px; }
@media (max-width: 700px) { .hero-panel { align-items: flex-start; padding: 36px 24px 28px; } .hero-mark { display: none; } .stats-row { grid-template-columns: 1fr; } .section-heading { align-items: start; flex-direction: column; } .hero-panel h1 { font-size: 31px; } }
</style>
