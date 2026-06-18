(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var video = document.querySelector('video[data-stream]');

  if (video) {
    var source = video.getAttribute('data-stream');
    var layer = document.querySelector('[data-play-layer]');
    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play]'));
    var attached = false;

    function attachStream() {
      if (attached || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function playVideo() {
      attachStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      video.controls = true;
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', playVideo);
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', playVideo);
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim().toLowerCase() : '';
      var panel = document.querySelector('[data-search-panel]');
      var results = document.querySelector('[data-search-results]');
      var base = form.getAttribute('data-search-base') || '';

      if (!panel || !results || !window.SITE_SEARCH) {
        return;
      }

      if (!query) {
        panel.hidden = true;
        results.innerHTML = '';
        return;
      }

      var matches = window.SITE_SEARCH.filter(function (item) {
        return [item.title, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 30);

      panel.hidden = false;
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result" href="' + base + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></a>';
      }).join('') || '<div class="search-result"><strong>暂无匹配内容</strong><span>换一个关键词试试</span></div>';

      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  var libraryForm = document.querySelector('[data-library-filter]');
  var libraryGrid = document.querySelector('[data-library-grid]');

  if (libraryForm && libraryGrid) {
    var libraryCards = Array.prototype.slice.call(libraryGrid.querySelectorAll('[data-card-title]'));

    libraryForm.addEventListener('input', filterLibrary);
    libraryForm.addEventListener('change', filterLibrary);

    function filterLibrary() {
      var formData = new FormData(libraryForm);
      var query = String(formData.get('q') || '').trim().toLowerCase();
      var category = String(formData.get('category') || '');

      libraryCards.forEach(function (card) {
        var text = [
          card.getAttribute('data-card-title') || '',
          card.getAttribute('data-card-genre') || '',
          card.getAttribute('data-card-region') || '',
          card.getAttribute('data-card-category') || ''
        ].join(' ').toLowerCase();
        var cardCategory = card.getAttribute('data-card-category') || '';
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedCategory = !category || cardCategory === category;
        card.style.display = matchedQuery && matchedCategory ? '' : 'none';
      });
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
