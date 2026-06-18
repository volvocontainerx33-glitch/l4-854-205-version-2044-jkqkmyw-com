(function () {
    var video = document.getElementById('moviePlayer');
    var button = document.getElementById('playButton');

    if (!video || !button) {
        return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;

    function prepareVideo() {
        if (!stream || video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            video.hlsInstance = hlsInstance;
        } else {
            video.src = stream;
        }

        video.dataset.ready = 'true';
    }

    function startVideo() {
        prepareVideo();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    button.addEventListener('click', startVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
})();
