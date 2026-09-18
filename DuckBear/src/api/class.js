import api from "@/service/http";

export function getClassesApi() {
  return api.get("/class-management");
}

export function createClassApi(payload) {
  return api.post("/class-management/add", payload);
}

export function deleteClassApi(id) {
  return api.delete(`/class-management/remove/${id}`);
}

export function getSchoolYearsApi() {
  return api.get("/schoolyear-management");
}

export function getStudentsApi() {
  return api.get("/user-management/students");
}

export function getClassStudentsApi(classId) {
  return api.get(`/class-student-management/by-class/${classId}`);
}

export function addStudentToClassApi(classId, studentId) {
  return api.post("/class-student-management/add", { classId, studentId });
}

export function removeStudentFromClassApi(id) {
  return api.delete(`/class-student-management/remove/${id}`);
}

export function getMyClassesApi() {
  return api.get("/class-student-management/my-classes");
}

export function joinClassApi(classId) {
  return api.post(`/class-student-management/join/${classId}`);
}