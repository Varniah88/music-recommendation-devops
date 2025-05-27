// document.getElementById('loginForm').addEventListener('submit', function (e) {
//   e.preventDefault();

//   console.log('Login form submitted'); 

//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   fetch('http://localhost:3000/api/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password })
//   })
//     .then(res => res.json())
//     .then(data => {
//       console.log('Login response:', data); 

//       alert(data.message);

//       if (data.role === 'admin') {
//         window.location.href = '/admin';
//       } else if (data.role === 'user') {
//         window.location.href = '/home';
//       }
//     })
//     .catch(err => {
//       console.error('Login error:', err);
//       alert('An error occurred during login');
//     });
// });
