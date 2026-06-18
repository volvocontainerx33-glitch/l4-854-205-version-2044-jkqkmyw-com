(function () {
  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLiveFilter() {
    var input = document.querySelector('[data-live-search]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filterable]'));
    var count = document.querySelector('[data-filter-count]');
    function applyFilter() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize((card.dataset.title || '') + ' ' + (card.dataset.meta || '') + ' ' + card.textContent);
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }
    input.addEventListener('input', applyFilter);
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card card">' +
        '<a href="video/' + encodeURIComponent(movie.id) + '.html">' +
          '<div class="movie-cover">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="view-badge">' + escapeHtml(movie.viewsText) + '</span>' +
          '</div>' +
          '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
            '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initGlobalSearch() {
    var results = document.getElementById('globalSearchResults');
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = document.getElementById('globalSearchInput');
    var category = document.getElementById('globalSearchCategory');
    var year = document.getElementById('globalSearchYear');
    var button = document.getElementById('globalSearchButton');
    var count = document.getElementById('globalSearchCount');

    function runSearch() {
      var query = normalize(input && input.value);
      var cat = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.categoryName,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (cat && normalize(movie.categoryName) !== cat) {
          return false;
        }
        if (selectedYear && normalize(movie.year) !== selectedYear) {
          return false;
        }
        return true;
      }).slice(0, 240);

      results.innerHTML = matches.map(createSearchCard).join('');
      if (count) {
        count.textContent = matches.length + ' 条结果' + (matches.length === 240 ? '（最多显示 240 条）' : '');
      }
    }

    [input, category, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', runSearch);
        el.addEventListener('change', runSearch);
      }
    });
    if (button) {
      button.addEventListener('click', runSearch);
    }
    runSearch();
  }

  function initPlayer() {
    var video = document.querySelector('video[data-hls-source]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls-source');
    var button = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function initializePlayer() {
      if (!source) {
        setStatus('未找到可用播放源。');
        return;
      }
      if (initialized) {
        video.play().catch(function () {
          setStatus('播放已准备好，请再次点击视频控件。');
        });
        return;
      }
      initialized = true;
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在初始化 HLS 播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成。');
          video.play().catch(function () {
            setStatus('播放源已就绪，请点击视频控件开始播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络错误，正在尝试重新加载播放源。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体错误，正在尝试恢复播放。');
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放源初始化失败，请稍后重试。');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源加载完成。');
          video.play().catch(function () {
            setStatus('播放源已就绪，请点击视频控件开始播放。');
          });
        }, { once: true });
      } else {
        video.src = source;
        setStatus('当前浏览器可能不支持 M3U8，已尝试直接载入播放源。');
      }
    }

    if (button) {
      button.addEventListener('click', initializePlayer);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initCopySource() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-copy-source]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var source = button.getAttribute('data-copy-source');
        if (!source) {
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(source).then(function () {
            button.textContent = '已复制';
          }).catch(function () {
            button.textContent = '复制失败';
          });
        } else {
          var textarea = document.createElement('textarea');
          textarea.value = source;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          button.textContent = '已复制';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initLiveFilter();
    initGlobalSearch();
    initPlayer();
    initCopySource();
  });
})();
