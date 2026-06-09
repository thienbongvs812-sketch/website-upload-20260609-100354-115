function initMoviePlayer(streamUrl) {
    var player = document.querySelector("[data-movie-player]");
    if (!player) {
        return;
    }

    var video = player.querySelector("[data-player-video]");
    var overlay = player.querySelector("[data-player-overlay]");
    var errorBox = player.querySelector("[data-player-error]");
    var hlsInstance = null;
    var prepared = false;

    function showError() {
        if (errorBox) {
            errorBox.textContent = "视频加载失败，请稍后重试";
            errorBox.classList.add("show");
        }
    }

    function prepareVideo() {
        if (prepared || !video) {
            return;
        }
        prepared = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else {
            showError();
        }
    }

    function startVideo() {
        prepareVideo();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (video) {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
    }

    function toggleVideo() {
        if (!video) {
            return;
        }
        if (video.paused) {
            startVideo();
        } else {
            video.pause();
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startVideo);
    }

    if (video) {
        video.addEventListener("click", toggleVideo);
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
