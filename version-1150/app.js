(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                reset();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                reset();
            });
        });
        start();
    }

    function setupSearch() {
        var input = document.getElementById('site-search');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        if (!input || !cards.length) {
            return;
        }
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var empty = document.querySelector('[data-empty-state]');
        var activeFilter = '全部';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function matches(card, query, filter) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var queryOk = !query || text.indexOf(query) !== -1;
            var filterOk = filter === '全部' || text.indexOf(normalize(filter)) !== -1;
            return queryOk && filterOk;
        }

        function apply() {
            var query = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card, query, activeFilter);
                card.classList.toggle('hidden-card', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = chip.getAttribute('data-filter') || '全部';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }
        var shell = document.querySelector('[data-player-shell]');
        var button = document.querySelector('[data-player-action="play"]');
        var url = video.getAttribute('data-video-url');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !url) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === video || event.target === button) {
                    return;
                }
                play();
            });
        }
        video.addEventListener('pointerdown', attach, { once: true });
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
