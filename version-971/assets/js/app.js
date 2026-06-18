(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var root = panel.parentElement || document;
    var list = root.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
    var input = panel.querySelector('[data-filter-input]');
    var clearButton = panel.querySelector('[data-clear-filter]');

    function applyFilter(value) {
      if (!list) {
        return;
      }
      var query = normalize(value);
      list.querySelectorAll('.movie-card').forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        applyFilter('');
      });
    }

    panel.querySelectorAll('[data-filter-key]').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-filter-key') || '';
        if (input) {
          input.value = key;
        }
        applyFilter(key);
      });
    });

    panel.querySelectorAll('[data-jump]').forEach(function (button) {
      button.addEventListener('click', function () {
        var href = button.getAttribute('data-jump');
        if (href) {
          window.location.href = href;
        }
      });
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  });

  window.MovieSite = window.MovieSite || {};

  window.MovieSite.initPlayer = function (url) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var attached = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
