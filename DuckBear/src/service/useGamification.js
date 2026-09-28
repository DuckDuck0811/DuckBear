import { ref, computed, unref } from "vue";
import * as gamificationApi from "../api/gamification";

/**
 * Composable gom state + hành động cho 1 user cụ thể.
 * Dùng chung được ở cả widget tóm tắt lẫn trang chi tiết.
 */
export function useGamification(userId) {
  const summary = ref(null); // { totalPoints, currentStreak, longestStreak, badges, rank }
  const loading = ref(false);
  const error = ref(null);
  const checkingIn = ref(false);

  const hasCheckedInToday = computed(() => {
    if (!summary.value?.lastActiveDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return String(summary.value.lastActiveDate).slice(0, 10) === today;
  });

  async function loadSummary() {
    loading.value = true;
    error.value = null;
    try {
      const response = await gamificationApi.getSummary(unref(userId));
      const payload = response.data ?? response;
      const streak = payload?.streak || {};
      summary.value = {
        ...payload,
        totalPoints: Number(payload?.totalPoints ?? 0),
        currentStreak: Number(payload?.currentStreak ?? streak.currentStreak ?? 0),
        longestStreak: Number(payload?.longestStreak ?? streak.longestStreak ?? 0),
        lastActiveDate: payload?.lastActiveDate ?? streak.lastActiveDate ?? null,
        badges: payload?.badges || [],
        rank: payload?.rank ?? null,
      };
    } catch (err) {
      error.value = err.message || "Không tải được dữ liệu gamification";
    } finally {
      loading.value = false;
    }
  }

  async function doCheckIn() {
    if (checkingIn.value || hasCheckedInToday.value) return;
    checkingIn.value = true;
    try {
      const response = await gamificationApi.checkIn(unref(userId));
      const streak = response?.data ?? response;
      summary.value = {
        ...(summary.value || {}),
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
      };
    } catch (err) {
      error.value = err.message || "Điểm danh thất bại";
    } finally {
      checkingIn.value = false;
    }
  }

  return {
    summary,
    loading,
    error,
    checkingIn,
    hasCheckedInToday,
    loadSummary,
    doCheckIn,
  };
}
