<template>
  <v-app>
    <v-main class="profile-shell">
      <v-container max-width="840" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">Về dashboard</v-btn>

        <v-card class="mb-6" elevation="1">
          <v-card-item>
            <template #prepend>
              <v-avatar size="56" color="primary" class="text-white">{{ initials }}</v-avatar>
            </template>
            <v-card-title>{{ profile.fullName || user.name || 'Học sinh' }}</v-card-title>
            <v-card-subtitle>{{ profile.email || user.email || 'Chưa có email' }}</v-card-subtitle>
          </v-card-item>
        </v-card>

        <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
        <v-alert v-if="successMessage" type="success" class="mb-4">{{ successMessage }}</v-alert>

        <v-card elevation="1">
          <v-card-title class="px-6 pt-6">Thông tin cá nhân</v-card-title>
          <v-card-text>
            <v-form v-if="profile" @submit.prevent="saveProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="profile.fullName" label="Họ và tên" variant="outlined" readonly />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="profile.email" label="Email" variant="outlined" readonly />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="profile.studentCode" label="Mã học sinh" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="profile.gradeLevel" label="Khối lớp" type="number" variant="outlined" min="1" max="12" />
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="profile.dateOfBirth" label="Ngày sinh" type="date" variant="outlined" />
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-4">
                <v-btn color="primary" type="submit" :loading="saving">Lưu thông tin</v-btn>
              </div>
            </v-form>

            <div v-else class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getStudentProfileByUserIdApi, updateStudentProfileApi } from "@/api/studentProfile";

const router = useRouter();
const authStore = useAuthStore();
const profile = ref(null);
const errorMessage = ref("");
const successMessage = ref("");
const saving = ref(false);

const user = computed(() => ({
  name: authStore.fullName || localStorage.getItem("fullName") || "Học sinh",
  email: authStore.email || localStorage.getItem("email") || "",
}));

const initials = computed(() => {
  const name = user.value.name || "HS";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "HS";
});

function goBack() {
  router.push({ name: "student-dashboard" });
}

async function loadProfile() {
  try {
    const userId = authStore.userId || Number(localStorage.getItem("userId"));
    if (!userId) {
      errorMessage.value = "Bạn chưa đăng nhập";
      return;
    }

    const { data } = await getStudentProfileByUserIdApi(userId);
    profile.value = {
      ...data,
      dateOfBirth: data.dateOfBirth || "",
    };
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không tải được hồ sơ học sinh";
  }
}

async function saveProfile() {
  if (!profile.value?.id) return;

  saving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload = {
      userId: profile.value.userId,
      studentCode: profile.value.studentCode,
      gradeLevel: Number(profile.value.gradeLevel),
      dateOfBirth: profile.value.dateOfBirth || null,
    };

    const { data } = await updateStudentProfileApi(profile.value.id, payload);
    profile.value = { ...data, dateOfBirth: data.dateOfBirth || "" };
    successMessage.value = "Cập nhật hồ sơ thành công";
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không thể lưu hồ sơ";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>
