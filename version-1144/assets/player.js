(function() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function(player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".play-cover");
    var source = video ? video.getAttribute("data-video") : "";
    var ready = false;
    var hls = null;

    function prepare() {
      if (!video || !source || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      prepare();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.setAttribute("controls", "controls");
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function() {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (!ready) {
          start();
        }
      });
    }

    window.addEventListener("beforeunload", function() {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
