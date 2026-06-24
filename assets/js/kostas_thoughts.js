(function () {
  function cleanThoughtText(text) {
    return text
      .replace(/^#KostasThoughts\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function entryFromElement(element) {
    var clone = element.cloneNode(true);
    var dateNode = clone.querySelector("[data-thought-date], time, .date, .post-meta");
    var date = "";

    if (dateNode) {
      date = dateNode.getAttribute("datetime") || dateNode.textContent.trim();
      dateNode.remove();
    }

    var text = cleanThoughtText(clone.textContent || "");
    if (!text || text.length < 12) return null;

    return { text: text, date: date };
  }

  function parseThoughts(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var selectors = [
      "[data-thought]",
      ".thought",
      ".kosta-thought",
      ".kostas-thought",
      "article blockquote",
      "main blockquote",
      "article li",
      "main li",
      "article p",
      "main p"
    ];
    var seen = {};
    var thoughts = [];

    selectors.forEach(function (selector) {
      Array.prototype.forEach.call(doc.querySelectorAll(selector), function (element) {
        var thought = entryFromElement(element);
        if (!thought || seen[thought.text]) return;
        seen[thought.text] = true;
        thoughts.push(thought);
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
    var source = section.getAttribute("data-source") || "/kostas-thoughts/";

    fetch(source, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("Thought source unavailable");
        return response.text();
      })
      .then(function (html) {
        var thoughts = parseThoughts(html);
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
