document.addEventListener("DOMContentLoaded", () => {
    const currentUserEmail = sessionStorage.getItem("userEmail");
    const dropdown = document.getElementById("userDropdown");
    const searchInput = document.getElementById("userSearch");
  
    if (!currentUserEmail) return console.warn("⚠️ No current user email found.");
  
    fetch(`http://localhost:3000/api/users?exclude=${currentUserEmail}`)
      .then(res => res.json())
      .then(data => {
        let allUsers = data;
  
        function populateDropdown(filteredUsers) {
          dropdown.innerHTML = '<option value="" disabled selected>Select a user</option>';
          filteredUsers.forEach(user => {
            const option = document.createElement("option");
            option.value = user.email;
            option.textContent = user.name || user.username || "Unnamed";
            dropdown.appendChild(option);
          });
          M.FormSelect.init(dropdown); // Re-initialize after update
        }
  
        populateDropdown(allUsers);
  
        searchInput?.addEventListener("input", () => {
          const query = searchInput.value.toLowerCase();
          const filtered = allUsers.filter(user =>
            (user.name || user.username || "").toLowerCase().includes(query)
          );
          populateDropdown(filtered);
        });
  
        // Handle start chat button
        const startBtn = document.getElementById("startPrivateChatBtn");
        startBtn?.addEventListener("click", () => {
          const selectedEmail = dropdown.value;
          const selectedUser = allUsers.find(u => u.email === selectedEmail);
          if (selectedEmail && selectedUser) {
            openPrivateChat(selectedEmail, selectedUser.name || selectedUser.username);
          } else {
            M.toast({ html: "Please select a user", classes: "red" });
          }
        });
      })
      .catch(err => {
        console.error("❌ Failed to fetch users:", err);
      });
  });
  