(function () {
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

  function renderThought(section, thoughts) {
    if (!thoughts.length) return;

    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    var textNode = section.querySelector("[data-thought-text]");
    var dateNode = section.querySelector("[data-thought-date]");
    var content = section.querySelector(".kostas-thoughts-card");

    content.classList.add("is-changing");

    window.setTimeout(function () {
      textNode.textContent = thought.text;
      if (thought.date) {
        dateNode.textContent = thought.date;
        dateNode.hidden = false;
      } else {
        dateNode.textContent = "";
        dateNode.hidden = true;
      }
      content.classList.remove("is-changing");
    }, 120);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.querySelector("[data-kostas-thoughts]");
    if (!section) return;
    var source = section.getAttribute("data-source") || "/kostas-thoughts/posts.json";

    fetch(source, { credentials: "same-origin", cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Thought source unavailable");
        return response.json();
      })
      .then(function (data) {
        var thoughts = parseThoughts(data);
        if (!thoughts.length) return;

        var button = section.querySelector("[data-another-thought]");

        section.hidden = false;
        renderThought(section, thoughts);

        if (button) {
          button.addEventListener("click", function () {
            renderThought(section, thoughts);
          });
        }
      })
      .catch(function () {
        section.hidden = true;
      });
  });
})();
