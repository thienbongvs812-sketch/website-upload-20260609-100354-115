function selectAll(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHero();
  setupCardScopes();
});

function setupMenu() {
  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = selectAll("[data-hero-slide]", root);
  var dots = selectAll("[data-hero-dot]", root);
  if (slides.length === 0) {
    return;
  }
  var index = 0;
  var timer = null;
  function show(next) {
    slides[index].classList.remove("is-active");
    if (dots[index]) {
      dots[index].classList.remove("is-active");
    }
    index = (next + slides.length) % slides.length;
    slides[index].classList.add("is-active");
    if (dots[index]) {
      dots[index].classList.add("is-active");
    }
  }
  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      if (timer) {
        window.clearInterval(timer);
      }
      show(dotIndex);
      start();
    });
  });
  start();
}

function setupCardScopes() {
  selectAll("[data-card-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var typeButtons = selectAll("[data-filter-button]", scope);
    var categoryButtons = selectAll("[data-category-button]", scope);
    var cards = selectAll("[data-movie-card]", scope);
    var empty = scope.querySelector("[data-empty]");
    var activeType = "all";
    var activeCategory = "all";

    if (input && scope.getAttribute("data-use-query") === "true") {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      input.value = query;
    }

    function apply() {
      var queryText = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "movie";
        var category = card.getAttribute("data-category") || "";
        var typeMatch = activeType === "all" || type === activeType;
        var categoryMatch = activeCategory === "all" || category === activeCategory;
        var queryMatch = !queryText || search.indexOf(queryText) !== -1;
        var matched = typeMatch && categoryMatch && queryMatch;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = button.getAttribute("data-filter-value") || "all";
        typeButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-category-value") || "all";
        categoryButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    apply();
  });
}
