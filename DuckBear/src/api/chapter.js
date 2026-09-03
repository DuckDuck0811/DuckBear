import api from "@/service/http";

export function getChaptersByBookApi(bookId) {
  return api.get(`/chapter-management/by-book/${bookId}`);
}

export function createChapterApi(payload) {
  return api.post("/chapter-management/add", payload);
}

export function updateChapterApi(id, payload) {
  return api.put(`/chapter-management/update/${id}`, payload);
}

export function deleteChapterApi(id) {
  return api.delete(`/chapter-management/remove/${id}`);
}
