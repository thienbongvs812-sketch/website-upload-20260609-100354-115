var hlsScriptSource = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
var hlsLoader = null;

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(true);
  }
  if (hlsLoader) {
    return hlsLoader;
  }
  hlsLoader = new Promise(function (resolve) {
    var script = document.createElement("script");
    script.src = hlsScriptSource;
    script.async = true;
    script.onload = function () {
      resolve(Boolean(window.Hls));
    };
    script.onerror = function () {
      resolve(false);
    };
    document.head.appendChild(script);
  });
  return hlsLoader;
}

document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("[data-player]");
  if (!root) {
    return;
  }
  var video = root.querySelector("video");
  var button = root.querySelector("[data-play-button]");
  if (!video || !button) {
    return;
  }
  var source = video.getAttribute("data-hls") || "";
  var hlsInstance = null;
  var attached = false;

  function attachWithNative() {
    video.src = source;
    attached = true;
    return Promise.resolve(true);
  }

  function attachWithHls() {
    return loadHlsLibrary().then(function (loaded) {
      if (loaded && window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
            attached = false;
          }
        });
        attached = true;
        return true;
      }
      return attachWithNative();
    });
  }

  function startVideo() {
    if (!source) {
      return;
    }
    button.classList.add("is-loading");
    var setup = attached ? Promise.resolve(true) : (video.canPlayType("application/vnd.apple.mpegurl") ? attachWithNative() : attachWithHls());
    setup.then(function () {
      button.classList.remove("is-loading");
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    });
  }

  button.addEventListener("click", startVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });
});
