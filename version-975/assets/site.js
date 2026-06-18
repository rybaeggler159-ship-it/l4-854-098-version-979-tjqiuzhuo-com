(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var next = carousel.querySelector("[data-hero-next]");
    var prev = carousel.querySelector("[data-hero-prev]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupFilters() {
    var list = document.querySelector("[data-card-list]");
    var input = document.querySelector("[data-filter-input]");
    if (!list || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var initial = getQueryValue("q");

    if (initial) {
      input.value = initial;
    }

    function matches(card, attr, value) {
      if (!value) {
        return true;
      }
      return (card.getAttribute(attr) || "") === value;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-text") || "").toLowerCase();
        var visible = (!query || haystack.indexOf(query) !== -1)
          && matches(card, "data-region", regionValue)
          && matches(card, "data-type", typeValue)
          && matches(card, "data-year", yearValue);
        card.classList.toggle("is-filtered-out", !visible);
      });
    }

    input.addEventListener("input", apply);
    [region, type, year].forEach(function (select) {
      if (select) {
        select.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    if (!video || !cover || !streamUrl) {
      return;
    }
    var initialized = false;
    var hlsInstance = null;

    function attach() {
      if (initialized) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      initialized = true;
    }

    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!initialized || video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();
