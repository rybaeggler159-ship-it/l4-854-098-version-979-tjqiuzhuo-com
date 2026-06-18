(() => {
    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    const normalize = (value) => String(value || "").trim().toLowerCase();

    function initMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", () => {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = 0;
        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === index;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };
        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };
        prev && prev.addEventListener("click", () => {
            show(index - 1);
            start();
        });
        next && next.addEventListener("click", () => {
            show(index + 1);
            start();
        });
        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-section]").forEach((panel) => {
            const host = panel.parentElement || document;
            const input = panel.querySelector("[data-search-input]");
            const category = panel.querySelector("[data-filter-category]");
            const region = panel.querySelector("[data-filter-region]");
            const type = panel.querySelector("[data-filter-type]");
            const year = panel.querySelector("[data-filter-year]");
            const count = panel.querySelector("[data-filter-count]");
            const cards = Array.from(host.querySelectorAll("[data-movie-card]"));
            const apply = () => {
                const keyword = normalize(input && input.value);
                const categoryValue = normalize(category && category.value);
                const regionValue = normalize(region && region.value);
                const typeValue = normalize(type && type.value);
                const yearValue = normalize(year && year.value);
                let visible = 0;
                cards.forEach((card) => {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.category,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    const matched = (!keyword || haystack.includes(keyword)) &&
                        (!categoryValue || normalize(card.dataset.category) === categoryValue) &&
                        (!regionValue || normalize(card.dataset.region) === regionValue) &&
                        (!typeValue || normalize(card.dataset.type) === typeValue) &&
                        (!yearValue || normalize(card.dataset.year) === yearValue);
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visible);
                }
            };
            [input, category, region, type, year].forEach((control) => {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach((player) => {
            const video = player.querySelector("video");
            const button = player.querySelector("[data-play-button]");
            const cover = player.querySelector("[data-cover]");
            if (!video) {
                return;
            }
            const stream = video.getAttribute("data-stream");
            let prepared = false;
            const prepare = () => {
                if (prepared || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        maxBufferLength: 60,
                        enableWorker: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    player.hls = hls;
                    return;
                }
                video.src = stream;
                video.load();
            };
            const play = () => {
                prepare();
                player.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                const attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(() => {});
                }
            };
            if (button) {
                button.addEventListener("click", play);
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
        });
    }

    ready(() => {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
