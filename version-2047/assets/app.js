(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('#site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
      var input = document.querySelector('#movie-search');
      var select = document.querySelector('#movie-year');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
      var activeCategory = '';
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input && initial) {
        input.value = initial;
      }

      function normalize(text) {
        return String(text || '').toLowerCase();
      }

      function apply() {
        var q = normalize(input ? input.value : '');
        var year = select ? select.value : '';
        cards.forEach(function (card) {
          var hay = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var passText = !q || hay.indexOf(q) !== -1;
          var passYear = !year || card.getAttribute('data-year') === year;
          var passCategory = !activeCategory || card.getAttribute('data-category') === activeCategory;
          card.classList.toggle('hidden-card', !(passText && passYear && passCategory));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (other) {
            other.classList.remove('active');
          });
          chip.classList.add('active');
          activeCategory = chip.getAttribute('data-category') || '';
          apply();
        });
      });
      apply();
    }
  });
})();
