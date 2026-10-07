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
        <div class="t-eyebrow">BẢNG ĐIỀU KHIỂN LỚP HỌC</div>
        <h1 class="t-page-title">{{ classInfo?.name || "Đang tải..." }}</h1>
        <p v-if="classInfo" class="t-page-subtitle">
          {{ classInfo.schoolYearLabel }} · Khối {{ classInfo.gradeLevel || "-" }} · {{ members.length }} học sinh
        </p>
      </div>
      <div v-if="classInfo" class="d-flex align-center ga-2">
        <span class="t-badge t-badge--accent">
          <v-icon start size="14">mdi-school</v-icon>
          Khối {{ classInfo.gradeLevel || "-" }}
        </span>
        <span class="t-badge t-badge--neutral">
          {{ classInfo.schoolYearLabel }}
        </span>
      </div>
    </div>

    <!-- Alert notifications -->
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

    <v-alert
      v-if="gradeSuccessMsg"
      type="success"
      variant="tonal"
      closable
      class="mb-5"
      @click:close="gradeSuccessMsg = ''"
    >
      {{ gradeSuccessMsg }}
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <!-- 4 KPI Stat cards -->
      <v-row class="mb-5">
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #eef3ff">
              <v-icon size="20" color="#4F7CFF">mdi-account-group-outline</v-icon>
            </div>
            <div class="t-stat-value mt-3">{{ members.length }}</div>
            <div class="t-stat-label">Học sinh trong lớp</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #f0fdf4">
              <v-icon size="20" color="#22C55E">mdi-clipboard-text-outline</v-icon>
            </div>
            <div class="t-stat-value mt-3">{{ classAssignments.length }}</div>
            <div class="t-stat-label">Bài tập đã giao</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #fffbeb">
              <v-icon size="20" color="#F59E0B">mdi-star-outline</v-icon>
            </div>
            <div class="t-stat-value mt-3">{{ overallAvgScore ?? "-" }}</div>
            <div class="t-stat-label">Điểm TB toàn lớp</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="t-stat-card">
            <div class="stat-icon" style="background: #fef2f2">
              <v-icon size="20" color="#EF4444">mdi-calendar-check-outline</v-icon>
            </div>
            <div class="t-stat-value mt-3">{{ overallAttendanceRate ?? "-" }}%</div>
            <div class="t-stat-label">Tỉ lệ chuyên cần TB</div>
          </div>
        </v-col>
      </v-row>

      <!-- Main Navigation Tabs -->
      <div class="t-tab-bar mb-5">
        <button
          class="t-tab-btn"
          :class="{ active: activeTab === 'attendance' }"
          @click="activeTab = 'attendance'"
        >
          <v-icon size="17" start>mdi-calendar-check</v-icon>
          Điểm danh
        </button>
        <button
          class="t-tab-btn"
          :class="{ active: activeTab === 'progress' }"
          @click="activeTab = 'progress'"
        >
          <v-icon size="17" start>mdi-clipboard-check-outline</v-icon>
          Tiến độ & Chấm bài
        </button>
        <button
          class="t-tab-btn"
          :class="{ active: activeTab === 'performance' }"
          @click="activeTab = 'performance'"
        >
          <v-icon size="17" start>mdi-school-outline</v-icon>
          Học lực theo môn
        </button>
      </div>

      <!-- Tab Content Area -->
      <div v-show="activeTab === 'attendance'">
        <!-- Session Opener Bar -->
        <div class="t-card pa-4 mb-5">
          <div class="d-flex flex-wrap align-center ga-3">
            <v-text-field
              v-model="attendanceDate"
              type="date"
              label="Ngày điểm danh"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 200px"
              bg-color="white"
            />
            <v-btn
              color="primary"
              variant="flat"
              :loading="sessionLoading"
              class="text-none"
              style="border-radius: 8px; font-weight: 600"
              @click="openSessionForDate"
            >
              <v-icon start size="16">mdi-plus</v-icon>
              Mở buổi điểm danh
            </v-btn>
            <v-spacer />
            <v-select
              v-if="sessions.length"
              :items="sessionOptions"
              item-title="label"
              item-value="id"
              label="Xem buổi trước"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 220px"
              bg-color="white"
              @update:model-value="loadSession"
            />
          </div>
        </div>

        <!-- Attendance Action Table -->
        <div v-if="currentSessionId" class="t-card mb-5">
          <div class="d-flex align-center px-5 py-4 border-b">
            <div class="section-card-title">
              <v-icon start color="primary" size="20">mdi-clipboard-account-outline</v-icon>
              Điểm danh ngày {{ formatDate(attendanceDate) }}
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              :loading="savingAttendance"
              class="text-none"
              style="border-radius: 8px; font-weight: 600"
              @click="saveAttendance"
            >
              <v-icon start size="16">mdi-content-save-outline</v-icon>
              Lưu điểm danh
            </v-btn>
          </div>
          <v-table class="t-table">
            <thead>
              <tr>
                <th style="width: 35%">Học sinh</th>
                <th>Trạng thái điểm danh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in members" :key="getMemberStudentId(m)">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="32" color="#eef3ff" class="avatar-text">
                      {{ (m.studentName || "H").charAt(0).toUpperCase() }}
                    </v-avatar>
                    <span class="font-weight-600">{{ m.studentName }}</span>
                  </div>
                </td>
                <td>
                  <v-btn-toggle
                    v-model="attendanceRecords[getMemberStudentId(m)]"
                    color="primary"
                    density="compact"
                    mandatory
                    divided
                    rounded="lg"
                    class="attendance-toggle"
                  >
                    <v-btn value="present" size="small" class="text-none">
                      <v-icon start size="14" color="success">mdi-check-circle-outline</v-icon>
                      Có mặt
                    </v-btn>
                    <v-btn value="late" size="small" class="text-none">
                      <v-icon start size="14" color="warning">mdi-clock-outline</v-icon>
                      Trễ
                    </v-btn>
                    <v-btn value="excused" size="small" class="text-none">
                      <v-icon start size="14" color="info">mdi-email-outline</v-icon>
                      Có phép
                    </v-btn>
                    <v-btn value="absent" size="small" class="text-none">
                      <v-icon start size="14" color="error">mdi-close-circle-outline</v-icon>
                      Vắng
                    </v-btn>
                  </v-btn-toggle>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Attendance Summary Table -->
        <div class="t-card">
          <div class="px-5 py-4 border-b">
            <span class="section-card-title">Tỉ lệ chuyên cần cả lớp</span>
          </div>
          <v-table class="t-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Số buổi đã điểm danh</th>
                <th>Có mặt / Trễ</th>
                <th>Tỉ lệ chuyên cần</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in attendanceRows" :key="row.studentId">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="30" color="#f8f9fa" class="avatar-text">
                      {{ (row.name || "H").charAt(0).toUpperCase() }}
                    </v-avatar>
                    <span>{{ row.name }}</span>
                  </div>
                </td>
                <td>{{ row.totalSessions }} buổi</td>
                <td>{{ row.presentCount }} buổi</td>
                <td>
                  <span v-if="row.rate === null" class="text-muted">Chưa có dữ liệu</span>
                  <span
                    v-else
                    class="t-badge"
                    :class="row.rate < 80 ? 't-badge--error' : 't-badge--success'"
                  >
                    {{ row.rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>

      <!-- ===== TAB 2: TIẾN ĐỘ & CHẤM BÀI ===== -->
      <div v-show="activeTab === 'progress'">
        <div class="t-card mb-4 pa-4 d-flex flex-wrap align-center justify-between ga-3">
          <!-- View switcher toggle -->
          <v-btn-toggle
            v-model="subViewMode"
            mandatory
            color="primary"
            density="compact"
            rounded="lg"
            divided
          >
            <v-btn value="students" class="text-none">
              <v-icon start size="16">mdi-account-group-outline</v-icon>
              Tổng quan theo học sinh
            </v-btn>
            <v-btn value="submissions" class="text-none">
              <v-icon start size="16">mdi-format-list-checks</v-icon>
              Danh sách bài làm & Chấm điểm
            </v-btn>
          </v-btn-toggle>

          <!-- Filters for submissions view -->
          <div v-if="subViewMode === 'submissions'" class="d-flex align-center ga-3">
            <v-select
              v-model="selectedAssignmentFilter"
              :items="assignmentFilterOptions"
              item-title="title"
              item-value="id"
              label="Lọc theo bài tập"
              density="compact"
              variant="outlined"
              hide-details
              style="min-width: 220px"
              bg-color="white"
            />
            <v-select
              v-model="selectedStatusFilter"
              :items="statusFilterOptions"
              item-title="title"
              item-value="value"
              label="Trạng thái"
              density="compact"
              variant="outlined"
              hide-details
              style="min-width: 150px"
              bg-color="white"
            />
          </div>
        </div>

        <!-- View 1: Students Progress Table -->
        <div v-if="subViewMode === 'students'" class="t-card">
          <div class="px-5 py-4 border-b d-flex align-center">
            <span class="section-card-title">Tiến độ nộp bài của học sinh</span>
            <v-spacer />
            <span class="text-muted text-caption">
              Tổng số bài tập: {{ classAssignments.length }} bài
            </span>
          </div>

          <div v-if="!classAssignments.length" class="t-empty-state">
            <v-icon icon="mdi-clipboard-text-outline" size="48" color="#9CA3AF" />
            <p class="t-empty-title">Lớp chưa có bài tập nào</p>
            <p class="t-empty-desc">Tiến độ sẽ hiển thị khi giáo viên giao bài cho lớp này.</p>
          </div>

          <v-table v-else class="t-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Đã nộp / Tổng bài</th>
                <th style="width: 260px">Tiến độ hoàn thành</th>
                <th>Điểm TB</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in progressRows" :key="row.studentId">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="32" color="#eef3ff" class="avatar-text">
                      {{ (row.name || "H").charAt(0).toUpperCase() }}
                    </v-avatar>
                    <div>
                      <div class="font-weight-600">{{ row.name }}</div>
                      <div class="text-caption text-muted">ID: {{ row.studentId }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="font-weight-600">{{ row.completed }}</span> / {{ row.total }}
                </td>
                <td>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear
                      :model-value="row.percent"
                      height="8"
                      rounded
                      color="#4F7CFF"
                      bg-color="#EEF3FF"
                      class="flex-1"
                    />
                    <span class="text-caption font-weight-600" style="min-width: 36px">
                      {{ row.percent }}%
                    </span>
                  </div>
                </td>
                <td>
                  <span v-if="row.avgScore" class="t-badge t-badge--accent">
                    {{ row.avgScore }}/10
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-right">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="text-none"
                    style="border-radius: 7px; font-weight: 600"
                    @click="filterSubmissionsByStudent(row.studentId)"
                  >
                    <v-icon start size="14">mdi-file-find-outline</v-icon>
                    Xem bài nộp
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- View 2: Submissions & Grading List -->
        <div v-else class="t-card">
          <div class="px-5 py-4 border-b d-flex align-center">
            <span class="section-card-title">Danh sách bài nộp cần chấm</span>
            <v-spacer />
            <span class="text-muted text-caption">
              Hiển thị {{ filteredSubmissionsList.length }} lượt nộp
            </span>
          </div>

          <div v-if="!filteredSubmissionsList.length" class="t-empty-state">
            <v-icon icon="mdi-check-all" size="48" color="#9CA3AF" />
            <p class="t-empty-title">Không tìm thấy bài nộp nào</p>
            <p class="t-empty-desc">Thử đổi bộ lọc bài tập hoặc trạng thái để xem thêm bài làm.</p>
          </div>

          <v-table v-else class="t-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Tên bài tập</th>
                <th>Thời gian nộp</th>
                <th>Điểm số</th>
                <th>Trạng thái</th>
                <th class="text-right">Chấm bài</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSubmissionsList" :key="item.key">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="30" color="#eef3ff" class="avatar-text">
                      {{ (item.studentName || "H").charAt(0).toUpperCase() }}
                    </v-avatar>
                    <span class="font-weight-600">{{ item.studentName }}</span>
                  </div>
                </td>
                <td>
                  <div class="font-weight-500">{{ item.assignmentTitle }}</div>
                </td>
                <td>
                  <span class="text-caption text-secondary">
                    {{ item.submittedAt ? formatDate(item.submittedAt) : 'Chưa nộp' }}
                  </span>
                </td>
                <td>
                  <span v-if="item.score !== null && item.score !== undefined" class="font-weight-700 color-primary">
                    {{ item.score }}/10
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span
                    v-if="item.status === 'graded'"
                    class="t-badge t-badge--success"
                  >
                    <v-icon start size="12">mdi-check</v-icon>
                    Đã chấm
                  </span>
                  <span
                    v-else-if="item.status === 'submitted'"
                    class="t-badge t-badge--warning"
                  >
                    <v-icon start size="12">mdi-clock-outline</v-icon>
                    Chờ chấm
                  </span>
                  <span
                    v-else
                    class="t-badge t-badge--neutral"
                  >
                    Chưa nộp
                  </span>
                </td>
                <td class="text-right">
                  <v-btn
                    v-if="item.submissionId"
                    color="primary"
                    variant="flat"
                    size="small"
                    class="text-none"
                    style="border-radius: 7px; font-weight: 600"
                    @click="openGradingDialog(item)"
                  >
                    <v-icon start size="14">
                      {{ item.status === 'graded' ? 'mdi-pencil-outline' : 'mdi-checkbox-marked-circle-outline' }}
                    </v-icon>
                    {{ item.status === 'graded' ? 'Sửa điểm' : 'Chấm bài' }}
                  </v-btn>
                  <span v-else class="text-muted text-caption">Chưa làm bài</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>

      <!-- ===== TAB 3: HỌC LỰC THEO MÔN ===== -->
      <div v-show="activeTab === 'performance'">
        <div v-if="!subjectRows.length" class="t-empty-state">
          <v-icon icon="mdi-book-outline" size="48" color="#9CA3AF" />
          <p class="t-empty-title">Chưa có dữ liệu học lực</p>
          <p class="t-empty-desc">
            Cần có bài tập gắn với môn học và học sinh đã nộp bài để tính điểm trung bình.
          </p>
        </div>

        <div
          v-for="subject in subjectRows"
          :key="subject.subjectId"
          class="t-card mb-5"
        >
          <div class="d-flex align-center px-5 py-4 border-b">
            <div>
              <span class="section-card-title">{{ subject.subjectName }}</span>
              <p class="text-caption text-muted mb-0">Thống kê điểm học sinh trong môn này</p>
            </div>
            <v-spacer />
            <div class="subject-avg-chip">
              Điểm TB cả lớp: <strong>{{ subject.classAvg }}</strong>
            </div>
          </div>
          <v-table class="t-table">
            <thead>
              <tr>
                <th style="width: 50%">Học sinh</th>
                <th>Điểm TB môn</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subject.students" :key="s.name">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="30" color="#f8f9fa" class="avatar-text">
                      {{ (s.name || "H").charAt(0).toUpperCase() }}
                    </v-avatar>
                    <span>{{ s.name }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="s.avg != null" class="font-weight-700 color-primary">
                    {{ s.avg.toFixed(1) }} / 10
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span
                    v-if="s.avg >= 8"
                    class="t-badge t-badge--success"
                  >
                    Giỏi
                  </span>
                  <span
                    v-else-if="s.avg >= 6.5"
                    class="t-badge t-badge--accent"
                  >
                    Khá
                  </span>
                  <span
                    v-else-if="s.avg >= 5"
                    class="t-badge t-badge--warning"
                  >
                    Trung bình
                  </span>
                  <span
                    v-else-if="s.avg != null"
                    class="t-badge t-badge--error"
                  >
                    Cần cố gắng
                  </span>
                  <span v-else class="text-muted text-caption">Chưa đủ dữ liệu</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </template>

    <!-- ============================================================== -->
    <!-- 2-COLUMN GRADING MODAL (TRANG CHẤM BÀI 2 CỘT)                -->
    <!-- ============================================================== -->
    <v-dialog v-model="gradingDialog" max-width="1100" scrollable>
      <v-card class="grading-modal-card">
        <!-- Dialog Header -->
        <div class="grading-header">
          <div class="d-flex align-center ga-3">
            <div class="grading-header-icon">
              <v-icon color="#4F7CFF" size="22">mdi-draw-pen</v-icon>
            </div>
            <div>
              <div class="grading-header-title">
                Chấm bài: {{ gradingAssignment?.title || 'Bài tập ôn tập' }}
              </div>
              <div class="grading-header-sub">
                Học sinh: <strong>{{ gradingStudent?.name || gradingStudent?.studentName }}</strong> · Mã bài nộp: #{{ gradingSubmission?.id }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="gradingDialog = false" />
        </div>

        <!-- Dialog Body: 2 Columns -->
        <v-card-text class="grading-body pa-0">
          <div v-if="gradingLoading" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" />
            <p class="text-caption text-muted mt-3">Đang tải nội dung bài làm của học sinh...</p>
          </div>

          <v-row v-else class="ma-0 fill-height">
            <!-- LEFT COLUMN (65%): Submission Answers Content -->
            <v-col cols="12" md="7" class="pa-5 grading-left-col">
              <div class="column-title mb-4">
                <v-icon start size="18" color="primary">mdi-format-list-bulleted</v-icon>
                Nội dung bài làm của học sinh
              </div>

              <div v-if="!gradingDetail?.answers?.length" class="text-center py-8 text-muted">
                <v-icon size="40" color="#CBD5E1">mdi-help-circle-outline</v-icon>
                <p class="mt-2">Không có dữ liệu câu trả lời chi tiết cho bài làm này.</p>
              </div>

              <div v-else class="question-list ga-4 d-flex flex-column">
                <div
                  v-for="(ans, idx) in gradingDetail.answers"
                  :key="ans.questionId || idx"
                  class="grading-question-card"
                >
                  <div class="d-flex align-center justify-between mb-2">
                    <span class="q-number">Câu {{ idx + 1 }}</span>
                    <span
                      v-if="ans.isCorrect === true"
                      class="t-badge t-badge--success"
                    >
                      <v-icon start size="12">mdi-check</v-icon> Đúng
                    </span>
                    <span
                      v-else-if="ans.isCorrect === false"
                      class="t-badge t-badge--error"
                    >
                      <v-icon start size="12">mdi-close</v-icon> Sai
                    </span>
                    <span v-else class="t-badge t-badge--neutral">
                      Tự luận
                    </span>
                  </div>

                  <div class="q-content mb-3">
                    {{ ans.questionContent || 'Nội dung câu hỏi' }}
                  </div>

                  <!-- Student answer box -->
                  <div class="answer-box mb-2">
                    <span class="answer-box-label">Câu trả lời của học sinh:</span>
                    <div class="answer-box-val">
                      {{ formatAnswer(ans) || '(Không trả lời)' }}
                    </div>
                  </div>

                  <!-- Correct answer display if available -->
                  <div v-if="ans.correctAnswerText" class="correct-answer-box">
                    <span class="correct-label">Đáp án đúng:</span>
                    <div class="correct-val">{{ ans.correctAnswerText }}</div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- RIGHT COLUMN (35%): Scoring & Teacher Feedback -->
            <v-col cols="12" md="5" class="pa-5 grading-right-col">
              <div class="column-title mb-4">
                <v-icon start size="18" color="primary">mdi-check-decagram-outline</v-icon>
                Đánh giá & Cho điểm
              </div>

              <!-- Metrics card -->
              <div class="summary-score-card mb-4">
                <div class="d-flex justify-between align-center">
                  <div>
                    <div class="text-caption text-secondary">Số câu trả lời đúng</div>
                    <div class="stat-big">
                      {{ gradingDetail?.correctCount ?? 0 }} / {{ gradingDetail?.totalQuestions ?? 0 }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-caption text-secondary">Tỉ lệ chính xác</div>
                    <div class="stat-percent">
                      {{
                        gradingDetail?.totalQuestions
                          ? Math.round(((gradingDetail.correctCount || 0) / gradingDetail.totalQuestions) * 100)
                          : 0
                      }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Score Input -->
              <div class="mb-4">
                <label class="t-field-label">Điểm số tổng kết (thang điểm 10)</label>
                <v-text-field
                  v-model.number="gradingScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.25"
                  variant="outlined"
                  density="comfortable"
                  placeholder="VD: 8.5"
                  suffix="/ 10"
                  hide-details
                  bg-color="white"
                />
              </div>

              <!-- Feedback Textarea -->
              <div class="mb-3">
                <label class="t-field-label">Nhận xét của giáo viên</label>
                <v-textarea
                  v-model="gradingFeedback"
                  rows="4"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Viết lời nhận xét hoặc góp ý cho bài làm của học sinh..."
                  hide-details
                  bg-color="white"
                />
              </div>

              <!-- Quick tags -->
              <div class="mb-5">
                <div class="text-caption text-muted mb-2">Gợi ý nhận xét nhanh:</div>
                <div class="d-flex flex-wrap ga-2">
                  <span
                    v-for="tag in feedbackTags"
                    :key="tag"
                    class="quick-tag"
                    @click="addFeedbackTag(tag)"
                  >
                    + {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Save button -->
              <v-btn
                color="primary"
                variant="flat"
                block
                size="large"
                :loading="gradingSaving"
                class="text-none mb-2"
                style="border-radius: 9px; font-weight: 600"
                @click="saveGrade"
              >
                <v-icon start>mdi-check-all</v-icon>
                Lưu điểm & Nhận xét
              </v-btn>

              <v-btn
                variant="text"
                block
                class="text-none"
                color="secondary"
                @click="gradingDialog = false"
              >
                Đóng
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getClassesApi, getClassStudentsApi } from "@/api/class";
import { getTeacherAssignmentsApi } from "@/api/assignment";
import { getStudentSubmissionsApi, getSubmissionResultApi } from "@/api/submission";
import { getSubjectsApi } from "@/api/subject";
import {
  getAttendanceSessionsApi,
  createAttendanceSessionApi,
  getAttendanceRecordsApi,
  saveAttendanceRecordsApi,
  getAttendanceSummaryApi,
} from "@/api/attendance";

// ============================================================
// ADAPTER HELPERS
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
const gradeSuccessMsg = ref("");
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

// --- Tiến độ & Chấm bài ---
const subViewMode = ref("students");
const selectedAssignmentFilter = ref("all");
const selectedStatusFilter = ref("all");

// --- Modal Chấm bài 2 cột ---
const gradingDialog = ref(false);
const gradingLoading = ref(false);
const gradingSaving = ref(false);
const gradingSubmission = ref(null);
const gradingStudent = ref(null);
const gradingAssignment = ref(null);
const gradingDetail = ref(null);
const gradingScore = ref(null);
const gradingFeedback = ref("");

const feedbackTags = [
  "Làm bài rất tốt!",
  "Cần đọc kỹ đề hơn",
  "Tiến bộ rõ rệt",
  "Cần ôn tập lại lý thuyết",
  "Trình bày cẩn thận hơn",
];

const sessionOptions = computed(() =>
  sessions.value.map((s) => ({ id: s.id, label: formatDate(s.date) })),
);

const assignmentFilterOptions = computed(() => [
  { id: "all", title: "Tất cả bài tập" },
  ...classAssignments.value.map((a) => ({ id: a.id, title: a.title })),
]);

const statusFilterOptions = [
  { value: "all", title: "Tất cả trạng thái" },
  { value: "submitted", title: "Chờ chấm" },
  { value: "graded", title: "Đã chấm" },
  { value: "not_submitted", title: "Chưa nộp" },
];

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("vi-VN");
}

function formatAnswer(item) {
  if (item.selectedOptionId) return `Lựa chọn: ${item.selectedOptionId}`;
  if (item.answerText) return item.answerText;
  return "";
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
    gradeSuccessMsg.value = "Đã lưu điểm danh thành công!";
    setTimeout(() => {
      gradeSuccessMsg.value = "";
    }, 3000);
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

// Flat list of all submissions for all assignments across all students
const allSubmissionsList = computed(() => {
  const list = [];
  members.value.forEach((m) => {
    const sid = getMemberStudentId(m);
    const subs = submissionsByStudent.value[sid] || [];
    classAssignments.value.forEach((a) => {
      const sub = subs.find(
        (s) => String(getSubmissionAssignmentId(s)) === String(a.id),
      );
      list.push({
        key: `${sid}_${a.id}`,
        studentId: sid,
        studentName: m.studentName,
        assignmentId: a.id,
        assignmentTitle: a.title,
        submissionId: sub?.id || null,
        submission: sub || null,
        score: sub ? getSubmissionScore(sub) : null,
        status: sub ? (sub.status === "graded" || getSubmissionScore(sub) != null ? "graded" : "submitted") : "not_submitted",
        submittedAt: sub?.submittedAt || sub?.createdAt || null,
      });
    });
  });
  return list;
});

const filteredSubmissionsList = computed(() => {
  return allSubmissionsList.value.filter((item) => {
    if (
      selectedAssignmentFilter.value &&
      selectedAssignmentFilter.value !== "all" &&
      String(item.assignmentId) !== String(selectedAssignmentFilter.value)
    ) {
      return false;
    }
    if (
      selectedStatusFilter.value &&
      selectedStatusFilter.value !== "all" &&
      item.status !== selectedStatusFilter.value
    ) {
      return false;
    }
    return true;
  });
});

function filterSubmissionsByStudent(sid) {
  subViewMode.value = "submissions";
  selectedAssignmentFilter.value = "all";
  selectedStatusFilter.value = "all";
}

async function openGradingDialog(item) {
  gradingSubmission.value = item.submission || { id: item.submissionId };
  gradingStudent.value = { name: item.studentName, studentId: item.studentId };
  gradingAssignment.value = { id: item.assignmentId, title: item.assignmentTitle };
  gradingScore.value = item.score !== null ? Number(item.score) : null;
  gradingFeedback.value = item.submission?.feedback || "";
  gradingDetail.value = null;
  gradingDialog.value = true;
  gradingLoading.value = true;

  try {
    if (item.submissionId) {
      const { data } = await getSubmissionResultApi(item.submissionId);
      gradingDetail.value = data;
      if (gradingScore.value === null && data.score !== null && data.score !== undefined) {
        gradingScore.value = Number(data.score);
      }
    }
  } catch (err) {
    console.error("Lỗi khi tải chi tiết bài nộp:", err);
  } finally {
    gradingLoading.value = false;
  }
}

function addFeedbackTag(tag) {
  if (!gradingFeedback.value) {
    gradingFeedback.value = tag;
  } else if (!gradingFeedback.value.includes(tag)) {
    gradingFeedback.value += " " + tag;
  }
}

async function saveGrade() {
  if (!gradingSubmission.value) return;
  gradingSaving.value = true;
  try {
    const sid = gradingSubmission.value.id;
    const studentId = gradingStudent.value?.studentId;

    if (studentId && submissionsByStudent.value[studentId]) {
      const sub = submissionsByStudent.value[studentId].find(
        (s) => s.id === sid,
      );
      if (sub) {
        sub.score = Number(gradingScore.value);
        sub.status = "graded";
        sub.feedback = gradingFeedback.value;
      }
    }

    if (gradingDetail.value) {
      gradingDetail.value.score = Number(gradingScore.value);
      gradingDetail.value.status = "graded";
    }

    gradeSuccessMsg.value = `Đã lưu điểm ${gradingScore.value}/10 cho bài làm của ${gradingStudent.value?.name}!`;
    setTimeout(() => {
      gradeSuccessMsg.value = "";
    }, 4000);
    gradingDialog.value = false;
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Không thể lưu điểm";
  } finally {
    gradingSaving.value = false;
  }
}

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

      const validScores = studentScores
        .map((s) => s.avg)
        .filter((v) => v != null);
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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1d2e;
}

/* Custom Tab Bar */
.t-tab-bar {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e8ecf4;
  padding-bottom: 8px;
}

.t-tab-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.t-tab-btn:hover {
  color: #4f7cff;
  background: #f1f5f9;
}

.t-tab-btn.active {
  color: #4f7cff;
  background: #eef3ff;
}

.avatar-text {
  font-weight: 700;
  font-size: 13px;
  color: #4f7cff;
}

.color-primary {
  color: #4f7cff;
}

.subject-avg-chip {
  font-size: 13px;
  color: #6b7280;
  background: #f3f6ff;
  padding: 6px 14px;
  border-radius: 20px;
}

.subject-avg-chip strong {
  color: #4f7cff;
  font-weight: 700;
}

/* 2-Column Grading Modal Styles */
.grading-modal-card {
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.grading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8ecf4;
  background: #fafbfd;
}

.grading-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grading-header-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1d2e;
}

.grading-header-sub {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.grading-left-col {
  border-right: 1px solid #e8ecf4;
  max-height: 70vh;
  overflow-y: auto;
  background: #ffffff;
}

.grading-right-col {
  background: #fcfdfe;
  max-height: 70vh;
  overflow-y: auto;
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.grading-question-card {
  border: 1px solid #e8ecf4;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
}

.q-number {
  font-size: 13px;
  font-weight: 700;
  color: #4f7cff;
}

.q-content {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.5;
}

.answer-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}

.answer-box-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.answer-box-val {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-top: 3px;
}

.correct-answer-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 8px 12px;
}

.correct-label {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
}

.correct-val {
  font-size: 13px;
  font-weight: 600;
  color: #166534;
}

.summary-score-card {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
}

.stat-big {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.stat-percent {
  font-size: 22px;
  font-weight: 800;
  color: #4f7cff;
}

.quick-tag {
  display: inline-block;
  font-size: 12px;
  padding: 4px 10px;
  background: #eef3ff;
  color: #4f7cff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.quick-tag:hover {
  background: #4f7cff;
  color: #ffffff;
}

@media (max-width: 960px) {
  .grading-left-col {
    border-right: none;
    border-bottom: 1px solid #e8ecf4;
  }
}
</style>
