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

export function getUserBadges(userId) {
  return api.get(`/gamification/badges/${userId}`);
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
