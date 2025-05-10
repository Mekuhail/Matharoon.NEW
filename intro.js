document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.querySelector(".theme-toggle");
    const body = document.body;

    // Function to apply the saved theme or default to dark mode
    const applyTheme = (theme) => {
        if (theme === "light") {
            body.classList.add("light-mode");
            if (themeToggleBtn) themeToggleBtn.textContent = "Dark Mode";
        } else {
            body.classList.remove("light-mode");
            if (themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
        }
    };

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme("dark"); // Default to dark mode if no preference is saved
    }

    // Toggle theme function
    window.toggleTheme = () => {
        let currentTheme;
        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            if (themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
            currentTheme = "dark";
        } else {
            body.classList.add("light-mode");
            if (themeToggleBtn) themeToggleBtn.textContent = "Dark Mode";
            currentTheme = "light";
        }
        localStorage.setItem("theme", currentTheme);
    };

    // Ensure the button text is correct on load based on the applied theme
    // This is a bit redundant given applyTheme handles it, but good for clarity
    if (themeToggleBtn) {
        if (body.classList.contains("light-mode")) {
            themeToggleBtn.textContent = "Dark Mode";
        } else {
            themeToggleBtn.textContent = "Light Mode";
        }
    }
});

