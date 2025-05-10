function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");

    const button = document.querySelector(".theme-toggle");
    const isLightMode = body.classList.contains("light-mode");

    button.textContent = isLightMode ? "Dark Mode" : "Light Mode";
}
