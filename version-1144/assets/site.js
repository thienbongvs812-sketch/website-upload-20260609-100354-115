(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterSelect = document.querySelector("[data-filter-select]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

  function applyLocalFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = filterSelect ? filterSelect.value : "";

    filterCards.forEach(function(card) {
      var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var yearMatched = !year || cardYear === year;
      card.style.display = keywordMatched && yearMatched ? "" : "none";
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyLocalFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyLocalFilter);
  }

  var searchRoot = document.querySelector("[data-search-results]");

  if (searchRoot && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-box]");

    if (input) {
      input.value = query;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="card-badge">' + escapeHtml(item.type) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<h2 class="card-title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p class="card-text">' + escapeHtml(item.description) + '</p>',
        '<div class="card-meta">',
        '<span>' + escapeHtml(item.year) + '</span>',
        '<span>' + escapeHtml(item.region) + '</span>',
        '<span>' + escapeHtml(item.genre) + '</span>',
        '</div>',
        '</div>',
        '</article>'
      ].join("");
    }

    var normalized = query.toLowerCase();
    var results = window.SEARCH_INDEX.filter(function(item) {
      var text = [item.title, item.description, item.region, item.type, item.genre, item.tags, item.category].join(" ").toLowerCase();
      return !normalized || text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (!query) {
      searchRoot.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签，快速查找想看的影片。</div>';
    } else if (!results.length) {
      searchRoot.innerHTML = '<div class="empty-state">没有找到相关影片，换个关键词再试试。</div>';
    } else {
      searchRoot.innerHTML = '<div class="grid cards">' + results.map(cardTemplate).join("") + '</div>';
    }
  }
})();
