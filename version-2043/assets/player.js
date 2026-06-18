const MoviePlayer = (function () {
  function init(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const cover = document.getElementById(options.coverId);
    let attached = false;
    let hls = null;

    if (!video || !options.source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        return;
      }

      video.src = options.source;
      video.load();
    }

    async function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      try {
        await video.play();
      } catch (error) {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        start();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
