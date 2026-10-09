import { createRouter, createWebHistory } from "vue-router";
import RegisterFormStudent from "@/view/Login/Register/RegisterFormStudent.vue";
import RegisterFormTeacher from "@/view/Login/Register/RegisterFormTeacher.vue";
import RegisterRoleSelect from "@/view/Login/Register/RegisterRoleSelect.vue";
import LoginFormStudent from "@/view/Login/LoginFormStudent.vue";
import LoginFormTeacher from "@/view/Login/LoginFormTeacher.vue";
import LoginRoleSelect from "@/view/Login/LoginRoleSelect.vue";
import TeacherLayout from "@/layout/TeacherLayout.vue";
import BookView from "@/view/Book/BookView.vue";
import LessionsView from "@/view/Lession/LessionsView.vue";
import LessonDetailRouteView from "@/view/Lession/LessonDetailRouteView.vue";
import Question from "@/view/Question/Question.vue";
import Assignmentbankview from "@/view/Assignment/Assignmentbankview.vue";
import Assignmentcreateview from "@/view/Assignment/Assignmentcreateview.vue";
import Assignmentgenerateview from "@/view/Assignment/Assignmentgenerateview.vue";
import Classesview from "@/view/Classes/Classesview.vue";
import Classdashboardview from "@/view/Classes/Classdashboardview.vue";
import Logsview from "@/view/Logs/Logsview.vue";
import Profileview from "@/view/Profile/Profileview.vue";
import StudentDashboard from "@/view/Student/StudentDashboard.vue";
import StudentAssignmentView from "@/view/Student/StudentAssignmentView.vue";
import StudentAssignmentPlayView from "@/view/Student/StudentAssignmentPlayView.vue";
import StudentClassDetail from "@/view/Student/StudentClassDetail.vue";
import StudentHistoryView from "@/view/Student/StudentHistoryView.vue";
import StudentResultView from "@/view/Student/StudentResultView.vue";
import StudentProfileView from "@/view/Student/StudentProfileView.vue";
import StudentAiView from "@/view/Student/StudentAiView.vue";
import GamificationView from "@/view/Student/GamificationView.vue";
import BadgeManagementView from "@/view/Gamification/BadgeManagementView.vue";

const routes = [
  {
    path: "/",
    redirect: "/register",
  },
  {
    path: "/register",
    name: "register",
    component: RegisterRoleSelect,
  },
  {
    path: "/register/student",
    name: "register-student",
    component: RegisterFormStudent,
  },
  {
    path: "/register/teacher",
    name: "register-teacher",
    component: RegisterFormTeacher,
  },
  {
    path: "/login",
    name: "login",
    component: LoginRoleSelect,
  },
  {
    path: "/login/student",
    name: "login-student",
    component: LoginFormStudent,
  },
  {
    path: "/login/teacher",
    name: "login-teacher",
    component: LoginFormTeacher,
  },
  {
    path: "/student/dashboard",
    name: "student-dashboard",
    component: StudentDashboard,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/assignments/:id",
    name: "student-assignment",
    component: StudentAssignmentView,
    props: true,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/assignment-play/:id",
    name: "student-assignment-play",
    component: StudentAssignmentPlayView,
    props: true,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/class/:id",
    name: "student-class-detail",
    component: StudentClassDetail,
    props: true,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/history",
    name: "student-history",
    component: StudentHistoryView,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/result/:submissionId",
    name: "student-result",
    component: StudentResultView,
    props: true,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/profile",
    name: "student-profile",
    component: StudentProfileView,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/gamification",
    name: "student-gamification",
    component: GamificationView,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/student/ai",
    name: "student-ai",
    component: StudentAiView,
    meta: { requiresAuth: true, role: "student" },
  },
  {
    path: "/teacher",
    component: TeacherLayout,
    meta: { requiresAuth: true, role: "teacher" },
    children: [
      {
        path: "gamification/badges",
        name: "teacher-badges",
        component: BadgeManagementView,
        meta: { title: "Quản lý huy hiệu" },
      },
      {
        path: "",
        redirect: { name: "teacher-books" },
      },
      {
        path: "books",
        name: "teacher-books",
        component: BookView,
        meta: { title: "Sách / Môn học" },
      },
      {
        path: "lessons",
        name: "teacher-lessons",
        component: LessionsView,
        meta: { title: "Chương - Bài học" },
      },
      {
        path: "lessons/:lessonId",
        name: "teacher-lesson-detail",
        component: LessonDetailRouteView,
        meta: { title: "Nội dung bài học" },
      },
      {
        path: "questions",
        name: "teacher-questions",
        component: Question,
        meta: { title: "Ngân hàng câu hỏi" },
      },
      {
        path: "assignments/create",
        name: "teacher-assignments-create",
        component: Assignmentcreateview,
        meta: { title: "Tạo bài tập" },
      },
      {
        path: "assignments/generate",
        name: "teacher-assignments-generate",
        component: Assignmentgenerateview,
        meta: { title: "Sinh đề tổng hợp" },
      },
      {
        path: "assignments/bank",
        name: "teacher-assignments-bank",
        component: Assignmentbankview,
        meta: { title: "Ngân hàng đề" },
      },
      {
        path: "classes",
        name: "teacher-classes",
        component: Classesview,
        meta: { title: "Lớp / Niên khóa" },
      },
      {
        path: "classes/:classId/dashboard",
        name: "ClassDashboard",
        component: Classdashboardview,
        props: true,
        meta: { title: "Dashboard lớp học" },
      },
      {
        path: "logs",
        name: "teacher-logs",
        component: Logsview,
        meta: { title: "Nhật ký hoạt động" },
      },
      {
        path: "profile",
        name: "teacher-profile",
        component: Profileview,
        meta: { title: "Hồ sơ cá nhân" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }

  if (to.meta.role && role !== to.meta.role) {
    return role === "student"
      ? { name: "student-dashboard" }
      : { name: "teacher-books" };
  }

  return true;
});

export default router;
