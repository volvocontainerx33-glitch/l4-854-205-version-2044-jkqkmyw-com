(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) return;
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function searchTemplate(movie) {
    return '<a class="search-result" href="' + text(movie.link) + '">' +
      '<img src="' + text(movie.cover) + '" alt="' + text(movie.title) + '">' +
      '<span><strong>' + text(movie.title) + '</strong><span>' +
      text(movie.year) + ' · ' + text(movie.region) + ' · ' + text(movie.category) +
      '</span></span></a>';
  }

  function setupSearch() {
    var index = window.SEARCH_MOVIES || [];
    $all('.js-search-form').forEach(function (form) {
      var input = $('.js-search-input', form);
      var panel = $('.js-search-panel', form);
      if (!input || !panel) return;

      function render() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          panel.hidden = true;
          panel.innerHTML = '';
          return;
        }
        var words = q.split(/\s+/).filter(Boolean);
        var results = index.filter(function (movie) {
          var hay = movie.search.toLowerCase();
          return words.every(function (word) {
            return hay.indexOf(word) !== -1;
          });
        }).slice(0, 12);
        panel.innerHTML = results.length ? results.map(searchTemplate).join('') : '<div class="empty-search">没有找到匹配影片</div>';
        panel.hidden = false;
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      form.addEventListener('submit', function (event) {
        var q = input.value.trim().toLowerCase();
        if (!q) return;
        var first = index.find(function (movie) {
          return movie.search.toLowerCase().indexOf(q) !== -1;
        });
        if (first) {
          event.preventDefault();
          window.location.href = first.link;
        }
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          panel.hidden = true;
        }
      });
    });
  }

  function setupLocalFilters() {
    var input = $('[data-local-filter]');
    var year = $('[data-year-filter]');
    var type = $('[data-type-filter]');
    var cards = $all('[data-card]');
    if (!cards.length || (!input && !year && !type)) return;

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        var hay = [card.getAttribute('data-title'), card.getAttribute('data-genre')].join(' ').toLowerCase();
        var okKeyword = !keyword || hay.indexOf(keyword) !== -1;
        var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var okType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.classList.toggle('is-hidden', !(okKeyword && okYear && okType));
      });
    }

    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
    if (type) type.addEventListener('change', apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilters();
  });
})();
