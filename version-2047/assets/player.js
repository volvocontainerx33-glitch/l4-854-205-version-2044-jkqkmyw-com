(function () {
  function setup() {
    var box = document.querySelector('.player-box');
    var video = document.querySelector('#movie-video');
    var button = document.querySelector('.play-overlay');
    if (!box || !video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var ready = false;

    function load() {
      if (ready || !source) {
        return;
      }
      ready = true;
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
    }

    function play() {
      load();
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });
  }

  if (document.readyState !== 'loading') {
    setup();
  } else {
    document.addEventListener('DOMContentLoaded', setup);
  }
})();
