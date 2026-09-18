import api from "@/service/http";

export function getStudentProfileByUserIdApi(userId) {
  return api.get(`/studentprofile-management/by-user/${userId}`);
}

export function updateStudentProfileApi(profileId, payload) {
  return api.put(`/studentprofile-management/update/${profileId}`, payload);
}
