<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">HỌC LIỆU</div>
        <h1 class="t-page-title">Ngân hàng câu hỏi</h1>
        <p class="t-page-subtitle">
          Quản lý, tra cứu và phân loại câu hỏi theo môn học, chương bài và độ khó.
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-creation"
          class="text-none"
          style="border-radius: 8px; font-weight: 600"
          :to="{ name: 'teacher-assignments-generate' }"
        >
          Sinh câu hỏi AI
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          class="text-none"
          style="border-radius: 8px; font-weight: 600"
          @click="createDialog = true"
        >
          Thêm câu hỏi mới
        </v-btn>
      </div>
    </div>

    <!-- Quick Stats with Pastel Icon Badges -->
    <v-row class="mb-5">
      <v-col cols="6" sm="3">
        <div class="t-stat-card stat-card-hover">
          <div class="stat-icon-wrap" style="background: #eef3ff">
            <v-icon color="#4F7CFF" size="20">mdi-help-box-multiple-outline</v-icon>
          </div>
          <div class="t-stat-value mt-3">128</div>
          <div class="t-stat-label">Tổng số câu hỏi</div>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <div class="t-stat-card stat-card-hover">
          <div class="stat-icon-wrap" style="background: #f0fdf4">
            <v-icon color="#22C55E" size="20">mdi-radiobox-marked</v-icon>
          </div>
          <div class="t-stat-value mt-3" style="color: #22c55e">94</div>
          <div class="t-stat-label">Trắc nghiệm lựa chọn</div>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <div class="t-stat-card stat-card-hover">
          <div class="stat-icon-wrap" style="background: #fffbeb">
            <v-icon color="#F59E0B" size="20">mdi-text-box-edit-outline</v-icon>
          </div>
          <div class="t-stat-value mt-3" style="color: #f59e0b">34</div>
          <div class="t-stat-label">Tự luận & Điền khuyết</div>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <div class="t-stat-card stat-card-hover">
          <div class="stat-icon-wrap" style="background: #f3e8ff">
            <v-icon color="#8B5CF6" size="20">mdi-archive-check-outline</v-icon>
          </div>
          <div class="t-stat-value mt-3" style="color: #8b5cf6">12</div>
          <div class="t-stat-label">Bộ đề đang sử dụng</div>
        </div>
      </v-col>
    </v-row>

    <!-- Filter Bar with Modern Inputs -->
    <div class="t-filter-bar mb-5">
      <v-row dense align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Tìm theo nội dung câu hỏi..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            class="filter-input"
          />
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-select
            v-model="filters.subject"
            :items="['Tất cả môn', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học']"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            class="filter-input"
          />
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-select
            v-model="filters.grade"
            :items="['Tất cả khối', 'Khối 10', 'Khối 11', 'Khối 12']"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            class="filter-input"
          />
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-select
            v-model="filters.difficulty"
            :items="['Tất cả độ khó', 'Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            class="filter-input"
          />
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-select
            v-model="filters.type"
            :items="['Tất cả loại', 'Trắc nghiệm', 'Tự luận', 'Đúng/Sai']"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            class="filter-input"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Question List Card -->
    <div class="t-card">
      <div class="px-5 py-4 border-b d-flex align-center">
        <div>
          <span class="section-title">Danh sách câu hỏi trong ngân hàng</span>
          <div class="text-caption text-secondary">Ngân hàng câu hỏi chuẩn hóa theo từng đơn vị kiến thức</div>
        </div>
        <v-spacer />
        <span class="text-caption text-muted">Hiển thị {{ filteredQuestions.length }} câu hỏi</span>
      </div>

      <div v-if="!filteredQuestions.length" class="t-empty-state">
        <v-icon icon="mdi-help-circle-outline" size="48" color="#9CA3AF" />
        <p class="t-empty-title">Không tìm thấy câu hỏi phù hợp</p>
        <p class="t-empty-desc">Thử thay đổi bộ lọc tìm kiếm hoặc thêm câu hỏi mới.</p>
      </div>

      <div v-else class="pa-5 d-flex flex-column ga-4">
        <div
          v-for="(q, index) in filteredQuestions"
          :key="q.id"
          class="question-item-card"
        >
          <div class="d-flex align-center justify-between mb-2">
            <div class="d-flex align-center ga-2">
              <span class="q-tag q-tag--primary">Câu #{{ index + 1 }}</span>
              <span class="t-badge t-badge--neutral">{{ q.subject }} · {{ q.grade }}</span>
              <span
                class="t-badge"
                :class="q.difficulty === 'Vận dụng cao' ? 't-badge--error' : (q.difficulty === 'Vận dụng' ? 't-badge--warning' : 't-badge--accent')"
              >
                {{ q.difficulty }}
              </span>
            </div>
            <div class="d-flex align-center ga-1">
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" title="Sửa câu hỏi" />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" title="Xóa" />
            </div>
          </div>

          <div class="q-content mb-3">
            {{ q.content }}
          </div>

          <!-- Options Grid -->
          <div v-if="q.options?.length" class="options-grid mb-3">
            <div
              v-for="opt in q.options"
              :key="opt.key"
              class="opt-item"
              :class="{ 'opt-item--correct': opt.isCorrect }"
            >
              <span class="opt-key">{{ opt.key }}.</span>
              <span class="opt-text">{{ opt.text }}</span>
              <v-icon v-if="opt.isCorrect" size="16" color="success" class="ml-auto">
                mdi-check-circle
              </v-icon>
            </div>
          </div>

          <!-- Explanation Box -->
          <div v-if="q.explanation" class="explanation-box">
            <span class="explanation-label">
              <v-icon size="14" color="primary" start>mdi-lightbulb-on-outline</v-icon>
              Lời giải chi tiết:
            </span>
            <div class="explanation-text">{{ q.explanation }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Question Dialog -->
    <v-dialog v-model="createDialog" max-width="640">
      <v-card class="pa-2" style="border-radius: 16px">
        <div class="d-flex align-center px-4 pt-4 pb-2">
          <div class="dialog-icon-box mr-3">
            <v-icon color="#4F7CFF" size="24">mdi-help-box-multiple-outline</v-icon>
          </div>
          <div>
            <div class="t-dialog-title">Thêm câu hỏi mới vào ngân hàng</div>
            <div class="text-caption text-secondary">Soạn câu hỏi trắc nghiệm hoặc tự luận</div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="createDialog = false" />
        </div>

        <v-card-text class="px-4 py-2">
          <div class="t-field-label">Nội dung câu hỏi *</div>
          <v-textarea
            v-model="newQuestion.content"
            placeholder="Nhập đề bài câu hỏi..."
            rows="3"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            bg-color="white"
          />

          <v-row dense>
            <v-col cols="6">
              <div class="t-field-label">Môn học</div>
              <v-select
                v-model="newQuestion.subject"
                :items="['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học']"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
            <v-col cols="6">
              <div class="t-field-label">Độ khó</div>
              <v-select
                v-model="newQuestion.difficulty"
                :items="['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                bg-color="white"
              />
            </v-col>
          </v-row>

          <div class="t-field-label">Đáp án đúng</div>
          <v-text-field
            v-model="newQuestion.correctAnswer"
            placeholder="VD: B hoặc đáp án chi tiết"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            bg-color="white"
          />

          <div class="t-field-label">Giải thích chi tiết (tùy chọn)</div>
          <v-textarea
            v-model="newQuestion.explanation"
            placeholder="Hướng dẫn phương pháp giải cho học sinh..."
            rows="2"
            variant="outlined"
            density="comfortable"
            bg-color="white"
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="createDialog = false">
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            @click="createDialog = false"
          >
            Lưu vào ngân hàng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";

const createDialog = ref(false);

const filters = reactive({
  keyword: "",
  subject: "Tất cả môn",
  grade: "Tất cả khối",
  difficulty: "Tất cả độ khó",
  type: "Tất cả loại",
});

const newQuestion = reactive({
  content: "",
  subject: "Toán học",
  difficulty: "Thông hiểu",
  correctAnswer: "",
  explanation: "",
});

const sampleQuestions = ref([
  {
    id: 1,
    subject: "Toán học",
    grade: "Khối 10",
    difficulty: "Nhận biết",
    content: "Cho tập hợp A = {x ∈ ℝ | 2x - 4 = 0}. Tập hợp A có bao nhiêu phần tử?",
    options: [
      { key: "A", text: "0 phần tử", isCorrect: false },
      { key: "B", text: "1 phần tử", isCorrect: true },
      { key: "C", text: "2 phần tử", isCorrect: false },
      { key: "D", text: "Vô số phần tử", isCorrect: false },
    ],
    explanation: "Phương trình 2x - 4 = 0 có nghiệm duy nhất x = 2. Do đó A = {2}, có đúng 1 phần tử.",
  },
  {
    id: 2,
    subject: "Toán học",
    grade: "Khối 10",
    difficulty: "Thông hiểu",
    content: "Tìm tập xác định D của hàm số y = √(x - 3) / (x - 5).",
    options: [
      { key: "A", text: "D = [3; +∞) \\ {5}", isCorrect: true },
      { key: "B", text: "D = (3; +∞)", isCorrect: false },
      { key: "C", text: "D = [3; 5)", isCorrect: false },
      { key: "D", text: "D = ℝ \\ {5}", isCorrect: false },
    ],
    explanation: "Điều kiện xác định: x - 3 ≥ 0 và x - 5 ≠ 0 ⇔ x ≥ 3 và x ≠ 5. Vậy D = [3; +∞) \\ {5}.",
  },
  {
    id: 3,
    subject: "Ngữ văn",
    grade: "Khối 10",
    difficulty: "Vận dụng",
    content: "Đặc điểm cơ bản nhất của thể loại thần thoại là gì?",
    options: [
      { key: "A", text: "Kể về các sự kiện lịch sử có thật với nhân vật có lai lịch rõ ràng", isCorrect: false },
      { key: "B", text: "Phản ánh nhận thức sơ khai của người cổ xưa về thế giới tự nhiên và nguồn gốc muôn loài thông qua các vị thần", isCorrect: true },
      { key: "C", text: "Phản ánh số phận người bình dân trong xã hội phong kiến", isCorrect: false },
      { key: "D", text: "Đề cao trí thông minh cơ trí của các anh hùng dân gian", isCorrect: false },
    ],
    explanation: "Thần thoại là thể loại tự sự dân gian xuất hiện sớm nhất nhằm giải thích nguồn gốc vũ trụ và vạn vật qua trí tưởng tượng thần linh.",
  },
]);

const filteredQuestions = computed(() => {
  return sampleQuestions.value.filter((q) => {
    if (filters.keyword.trim()) {
      const kw = filters.keyword.toLowerCase();
      if (!q.content.toLowerCase().includes(kw)) return false;
    }
    if (filters.subject !== "Tất cả môn" && q.subject !== filters.subject) {
      return false;
    }
    if (filters.grade !== "Tất cả khối" && q.grade !== filters.grade) {
      return false;
    }
    if (filters.difficulty !== "Tất cả độ khó" && q.difficulty !== filters.difficulty) {
      return false;
    }
    return true;
  });
});
</script>

<style scoped>
.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-hover {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(20, 30, 80, 0.08) !important;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1d2e;
}

.question-item-card {
  border: 1px solid #e8ecf4;
  border-radius: 14px;
  padding: 18px 20px;
  background: #ffffff;
  transition: box-shadow 0.15s ease;
}

.question-item-card:hover {
  box-shadow: 0 4px 16px rgba(20, 30, 80, 0.06);
}

.q-tag--primary {
  font-size: 12px;
  font-weight: 700;
  color: #4f7cff;
}

.q-content {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.55;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  transition: all 0.15s ease;
}

.opt-item--correct {
  background: #f0fdf4;
  border-color: #86efac;
  color: #15803d;
  font-weight: 600;
}

.opt-key {
  font-weight: 700;
}

.explanation-box {
  background: #f8faff;
  border-left: 3px solid #4f7cff;
  border-radius: 0 10px 10px 0;
  padding: 12px 16px;
  margin-top: 10px;
}

.explanation-label {
  font-size: 12px;
  font-weight: 700;
  color: #4f7cff;
  display: flex;
  align-items: center;
}

.explanation-text {
  font-size: 13px;
  color: #475569;
  margin-top: 4px;
  line-height: 1.5;
}

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
</style>
