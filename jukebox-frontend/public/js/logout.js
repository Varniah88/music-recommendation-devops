document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Logout clicked");

      // Clear auth and session
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to landing
      window.location.href = "./";
    });
  }
});
