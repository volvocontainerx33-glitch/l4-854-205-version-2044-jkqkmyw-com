(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachStream(shell) {
    var video = shell.querySelector("video");
    if (!video || shell.getAttribute("data-ready") === "1") {
      return Promise.resolve(video);
    }
    var url = video.getAttribute("data-stream");
    shell.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve(video);
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      shell._hls = hls;
      return Promise.resolve(video);
    }
    video.src = url;
    return Promise.resolve(video);
  }

  function play(shell) {
    var video = shell.querySelector("video");
    if (!video) {
      return;
    }
    attachStream(shell).then(function () {
      video.controls = true;
      shell.classList.add("is-playing");
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    });
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var trigger = shell.querySelector("[data-play-trigger]");
      var video = shell.querySelector("video");
      if (trigger) {
        trigger.addEventListener("click", function () {
          play(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play(shell);
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.seeking && video.currentTime === 0) {
            shell.classList.remove("is-playing");
          }
        });
      }
    });
    window.addEventListener("beforeunload", function () {
      players.forEach(function (shell) {
        if (shell._hls) {
          shell._hls.destroy();
        }
      });
    });
  });
})();
