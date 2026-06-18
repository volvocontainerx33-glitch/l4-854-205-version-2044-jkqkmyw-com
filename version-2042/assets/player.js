(function () {
  var video = document.getElementById('movieVideo');
  var overlay = document.querySelector('.player-overlay');
  var hls;
  var ready = false;

  function attach() {
    if (!video || ready || typeof mediaPath !== 'string' || !mediaPath) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaPath;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(mediaPath);
      hls.attachMedia(video);
      ready = true;
      return;
    }
    video.src = mediaPath;
    ready = true;
  }

  function play() {
    attach();
    if (overlay) overlay.classList.add('is-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        if (overlay) overlay.classList.remove('is-hidden');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) overlay.classList.remove('is-hidden');
    });
    video.addEventListener('ended', function () {
      if (overlay) overlay.classList.remove('is-hidden');
    });
  }
})();
