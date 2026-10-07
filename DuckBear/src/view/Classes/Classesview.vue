<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">QUẢN LÝ LỚP</div>
        <h1 class="t-page-title">Lớp học của bạn</h1>
        <p class="t-page-subtitle">Tạo lớp, quản lý danh sách học sinh và tổ chức không gian giao bài.</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        style="border-radius: 8px; font-weight: 600; flex-shrink: 0"
        @click="openCreateClass"
      >
        Tạo lớp mới
      </v-btn>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
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

    <!-- Empty -->
    <div v-else-if="!classes.length" class="t-empty-state">
      <v-icon icon="mdi-google-classroom" size="48" color="#9CA3AF" class="t-empty-icon" />
      <p class="t-empty-title">Chưa có lớp học nào</p>
      <p class="t-empty-desc">Tạo lớp học đầu tiên để bắt đầu thêm học sinh và giao bài tập ôn tập.</p>
      <v-btn
        color="primary"
        variant="flat"
        class="text-none"
        style="border-radius: 8px"
        @click="openCreateClass"
      >
        Tạo lớp mới
      </v-btn>
    </div>

    <!-- Class grid -->
    <v-row v-else>
      <v-col
        v-for="classRoom in classes"
        :key="classRoom.id"
        cols="12"
        md="6"
        lg="4"
      >
        <div class="class-card t-card t-card-hover">
          <!-- Class Card Header Banner -->
          <div
            class="class-banner"
            :style="{ background: getClassTheme(classRoom).gradient }"
          >
            <div class="class-banner-pattern" />
            <div class="class-emblem">
              <v-icon :icon="getClassTheme(classRoom).icon" size="24" color="white" />
            </div>
            <span class="class-grade-pill" v-if="classRoom.gradeLevel">
              Khối {{ classRoom.gradeLevel }}
            </span>
          </div>

          <!-- Class Body -->
          <div class="class-body">
            <h3 class="class-name">{{ classRoom.name }}</h3>
            <div class="class-year">
              <v-icon size="14" color="#64748B" start>mdi-calendar-range</v-icon>
              {{ classRoom.schoolYearLabel || "Niên khóa" }}
            </div>
            <div class="class-teacher">
              <v-icon size="14" color="#64748B" start>mdi-account-tie-outline</v-icon>
              {{ classRoom.homeroomTeacherName || "Chưa gán GV chủ nhiệm" }}
            </div>
          </div>

          <!-- Class Actions -->
          <div class="class-actions">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              class="text-none flex-1"
              style="border-radius: 7px; font-weight: 600"
              @click="openMembers(classRoom)"
            >
              <v-icon start size="16">mdi-account-multiple</v-icon>
              Học sinh
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              size="small"
              class="text-none flex-1"
              style="border-radius: 7px; font-weight: 600"
              :to="{ name: 'ClassDashboard', params: { classId: classRoom.id } }"
            >
              <v-icon start size="16">mdi-view-dashboard-outline</v-icon>
              Dashboard
            </v-btn>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="error"
              @click="removeClass(classRoom)"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Create Class Dialog with Live Preview -->
    <v-dialog v-model="classDialog" max-width="540">
      <v-card class="pa-2" style="border-radius: 16px">
        <!-- Dialog Header -->
        <div class="d-flex align-center px-4 pt-4 pb-2">
          <div class="dialog-icon-box mr-3">
            <v-icon color="#4F7CFF" size="24">mdi-google-classroom</v-icon>
          </div>
          <div>
            <div class="t-dialog-title">Tạo lớp học mới</div>
            <div class="text-caption text-secondary">
              Thiết lập lớp học và niên khóa giảng dạy
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="classDialog = false" />
        </div>

        <v-card-text class="px-4 py-2">
          <!-- LIVE PREVIEW CLASS CARD -->
          <div class="preview-container mb-4">
            <div class="text-caption font-weight-700 text-uppercase color-primary mb-2">
              <v-icon size="14" color="primary" start>mdi-eye-outline</v-icon>
              Xem trước thẻ lớp học
            </div>
            <div class="preview-class-card">
              <div
                class="preview-class-banner"
                :style="{ background: currentSelectedClassTheme.gradient }"
              >
                <div class="class-banner-pattern" />
                <div class="class-emblem">
                  <v-icon :icon="currentSelectedClassTheme.icon" size="22" color="white" />
                </div>
                <span class="class-grade-pill">
                  Khối {{ classForm.gradeLevel || "-" }}
                </span>
              </div>
              <div class="preview-class-body">
                <div class="preview-class-title">{{ classForm.name || "Tên lớp học..." }}</div>
                <div class="text-caption text-secondary">
                  {{ selectedSchoolYearLabel || "Chưa chọn niên khóa" }}
                </div>
              </div>
            </div>
          </div>

          <v-form ref="classFormRef">
            <div class="t-field-label">Tên lớp học *</div>
            <v-text-field
              v-model="classForm.name"
              variant="outlined"
              density="comfortable"
              placeholder="VD: 10A1, 11 Toán 1, 12 Chuyên Anh..."
              prepend-inner-icon="mdi-format-title"
              :rules="[(v) => !!v || 'Vui lòng nhập tên lớp']"
              class="mb-3"
            />

            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="t-field-label">Khối lớp *</div>
                <v-select
                  v-model="classForm.gradeLevel"
                  :items="gradeOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Chọn khối lớp"
                  prepend-inner-icon="mdi-numeric"
                  :rules="[(v) => !!v || 'Chọn khối lớp']"
                  class="mb-3"
                  @update:model-value="onGradeChange"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <div class="t-field-label">Niên khóa *</div>
                <v-select
                  v-model="classForm.schoolYearId"
                  :items="schoolYears"
                  item-title="yearLabel"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Chọn niên khóa"
                  prepend-inner-icon="mdi-calendar-range"
                  :rules="[(v) => !!v || 'Chọn niên khóa']"
                  class="mb-3"
                />
              </v-col>
            </v-row>

            <!-- Theme Picker -->
            <div class="t-field-label font-weight-700 mt-1 mb-2 color-primary d-flex align-center justify-between">
              <span>
                <v-icon size="16" color="primary" start>mdi-palette-outline</v-icon>
                Chọn màu chủ đạo của lớp
              </span>
            </div>

            <div class="class-theme-grid mb-2">
              <div
                v-for="theme in classThemes"
                :key="theme.id"
                class="class-theme-item"
                :class="{ active: classForm.themeId === theme.id }"
                :style="{ background: theme.gradient }"
                :title="theme.name"
                @click="classForm.themeId = theme.id"
              >
                <v-icon :icon="theme.icon" size="18" color="white" />
                <span class="theme-name">{{ theme.name }}</span>
                <v-icon
                  v-if="classForm.themeId === theme.id"
                  size="14"
                  color="white"
                  class="theme-check-icon"
                >
                  mdi-check-circle
                </v-icon>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="classDialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            :loading="saving"
            @click="createClass"
          >
            Lưu lớp học
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Members dialog -->
    <v-dialog v-model="membersDialog" max-width="640">
      <v-card class="pa-2" style="border-radius: 16px">
        <v-card-title class="d-flex align-center px-4 pt-4 pb-2">
          <div class="dialog-icon-box mr-3">
            <v-icon color="#4F7CFF" size="24">mdi-account-group-outline</v-icon>
          </div>
          <div>
            <div class="t-dialog-title">Thành viên: {{ selectedClass?.name }}</div>
            <div class="text-caption text-secondary">
              Danh sách {{ members.length }} học sinh trong lớp
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="membersDialog = false" />
        </v-card-title>

        <v-card-text class="px-4 pb-4">
          <div class="d-flex ga-2 mb-4">
            <v-select
              v-model="studentToAdd"
              :items="students"
              item-title="fullName"
              item-value="id"
              placeholder="Chọn học sinh để thêm vào lớp..."
              variant="outlined"
              density="comfortable"
              hide-details
              bg-color="white"
            />
            <v-btn
              color="primary"
              variant="flat"
              class="text-none"
              style="border-radius: 8px; font-weight: 600; height: 44px"
              :disabled="!studentToAdd"
              :loading="saving"
              @click="addStudent"
            >
              <v-icon start size="16">mdi-account-plus</v-icon>
              Thêm
            </v-btn>
          </div>

          <v-list v-if="members.length" lines="two" border rounded class="t-card">
            <v-list-item
              v-for="member in members"
              :key="member.id"
              :title="member.studentName"
              :subtitle="member.studentEmail || 'Chưa cập nhật email'"
            >
              <template #prepend>
                <v-avatar color="#eef3ff" size="36" class="mr-3">
                  <span class="font-weight-700 color-primary">
                    {{ (member.studentName || "H").charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
              </template>
              <template #append>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeStudent(member)"
                />
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="t-empty-state" style="margin: 0; padding: 32px 24px">
            <v-icon icon="mdi-account-school-outline" size="44" color="#9CA3AF" />
            <p class="t-empty-title" style="font-size: 15px">Chưa có học sinh nào trong lớp</p>
            <p class="t-empty-desc">Chọn học sinh ở trên và nhấn "Thêm" để bắt đầu xếp lớp.</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  addStudentToClassApi,
  createClassApi,
  deleteClassApi,
  getClassStudentsApi,
  getClassesApi,
  getSchoolYearsApi,
  getStudentsApi,
  removeStudentFromClassApi,
} from "@/api/class";

const classes = ref([]);
const schoolYears = ref([]);
const students = ref([]);
const members = ref([]);
const selectedClass = ref(null);
const studentToAdd = ref(null);
const classDialog = ref(false);
const membersDialog = ref(false);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");

// Grade Level Options with clear Vietnamese text
const gradeOptions = [
  { title: "Khối 6 (Lớp 6)", value: "6" },
  { title: "Khối 7 (Lớp 7)", value: "7" },
  { title: "Khối 8 (Lớp 8)", value: "8" },
  { title: "Khối 9 (Lớp 9)", value: "9" },
  { title: "Khối 10 (Lớp 10)", value: "10" },
  { title: "Khối 11 (Lớp 11)", value: "11" },
  { title: "Khối 12 (Lớp 12)", value: "12" },
];

// 6 Classroom Banner Themes
const classThemes = [
  {
    id: "blue",
    name: "Tri thức",
    icon: "mdi-school",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
  },
  {
    id: "emerald",
    name: "Tự nhiên",
    icon: "mdi-leaf",
    gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
  },
  {
    id: "purple",
    name: "Sáng tạo",
    icon: "mdi-lightbulb-on-outline",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
  },
  {
    id: "amber",
    name: "Nhiệt huyết",
    icon: "mdi-fire",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },
  {
    id: "teal",
    name: "Ngọc bích",
    icon: "mdi-book-open-page-variant",
    gradient: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)",
  },
  {
    id: "rose",
    name: "San hô",
    icon: "mdi-star-circle-outline",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)",
  },
];

const classForm = reactive({
  name: "",
  gradeLevel: "10",
  schoolYearId: null,
  themeId: "blue",
});

const currentSelectedClassTheme = computed(() => {
  return classThemes.find((t) => t.id === classForm.themeId) || classThemes[0];
});

const selectedSchoolYearLabel = computed(() => {
  const y = schoolYears.value.find((item) => item.id === classForm.schoolYearId);
  return y ? y.yearLabel : "";
});

function getClassTheme(classRoom) {
  const customThemes = JSON.parse(localStorage.getItem("duckbear_class_themes") || "{}");
  const savedThemeId = customThemes[classRoom.id];
  if (savedThemeId) {
    const found = classThemes.find((t) => t.id === savedThemeId);
    if (found) return found;
  }
  const idx = (classRoom.id || 0) % classThemes.length;
  return classThemes[idx];
}

function onGradeChange(grade) {
  // auto-suggest theme or keep current
}

function openCreateClass() {
  classForm.name = "";
  classForm.gradeLevel = "10";
  classForm.schoolYearId = schoolYears.value[0]?.id || null;
  classForm.themeId = "blue";
  classDialog.value = true;
}

async function loadData() {
  loading.value = true;
  try {
    const [classResponse, yearResponse, studentResponse] = await Promise.all([
      getClassesApi(),
      getSchoolYearsApi(),
      getStudentsApi(),
    ]);
    classes.value = classResponse.data;
    schoolYears.value = yearResponse.data;
    students.value = studentResponse.data;
    if (schoolYears.value.length && !classForm.schoolYearId) {
      classForm.schoolYearId = schoolYears.value[0].id;
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được dữ liệu lớp học";
  } finally {
    loading.value = false;
  }
}

async function createClass() {
  if (!classForm.name || !classForm.schoolYearId) {
    errorMessage.value = "Vui lòng nhập tên lớp và niên khóa";
    return;
  }
  saving.value = true;
  try {
    const res = await createClassApi({
      name: classForm.name,
      gradeLevel: classForm.gradeLevel,
      schoolYearId: classForm.schoolYearId,
    });

    const savedId = res.data?.id;
    if (savedId) {
      const customThemes = JSON.parse(localStorage.getItem("duckbear_class_themes") || "{}");
      customThemes[savedId] = classForm.themeId;
      localStorage.setItem("duckbear_class_themes", JSON.stringify(customThemes));
    }

    classDialog.value = false;
    await loadData();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể tạo lớp";
  } finally {
    saving.value = false;
  }
}

async function removeClass(classRoom) {
  if (!window.confirm(`Xóa lớp ${classRoom.name}?`)) return;
  try {
    await deleteClassApi(classRoom.id);
    const customThemes = JSON.parse(localStorage.getItem("duckbear_class_themes") || "{}");
    delete customThemes[classRoom.id];
    localStorage.setItem("duckbear_class_themes", JSON.stringify(customThemes));
    await loadData();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể xóa lớp";
  }
}

async function openMembers(classRoom) {
  selectedClass.value = classRoom;
  studentToAdd.value = null;
  membersDialog.value = true;
  try {
    members.value = (await getClassStudentsApi(classRoom.id)).data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được danh sách học sinh";
  }
}

async function addStudent() {
  saving.value = true;
  try {
    await addStudentToClassApi(selectedClass.value.id, studentToAdd.value);
    members.value = (await getClassStudentsApi(selectedClass.value.id)).data;
    studentToAdd.value = null;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thêm được học sinh vào lớp";
  } finally {
    saving.value = false;
  }
}

async function removeStudent(member) {
  if (!window.confirm(`Xóa học sinh ${member.studentName} khỏi lớp?`)) return;
  try {
    await removeStudentFromClassApi(selectedClass.value.id, member.studentId);
    members.value = members.value.filter((m) => m.id !== member.id);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không xóa được học sinh khỏi lớp";
  }
}

onMounted(loadData);
</script>

<style scoped>
.class-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}

.class-banner {
  height: 90px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
}

.class-banner-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  pointer-events: none;
}

.class-emblem {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
}

.class-grade-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  padding: 3px 10px;
  border-radius: 12px;
}

.class-body {
  padding: 16px;
}

.class-name {
  font-size: 17px;
  font-weight: 700;
  color: #1a1d2e;
  margin-bottom: 6px;
}

.class-year {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.class-teacher {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
}

.class-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid #f1f5f9;
}

/* Dialog Styles */
.dialog-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.t-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1d2e;
}

.preview-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.preview-class-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.preview-class-banner {
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 14px;
}

.preview-class-body {
  padding: 10px 14px;
}

.preview-class-title {
  font-weight: 700;
  font-size: 15px;
  color: #1a1d2e;
}

.color-primary {
  color: #4f7cff;
}

/* Class Theme Grid */
.class-theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.class-theme-item {
  position: relative;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  padding: 0 8px;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.class-theme-item:hover {
  transform: translateY(-1px);
}

.class-theme-item.active {
  box-shadow: 0 0 0 2.5px #ffffff, 0 0 0 4.5px #4f7cff;
}

.theme-name {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.theme-check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
