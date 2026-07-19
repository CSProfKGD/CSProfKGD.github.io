function handleThemeToggleClick(event) {
    const mode_toggle = event.target.closest(".js-light-toggle");
    if (!mode_toggle) return;

    event.preventDefault();
    window.toggleTheme(localStorage.getItem("theme"));
}

document.addEventListener("click", handleThemeToggleClick);

window.addEventListener("pageshow", function () {
    window.setTheme(localStorage.getItem("theme"));
});
