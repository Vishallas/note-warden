document.getElementById("signInForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent form submission
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await axios.post('http://localhost:3000/signin', {
      username: username,
      password: password
    });
    if (res.data.success) {
      const token = res.data.token;
      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem('authToken', token);
      alert('Logged in successfully');
      window.location.href = "fileManager.html";
    }
  }
  catch (err) {
    if (err.response.data.message === 'username') {
      // Display error message
      alert('Username Not Found!');
      document.getElementById("errorMessage").textContent = "User Not Found";
    } else if (err.response.data.message === 'password') {
      // Display error message
      alert('Invalid password!');
      document.getElementById("errorMessage").textContent = "Invalid password.";
    }
  }
});

document.getElementById('signup').addEventListener('click',()=>{
  window.location.href = 'signup.html';
});
