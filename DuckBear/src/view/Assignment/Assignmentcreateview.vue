<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">BÀI TẬP & ĐỀ THI</div>
        <h1 class="t-page-title">Tạo và giao đề</h1>
        <p class="t-page-subtitle">Soạn đề kiểm tra, chọn lớp giao bài và thiết lập thời gian làm bài.</p>
      </div>
      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        class="text-none"
        style="border-radius: 8px; font-weight: 600; flex-shrink: 0"
        @click="router.push({ name: 'teacher-assignments-bank' })"
      >
        Về ngân hàng đề
      </v-btn>
    </div>

    <!-- Alert Message -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-5"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <!-- LEFT COLUMN: Form Builder (70%) -->
      <v-col cols="12" lg="8">
        <!-- STEP 1: Basic Information -->
        <div class="t-card pa-6 mb-5">
          <div class="d-flex align-center ga-3 mb-4">
            <div class="step-circle">1</div>
            <div>
              <div class="section-title">Thông tin cơ bản của đề</div>
              <div class="text-caption text-secondary">Tên đề thi, lớp học tiếp nhận và loại đề</div>
            </div>
          </div>

          <div class="t-field-label">Tên bài tập / Đề kiểm tra *</div>
          <v-text-field
            v-model="form.title"
            variant="outlined"
            density="comfortable"
            placeholder="VD: Kiểm tra giữa kỳ 1 - Đại số 10 (Chương 1)"
            prepend-inner-icon="mdi-format-title"
            class="mb-3"
            bg-color="white"
          />

          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Giao cho lớp *</div>
              <v-select
                v-model="form.classId"
                :items="classes"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                placeholder="Chọn lớp học"
                prepend-inner-icon="mdi-google-classroom"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Hình thức giao đề *</div>
              <v-select
                v-model="form.genType"
                :items="generationTypes"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-layers-outline"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
          </v-row>
        </div>

        <!-- STEP 2: Content & Questions -->
        <div class="t-card pa-6 mb-5">
          <div class="d-flex align-center ga-3 mb-4">
            <div class="step-circle">2</div>
            <div>
              <div class="section-title">Nội dung bài học & Câu hỏi</div>
              <div class="text-caption text-secondary">Chọn phạm vi kiến thức và các câu hỏi đưa vào đề thi</div>
            </div>
          </div>

          <div class="t-field-label">Phạm vi bài học *</div>
          <v-select
            v-model="form.lessonIds"
            :items="lessons"
            item-title="title"
            item-value="id"
            variant="outlined"
            density="comfortable"
            placeholder="Chọn một hoặc nhiều bài học liên quan..."
            prepend-inner-icon="mdi-book-open-page-variant-outline"
            multiple
            chips
            closable-chips
            class="mb-4"
            bg-color="white"
          />

          <div class="d-flex align-center justify-between mb-2">
            <div class="t-field-label mb-0">
              Chọn câu hỏi vào đề *
              <span class="text-caption color-primary font-weight-700 ml-2">
                ({{ form.questionIds.length }}/50 câu)
              </span>
            </div>
            <div class="d-flex ga-2">
              <v-btn
                variant="text"
                size="small"
                color="primary"
                class="text-none font-weight-600"
                @click="selectAllQuestions"
              >
                Chọn tất cả
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                color="secondary"
                class="text-none font-weight-600"
                @click="form.questionIds = []"
              >
                Bỏ chọn
              </v-btn>
            </div>
          </div>

          <v-select
            v-model="form.questionIds"
            :items="questions"
            item-title="content"
            item-value="id"
            variant="outlined"
            density="comfortable"
            placeholder="Tìm và chọn các câu hỏi từ ngân hàng..."
            prepend-inner-icon="mdi-help-box-multiple-outline"
            multiple
            chips
            closable-chips
            bg-color="white"
          />

          <div v-if="form.questionIds.length > 0" class="selected-counter mt-2">
            <v-icon color="#22C55E" size="16" start>mdi-check-circle-outline</v-icon>
            Đã chọn <strong>{{ form.questionIds.length }}</strong> câu hỏi cho đề thi này.
          </div>
        </div>

        <!-- STEP 3: Time & Submission Settings -->
        <div class="t-card pa-6 mb-5">
          <div class="d-flex align-center ga-3 mb-4">
            <div class="step-circle">3</div>
            <div>
              <div class="section-title">Cài đặt thời gian & Quy chế làm bài</div>
              <div class="text-caption text-secondary">Quy định thời gian làm bài, số lần nộp và hạn nộp đề</div>
            </div>
          </div>

          <!-- Time limit with quick chips -->
          <div class="mb-4">
            <div class="d-flex align-center justify-between mb-1">
              <span class="t-field-label mb-0">Thời gian làm bài (phút) *</span>
              <span class="text-caption text-secondary">Chọn nhanh hoặc nhập số phút</span>
            </div>

            <!-- Quick time preset chips -->
            <div class="d-flex flex-wrap ga-2 mb-2">
              <span
                v-for="mins in [15, 30, 45, 60, 90]"
                :key="mins"
                class="time-chip"
                :class="{ active: form.timeLimit === mins }"
                @click="form.timeLimit = mins"
              >
                {{ mins }} phút
              </span>
            </div>

            <v-text-field
              v-model.number="form.timeLimit"
              type="number"
              min="1"
              max="300"
              variant="outlined"
              density="comfortable"
              suffix="phút"
              prepend-inner-icon="mdi-clock-outline"
              bg-color="white"
            />
          </div>

          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Số lần làm bài tối đa *</div>
              <v-select
                v-model.number="form.maxAttempts"
                :items="[
                  { title: '1 lần duy nhất', value: 1 },
                  { title: '2 lần', value: 2 },
                  { title: '3 lần', value: 3 },
                  { title: 'Không giới hạn', value: 99 },
                ]"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-repeat"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="t-field-label">Hạn nộp bài (Deadline)</div>
              <v-text-field
                v-model="form.deadline"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-clock"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
          </v-row>

          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-2"
            style="border-radius: 10px; font-size: 13px"
          >
            Đề thi sau khi tạo sẽ được thông báo ngay đến toàn bộ học sinh trong lớp.
          </v-alert>
        </div>

        <!-- Submit Button -->
        <v-btn
          color="primary"
          size="x-large"
          block
          :loading="saving"
          class="text-none mb-6"
          style="border-radius: 12px; font-weight: 700; font-size: 16px; height: 52px"
          @click="saveAssignment"
        >
          <v-icon start size="20">mdi-send-check</v-icon>
          Tạo và giao bài tập ngay
        </v-btn>
      </v-col>

      <!-- RIGHT COLUMN: Live Student Preview Card (30%) -->
      <v-col cols="12" lg="4">
        <div class="sticky-preview">
          <div class="preview-heading mb-3">
            <v-icon size="16" color="primary" start>mdi-cellphone-text</v-icon>
            GIAO DIỆN HỌC SINH NHÌN THẤY
          </div>

          <!-- Preview Card -->
          <div class="preview-assignment-card t-card">
            <!-- Banner -->
            <div class="preview-card-banner">
              <div class="preview-banner-pattern" />
              <div class="d-flex align-center justify-between" style="position: relative; z-index: 1">
                <span class="preview-class-pill">
                  <v-icon size="13" color="#4F7CFF" start>mdi-google-classroom</v-icon>
                  {{ selectedClassName || "Lớp học" }}
                </span>
                <span class="preview-status-pill">Đang mở</span>
              </div>
            </div>

            <!-- Body -->
            <div class="pa-4">
              <h3 class="preview-card-title">
                {{ form.title || "Tên bài tập sẽ hiển thị ở đây..." }}
              </h3>

              <div class="preview-meta-grid mb-3">
                <div class="preview-meta-item">
                  <v-icon size="15" color="#64748B">mdi-help-circle-outline</v-icon>
                  <span>{{ form.questionIds.length }} câu hỏi</span>
                </div>
                <div class="preview-meta-item">
                  <v-icon size="15" color="#64748B">mdi-clock-outline</v-icon>
                  <span>{{ form.timeLimit || 30 }} phút</span>
                </div>
                <div class="preview-meta-item">
                  <v-icon size="15" color="#64748B">mdi-repeat</v-icon>
                  <span>{{ form.maxAttempts === 99 ? 'Không giới hạn' : `${form.maxAttempts} lượt làm` }}</span>
                </div>
                <div class="preview-meta-item">
                  <v-icon size="15" color="#64748B">mdi-calendar-end</v-icon>
                  <span>{{ formatDeadlinePreview(form.deadline) }}</span>
                </div>
              </div>

              <v-btn
                color="primary"
                variant="flat"
                block
                class="text-none mt-2"
                style="border-radius: 8px; font-weight: 600"
                disabled
              >
                Vào làm bài
              </v-btn>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="t-card pa-4 mt-4" style="background: #fafbfd">
            <div class="d-flex align-center ga-2 mb-2 font-weight-600 color-primary" style="font-size: 13px">
              <v-icon color="#4F7CFF" size="18">mdi-lightbulb-on-outline</v-icon>
              Mẹo giao bài hiệu quả
            </div>
            <p class="text-caption text-secondary mb-0" style="line-height: 1.6">
              Nên đặt thời gian làm bài từ 15–45 phút cho các bài ôn tập ngắn và kèm hạn nộp rõ ràng để học sinh chủ động hoàn thành trước buổi học tiếp theo.
            </p>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getClassesApi } from "@/api/class";
import { createAssignmentApi } from "@/api/assignment";
import { getLessonsApi } from "@/api/lesson";
import { getQuestionsApi } from "@/api/question";

const router = useRouter();
const authStore = useAuthStore();
const classes = ref([]);
const lessons = ref([]);
const questions = ref([]);
const saving = ref(false);
const errorMessage = ref("");

const generationTypes = [
  { title: "Theo một bài học cụ thể", value: "single_lesson" },
  { title: "Tổng hợp nhiều bài học", value: "multi_lesson" },
  { title: "Toàn bộ chương trình sách", value: "full_book" },
];

const form = reactive({
  title: "",
  classId: null,
  genType: "single_lesson",
  lessonIds: [],
  questionIds: [],
  timeLimit: 30,
  maxAttempts: 1,
  deadline: "",
  status: "private",
});

const selectedClassName = computed(() => {
  const c = classes.value.find((item) => item.id === form.classId);
  return c ? c.name : "";
});

function selectAllQuestions() {
  form.questionIds = questions.value.slice(0, 50).map((q) => q.id);
}

function formatDeadlinePreview(dl) {
  if (!dl) return "Không có hạn chót";
  try {
    const d = new Date(dl);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${d.toLocaleDateString("vi-VN")}`;
  } catch {
    return dl;
  }
}

async function saveAssignment() {
  if (
    !form.title.trim() ||
    !form.classId ||
    !form.lessonIds.length ||
    !form.questionIds.length
  ) {
    errorMessage.value =
      "Vui lòng nhập đầy đủ tên đề, chọn lớp, bài học và ít nhất một câu hỏi.";
    return;
  }
  if (form.questionIds.length > 50) {
    errorMessage.value = "Một đề thi chỉ được tối đa 50 câu hỏi.";
    return;
  }

  saving.value = true;
  try {
    await createAssignmentApi({
      ...form,
      teacherId: authStore.userId,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    });
    router.push({ name: "teacher-assignments-bank" });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể tạo bài tập";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const [classResponse, lessonResponse, questionResponse] = await Promise.all(
      [getClassesApi(), getLessonsApi(), getQuestionsApi()],
    );
    classes.value = classResponse.data || [];
    lessons.value = lessonResponse.data || [];
    questions.value = questionResponse.data || [];

    if (classes.value.length && !form.classId) {
      form.classId = classes.value[0].id;
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không tải được dữ liệu tạo đề";
  }
});
</script>

<style scoped>
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eef3ff;
  color: #4f7cff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
}

.color-primary {
  color: #4f7cff;
}

.selected-counter {
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
}

/* Time Preset Chips */
.time-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.time-chip:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.time-chip.active {
  background: #4f7cff;
  color: #ffffff;
}

/* Sticky Right Column Preview */
.sticky-preview {
  position: sticky;
  top: 24px;
}

.preview-heading {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #475569;
  display: flex;
  align-items: center;
}

.preview-assignment-card {
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e8ecf4;
  box-shadow: 0 4px 16px rgba(20, 30, 80, 0.06);
}

.preview-card-banner {
  height: 64px;
  background: linear-gradient(135deg, #4f7cff 0%, #2563eb 100%);
  position: relative;
  padding: 14px 16px;
  overflow: hidden;
}

.preview-banner-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
}

.preview-class-pill {
  background: #ffffff;
  color: #1e293b;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
}

.preview-status-pill {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.preview-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
  line-height: 1.4;
  margin-bottom: 12px;
  min-height: 44px;
}

.preview-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preview-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
</style>
