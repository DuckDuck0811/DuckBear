<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="text-none mb-2 pl-0"
          color="secondary"
          size="small"
          @click="router.back()"
        >
          Quay lại danh sách lớp
        </v-btn>
        <div class="t-eyebrow">BẢNG ĐIỀU KHIỂN LỚP</div>
        <h1 class="t-page-title">{{ classInfo?.name || "Đang tải..." }}</h1>
        <p v-if="classInfo" class="t-page-subtitle">
          {{ classInfo.schoolYearLabel }} · Khối {{ classInfo.gradeLevel || "-" }} · {{ members.length }} học sinh
        </p>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      closable
      class="mb-5"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <!-- Stat cards -->
      <v-row class="mb-4">
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #eef3ff">
              <v-icon size="18" color="#4F7CFF">mdi-account-group-outline</v-icon>
            </div>
            <div class="t-stat-value mt-2">{{ members.length }}</div>
            <div class="t-stat-label">Học sinh</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #f0fdf4">
              <v-icon size="18" color="#22C55E">mdi-clipboard-text-outline</v-icon>
            </div>
            <div class="t-stat-value mt-2">{{ classAssignments.length }}</div>
            <div class="t-stat-label">Bài tập</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #fffbeb">
              <v-icon size="18" color="#F59E0B">mdi-star-outline</v-icon>
            </div>
            <div class="t-stat-value mt-2">{{ overallAvgScore ?? "-" }}</div>
            <div class="t-stat-label">Điểm TB lớp</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #fef2f2">
              <v-icon size="18" color="#EF4444">mdi-calendar-check-outline</v-icon>
            </div>
            <div class="t-stat-value mt-2">{{ overallAttendanceRate ?? "-" }}%</div>
            <div class="t-stat-label">Tỉ lệ đi học TB</div>
          </div>
        </v-col>
      </v-row>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary" class="mb-4 t-tabs" bg-color="transparent">
        <v-tab value="attendance">
          <v-icon start size="17">mdi-calendar-check</v-icon>
          Điểm danh
        </v-tab>
        <v-tab value="progress">
          <v-icon start size="17">mdi-chart-line</v-icon>
          Tiến độ học tập
        </v-tab>
        <v-tab value="performance">
          <v-icon start size="17">mdi-school-outline</v-icon>
          Học lực theo môn
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- ===== ĐIỂM DANH ===== -->
        <v-window-item value="attendance">
          <v-card class="t-card mb-5">
            <v-card-text class="d-flex flex-wrap align-center ga-3 pa-4">
              <v-text-field
                v-model="attendanceDate"
                type="date"
                label="Ngày điểm danh"
                variant="outlined"
                density="comfortable"
                hide-details
                style="max-width: 220px"
              />
              <v-btn
                color="primary"
                variant="flat"
                :loading="sessionLoading"
                style="border-radius: 8px; font-weight: 600"
                @click="openSessionForDate"
              >
                Bắt đầu / Mở buổi điểm danh
              </v-btn>
              <v-spacer />
              <v-select
                v-if="sessions.length"
                :items="sessionOptions"
                item-title="label"
                item-value="id"
                label="Xem buổi trước"
                variant="outlined"
                density="comfortable"
                hide-details
                style="max-width: 220px"
                @update:model-value="loadSession"
              />
            </v-card-text>
          </v-card>

          <!-- Attendance table -->
          <v-card v-if="currentSessionId" class="t-card mb-5">
            <v-card-title class="d-flex align-center px-5 pt-4 pb-2">
              <span class="section-card-title">Điểm danh ngày {{ formatDate(attendanceDate) }}</span>
              <v-spacer />
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                :loading="savingAttendance"
                style="border-radius: 8px; font-weight: 600"
                @click="saveAttendance"
              >
                Lưu điểm danh
              </v-btn>
            </v-card-title>
            <v-table class="t-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in members" :key="getMemberStudentId(m)">
                  <td>{{ m.studentName }}</td>
                  <td>
                    <v-btn-toggle
                      v-model="attendanceRecords[getMemberStudentId(m)]"
                      color="primary"
                      density="comfortable"
                      mandatory
                      divided
                      rounded="lg"
                    >
                      <v-btn value="present" size="small">Có mặt</v-btn>
                      <v-btn value="late" size="small">Trễ</v-btn>
                      <v-btn value="excused" size="small">Có phép</v-btn>
                      <v-btn value="absent" size="small">Vắng</v-btn>
                    </v-btn-toggle>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <!-- Attendance summary -->
          <v-card class="t-card">
            <v-card-title class="section-card-title px-5 pt-4 pb-2">Tỉ lệ chuyên cần</v-card-title>
            <v-table class="t-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Số buổi đã điểm danh</th>
                  <th>Có mặt / Trễ</th>
                  <th>Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in attendanceRows" :key="row.studentId">
                  <td>{{ row.name }}</td>
                  <td>{{ row.totalSessions }}</td>
                  <td>{{ row.presentCount }}</td>
                  <td>
                    <span v-if="row.rate === null" style="color: #9ca3af">Chưa có dữ liệu</span>
                    <span
                      v-else
                      class="rate-badge"
                      :class="row.rate < 80 ? 'rate-badge--low' : 'rate-badge--ok'"
                    >{{ row.rate }}%</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>

        <!-- ===== TIẾN ĐỘ HỌC TẬP ===== -->
        <v-window-item value="progress">
          <v-card class="t-card">
            <v-card-title class="section-card-title px-5 pt-4 pb-2">Tiến độ hoàn thành bài tập</v-card-title>
            <v-empty-state
              v-if="!classAssignments.length"
              icon="mdi-clipboard-text-outline"
              title="Lớp chưa có bài tập nào"
              text="Tiến độ sẽ hiển thị khi giáo viên giao bài cho lớp này."
            />
            <v-table v-else class="t-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Đã nộp / Tổng bài</th>
                  <th style="width: 220px">Tiến độ</th>
                  <th>Điểm TB</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in progressRows" :key="row.studentId">
                  <td>{{ row.name }}</td>
                  <td>{{ row.completed }} / {{ row.total }}</td>
                  <td>
                    <v-progress-linear
                      :model-value="row.percent"
                      height="16"
                      rounded
                      color="primary"
                      bg-color="#EEF3FF"
                    >
                      <span style="font-size: 11px; font-weight: 600; color: white">{{ row.percent }}%</span>
                    </v-progress-linear>
                  </td>
                  <td>
                    <span v-if="row.avgScore" class="score-pill">{{ row.avgScore }}</span>
                    <span v-else style="color: #9ca3af">-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>

        <!-- ===== HỌC LỰC THEO MÔN ===== -->
        <v-window-item value="performance">
          <v-empty-state
            v-if="!subjectRows.length"
            icon="mdi-book-outline"
            title="Chưa có dữ liệu học lực"
            text="Cần có bài tập gắn với môn học và học sinh đã nộp bài để tính điểm trung bình."
          />

          <v-card
            v-for="subject in subjectRows"
            :key="subject.subjectId"
            class="t-card mb-4"
          >
            <v-card-title class="d-flex align-center px-5 pt-4 pb-2">
              <span class="section-card-title">{{ subject.subjectName }}</span>
              <v-spacer />
              <div class="subject-avg-chip">
                Điểm TB lớp: <strong>{{ subject.classAvg }}</strong>
              </div>
            </v-card-title>
            <v-table density="compact" class="t-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Điểm TB môn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in subject.students" :key="s.name">
                  <td>{{ s.name }}</td>
                  <td>
                    <span v-if="s.avg != null" class="score-pill">{{ s.avg.toFixed(1) }}</span>
                    <span v-else style="color: #9ca3af">-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>
      </v-window>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getClassesApi, getClassStudentsApi } from "@/api/class";
import { getTeacherAssignmentsApi } from "@/api/assignment";
import { getStudentSubmissionsApi } from "@/api/submission";
import { getSubjectsApi } from "@/api/subject";
import {
  getAttendanceSessionsApi,
  createAttendanceSessionApi,
  getAttendanceRecordsApi,
  saveAttendanceRecordsApi,
  getAttendanceSummaryApi,
} from "@/api/attendance";

// ============================================================
// ADAPTER — CHỈNH Ở ĐÂY nếu tên field thật khác với giả định dưới.
// ============================================================
const getAssignmentClassId = (a) => a.classId;
const getAssignmentSubjectId = (a) => a.subjectId;
const getAssignmentId = (a) => a.id;
const getSubmissionAssignmentId = (s) => s.assignmentId;
const getSubmissionScore = (s) => s.score ?? s.grade ?? null;
const getMemberStudentId = (m) => m.studentId ?? m.id;
const getSubjectName = (subj) => subj.name ?? subj.subjectName ?? "Không tên";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const classId = route.params.classId;

const loading = ref(true);
const errorMessage = ref("");
const activeTab = ref("attendance");

const classInfo = ref(null);
const members = ref([]);
const subjects = ref([]);
const classAssignments = ref([]);
const submissionsByStudent = ref({});

// --- Điểm danh ---
const sessions = ref([]);
const attendanceSummary = ref([]);
const attendanceDate = ref(new Date().toISOString().slice(0, 10));
const currentSessionId = ref(null);
const attendanceRecords = reactive({});
const sessionLoading = ref(false);
const savingAttendance = ref(false);

const sessionOptions = computed(() =>
  sessions.value.map((s) => ({ id: s.id, label: formatDate(s.date) })),
);

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("vi-VN");
}

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [classRes, membersRes, subjectRes] = await Promise.all([
      getClassesApi(),
      getClassStudentsApi(classId),
      getSubjectsApi(),
    ]);
    classInfo.value =
      classRes.data.find((c) => String(c.id) === String(classId)) || null;
    members.value = membersRes.data || [];
    subjects.value = subjectRes.data || [];

    const assignmentRes = await getTeacherAssignmentsApi(authStore.userId);
    classAssignments.value = (assignmentRes.data || []).filter(
      (a) => String(getAssignmentClassId(a)) === String(classId),
    );

    const studentIds = members.value.map(getMemberStudentId);
    const submissionResults = await Promise.all(
      studentIds.map((id) =>
        getStudentSubmissionsApi(id).catch(() => ({ data: [] })),
      ),
    );
    submissionsByStudent.value = Object.fromEntries(
      studentIds.map((id, idx) => [id, submissionResults[idx].data || []]),
    );

    const [summaryRes, sessionRes] = await Promise.all([
      getAttendanceSummaryApi(classId, studentIds),
      getAttendanceSessionsApi(classId),
    ]);
    attendanceSummary.value = summaryRes.data || [];
    sessions.value = sessionRes.data || [];
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      "Không tải được dữ liệu bảng điều khiển";
  } finally {
    loading.value = false;
  }
}

async function openSessionForDate() {
  sessionLoading.value = true;
  try {
    const { data: session } = await createAttendanceSessionApi({
      classId,
      date: attendanceDate.value,
    });
    currentSessionId.value = session.id;
    if (!sessions.value.find((s) => s.id === session.id))
      sessions.value.unshift(session);

    const { data: records } = await getAttendanceRecordsApi(session.id);
    members.value.forEach((m) => {
      const sid = getMemberStudentId(m);
      const existing = records.find((r) => r.studentId === sid);
      attendanceRecords[sid] = existing?.status || "present";
    });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không mở được buổi điểm danh";
  } finally {
    sessionLoading.value = false;
  }
}

async function loadSession(sessionId) {
  const session = sessions.value.find((s) => s.id === sessionId);
  if (!session) return;
  attendanceDate.value = session.date;
  currentSessionId.value = session.id;
  const { data: records } = await getAttendanceRecordsApi(session.id);
  members.value.forEach((m) => {
    const sid = getMemberStudentId(m);
    const existing = records.find((r) => r.studentId === sid);
    attendanceRecords[sid] = existing?.status || "present";
  });
}

async function saveAttendance() {
  if (!currentSessionId.value) return;
  savingAttendance.value = true;
  try {
    const records = members.value.map((m) => {
      const sid = getMemberStudentId(m);
      return { studentId: sid, status: attendanceRecords[sid] || "present" };
    });
    await saveAttendanceRecordsApi(currentSessionId.value, records);
    const studentIds = members.value.map(getMemberStudentId);
    const { data } = await getAttendanceSummaryApi(classId, studentIds);
    attendanceSummary.value = data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không lưu được điểm danh";
  } finally {
    savingAttendance.value = false;
  }
}

const attendanceRows = computed(() =>
  members.value.map((m) => {
    const sid = getMemberStudentId(m);
    const summary = attendanceSummary.value.find((s) => s.studentId === sid);
    return {
      studentId: sid,
      name: m.studentName,
      totalSessions: summary?.totalSessions || 0,
      presentCount: summary?.presentCount || 0,
      rate: summary?.rate ?? null,
    };
  }),
);

const overallAttendanceRate = computed(() => {
  const rates = attendanceSummary.value
    .map((s) => s.rate)
    .filter((r) => r != null);
  if (!rates.length) return null;
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
});

const progressRows = computed(() =>
  members.value.map((m) => {
    const sid = getMemberStudentId(m);
    const subs = submissionsByStudent.value[sid] || [];
    const classAssignmentIds = classAssignments.value.map(getAssignmentId);
    const relevantSubs = subs.filter((s) =>
      classAssignmentIds.includes(getSubmissionAssignmentId(s)),
    );
    const scored = relevantSubs
      .map((s) => getSubmissionScore(s))
      .filter((score) => score != null);
    const avgScore = scored.length
      ? (
          scored.reduce((sum, v) => sum + Number(v), 0) / scored.length
        ).toFixed(1)
      : null;
    const total = classAssignments.value.length;
    const completed = relevantSubs.length;
    return {
      studentId: sid,
      name: m.studentName,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      avgScore,
    };
  }),
);

const overallAvgScore = computed(() => {
  const scores = progressRows.value
    .map((r) => r.avgScore)
    .filter((v) => v != null)
    .map(Number);
  if (!scores.length) return null;
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
});

const subjectRows = computed(() => {
  return subjects.value
    .map((subject) => {
      const subjectAssignmentIds = classAssignments.value
        .filter(
          (a) => String(getAssignmentSubjectId(a)) === String(subject.id),
        )
        .map(getAssignmentId);
      if (!subjectAssignmentIds.length) return null;

      const studentScores = members.value.map((m) => {
        const sid = getMemberStudentId(m);
        const subs = submissionsByStudent.value[sid] || [];
        const scored = subs
          .filter((s) =>
            subjectAssignmentIds.includes(getSubmissionAssignmentId(s)),
          )
          .map((s) => getSubmissionScore(s))
          .filter((v) => v != null)
          .map(Number);
        const avg = scored.length
          ? scored.reduce((a, b) => a + b, 0) / scored.length
          : null;
        return { name: m.studentName, avg };
      });

      const validScores = studentScores.map((s) => s.avg).filter((v) => v != null);
      const classAvg = validScores.length
        ? (
            validScores.reduce((a, b) => a + b, 0) / validScores.length
          ).toFixed(1)
        : "-";

      return {
        subjectId: subject.id,
        subjectName: getSubjectName(subject),
        classAvg,
        students: studentScores,
      };
    })
    .filter(Boolean);
});

onMounted(loadDashboard);
</script>

<style scoped>
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1d2e;
}

/* Rate badge */
.rate-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.rate-badge--ok {
  background: #f0fdf4;
  color: #15803d;
}

.rate-badge--low {
  background: #fef2f2;
  color: #b91c1c;
}

/* Score pill */
.score-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: #eef3ff;
  color: #4f7cff;
}

/* Subject avg chip */
.subject-avg-chip {
  font-size: 13px;
  color: #6b7280;
  background: #f3f6ff;
  padding: 4px 12px;
  border-radius: 20px;
}

.subject-avg-chip strong {
  color: #4f7cff;
  font-weight: 700;
}

@media (max-width: 600px) {
  .t-page-wrap {
    padding: 16px;
  }
}
</style>
