(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function prefixPath(path) {
    var prefix = document.documentElement.getAttribute("data-prefix") || "";
    return prefix + path.replace(/^\.\//, "");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearch() {
    var input = document.querySelector("[data-site-search]");
    var panel = document.querySelector("[data-search-panel]");
    var form = input ? input.closest("form") : null;
    if (!input || !panel || !window.SITE_MOVIES) {
      return;
    }
    function render() {
      var query = input.value.trim().toLowerCase();
      panel.innerHTML = "";
      if (!query) {
        panel.classList.remove("is-open");
        return;
      }
      var results = window.SITE_MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.year, item.genre, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 12);
      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><div></div><small>没有找到匹配影片</small></div>';
        panel.classList.add("is-open");
        return;
      }
      results.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "search-result";
        link.href = prefixPath(item.url);
        link.innerHTML = '<img src="' + prefixPath(item.cover) + '" alt="">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<small>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.oneLine) + '</small></span>';
        panel.appendChild(link);
      });
      panel.classList.add("is-open");
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[char];
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var grids = document.querySelectorAll("[data-catalog-grid]");
    grids.forEach(function (grid) {
      var container = grid.closest(".container") || document;
      var keywordInput = container.querySelector("[data-card-search]");
      var regionSelect = container.querySelector("[data-region-filter]");
      var yearSelect = container.querySelector("[data-year-filter]");
      var empty = container.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));
      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var region = regionSelect ? regionSelect.value : "";
        var year = yearSelect ? parseInt(yearSelect.value, 10) : 0;
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            ok = false;
          }
          if (year && cardYear < year) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [keywordInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-player-play]");
      var source = shell.getAttribute("data-video-src");
      if (!video || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hls = hls;
      } else {
        video.src = source;
      }
      function playOrPause() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }
      if (button) {
        button.addEventListener("click", playOrPause);
      }
      video.addEventListener("click", playOrPause);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    });
  }

  onReady(function () {
    initMenu();
    initSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
