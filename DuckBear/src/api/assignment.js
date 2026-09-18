import api from "@/service/http";

export function getStudentAssignmentsApi() {
  return api.get("/assignment-management/student");
}

export function getAssignmentDetailApi(id) {
  return api.get(`/assignment-management/${id}/detail`);
}

export function getTeacherAssignmentsApi(teacherId) {
  return api.get(`/assignment-management/teacher/${teacherId}`);
}

export function deleteAssignmentApi(id) {
  return api.delete(`/assignment-management/remove/${id}`);
}

export function createAssignmentApi(payload) {
  const { teacherId, ...request } = payload;
  return api.post("/assignment-management/add", request, {
    params: { teacherId },
  });
}