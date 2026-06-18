(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        restart();
      });
    });

    show(0);
    restart();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const cards = Array.from(document.querySelectorAll('.searchable-card'));

  function applyFilters() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const category = categoryFilter ? categoryFilter.value : '';

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title || '',
        card.dataset.genre || '',
        card.dataset.region || '',
        card.dataset.year || '',
        card.dataset.category || ''
      ].join(' ').toLowerCase();

      const keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      const yearMatched = !year || (card.dataset.year || '') === year;
      const categoryMatched = !category || (card.dataset.category || '') === category;

      card.classList.toggle('is-hidden-by-filter', !(keywordMatched && yearMatched && categoryMatched));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }
})();
