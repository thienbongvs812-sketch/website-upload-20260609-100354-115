(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.hidden = !mobileNav.hidden;
      menuButton.textContent = mobileNav.hidden ? '☰' : '×';
    });
  }

  var slides = all('[data-hero-slide]');
  var dots = all('[data-hero-dot]');
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var movies = window.SEARCH_MOVIES || [];
  all('.site-search').forEach(function (input) {
    var box = input.parentElement.querySelector('.search-results');
    function close() {
      if (box) {
        box.hidden = true;
      }
    }
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      if (!box || value.length < 1) {
        close();
        return;
      }
      var result = movies.filter(function (item) {
        return item.keywords.indexOf(value) !== -1;
      }).slice(0, 12);
      if (!result.length) {
        box.innerHTML = '<div class="search-item"><strong>暂无匹配</strong><span>换个关键词试试</span></div>';
        box.hidden = false;
        return;
      }
      box.innerHTML = result.map(function (item) {
        return '<a class="search-item" href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></a>';
      }).join('');
      box.hidden = false;
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });
    document.addEventListener('click', function (event) {
      if (!input.parentElement.contains(event.target)) {
        close();
      }
    });
  });

  var filterGrid = document.querySelector('.filter-grid');
  if (filterGrid) {
    var cards = all('[data-card]', filterGrid);
    var categoryInput = document.querySelector('.category-search');
    var selects = all('.filter-select');
    function applyFilters() {
      var query = categoryInput ? categoryInput.value.trim().toLowerCase() : '';
      var values = {};
      selects.forEach(function (select) {
        values[select.getAttribute('data-filter')] = select.value;
      });
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-year'), card.getAttribute('data-genre')].join(' ').toLowerCase();
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (values.region && card.getAttribute('data-region') !== values.region) {
          ok = false;
        }
        if (values.year && card.getAttribute('data-year') !== values.year) {
          ok = false;
        }
        card.hidden = !ok;
      });
    }
    if (categoryInput) {
      categoryInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }
}());
