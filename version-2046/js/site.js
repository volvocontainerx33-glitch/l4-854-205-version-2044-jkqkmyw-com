(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function scheduleSlides() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                activateSlide(activeIndex + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            activateSlide(index);
            scheduleSlides();
        });
    });

    scheduleSlides();

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var searchInput = panel.querySelector('[data-filter-search]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var genreSelect = panel.querySelector('[data-filter-genre]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var emptyState = scope.querySelector('[data-empty-state]');
        var resultStatus = panel.querySelector('[data-result-status]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(searchInput && searchInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var genre = normalize(genreSelect && genreSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.category
                ].join(' '));
                var cardRegion = normalize(card.dataset.region);
                var cardYear = normalize(card.dataset.year);
                var cardGenre = normalize(card.dataset.genre);
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }

            if (resultStatus) {
                resultStatus.textContent = visible === 0 ? '没有匹配的影片。' : '影片列表已更新。';
            }
        }

        [searchInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
