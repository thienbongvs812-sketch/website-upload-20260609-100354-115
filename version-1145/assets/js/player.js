(function () {
  var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  playerBlocks.forEach(function (playerBlock) {
    var video = playerBlock.querySelector('video');
    var overlay = playerBlock.querySelector('.player-overlay');
    var button = playerBlock.querySelector('.play-button');
    var source = playerBlock.getAttribute('data-video');
    var hlsInstance = null;
    var isReady = false;

    function attachSource() {
      if (!video || !source || isReady) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        isReady = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        isReady = true;
        return;
      }

      video.src = source;
      isReady = true;
    }

    function startPlayback() {
      attachSource();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
