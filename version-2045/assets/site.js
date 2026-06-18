(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute("data-" + key) || "";
      raw.split(/\s+/).forEach(function (value) {
        var item = value.trim();
        if (item && values.indexOf(item) === -1) {
          values.push(item);
        }
      });
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select || select.options.length > 1) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var list = document.querySelector("[data-card-list]");
    var form = document.querySelector("[data-filter-form]");
    if (!list || !form) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var input = form.querySelector("[data-search-input]");
    var typeSelect = form.querySelector('[data-filter-select="type"]');
    var regionSelect = form.querySelector('[data-filter-select="region"]');
    var yearSelect = form.querySelector('[data-filter-select="year"]');
    var empty = document.querySelector("[data-no-result]");
    fillSelect(typeSelect, uniqueValues(cards, "type"));
    fillSelect(regionSelect, uniqueValues(cards, "region"));
    fillSelect(yearSelect, uniqueValues(cards, "year"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    function match(card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (type && card.getAttribute("data-type") !== type) {
        return false;
      }
      if (region && card.getAttribute("data-region") !== region) {
        return false;
      }
      if (year && card.getAttribute("data-year") !== year) {
        return false;
      }
      return true;
    }
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [input, typeSelect, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    form.addEventListener("submit", function (event) {
      if (window.location.pathname.indexOf("search.html") !== -1) {
        event.preventDefault();
        apply();
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupFilters();
  });
})();
