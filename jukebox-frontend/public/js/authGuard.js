const token = localStorage.getItem("token");
const userEmail = sessionStorage.getItem("userEmail");
const userRole = sessionStorage.getItem("userRole");

if (!token || !userEmail || !userRole) {
  console.warn("No token or user info found. Redirecting to login.");
  window.location.href = "/login";
}

// Checking on console for debugging
console.log("Logged-in user:", userEmail, userRole);
