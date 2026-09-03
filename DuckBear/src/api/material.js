import api from "@/service/http";

export function uploadMaterialApi(formData) {
  return api.post("/material-management/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getMaterialsByLessonApi(lessonId) {
  return api.get(`/material-management/lesson/${lessonId}`);
}

export function getMaterialsByChapterApi(chapterId) {
  return api.get(`/material-management/chapter/${chapterId}`);
}

export function deleteMaterialApi(id) {
  return api.delete(`/material-management/remove/${id}`);
}

// === MỚI ===
export function getMaterialByBookApi(bookId) {
  return api.get(`/material-management/book/${bookId}`);
}

// File PDF cần trả về dạng blob vì đây là file nhị phân, không phải JSON
export function getMaterialFileApi(id) {
  return api.get(`/material-management/${id}/file`, {
    responseType: "blob",
  });
}
