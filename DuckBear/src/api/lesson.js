import api from "@/service/http";

export function getLessonsByChapterApi(chapterId) {
  return api.get(`/lesson-management/by-chapter/${chapterId}`);
}

export function createLessonApi(payload) {
  return api.post("/lesson-management/add", payload);
}

export function updateLessonApi(id, payload) {
  return api.put(`/lesson-management/update/${id}`, payload);
}

export function deleteLessonApi(id) {
  return api.delete(`/lesson-management/remove/${id}`);
}