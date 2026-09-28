import api from "@/service/http";

export function getAttendanceSessionsApi(classId) {
  return api.get(`/attendance/class/${classId}/sessions`);
}

export function createAttendanceSessionApi(payload) {
  return api.post(`/attendance/class/${payload.classId}/sessions`, payload);
}

export function getAttendanceRecordsApi(sessionId) {
  return api.get(`/attendance/session/${sessionId}/records`);
}

export function saveAttendanceRecordsApi(sessionId, records) {
  return api.post(`/attendance/session/${sessionId}/records`, { records });
}

export function getAttendanceSummaryApi(classId, studentIds = []) {
  const params = new URLSearchParams();
  studentIds.forEach((id) => params.append("studentIds", id));
  return api.get(`/attendance/class/${classId}/summary`, {
    params,
  });
}
