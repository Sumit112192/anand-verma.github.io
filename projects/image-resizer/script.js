const UPSC = {
  minWidth: 350, maxWidth: 1000,
  minHeight: 350, maxHeight: 1000,
  minKB: 20, maxKB: 300
};
let mode = 'upsc';
let config = { ...UPSC };
function $(id) { return document.getElementById(id); }

// Mode switch logic
$("mode-upsc").onclick = function () {
  mode = "upsc";
  config = { ...UPSC };
  $("custom-fields").classList.add("hidden");
  $("mode-upsc").classList.add("active");
  $("mode-custom").classList.remove("active");
  $("requirements").innerHTML = `
    <ul>
      <li><strong>UPSC Spec:</strong> JPG output</li>
      <li>Dimensions: <b>350×350 px</b> up to <b>1000×1000 px</b></li>
      <li>File size: 20–300 KB</li>
    </ul>`;
};
$("mode-custom").onclick = function () {
  mode = "custom";
  $("custom-fields").classList.remove("hidden");
  $("mode-custom").classList.add("active");
  $("mode-upsc").classList.remove("active");
  $("requirements").innerHTML = `
    <ul>
      <li><strong>Custom Spec:</strong> JPG output</li>
      <li>Dimensions: <span id="label-range"></span> px</li>
      <li>File size: <span id="label-size"></span> KB</li>
    </ul>`;
  updateCustomConfig();
};
["custom-min-width", "custom-max-width", "custom-min-height", "custom-max-height", "custom-min-size", "custom-max-size"]
  .forEach(id => $(id).oninput = updateCustomConfig);
function updateCustomConfig() {
  config = {
    minWidth: parseInt($("custom-min-width").value) || 350,
    maxWidth: parseInt($("custom-max-width").value) || 1000,
    minHeight: parseInt($("custom-min-height").value) || 350,
    maxHeight: parseInt($("custom-max-height").value) || 1000,
    minKB: parseInt($("custom-min-size").value) || 20,
    maxKB: parseInt($("custom-max-size").value) || 300
  };
  if ($("label-range") && $("label-size")) {
    $("label-range").textContent = `${config.minWidth}×${config.minHeight} up to ${config.maxWidth}×${config.maxHeight}`;
    $("label-size").textContent = `${config.minKB}–${config.maxKB}`;
  }
}

$("file-input").onchange = function () {
  resetAll();
  const file = this.files[0];
  if (!file) return;
  if (!file.type.match(/^image\//)) {
    showError("Only image files are allowed."); return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError("Maximum file size is 10 MB."); return;
  }
  const kb = file.size / 1024;

  // Load image and check dimensions
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = function () {
    const origW = img.naturalWidth, origH = img.naturalHeight;
    $("original-preview").src = img.src;
    $("original-meta").textContent = `${origW}×${origH} px, ${Math.round(kb)} KB`;

    // Step 1: Dimension check
    if (origW < config.minWidth || origH < config.minHeight) {
      showError(`Too small! Min ${config.minWidth}×${config.minHeight}px required.`); return;
    }
    // Step 2: Downscale factor (never upscale)
    const scale = Math.min(
      config.maxWidth / origW,
      config.maxHeight / origH,
      1
    );
    const w = Math.round(origW * scale);
    const h = Math.round(origH * scale);

    // Step 3: After scaling, both must be >= min
    if (w < config.minWidth || h < config.minHeight) {
      showError(`Aspect ratio not accepted. After resize, both ≥${config.minWidth}×${config.minHeight}px.`); return;
    }

    // *** NO PROCESS if ALL requirements are met ***
    const isCompliant =
      scale === 1 &&
      w <= config.maxWidth && w >= config.minWidth &&
      h <= config.maxHeight && h >= config.minHeight &&
      kb >= config.minKB && kb <= config.maxKB;

    // If file is already JPG and meets requirements, just show and offer direct download
    if (isCompliant && file.type === "image/jpeg") {
      $("result-preview").src = img.src;
      $("result-meta").textContent = `${w}×${h} px, ${Math.round(kb)} KB (JPG)`;
      $("result-section").classList.remove("hidden");
      $("error-msg").textContent = "";
      $("download-btn").onclick = function () {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `image-resized-${mode}-${w}x${h}-${Date.now()}.jpg`;
        a.click();
      };
      return;
    }
    // If it's NOT JPG, but all requirements otherwise met, show preview and output re-encoded JPG ONLY ON DOWNLOAD
    if (isCompliant) {
      $("result-preview").src = img.src;
      $("result-meta").textContent = `${w}×${h} px, ${Math.round(kb)} KB (${file.type.split('/')[1].toUpperCase()})`;
      $("result-section").classList.remove("hidden");
      $("error-msg").textContent = "";
      $("download-btn").onclick = function () {
        encodeJPG(img, w, h, config.minKB, config.maxKB, function(blob, resultKB){
          const durl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = durl;
          a.download = `image-resized-${mode}-${w}x${h}-${Date.now()}.jpg`;
          a.click();
        });
      };
      return;
    }
    // Otherwise, PROCESS image: downscale and compress as JPG
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    let found = false, bestBlob = null, bestKB = 0, bestDiff = 1e9, quality = 0.92;
    (async () => {
      for (let i = 0; i < 8; i++) {
        const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
        const curKB = blob.size / 1024;
        if (curKB >= config.minKB && curKB <= config.maxKB) {
          bestBlob = blob; bestKB = curKB; found = true; break;
        }
        let diff = Math.abs(curKB - (config.minKB + config.maxKB) / 2);
        if (diff < bestDiff) { bestBlob = blob; bestKB = curKB; bestDiff = diff; }
        quality -= 0.10;
        if (quality < 0.30) break;
      }
      if (!bestBlob) {
        showError("JPG encoding failed."); return;
      }
      $("result-preview").src = URL.createObjectURL(bestBlob);
      $("result-meta").textContent = `${w}×${h} px, ${Math.round(bestKB)} KB (JPG)`;
      $("result-section").classList.remove("hidden");
      $("error-msg").textContent = found ? "" : `Closest file size: ${Math.round(bestKB)} KB (outside allowed range). Try a different photo.`;
      $("download-btn").onclick = function () {
        const a = document.createElement('a');
        a.href = $("result-preview").src;
        a.download = `image-resized-${mode}-${w}x${h}-${Date.now()}.jpg`;
        a.click();
      };
    })();
  };
  img.onerror = function () {
    showError("Could not load image.");
  };
};

function encodeJPG(img, w, h, minKB, maxKB, cb) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  let quality = 0.92;
  for (let i = 0; i < 8; i++) {
    canvas.toBlob(function(blob) {
      const kb = blob.size / 1024;
      if (kb >= minKB && kb <= maxKB || i === 7) cb(blob, kb);
    }, "image/jpeg", quality);
    quality -= 0.10;
    if (quality < 0.30) break;
  }
}
function showError(msg) {
  $("error-msg").textContent = msg;
  $("result-section").classList.add("hidden");
}
function resetAll() {
  $("error-msg").textContent = "";
  $("original-preview").src = "";
  $("original-meta").textContent = "";
  $("result-preview").src = "";
  $("result-meta").textContent = "";
  $("result-section").classList.add("hidden");
}
$("start-over-btn").onclick = resetAll;

// Set default active mode on load
window.onload = function () { $("mode-upsc").click(); };
