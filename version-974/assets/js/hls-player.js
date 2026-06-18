(function () {
  function attach(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var player = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      player.loadSource(source);
      player.attachMedia(video);
      return;
    }
    video.src = source;
  }

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;
    function play() {
      if (!started) {
        attach(video, source);
        started = true;
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!started) {
        play();
      }
    });
  };
})();
