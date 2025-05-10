document.title = "Matharoon - Fun Math Games & Learning Platform";
function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const themeToggleBtn = document.querySelector(".theme-toggle");
    if (document.body.classList.contains("light-mode")) {
        themeToggleBtn.textContent = "Dark Mode";
    }
    else {
        themeToggleBtn.textContent = "Light Mode";
    }
}