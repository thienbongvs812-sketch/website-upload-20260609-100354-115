(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.classList.toggle('open', opened);
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initScrollers() {
    document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll-target'));
        if (!target) {
          return;
        }
        var direction = button.getAttribute('data-scroll-dir') === 'left' ? -1 : 1;
        target.scrollBy({ left: direction * 420, behavior: 'smooth' });
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="card-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-badge">▶</span>',
      '    <span class="card-category">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p>' + escapeHtml(limitText(movie.oneLine || '', 62)) + '</p>',
      '    <div class="card-meta"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '    <div class="card-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearch() {
    var form = document.getElementById('searchForm');
    var results = document.getElementById('searchResults');
    if (!form || !results || !window.MOVIE_LIST) {
      return;
    }
    var input = document.getElementById('searchInput');
    var category = document.getElementById('categoryFilter');
    var year = document.getElementById('yearFilter');
    var type = document.getElementById('typeFilter');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render() {
      var keyword = normalize(input ? input.value : '');
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var list = window.MOVIE_LIST.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !categoryValue || movie.category === categoryValue;
        var matchYear = !yearValue || movie.year === yearValue;
        var matchType = !typeValue || normalize(movie.type).indexOf(normalize(typeValue)) !== -1;
        return matchKeyword && matchCategory && matchYear && matchType;
      }).slice(0, 120);
      results.innerHTML = list.length ? list.map(cardTemplate).join('') : '<div class="empty-state">没有找到相关影片</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var url = new URL(window.location.href);
      var value = input ? input.value.trim() : '';
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    });
    [input, category, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });
    render();
  }

  function initListingFilters() {
    document.querySelectorAll('[data-listing-filter]').forEach(function (bar) {
      var root = bar.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card-list] .movie-card'));
      var input = bar.querySelector('[data-filter-keyword]');
      var year = bar.querySelector('[data-filter-year]');
      var type = bar.querySelector('[data-filter-type]');
      var empty = root.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var yearValue = year ? year.value : '';
        var typeValue = normalize(type ? type.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var matchType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
          var show = matchKeyword && matchYear && matchType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
      }

      function play() {
        load();
        player.classList.add('playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('pointerdown', load, { once: true });
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function limitText(value, length) {
    value = String(value || '').trim();
    return value.length > length ? value.slice(0, length) + '…' : value;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  ready(function () {
    initMenu();
    initHero();
    initScrollers();
    initSearch();
    initListingFilters();
    initPlayers();
  });
})();
