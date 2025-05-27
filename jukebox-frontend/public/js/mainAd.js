// Show admin tab if role is admin
const userRole = sessionStorage.getItem("userRole");
if (userRole === "admin") {
  document.getElementById("adminTab")?.style.display = "inline-block";
}

// Optionally show a welcome message
const userName = sessionStorage.getItem("userName");
if (userName) {
  document.getElementById("welcomeUser")?.textContent = `Welcome, ${userName}`;
}
