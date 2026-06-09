(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-mobile-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
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

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            show(0);
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var typeFilter = scope.querySelector("[data-type-filter]");
            var yearFilter = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var emptyState = scope.querySelector("[data-empty-state]");

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function applyFilters() {
                var keyword = valueOf(input);
                var typeValue = valueOf(typeFilter);
                var yearValue = valueOf(yearFilter);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesType = !typeValue || (card.getAttribute("data-type") || "").toLowerCase() === typeValue;
                    var matchesYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
                    var showCard = matchesKeyword && matchesType && matchesYear;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            }

            [input, typeFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilters);
                    element.addEventListener("change", applyFilters);
                }
            });
        });
    });
})();
