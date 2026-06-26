$(document).ready(function() {
    const mode_toggles = document.querySelectorAll(".js-light-toggle");

    mode_toggles.forEach(function(mode_toggle) {
        mode_toggle.addEventListener("click", function() {
            toggleTheme(localStorage.getItem("theme"));
        });
    });
});
