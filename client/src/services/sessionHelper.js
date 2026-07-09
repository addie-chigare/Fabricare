export const startSession = () => {
  localStorage.setItem("loginTime", Date.now().toString());
};

export const isSessionExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const loginTimeStr = localStorage.getItem("loginTime");
  if (!loginTimeStr) {
    // If user is logged in but no login time is recorded, initialize it now
    localStorage.setItem("loginTime", Date.now().toString());
    return false;
  }

  const loginTime = parseInt(loginTimeStr, 10);
  const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  return Date.now() - loginTime > twoHours;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
};
