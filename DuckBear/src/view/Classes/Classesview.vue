<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">QUẢN LÝ LỚP</div>
        <h1 class="t-page-title">Lớp học của bạn</h1>
        <p class="t-page-subtitle">Tạo lớp, thêm học sinh và chuẩn bị nơi giao bài.</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        style="border-radius: 8px; font-weight: 600; flex-shrink: 0"
        @click="classDialog = true"
      >
        Tạo lớp
      </v-btn>
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

    <!-- Empty -->
    <div v-else-if="!classes.length" class="t-empty-state">
      <v-icon icon="mdi-google-classroom" size="48" color="#9CA3AF" class="t-empty-icon" />
      <p class="t-empty-title">Chưa có lớp học</p>
      <p class="t-empty-desc">Tạo lớp đầu tiên để bắt đầu giao bài.</p>
      <v-btn
        color="primary"
        variant="flat"
        class="text-none"
        style="border-radius: 8px"
        @click="classDialog = true"
      >
        Tạo lớp
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
          <!-- Color bar -->
          <div class="class-color-bar" />

          <div class="class-body">
            <div class="class-top">
              <div class="class-icon-wrap">
                <v-icon icon="mdi-google-classroom" size="22" color="#4F7CFF" />
              </div>
              <span class="class-grade-badge" v-if="classRoom.gradeLevel">
                Khối {{ classRoom.gradeLevel }}
              </span>
            </div>

            <p class="class-name">{{ classRoom.name }}</p>
            <p class="class-year">{{ classRoom.schoolYearLabel }}</p>
            <p class="class-teacher">
              {{ classRoom.homeroomTeacherName || "Chưa gán giáo viên chủ nhiệm" }}
            </p>
          </div>

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
              variant="text"
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

    <!-- Create class dialog -->
    <v-dialog v-model="classDialog" max-width="520">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">Tạo lớp học</v-card-title>
        <v-card-text class="px-5">
          <div class="t-field-label">Tên lớp</div>
          <v-text-field
            v-model="classForm.name"
            variant="outlined"
            density="comfortable"
            placeholder="VD: Lớp 6A"
            class="mb-3"
          />
          <div class="t-field-label">Khối lớp</div>
          <v-text-field
            v-model="classForm.gradeLevel"
            variant="outlined"
            density="comfortable"
            placeholder="VD: 6"
            class="mb-3"
          />
          <div class="t-field-label">Niên khóa</div>
          <v-select
            v-model="classForm.schoolYearId"
            :items="schoolYears"
            item-title="yearLabel"
            item-value="id"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
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
            Lưu lớp
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Members dialog -->
    <v-dialog v-model="membersDialog" max-width="620">
      <v-card style="border-radius: 14px">
        <v-card-title class="d-flex align-center px-5 pt-5 pb-2">
          <div>
            <div class="t-eyebrow" style="margin-bottom: 2px">THÀNH VIÊN</div>
            <span class="t-dialog-title">{{ selectedClass?.name }}</span>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="membersDialog = false" />
        </v-card-title>
        <v-card-text class="px-5 pb-5">
          <div class="d-flex ga-2 mb-4">
            <v-select
              v-model="studentToAdd"
              :items="students"
              item-title="fullName"
              item-value="id"
              label="Chọn học sinh"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-btn
              color="primary"
              height="56"
              :disabled="!studentToAdd"
              :loading="saving"
              style="border-radius: 8px; font-weight: 600"
              @click="addStudent"
            >
              Thêm
            </v-btn>
          </div>

          <v-list v-if="members.length" lines="two" border rounded>
            <v-list-item
              v-for="member in members"
              :key="member.id"
              :title="member.studentName"
              :subtitle="member.studentEmail"
            >
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
            <v-icon icon="mdi-account-school-outline" size="36" color="#9CA3AF" />
            <p class="t-empty-title" style="font-size: 14px">Chưa có học sinh</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
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
const classForm = reactive({ name: "", gradeLevel: "", schoolYearId: null });

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
    await createClassApi(classForm);
    classDialog.value = false;
    Object.assign(classForm, { name: "", gradeLevel: "", schoolYearId: null });
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
    studentToAdd.value = null;
    members.value = (await getClassStudentsApi(selectedClass.value.id)).data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể thêm học sinh";
  } finally {
    saving.value = false;
  }
}

async function removeStudent(member) {
  try {
    await removeStudentFromClassApi(member.id);
    members.value = members.value.filter((item) => item.id !== member.id);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể xóa học sinh khỏi lớp";
  }
}

onMounted(loadData);
</script>

<style scoped>
.class-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.class-color-bar {
  height: 4px;
  background: linear-gradient(90deg, #4f7cff, #7ba3ff);
  flex-shrink: 0;
}

.class-body {
  padding: 16px;
  flex: 1;
}

.class-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.class-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-grade-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  background: #fff7ed;
  color: #c2410c;
}

.class-name {
  font-weight: 700;
  font-size: 16px;
  color: #1a1d2e;
  margin-bottom: 3px;
}

.class-year {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 3px;
}

.class-teacher {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 0;
}

.class-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px 12px;
  border-top: 1px solid #f0f2f8;
}

.flex-1 {
  flex: 1;
}
</style>
