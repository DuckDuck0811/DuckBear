import apiBaseUrl from './apiBaseUrl'

export const getStats = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/stats/dashboard`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      studentCount: "0",
      teacherCount: "0",
      classCount: "0",
    };
  }
};
