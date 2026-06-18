
(function () {
  window.bindMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var shell = video.closest("[data-player-shell]");
    var button = shell ? shell.querySelector("[data-play-button]") : null;
    var hlsInstance = null;

    function attachSource() {
      if (video.getAttribute("data-bound") === "1") {
        return;
      }
      video.setAttribute("data-bound", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 28,
          enableWorker: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
