(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("active");
      if (dots[index]) {
        dots[index].classList.remove("active");
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("active");
      if (dots[index]) {
        dots[index].classList.add("active");
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function renderResults(keyword) {
    var panel = document.getElementById("siteSearchResults");
    if (!panel) {
      return;
    }
    var query = String(keyword || "").trim().toLowerCase();
    if (!query) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var source = window.SEARCH_INDEX || [];
    var results = source.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.oneLine,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    }).slice(0, 18);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
      panel.hidden = false;
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>' +
        '<p>' + escapeHtml(item.oneLine) + '</p></span></a>';
    }).join("");
    panel.hidden = false;
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector('input[name="keyword"]');
      if (!input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderResults(input.value);
      });
      input.addEventListener("input", function () {
        renderResults(input.value);
      });
      input.addEventListener("focus", function () {
        renderResults(input.value);
      });
    });
    document.addEventListener("click", function (event) {
      var panel = document.getElementById("siteSearchResults");
      if (!panel || panel.hidden) {
        return;
      }
      if (event.target.closest("[data-search-form]") || event.target.closest("#siteSearchResults")) {
        return;
      }
      panel.hidden = true;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
