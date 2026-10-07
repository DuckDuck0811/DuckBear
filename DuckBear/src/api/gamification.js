import api from "@/service/http";

export function getSummary(userId) {
  return api.get(`/gamification/summary/${userId}`);
}

export function getPointsTotal(userId) {
  return api.get(`/gamification/points/${userId}`);
}

export function getPointsHistory(userId, { page = 0, size = 10 } = {}) {
  return api.get(
    `/gamification/points/${userId}/history?page=${page}&size=${size}`,
  );
}

export function getAllBadges() {
  return api.get(`/gamification/badges`);
}

export function createBadge(payload) {
  return api.post(`/gamification/badges`, payload);
}

export function updateBadge(id, payload) {
  return api.put(`/gamification/badges/${id}`, payload);
}

export function deleteBadge(id) {
  return api.delete(`/gamification/badges/${id}`);
}

export function getUserBadges(userId) {
  return api.get(`/gamification/badges/${userId}`);
}

export function getStudentBadgeHistory(userId) {
  return api.get(`/gamification/students/${userId}/badges`);
}

export function getStreak(userId) {
  return api.get(`/gamification/streak/${userId}`);
}

export function checkIn(userId) {
  return api.post(`/gamification/checkin`, { userId });
}

export function getLeaderboard({
  scope = "global",
  scopeId = null,
  limit = 10,
} = {}) {
  const params = new URLSearchParams({ scope, limit });
  if (scopeId) params.set("scopeId", scopeId);
  return api.get(`/gamification/leaderboard?${params.toString()}`);
}
