/*
 * Klipin — trim.js
 * Real, working video trimming — runs 100% in the browser via
 * ffmpeg.wasm (WebAssembly). No file is ever uploaded to a server,
 * no API key, no login.
 *
 * Requires ffmpeg.min.js (loaded in index.html <head>) which exposes
 * a global `FFmpeg` object.
 */
(function () {
  "use strict";

  var drop = document.querySelector("[data-drop]");
  var fileInput = document.querySelector("[data-file-input]");
  var editor = document.querySelector("[data-editor]");
  var preview = document.querySelector("[data-preview]");

  var startSlider = document.querySelector("[data-start]");
  var endSlider = document.querySelector("[data-end]");
  var fill = document.querySelector("[data-fill]");
  var startLabel = document.querySelector("[data-start-label]");
  var endLabel = document.querySelector("[data-end-label]");
  var clipDurationLabel = document.querySelector("[data-clip-duration]");
  var preciseCheckbox = document.querySelector("[data-precise]");

  var cutBtn = document.querySelector("[data-cut-btn]");
  var resetBtn = document.querySelector("[data-reset-btn]");

  var progressWrap = document.querySelector("[data-progress]");
  var progressFill = document.querySelector("[data-progress-fill]");
  var progressLabel = document.querySelector("[data-progress-label]");

  var resultWrap = document.querySelector("[data-result]");
  var resultVideo = document.querySelector("[data-result-video]");
  var downloadBtn = document.querySelector("[data-download-btn]");

  var errorEl = document.querySelector("[data-error]");

  if (!drop || !fileInput) return; // section not present on this page

  var ffmpeg = null;
  var currentFile = null;
  var videoDuration = 0;

  /* ---------- helpers ---------- */
  function formatTime(sec) {
    sec = Math.max(0, sec || 0);
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function updateRangeUI() {
    var s = parseFloat(startSlider.value);
    var e = parseFloat(endSlider.value);
    if (s > e) { s = e; startSlider.value = s; }

    var pctStart = videoDuration ? (s / videoDuration) * 100 : 0;
    var pctEnd = videoDuration ? (e / videoDuration) * 100 : 100;
    fill.style.left = pctStart + "%";
    fill.style.right = (100 - pctEnd) + "%";

    startLabel.textContent = formatTime(s);
    endLabel.textContent = formatTime(e);
    clipDurationLabel.textContent = "durasi klip: " + formatTime(Math.max(0, e - s));
  }

  /* ---------- file selection ---------- */
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadFile(file);
  });

  ["dragover", "dragenter"].forEach(function (evt) {
    drop.addEventListener(evt, function (e) {
      e.preventDefault();
      drop.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    drop.addEventListener(evt, function (e) {
      e.preventDefault();
      drop.classList.remove("is-dragover");
    });
  });
  drop.addEventListener("drop", function (e) {
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadFile(file);
  });

  function loadFile(file) {
    if (!file.type.startsWith("video/")) {
      showError("Berkas ini bukan video. Pilih berkas video (MP4, WebM, MOV, dll).");
      return;
    }
    clearError();
    currentFile = file;

    var url = URL.createObjectURL(file);
    preview.src = url;

    preview.addEventListener(
      "loadedmetadata",
      function onMeta() {
        preview.removeEventListener("loadedmetadata", onMeta);
        videoDuration = preview.duration || 0;

        startSlider.min = 0;
        startSlider.max = videoDuration;
        startSlider.value = 0;
        endSlider.min = 0;
        endSlider.max = videoDuration;
        endSlider.value = videoDuration;

        updateRangeUI();

        drop.hidden = true;
        editor.hidden = false;
        resultWrap.hidden = true;
        progressWrap.hidden = true;
      },
      { once: true }
    );
  }

  resetBtn.addEventListener("click", function () {
    currentFile = null;
    fileInput.value = "";
    editor.hidden = true;
    drop.hidden = false;
    clearError();
  });

  startSlider.addEventListener("input", updateRangeUI);
  endSlider.addEventListener("input", updateRangeUI);

  /* ---------- ffmpeg.wasm ---------- */
  function getFFmpeg() {
    if (ffmpeg) return ffmpeg;
    if (typeof FFmpeg === "undefined") {
      throw new Error("ffmpeg-not-loaded");
    }
    ffmpeg = FFmpeg.createFFmpeg({
      log: false,
      corePath:
        "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
      progress: function (p) {
        if (typeof p.ratio === "number" && p.ratio >= 0) {
          var pct = Math.min(100, Math.round(p.ratio * 100));
          progressFill.style.width = pct + "%";
          progressLabel.textContent = "Memotong video… " + pct + "%";
        }
      },
    });
    return ffmpeg;
  }

  cutBtn.addEventListener("click", function () {
    if (!currentFile) return;
    clearError();

    var start = parseFloat(startSlider.value);
    var end = parseFloat(endSlider.value);
    var duration = end - start;

    if (duration <= 0.2) {
      showError("Rentang klip terlalu pendek. Geser penanda mulai/selesai dulu.");
      return;
    }

    runCut(currentFile, start, duration, !!preciseCheckbox.checked);
  });

  function runCut(file, start, duration, precise) {
    resultWrap.hidden = true;
    progressWrap.hidden = false;
    progressFill.style.width = "0%";
    progressLabel.textContent = "Menyiapkan mesin video (unduh sekali, lalu tersimpan di cache browser)…";
    cutBtn.disabled = true;

    var engine;
    try {
      engine = getFFmpeg();
    } catch (err) {
      progressWrap.hidden = true;
      cutBtn.disabled = false;
      showError(
        "Mesin pemroses video gagal dimuat. Pastikan koneksi internet aktif " +
        "(mesin ini diunduh sekali dari CDN publik saat pertama dipakai), lalu coba lagi."
      );
      return;
    }

    (engine.isLoaded() ? Promise.resolve() : engine.load())
      .then(function () {
        progressLabel.textContent = "Membaca berkas video…";
        var ext = (file.name.split(".").pop() || "mp4").toLowerCase();
        var inputName = "input." + ext;
        var outputName = "klip.mp4";

        return FFmpeg.fetchFile(file).then(function (data) {
          engine.FS("writeFile", inputName, data);

          var args = precise
            ? [
                "-ss", String(start),
                "-i", inputName,
                "-t", String(duration),
                "-c:v", "libx264",
                "-c:a", "aac",
                "-preset", "veryfast",
                outputName,
              ]
            : [
                "-ss", String(start),
                "-i", inputName,
                "-t", String(duration),
                "-c", "copy",
                outputName,
              ];

          progressLabel.textContent = "Memotong video…";
          return engine.run.apply(engine, args).then(function () {
            var out = engine.FS("readFile", outputName);
            var blob = new Blob([out.buffer], { type: "video/mp4" });
            var url = URL.createObjectURL(blob);

            resultVideo.src = url;
            downloadBtn.href = url;

            // clean up virtual FS for next run
            try { engine.FS("unlink", inputName); } catch (e) {}
            try { engine.FS("unlink", outputName); } catch (e) {}

            progressWrap.hidden = true;
            resultWrap.hidden = false;
            cutBtn.disabled = false;
          });
        });
      })
      .catch(function (err) {
        progressWrap.hidden = true;
        cutBtn.disabled = false;
        showError(
          "Gagal memotong video. Coba centang/hilangkan centang 'Potong presisi' " +
          "lalu ulangi, atau coba dengan berkas video yang lebih kecil."
        );
        if (window.console) console.error(err);
      });
  }
})();
