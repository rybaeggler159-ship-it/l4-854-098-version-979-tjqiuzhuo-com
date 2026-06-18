(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

    function filterCards(scope) {
        var input = scope.querySelector(".site-search");
        var activeFilter = scope.querySelector(".filter-chip.active");
        var cardsRoot = scope.parentElement || document;
        var cards = Array.prototype.slice.call(cardsRoot.querySelectorAll(".movie-card"));
        var query = input ? input.value.trim().toLowerCase() : "";
        var filter = activeFilter ? activeFilter.getAttribute("data-filter") : "all";

        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type")
            ].join(" ").toLowerCase();
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || text.indexOf(filter.toLowerCase()) !== -1;
            card.style.display = matchesQuery && matchesFilter ? "" : "none";
        });
    }

    searchInputs.forEach(function (input) {
        var panel = input.closest(".search-panel");

        input.addEventListener("input", function () {
            filterCards(panel);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll(".filter-chip")).forEach(function (button) {
        button.addEventListener("click", function () {
            var panel = button.closest(".search-panel");
            Array.prototype.slice.call(panel.querySelectorAll(".filter-chip")).forEach(function (chip) {
                chip.classList.remove("active");
            });
            button.classList.add("active");
            filterCards(panel);
        });
    });
})();

function initMoviePlayer(videoId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.querySelector('[data-player-overlay="' + videoId + '"]');

    if (!video) {
        return;
    }

    function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.setAttribute("data-ready", "1");
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute("data-ready", "1");
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = url;
            video.setAttribute("data-ready", "1");
        }
    }

    function playVideo() {
        attachSource();

        if (overlay) {
            overlay.hidden = true;
        }

        video.play().catch(function () {});
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.hidden = true;
        }
    });

    video.addEventListener("ended", function () {
        if (overlay) {
            overlay.hidden = false;
        }
    });
}
