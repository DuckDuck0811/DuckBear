import api from "@/service/http";

export function startSubmissionApi(assignmentId) {
  return api.post("/submission/start", null, { params: { assignmentId } });
}

export function submitSubmissionApi(submissionId, answers) {
  return api.post(`/submission/${submissionId}/submit`, { answers });
}

export function getStudentSubmissionsApi(studentId) {
  return api.get(`/submission/student/${studentId}`);
}

export function getMySubmissionsApi() {
  return api.get('/submission/my');
}

export function getSubmissionResultApi(submissionId) {
  return api.get(`/submission/${submissionId}/result`);
}