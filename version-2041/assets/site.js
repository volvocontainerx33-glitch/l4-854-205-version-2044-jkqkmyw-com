(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function lower(text) {
    return (text || "").toString().toLowerCase();
  }

  function setText(el, text) {
    el.textContent = text == null ? "" : String(text);
  }

  function createCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    var poster = document.createElement("a");
    poster.className = "movie-poster";
    poster.href = item.url;
    var img = document.createElement("img");
    img.src = item.cover;
    img.alt = item.title;
    var shade = document.createElement("span");
    shade.className = "poster-shade";
    var play = document.createElement("span");
    play.className = "poster-play";
    play.textContent = "▶";
    var score = document.createElement("span");
    score.className = "movie-score";
    setText(score, item.rating);
    poster.appendChild(img);
    poster.appendChild(shade);
    poster.appendChild(play);
    poster.appendChild(score);
    var info = document.createElement("div");
    info.className = "movie-info";
    var title = document.createElement("a");
    title.className = "movie-title";
    title.href = item.url;
    setText(title, item.title);
    var meta = document.createElement("div");
    meta.className = "movie-meta";
    [item.year, item.region, item.type].forEach(function (value) {
      var span = document.createElement("span");
      setText(span, value);
      meta.appendChild(span);
    });
    var line = document.createElement("p");
    line.className = "movie-line";
    setText(line, item.one_line);
    var tags = document.createElement("div");
    tags.className = "tag-row";
    (item.tags || []).slice(0, 4).forEach(function (tag) {
      var span = document.createElement("span");
      setText(span, tag);
      tags.appendChild(span);
    });
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(line);
    info.appendChild(tags);
    article.appendChild(poster);
    article.appendChild(info);
    return article;
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var clear = document.querySelector("[data-filter-clear]");
    var chipValue = "";

    function apply() {
      var q = lower(input.value + " " + chipValue).trim();
      cards.forEach(function (card) {
        var text = lower(card.getAttribute("data-search"));
        var hit = !q || q.split(/\s+/).every(function (word) {
          return text.indexOf(word) !== -1;
        });
        card.classList.toggle("is-hidden", !hit);
      });
    }

    input.addEventListener("input", apply);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        chipValue = chip.getAttribute("data-filter-chip") || "";
        apply();
      });
    });
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        chipValue = "";
        chips.forEach(function (item) {
          item.classList.toggle("active", !item.getAttribute("data-filter-chip"));
        });
        apply();
      });
    }
  }

  function initSearchPage() {
    var box = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-global-search-input]");
    if (!box || !window.SITE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render(q) {
      var query = lower(q).trim();
      if (!query) {
        return;
      }
      var words = query.split(/\s+/);
      var results = window.SITE_SEARCH_DATA.filter(function (item) {
        var hay = lower([item.title, item.region, item.type, item.year, item.genre, item.category, item.one_line, (item.tags || []).join(" ")].join(" "));
        return words.every(function (word) {
          return hay.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      box.innerHTML = "";
      results.forEach(function (item) {
        box.appendChild(createCard(item));
      });
      if (!results.length) {
        var empty = document.createElement("p");
        empty.className = "detail-lead";
        setText(empty, "没有找到匹配影片，可尝试更换片名、年份、地区或类型关键词。");
        box.appendChild(empty);
      }
    }

    render(initial);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
}());

function initMoviePlayer(source) {
  var video = document.getElementById("player-video");
  var cover = document.getElementById("player-cover");
  if (!video || !cover || !source) {
    return;
  }
  var hlsInstance = null;
  var started = false;

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function attach() {
    if (started) {
      playVideo();
      return;
    }
    started = true;
    cover.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      playVideo();
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
    } else {
      video.src = source;
      playVideo();
    }
  }

  cover.addEventListener("click", attach);
  video.addEventListener("click", function () {
    if (!started) {
      attach();
    } else if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
