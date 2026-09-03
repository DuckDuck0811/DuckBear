import api from "@/service/http";

export function getBooksApi() {
  return api.get("/book-management");
}

export function getBookByIdApi(id) {
  return api.get(`/book-management/${id}`);
}

export function getBooksBySubjectApi(subjectId) {
  return api.get(`/book-management/by-subject/${subjectId}`);
}

export function searchBooksApi(keyword) {
  return api.get("/book-management/search", { params: { keyword } });
}

export function createBookApi(payload) {
  return api.post("/book-management/add", payload);
}

export function updateBookApi(id, payload) {
  return api.put(`/book-management/update/${id}`, payload);
}

export function deleteBookApi(id) {
  return api.delete(`/book-management/remove/${id}`);
}

export function previewImportApi(formData) {
  return api.post("/book-management/import-preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function confirmImportApi(bookId, chapters) {
  return api.post(`/book-management/${bookId}/import-confirm`, chapters);
}
