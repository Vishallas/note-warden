document.getElementById("signUpForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent form submission
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post('http://localhost:3000/signup', {
      username: username,
      password: password
    });
    if (response.data.success == true) {
      window.location.href = "fileManager.html";
    }
  } catch (err) {
    if (err.response.data.message === 'username') {
      alert("User name already found!");
      document.getElementById("errorMessage").textContent = "User Already Signed in";
    } else {
      console.error(err);
    }
  }
});
