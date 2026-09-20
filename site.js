/* Hub interactions — progressive enhancement only */
(function () {
  "use strict";

  // Smooth-scroll offset for sticky header when using hash links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: "smooth" });
      if (history.pushState) history.pushState(null, "", id);
    });
  });

  // Mark cards that 404 is impossible to know client-side; instead soft-highlight current path
  var path = decodeURIComponent(location.pathname.replace(/\\/g, "/"));
  document.querySelectorAll(".card[href]").forEach(function (card) {
    var href = card.getAttribute("href") || "";
    var folder = href.replace(/^\.\//, "").replace(/\/$/, "");
    if (!folder) return;
    if (path.indexOf(folder) !== -1 || path.indexOf(encodeURI(folder)) !== -1) {
      card.setAttribute("aria-current", "page");
    }
  });
})();
