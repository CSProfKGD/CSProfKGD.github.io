(function () {
  var thoughtsCache = null;
  var isLoading = false;

  function cleanThoughtText(text) {
    return String(text || "")
      .replace(/^\s*#KostasThoughts\s*:?\s*/i, "")
      .replace(/\bSource:\s*/gi, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/pic\.twitter\.com\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function parseThoughts(data) {
    var posts = Array.isArray(data && data.posts) ? data.posts : [];
    var seen = {};
    var thoughts = [];

    posts.forEach(function (post) {
      var text = cleanThoughtText(post.text);
      if (!text || text.length < 12 || seen[text]) return;
      seen[text] = true;
      thoughts.push({
        text: text,
        date: formatDate(post.date)
      });
    });

    return thoughts;
  }

  function getCollapsedHeight(textNode) {
    var styles = window.getComputedStyle(textNode);
    var lineHeight = parseFloat(styles.lineHeight);
    if (Number.isNaN(lineHeight)) {
      lineHeight = parseFloat(styles.fontSize) * 1.62;
    }
    return lineHeight * 6;
  }

  function setThoughtExpansion(section, expanded) {
    var textNode = section.querySelector("[data-thought-text]");
    var toggle = section.querySelector("[data-thought-toggle]");
    if (!textNode || !toggle || toggle.hidden) return;

    textNode.classList.toggle("is-expanded", expanded);
    textNode.classList.toggle("is-collapsed", !expanded);
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.textContent = expanded ? "Show less \u2191" : "Read more \u2192";
  }

  function resetThoughtExpansion(section) {
    var textNode = section.querySelector("[data-thought-text]");
    var toggle = section.querySelector("[data-thought-toggle]");
    if (!textNode || !toggle) return;

    textNode.classList.remove("is-collapsed", "is-expanded");
    toggle.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Read more \u2192";
  }

  function updateThoughtExpansion(section, preserveExpanded) {
    var textNode = section.querySelector("[data-thought-text]");
    var toggle = section.querySelector("[data-thought-toggle]");
    if (!textNode || !toggle) return;

    var wasExpanded = preserveExpanded && textNode.classList.contains("is-expanded");

    resetThoughtExpansion(section);

    window.requestAnimationFrame(function () {
      var shouldCollapse = textNode.scrollHeight > getCollapsedHeight(textNode) + 2;
      if (!shouldCollapse) return;

      toggle.hidden = false;
      setThoughtExpansion(section, wasExpanded);
    });
  }

  function renderThought(section, thoughts) {
    if (!thoughts.length) return;

    var thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    var textNode = section.querySelector("[data-thought-text]");
    var dateNode = section.querySelector("[data-thought-date]");
    var content = section.querySelector(".kostas-thoughts-card");

    content.style.minHeight = content.offsetHeight + "px";
    content.classList.add("is-changing");

    window.setTimeout(function () {
      resetThoughtExpansion(section);
      textNode.textContent = thought.text;
      if (thought.date) {
        dateNode.textContent = thought.date;
        dateNode.hidden = false;
      } else {
        dateNode.textContent = "";
        dateNode.hidden = true;
      }

      window.requestAnimationFrame(function () {
        updateThoughtExpansion(section, false);
        content.classList.remove("is-changing");
        window.setTimeout(function () {
          content.style.minHeight = "";
        }, 180);
      });
    }, 120);
  }

  function getEmbeddedThoughtsData() {
    var dataNode = document.getElementById("kostas-thoughts-data");
    if (!dataNode) return null;

    try {
      return JSON.parse(dataNode.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function hydrateThoughts(section, data) {
    var thoughts = parseThoughts(data);
    if (!thoughts.length) return false;
    thoughtsCache = thoughts;

    var button = section.querySelector("[data-another-thought]");
    var toggle = section.querySelector("[data-thought-toggle]");

    section.hidden = false;
    section.setAttribute("data-thoughts-ready", "true");
    renderThought(section, thoughts);

    if (button && button.getAttribute("data-thoughts-bound") != "true") {
      button.setAttribute("data-thoughts-bound", "true");
      button.addEventListener("click", function () {
        renderThought(section, thoughtsCache || thoughts);
      });
    }

    if (toggle && toggle.getAttribute("data-thoughts-bound") != "true") {
      toggle.setAttribute("data-thoughts-bound", "true");
      toggle.addEventListener("click", function () {
        var textNode = section.querySelector("[data-thought-text]");
        setThoughtExpansion(section, !textNode.classList.contains("is-expanded"));
      });
    }

    if (section.getAttribute("data-resize-bound") != "true") {
      section.setAttribute("data-resize-bound", "true");
      window.addEventListener("resize", function () {
        updateThoughtExpansion(section, true);
      });
    }

    return true;
  }

  function loadThoughts(source, onSuccess, onFailure) {
    if (typeof XMLHttpRequest == "undefined") {
      onFailure();
      return;
    }

    var xhr = new XMLHttpRequest();
    var cacheBustedSource = source + (source.indexOf("?") == -1 ? "?" : "&") + "v=" + Date.now();

    xhr.open("GET", cacheBustedSource, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onSuccess(JSON.parse(xhr.responseText));
        } catch (error) {
          onFailure();
        }
        return;
      }

      onFailure();
    };
    xhr.onerror = onFailure;
    xhr.send();
  }

  function initKostasThoughts() {
    var section = document.querySelector("[data-kostas-thoughts]");
    if (!section) return;
    if (section.getAttribute("data-thoughts-ready") == "true" && thoughtsCache) return;
    if (isLoading) return;

    var embeddedData = getEmbeddedThoughtsData();
    if (embeddedData && hydrateThoughts(section, embeddedData)) return;

    var source = section.getAttribute("data-source") || "/kostas-thoughts/posts.json";
    isLoading = true;

    loadThoughts(
      source,
      function (data) {
        hydrateThoughts(section, data);
        isLoading = false;
      },
      function () {
        isLoading = false;
      }
    );
  }

  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", initKostasThoughts);
  } else {
    initKostasThoughts();
  }

  window.addEventListener("pageshow", function () {
    var section = document.querySelector("[data-kostas-thoughts]");
    if (!section) return;

    if (section.hidden || section.getAttribute("data-thoughts-ready") != "true") {
      initKostasThoughts();
    } else {
      window.requestAnimationFrame(function () {
        updateThoughtExpansion(section, true);
      });
    }
  });
})();
