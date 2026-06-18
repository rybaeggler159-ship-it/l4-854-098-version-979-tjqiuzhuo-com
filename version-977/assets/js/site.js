(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var list = scope.querySelector('[data-movie-list]');
            if (!list) {
                list = document.querySelector('[data-movie-list]');
            }
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.children);
            var search = panel.querySelector('[data-search-input]');
            var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
            var regionButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-region]'));
            var count = panel.querySelector('[data-filter-count]');
            var state = {
                text: '',
                type: 'all',
                region: 'all'
            };

            function activate(buttons, attr, value) {
                buttons.forEach(function (button) {
                    button.classList.toggle('is-active', button.getAttribute(attr) === value);
                });
            }

            function apply() {
                var visible = 0;
                items.forEach(function (item) {
                    var keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
                    var title = (item.getAttribute('data-title') || '').toLowerCase();
                    var type = item.getAttribute('data-type') || '';
                    var region = item.getAttribute('data-region') || '';
                    var matchText = !state.text || keywords.indexOf(state.text) >= 0 || title.indexOf(state.text) >= 0;
                    var matchType = state.type === 'all' || type === state.type;
                    var matchRegion = state.region === 'all' || region === state.region;
                    var matched = matchText && matchType && matchRegion;
                    item.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部影片';
                }
            }

            if (search) {
                search.addEventListener('input', function () {
                    state.text = search.value.trim().toLowerCase();
                    apply();
                });
            }

            typeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    state.type = button.getAttribute('data-filter-type') || 'all';
                    activate(typeButtons, 'data-filter-type', state.type);
                    apply();
                });
            });

            regionButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    state.region = button.getAttribute('data-filter-region') || 'all';
                    activate(regionButtons, 'data-filter-region', state.region);
                    apply();
                });
            });

            activate(typeButtons, 'data-filter-type', 'all');
            activate(regionButtons, 'data-filter-region', 'all');
            apply();
        });
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player');
        var playButton = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-player-status]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (initialized || !source) {
                return;
            }
            initialized = true;
            setStatus('正在加载视频源...');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('视频源已就绪');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络波动，正在重试加载');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体解码异常，正在恢复');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('视频暂时无法播放');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('视频源已就绪');
            } else {
                video.src = source;
                setStatus('当前浏览器可能需要支持 HLS 的播放环境');
            }
        }

        function playVideo() {
            attachSource();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setStatus('请再次点击播放或允许浏览器播放视频');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (playButton) {
                playButton.classList.remove('is-hidden');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
