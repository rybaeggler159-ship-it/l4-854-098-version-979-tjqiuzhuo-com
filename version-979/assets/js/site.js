
(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 6200);
      }

      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          schedule();
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          schedule();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          schedule();
        });
      });
      schedule();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var noResults = document.querySelector("[data-no-results]");
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function matchesFilter(card) {
      if (activeFilter === "all") {
        return true;
      }
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" ");
      return normalize(haystack).indexOf(normalize(activeFilter)) !== -1;
    }

    function applySearch() {
      var keyword = searchInput ? normalize(searchInput.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ");
        var ok = normalize(haystack).indexOf(keyword) !== -1 && matchesFilter(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", cards.length > 0 && visible === 0);
      }
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", applySearch);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "all";
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });
})();
