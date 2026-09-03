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
import Question from "@/view/Question/Question.vue";
import Ocrimportview from "@/view/Ocrimportview/Ocrimportview.vue";
import Assignmentbankview from "@/view/Assignment/Assignmentbankview.vue";
import Assignmentcreateview from "@/view/Assignment/Assignmentcreateview.vue";
import Assignmentgenerateview from "@/view/Assignment/Assignmentgenerateview.vue";
import Classesview from "@/view/Classes/Classesview.vue";
import Logsview from "@/view/Logs/Logsview.vue";
import Profileview from "@/view/Profile/Profileview.vue";
import BookFlipViewer from "@/view/Book/BookFlipViewer.vue";
import { components } from "vuetify/dist/vuetify.js";

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
    path: "/teacher",
    component: TeacherLayout,
    meta: { requiresAuth: true, role: "teacher" },
    children: [
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
        path: "questions",
        name: "teacher-questions",
        component: Question,
        meta: { title: "Ngân hàng câu hỏi" },
      },
      {
        path: "ocr",
        name: "teacher-ocr",
        component: Ocrimportview,
        meta: { title: "Scan tài liệu (OCR)" },
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
      {
        path: "book-viewer",
        name: "teacher-book-viewer",
        components: { default: BookFlipViewer },
        props: (route) => ({ bookId: route.query.bookId }),
        meta: { title: "Xem sách" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
