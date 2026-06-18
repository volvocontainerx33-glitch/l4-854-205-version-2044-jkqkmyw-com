(function () {
  var video = document.getElementById('movie-video');
  var startButton = document.getElementById('player-start');
  if (!video || !startButton) return;

  var url = video.getAttribute('data-play-url');
  var started = false;
  var hls = null;

  function attach() {
    if (started || !url) return;
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    attach();
    startButton.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  }

  startButton.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      startButton.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
