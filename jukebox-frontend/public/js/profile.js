document.addEventListener("DOMContentLoaded", () => {
  // Initialize Materialize components
  const modals = document.querySelectorAll('.modal');
  const selects = document.querySelectorAll('select');
  const tabs = document.querySelectorAll('.tabs');

  if (modals.length) M.Modal.init(modals);
  if (selects.length) M.FormSelect.init(selects);
  if (tabs.length) M.Tabs.init(tabs);

  M.updateTextFields();

  const token = localStorage.getItem("token");

fetch("http://localhost:3000/api/auth/getUserProfile", {
    method: "GET",
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById("userNameDisplay").textContent = user.username;
      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("dobDisplay").textContent = user.dateOfBirth ? new Date(user.dateOfBirth).toDateString() : "Not set";
      document.getElementById("ageDisplay").textContent = user.age;
      document.getElementById("genderDisplay").textContent = user.gender;
      document.getElementById("bioDisplay").textContent = user.bio;
    });
});

// Save personal info from modal
function savePersonalInfo() {
  const dateOfBirth = document.getElementById("dob").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const bio = document.getElementById("bio").value;

  const token = localStorage.getItem("token");

  fetch("http://localhost:3000/api/auth/profileUpdate", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      dateOfBirth,
      age,
      gender,
      bio
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        alert("Profile updated successfully!");
        // Update UI
        document.getElementById("dobDisplay").textContent = new Date(data.user.dateOfBirth).toDateString();
        document.getElementById("ageDisplay").textContent = data.user.age;
        document.getElementById("genderDisplay").textContent = data.user.gender;
        document.getElementById("bioDisplay").textContent = data.user.bio;
        const modalElem = document.getElementById("personalModal");
        const modalInstance = M.Modal.getInstance(modalElem);
        modalInstance.close();
        M.toast({ html: "Profile updated successfully!", classes: "green" });
      } else {
        alert("Failed to update profile.");
      }
    })
    .catch(err => {
      console.error("Update error:", err);
      alert("Server error. Please try again.");
    });
}
// Deleting the user profile
function deleteMyAccount() {
  if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

  const token = localStorage.getItem("token");

  fetch("http://localhost:3000/api/auth/deteleProfile", {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      // Clear session/local storage
      sessionStorage.clear();
      localStorage.clear();

      // Redirect to homepage or login
      window.location.href = "/login";
    })
}



