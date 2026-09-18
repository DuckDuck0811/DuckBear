<template>
  <div class="page-wrap">
    <div class="page-heading">
      <div>
        <div class="eyebrow">QUẢN LÝ LỚP</div>
        <h1>Lớp học của bạn</h1>
        <p>Tạo lớp, thêm học sinh và chuẩn bị nơi giao bài.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="classDialog = true">Tạo lớp</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" closable class="mb-5" @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>
    <div v-if="loading" class="text-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <v-row v-else>
      <v-col v-for="classRoom in classes" :key="classRoom.id" cols="12" md="6" lg="4">
        <v-card class="class-card" elevation="1">
          <v-card-item>
            <template #prepend><v-avatar color="primary" variant="tonal"><v-icon>mdi-google-classroom</v-icon></v-avatar></template>
            <v-card-title>{{ classRoom.name }}</v-card-title>
            <v-card-subtitle>{{ classRoom.schoolYearLabel }} · Khối {{ classRoom.gradeLevel || "-" }}</v-card-subtitle>
          </v-card-item>
          <v-card-text class="text-medium-emphasis">
            {{ classRoom.homeroomTeacherName || "Chưa gán giáo viên chủ nhiệm" }}
          </v-card-text>
          <v-card-actions>
            <v-btn variant="tonal" color="primary" block @click="openMembers(classRoom)">
              <v-icon start>mdi-account-multiple</v-icon> Quản lý học sinh
            </v-btn>
            <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="removeClass(classRoom)" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-empty-state v-if="!loading && !classes.length" icon="mdi-google-classroom" title="Chưa có lớp học" text="Tạo lớp đầu tiên để bắt đầu giao bài." />

    <v-dialog v-model="classDialog" max-width="520">
      <v-card>
        <v-card-title>Tạo lớp học</v-card-title>
        <v-card-text>
          <v-text-field v-model="classForm.name" label="Tên lớp" variant="outlined" class="mb-3" />
          <v-text-field v-model="classForm.gradeLevel" label="Khối lớp" variant="outlined" class="mb-3" />
          <v-select v-model="classForm.schoolYearId" :items="schoolYears" item-title="yearLabel" item-value="id" label="Niên khóa" variant="outlined" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="classDialog = false">Hủy</v-btn><v-btn color="primary" :loading="saving" @click="createClass">Lưu lớp</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="membersDialog" max-width="620">
      <v-card>
        <v-card-title class="d-flex align-center">{{ selectedClass?.name }}<v-spacer /><v-btn icon="mdi-close" variant="text" @click="membersDialog = false" /></v-card-title>
        <v-card-text>
          <div class="d-flex ga-2 mb-5">
            <v-select v-model="studentToAdd" :items="students" item-title="fullName" item-value="id" label="Chọn học sinh" variant="outlined" hide-details />
            <v-btn color="primary" height="56" :disabled="!studentToAdd" :loading="saving" @click="addStudent">Thêm</v-btn>
          </div>
          <v-list v-if="members.length" lines="two" border rounded>
            <v-list-item v-for="member in members" :key="member.id" :title="member.studentName" :subtitle="member.studentEmail">
              <template #append><v-btn icon="mdi-close" variant="text" color="error" @click="removeStudent(member)" /></template>
            </v-list-item>
          </v-list>
          <v-empty-state v-else icon="mdi-account-school-outline" title="Chưa có học sinh" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  addStudentToClassApi, createClassApi, deleteClassApi, getClassStudentsApi,
  getClassesApi, getSchoolYearsApi, getStudentsApi, removeStudentFromClassApi,
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
    const [classResponse, yearResponse, studentResponse] = await Promise.all([getClassesApi(), getSchoolYearsApi(), getStudentsApi()]);
    classes.value = classResponse.data;
    schoolYears.value = yearResponse.data;
    students.value = studentResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không tải được dữ liệu lớp học";
  } finally { loading.value = false; }
}

async function createClass() {
  if (!classForm.name || !classForm.schoolYearId) { errorMessage.value = "Vui lòng nhập tên lớp và niên khóa"; return; }
  saving.value = true;
  try { await createClassApi(classForm); classDialog.value = false; Object.assign(classForm, { name: "", gradeLevel: "", schoolYearId: null }); await loadData(); }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể tạo lớp"; }
  finally { saving.value = false; }
}

async function removeClass(classRoom) {
  if (!window.confirm(`Xóa lớp ${classRoom.name}?`)) return;
  try { await deleteClassApi(classRoom.id); await loadData(); }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể xóa lớp"; }
}

async function openMembers(classRoom) {
  selectedClass.value = classRoom; studentToAdd.value = null; membersDialog.value = true;
  try { members.value = (await getClassStudentsApi(classRoom.id)).data; }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không tải được danh sách học sinh"; }
}

async function addStudent() {
  saving.value = true;
  try { await addStudentToClassApi(selectedClass.value.id, studentToAdd.value); studentToAdd.value = null; members.value = (await getClassStudentsApi(selectedClass.value.id)).data; }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể thêm học sinh"; }
  finally { saving.value = false; }
}

async function removeStudent(member) {
  try { await removeStudentFromClassApi(member.id); members.value = members.value.filter((item) => item.id !== member.id); }
  catch (error) { errorMessage.value = error.response?.data?.message || "Không thể xóa học sinh khỏi lớp"; }
}

onMounted(loadData);
</script>

<style scoped>
.page-wrap { padding: 28px; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.eyebrow { color: #3d5afe; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; }
.page-heading h1 { color: #1a2540; font-size: 28px; margin-top: 6px; }
.page-heading p { color: #7c8496; margin-top: 6px; }
.class-card { border-radius: 14px; }
@media (max-width: 600px) { .page-wrap { padding: 16px; } .page-heading { align-items: start; flex-direction: column; } }
</style>
