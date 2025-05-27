export function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const dateOfBirth = document.getElementById("regDOB").value;
  const age = document.getElementById("regAge").value.trim();
  const gender = document.getElementById("regGender").value;
  const bio = document.getElementById("regBio").value.trim();
  const msgBox = document.getElementById("regMessage");

  // Input validations
  if (!username || !email || !password || !dateOfBirth || !age || !gender || !bio) {
    msgBox.textContent = "All fields are required.";
    msgBox.style.color = "red";
    return;
  }

  if (!/^[A-Za-z\s]+$/.test(username)) {
    msgBox.textContent = "Name must contain only letters.";
    msgBox.style.color = "red";
    return;
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    msgBox.textContent = "Password must include letters and numbers.";
    msgBox.style.color = "red";
    return;
  }

  // Send registration request to backend
  fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, dateOfBirth, age, gender, bio })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        msgBox.textContent = "Registration successful!";
        msgBox.style.color = "lightgreen";
      } else {
        msgBox.textContent = data.message || "Registration failed.";
        msgBox.style.color = "red";
      }
    })
    .catch(err => {
      console.error("Register error:", err);
      msgBox.textContent = "Server error. Please try again later.";
      msgBox.style.color = "red";
    });
}
