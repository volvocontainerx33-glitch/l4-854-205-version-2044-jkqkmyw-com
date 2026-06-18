(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (slides.length < 2) {
      return;
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    restart();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var search = scope.querySelector("[data-filter-search]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var empty = root.querySelector("[data-empty-tip]");

      function value(el) {
        return el ? String(el.value || "").trim().toLowerCase() : "";
      }

      function apply() {
        var q = value(search);
        var t = value(type);
        var y = value(year);
        var r = value(region);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
          var cardType = String(card.getAttribute("data-type") || "").toLowerCase();
          var cardYear = String(card.getAttribute("data-year") || "").toLowerCase();
          var cardRegion = String(card.getAttribute("data-region") || "").toLowerCase();
          var match = true;
          if (q && haystack.indexOf(q) === -1) {
            match = false;
          }
          if (t && cardType !== t) {
            match = false;
          }
          if (y && cardYear !== y) {
            match = false;
          }
          if (r && cardRegion !== r) {
            match = false;
          }
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, type, year, region].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && search) {
        search.value = initial;
      }
      apply();
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    var shell = document.querySelector(".player-shell");
    var video = document.querySelector(".movie-video");
    var startButton = document.querySelector(".player-start");
    if (!shell || !video || !startButton || !sourceUrl) {
      return;
    }

    var hls = null;
    var readyState = false;

    function attachSource() {
      if (readyState) {
        return;
      }
      readyState = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attachSource();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      video.play().catch(function () {});
    }

    startButton.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
