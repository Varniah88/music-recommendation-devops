document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;        // assuming your input has id="name"
    const email = document.getElementById('email').value;      // assuming your input has id="email"
    const password = document.getElementById('password').value;
  
    fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }) // send all 3 fields with correct keys
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Registered successfully');
      })
      .catch(err => console.error('Register error:', err));
  });
  