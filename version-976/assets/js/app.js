(function () {
  var mobileToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindCardFilters(scope) {
    var searchInput = scope.querySelector('[data-search]');
    var select = scope.querySelector('[data-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    if (!searchInput && !select) {
      return;
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var filter = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var year = normalize(card.getAttribute('data-year'));
        var keywordMatched = !keyword || haystack.indexOf(keyword) > -1;
        var filterMatched = !filter || year === filter || haystack.indexOf(filter) > -1;

        card.classList.toggle('is-hidden', !(keywordMatched && filterMatched));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (select) {
      select.addEventListener('change', applyFilters);
    }
  }

  bindCardFilters(document);

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-loader]');

      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hlsInstance = null;

    function hideCover() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function attachStream() {
      if (!video || !streamUrl || attached) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }

        video.src = streamUrl;
        attached = true;
      }).catch(function () {
        video.src = streamUrl;
        attached = true;
      });
    }

    function playVideo() {
      attachStream().then(function () {
        hideCover();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', hideCover);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });

  var pageInput = document.querySelector('[data-search-page-input]');
  var pageButton = document.querySelector('[data-search-page-button]');
  var pageResults = document.querySelector('[data-search-page-results]');

  if (pageInput && pageResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    pageInput.value = initialKeyword;

    function cardHtml(movie) {
      return [
        '<a class="movie-card" href="' + movie.file + '">',
        '  <span class="poster-wrap">',
        '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <em>' + movie.year + '</em>',
        '  </span>',
        '  <span class="movie-info">',
        '    <strong>' + movie.title + '</strong>',
        '    <small>' + movie.region + ' · ' + movie.type + ' · ' + movie.genre + '</small>',
        '    <span>' + movie.oneLine + '</span>',
        '  </span>',
        '</a>'
      ].join('');
    }

    function renderSearch() {
      var keyword = normalize(pageInput.value);
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine
        ].join(' '));

        return !keyword || haystack.indexOf(keyword) > -1;
      }).slice(0, keyword ? 120 : 60);

      pageResults.innerHTML = list.map(cardHtml).join('');
    }

    pageInput.addEventListener('input', renderSearch);

    if (pageButton) {
      pageButton.addEventListener('click', renderSearch);
    }

    renderSearch();
  }
})();
