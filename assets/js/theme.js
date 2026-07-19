// Has to be in the head tag, otherwise a flicker effect will occur.

var toggleTheme = (theme) => {
  if (theme == "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}


var setTheme = (theme) =>  {
  transTheme();
  if (theme && theme != "light") {
    document.documentElement.setAttribute("data-theme", theme);
  }
  else {
    document.documentElement.removeAttribute("data-theme");
    theme = "light";
  }
  localStorage.setItem("theme", theme);
  
  // Updates the background of medium-zoom overlay.
  if (typeof medium_zoom !== 'undefined') {
    medium_zoom.update({
      background: getComputedStyle(document.documentElement)
          .getPropertyValue('--global-bg-color') + 'ee',  // + 'ee' for trasparency.
    })
  }
};


var transTheme = () => {
  document.documentElement.classList.add("transition");
  window.setTimeout(() => {
    document.documentElement.classList.remove("transition");
  }, 500)
}


var initTheme = (theme) => {
  if (theme == null || theme == "null") {
    const userPref = window.matchMedia;
    if (userPref && userPref('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }
  }
  setTheme(theme);
}


window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.initTheme = initTheme;

initTheme(localStorage.getItem("theme"));
