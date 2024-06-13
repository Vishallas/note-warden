if (localStorage.getItem("isAuthenticated") && localStorage.getItem('authToken')) {
    window.location.href = "fileManager.html";
}