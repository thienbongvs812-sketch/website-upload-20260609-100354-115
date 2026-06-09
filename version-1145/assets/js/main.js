(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var activeIndex = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === activeIndex);
    });
  }

  function startSlider() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
    }

    if (slides.length > 1) {
      slideTimer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      showSlide(index);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var emptyResult = document.querySelector('[data-empty-result]');

  function getQueryText() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  if (filterInput && !filterInput.value) {
    filterInput.value = getQueryText();
  }

  function applyFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterSelect ? filterSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var yearMatch = !year || cardYear === year;
      var shouldShow = keywordMatch && yearMatch;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  applyFilter();
})();
