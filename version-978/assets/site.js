(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    document.querySelectorAll(".js-hero-carousel").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      if (slides.length < 2) {
        return;
      }
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function bindFilters() {
    document.querySelectorAll(".js-filter-scope").forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var empty = scope.querySelector("[data-filter-empty]");

      var regions = [];
      var types = [];
      var years = [];
      cards.forEach(function (card) {
        if (card.dataset.region && regions.indexOf(card.dataset.region) === -1) {
          regions.push(card.dataset.region);
        }
        if (card.dataset.type && types.indexOf(card.dataset.type) === -1) {
          types.push(card.dataset.type);
        }
        if (card.dataset.year && years.indexOf(card.dataset.year) === -1) {
          years.push(card.dataset.year);
        }
      });
      fillSelect(region, regions.sort());
      fillSelect(type, types.sort());
      fillSelect(year, years.sort().reverse());

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" ").toLowerCase();
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedRegion && card.dataset.region !== selectedRegion) {
            matched = false;
          }
          if (selectedType && card.dataset.type !== selectedType) {
            matched = false;
          }
          if (selectedYear && card.dataset.year !== selectedYear) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function bindGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./movies.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindFilters();
    bindGlobalSearch();
  });
})();

function initMoviePlayer(videoId, buttonId, overlayId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;
  var hls = null;

  function prepare() {
    if (prepared || !video || !source) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }
  if (overlay && overlay !== button) {
    overlay.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (!video.currentTime && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
