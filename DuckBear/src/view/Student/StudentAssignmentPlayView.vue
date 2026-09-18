<!--
  AssignmentPlayView.vue
  Wrapper: đọc gradeLevel của lớp học rồi chọn đúng 1 trong 5 giao diện
  (Grade1..Grade5) để render qua <component :is="...">.

  QUAN TRỌNG:
  - Wrapper KHÔNG gọi startSubmissionApi (tránh tạo trùng submission).
  - Ưu tiên nhận gradeLevel qua route.query (truyền từ trang danh sách bài tập,
    nơi đã có sẵn classRoom.gradeLevel) để khỏi phải gọi thêm API nào.
  - Chỉ khi thiếu gradeLevel (ví dụ người dùng vào thẳng URL) mới gọi
    getAssignmentDetailApi (API chỉ đọc, an toàn) để dò gradeLevel.

  Cách dùng khi điều hướng từ trang danh sách bài tập:
    router.push({
      name: "assignment-play",
      params: { id: assignment.id },
      query: { gradeLevel: classRoom.gradeLevel },
    });

  Tích hợp: copy file này vào src/views/Student/Assignment/AssignmentPlayView.vue
  và đặt route "assignment-play" trỏ tới nó (thay cho việc trỏ thẳng tới 1 file
  giao diện cố định như trước).
-->
<template>
  <div class="resolver-shell">
    <!-- Đang xác định gradeLevel (chỉ xảy ra khi phải gọi API dự phòng) -->
    <div v-if="resolving" class="resolver-loading">
      <v-progress-circular indeterminate color="primary" size="40" />
      <p>Đang chuẩn bị giao diện phù hợp...</p>
    </div>

    <!-- Không xác định được gradeLevel / có lỗi khi dò -->
    <div v-else-if="resolveError" class="resolver-error">
      <p>{{ resolveError }}</p>
      <v-btn color="primary" @click="goBack">Quay lại danh sách bài tập</v-btn>
    </div>

    <!-- Khối lớp chưa có giao diện riêng (6-12, sẽ bổ sung sau) -->
    <div v-else-if="!resolvedComponent" class="resolver-error">
      <p>
        Giao diện làm bài dành cho khối lớp {{ normalizedGrade || "này" }} đang
        được phát triển.
      </p>
      <v-btn color="primary" @click="goBack">Quay lại danh sách bài tập</v-btn>
    </div>

    <!-- Render đúng giao diện theo lớp -->
    <Suspense v-else>
      <component :is="resolvedComponent" />
      <template #fallback>
        <div class="resolver-loading">
          <v-progress-circular indeterminate color="primary" size="40" />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAssignmentDetailApi } from "@/api/assignment";

const route = useRoute();
const router = useRouter();

const resolving = ref(true);
const resolveError = ref("");
const normalizedGrade = ref(null);

// Map "khối lớp" -> component tương ứng (lazy-load, chỉ tải file cần dùng)
const GRADE_STYLE_MAP = {
  1: defineAsyncComponent(() => import("./styles/AssignmentPlayGrade1.vue")),
  2: defineAsyncComponent(() => import("./styles/AssignmentPlayGrade2.vue")),
  3: defineAsyncComponent(() => import("./styles/AssignmentPlayGrade3.vue")),
  4: defineAsyncComponent(() => import("./styles/AssignmentPlayGrade4.vue")),
  5: defineAsyncComponent(() => import("./styles/AssignmentPlayGrade5.vue")),
  // 6..12: sẽ bổ sung khi có giao diện cho THCS / THPT
};

const resolvedComponent = computed(() => {
  if (!normalizedGrade.value) return null;
  return GRADE_STYLE_MAP[normalizedGrade.value] || null;
});

// Chuẩn hoá nhiều định dạng gradeLevel có thể gặp: "1", "Lớp 1", "1A", "01"...
function normalizeGradeLevel(raw) {
  if (raw === null || raw === undefined) return null;
  const match = String(raw).match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

onMounted(async () => {
  // 1) Ưu tiên gradeLevel truyền qua query — không cần gọi API nào cả
  const fromQuery = normalizeGradeLevel(route.query.gradeLevel);
  if (fromQuery) {
    normalizedGrade.value = fromQuery;
    resolving.value = false;
    return;
  }

  // 2) Dự phòng: gọi API chỉ-đọc để lấy gradeLevel từ thông tin bài tập/lớp học.
  //    Lưu ý: KHÔNG gọi startSubmissionApi ở đây.
  //    Điều chỉnh đường dẫn field bên dưới cho khớp với response thật của bạn,
  //    ví dụ response.data.info.classRoom.gradeLevel hoặc response.data.info.gradeLevel.
  try {
    const assignmentId = Number(route.params.id);
    const response = await getAssignmentDetailApi(assignmentId);
    const info = response.data?.info || {};
    const rawGrade =
      info.gradeLevel ??
      info.classGradeLevel ??
      info.classRoom?.gradeLevel ??
      null;

    normalizedGrade.value = normalizeGradeLevel(rawGrade);

    if (!normalizedGrade.value) {
      resolveError.value = "Không xác định được khối lớp cho bài tập này.";
    }
  } catch (error) {
    resolveError.value =
      error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    resolving.value = false;
  }
});
</script>

<style scoped>
.resolver-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.resolver-loading,
.resolver-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 24px;
}
</style>
