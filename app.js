(function () {
  const FALLBACK_CAMERA = "HASSELBLAD X2D 100C";
  const APP_URL = "https://cyberhassel.example/";
  const SOLAR_TERMS = [
    { name: "Start of Spring", month: 2, day: 4 },
    { name: "Rain Water", month: 2, day: 19 },
    { name: "Insects Awaken", month: 3, day: 5 },
    { name: "Spring Equinox", month: 3, day: 20 },
    { name: "Pure Brightness", month: 4, day: 4 },
    { name: "Grain Rain", month: 4, day: 20 },
    { name: "Start of Summer", month: 5, day: 5 },
    { name: "Grain Full", month: 5, day: 21 },
    { name: "Grain in Ear", month: 6, day: 5 },
    { name: "Summer Solstice", month: 6, day: 21 },
    { name: "Minor Heat", month: 7, day: 7 },
    { name: "Major Heat", month: 7, day: 22 },
    { name: "Start of Autumn", month: 8, day: 7 },
    { name: "Limit of Heat", month: 8, day: 23 },
    { name: "White Dew", month: 9, day: 7 },
    { name: "Autumn Equinox", month: 9, day: 23 },
    { name: "Cold Dew", month: 10, day: 8 },
    { name: "Frost Descent", month: 10, day: 23 },
    { name: "Start of Winter", month: 11, day: 7 },
    { name: "Minor Snow", month: 11, day: 22 },
    { name: "Major Snow", month: 12, day: 7 },
    { name: "Winter Solstice", month: 12, day: 21 },
    { name: "Minor Cold", month: 1, day: 5 },
    { name: "Major Cold", month: 1, day: 20 }
  ];

  const POETRY_LIBRARY = [
    {
      id: "shanxi-yanmenguan",
      name: "SHANXI · YANMENGUAN",
      shortSeal: "雁门",
      bbox: { minLat: 39.1, maxLat: 39.3, minLng: 112.6, maxLng: 112.9 },
      poem: "三关冲要路，万里咽喉襟。",
      fallbackLat: 39.2086,
      fallbackLng: 112.7867
    },
    {
      id: "shanxi-pingyao",
      name: "SHANXI · PINGYAO",
      shortSeal: "平遥",
      bbox: { minLat: 37.1, maxLat: 37.3, minLng: 112.1, maxLng: 112.3 },
      poem: "落叶满空山，何处寻行迹。",
      fallbackLat: 37.1894,
      fallbackLng: 112.1766
    },
    {
      id: "shanxi-wutai",
      name: "SHANXI · WUTAISHAN",
      shortSeal: "五台",
      bbox: { minLat: 38.9, maxLat: 39.1, minLng: 113.4, maxLng: 113.7 },
      poem: "行到水穷处，坐看云起时。",
      fallbackLat: 39.0084,
      fallbackLng: 113.5926
    },
    {
      id: "yunnan-dali",
      name: "YUNNAN · DALI",
      shortSeal: "大理",
      bbox: { minLat: 25.5, maxLat: 25.8, minLng: 100.0, maxLng: 100.4 },
      poem: "苍山负雪，明烛天南。",
      fallbackLat: 25.6065,
      fallbackLng: 100.2676
    },
    {
      id: "tibet-lhasa",
      name: "TIBET · LHASA",
      shortSeal: "拉萨",
      bbox: { minLat: 29.5, maxLat: 29.8, minLng: 91.0, maxLng: 91.3 },
      poem: "山高月小，水落石出。",
      fallbackLat: 29.6525,
      fallbackLng: 91.1721
    },
    {
      id: "jiangnan-water",
      name: "JIANGNAN · WATER TOWN",
      shortSeal: "江南",
      bbox: { minLat: 30.0, maxLat: 31.8, minLng: 119.3, maxLng: 121.2 },
      poem: "江南可采莲，莲叶何田田。",
      fallbackLat: 30.8746,
      fallbackLng: 120.5492
    },
    {
      id: "gansu-desert",
      name: "GANSU · DESERT ARC",
      shortSeal: "大漠",
      bbox: { minLat: 37.0, maxLat: 41.0, minLng: 93.0, maxLng: 101.5 },
      poem: "大漠孤烟直，长河落日圆。",
      fallbackLat: 40.1421,
      fallbackLng: 94.6619
    }
  ];

  const state = {
    file: null,
    image: null,
    exif: null,
    dominant: null,
    matchedPlace: null,
    renderToken: null
  };

  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");
  const renderButton = document.getElementById("renderButton");
  const exportButton = document.getElementById("exportButton");
  const status = document.getElementById("status");
  const exportPreview = document.getElementById("exportPreview");
  const serialText = document.getElementById("serialText");
  const exportOverlay = document.getElementById("exportOverlay");
  const exportResultImage = document.getElementById("exportResultImage");
  const downloadResultLink = document.getElementById("downloadResultLink");
  const inlineSavePanel = document.getElementById("inlineSavePanel");
  const inlineSaveImage = document.getElementById("inlineSaveImage");
  const inlineDownloadLink = document.getElementById("inlineDownloadLink");
  const closeOverlayButton = document.getElementById("closeOverlayButton");
  const closeOverlayFooterButton = document.getElementById("closeOverlayFooterButton");
  const canvas = document.getElementById("posterCanvas");
  const ctx = canvas.getContext("2d");
  let exportObjectUrl = "";

  bindEvents();
  renderPlaceholder();

  function bindEvents() {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", (event) => {
      const [file] = event.target.files || [];
      if (file) handleFile(file);
    });

    ["dragenter", "dragover"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragging");
      });
    });

    dropzone.addEventListener("drop", (event) => {
      const [file] = event.dataTransfer?.files || [];
      if (file) handleFile(file);
    });

    renderButton.addEventListener("click", () => {
      if (!state.file) fileInput.click();
      else processCurrentFile();
    });

    exportButton.addEventListener("click", exportPoster);
    closeOverlayButton.addEventListener("click", closeExportOverlay);
    closeOverlayFooterButton.addEventListener("click", closeExportOverlay);
    exportOverlay.addEventListener("click", (event) => {
      if (event.target === exportOverlay) closeExportOverlay();
    });
  }

  async function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      setStatus("这不是图片文件，换一张试试。");
      return;
    }
    state.file = file;
    exportButton.disabled = true;
    setStatus("正在提取主色、读取拍摄信息、刻录时空参数...");
    await processCurrentFile();
  }

  async function processCurrentFile() {
    const currentToken = Symbol("render");
    state.renderToken = currentToken;

    const [image, exif] = await Promise.all([
      loadImage(state.file),
      readExif(state.file)
    ]);

    if (state.renderToken !== currentToken) return;

    state.image = image;
    state.exif = exif;
    state.dominant = sampleDominantColor(image);
    state.matchedPlace = matchPlace(exif, state.file.name);
    drawPoster();
    exportButton.disabled = false;
    setStatus("刻录完成。现在这张图已经学会了装得很贵。");
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function renderPlaceholder() {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "700 104px 'Segoe UI', sans-serif";
    ctx.fillText("CYBERHASSEL", 110, 240);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "400 42px 'Segoe UI', sans-serif";
    ctx.fillText("DROP AN IMAGE TO ENGRAVE TIME AND TERRITORY", 110, 320);
    syncExportPreview("No. CBH-2026-ARCHIVE-00000");
  }

  function drawPoster() {
    const theme = buildTheme(state.dominant);
    const place = state.matchedPlace;
    const exif = enrichExif(state.exif, place);
    const code = buildCertificateCode(place);
    const solarTerm = resolveSolarTerm(exif.captureDate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaperBackground(theme);

    const card = {
      x: 88,
      y: 84,
      w: canvas.width - 176,
      h: canvas.height - 168
    };
    const photoArea = {
      x: card.x + 54,
      y: card.y + 54,
      w: card.w - 108,
      h: 1458
    };

    drawPosterCard(card, theme);
    drawPhoto(photoArea);
    drawEditorialSeal(photoArea, place, theme);
    drawBottomPanel(card, photoArea, theme, place, exif, solarTerm, code);
    syncExportPreview(`No. ${code}`);
  }

  function drawPaperBackground(theme) {
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, theme.paper);
    bg.addColorStop(1, theme.paperShadow);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 900; i += 1) {
      const x = (i * 197) % canvas.width;
      const y = (i * 131) % canvas.height;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.24)";
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  }

  function drawPosterCard(card, theme) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.16)";
    ctx.shadowBlur = 42;
    ctx.shadowOffsetY = 22;
    ctx.fillStyle = theme.card;
    roundRect(ctx, card.x, card.y, card.w, card.h, 30);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = theme.edge;
    ctx.lineWidth = 1;
    roundRect(ctx, card.x + 1, card.y + 1, card.w - 2, card.h - 2, 30);
    ctx.stroke();
    ctx.strokeStyle = theme.innerEdge;
    roundRect(ctx, card.x + 18, card.y + 18, card.w - 36, card.h - 36, 22);
    ctx.stroke();
    ctx.restore();
  }

  function drawPhoto(area) {
    const img = state.image;
    const ratio = Math.max(area.w / img.width, area.h / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const dx = area.x + (area.w - drawW) / 2;
    const dy = area.y + (area.h - drawH) / 2;

    ctx.save();
    ctx.fillStyle = "#0a0a0a";
    roundRect(ctx, area.x, area.y, area.w, area.h, 12);
    ctx.fill();
    clipRoundRect(ctx, area.x, area.y, area.w, area.h, 12);
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }

  function drawBottomPanel(card, photoArea, theme, place, exif, solarTerm, code) {
    const left = card.x + 74;
    const right = card.x + card.w - 74;
    const top = photoArea.y + photoArea.h + 72;

    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = theme.text;
    ctx.font = "700 28px 'Segoe UI', 'Noto Sans SC', sans-serif";
    ctx.fillText(place.name, left, top);

    ctx.textAlign = "right";
    ctx.font = "700 25px 'Segoe UI', sans-serif";
    ctx.fillText("HASSELBLAD", right, top);
    ctx.fillStyle = theme.muted;
    ctx.font = "400 18px 'Segoe UI', sans-serif";
    ctx.fillText("NATURAL COLOR", right, top + 28);
    ctx.restore();

    drawScaleRule(left, right, top + 78, theme);

    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = theme.muted;
    ctx.font = "400 21px 'Segoe UI', 'Noto Sans SC', sans-serif";
    ctx.fillText(formatCoordinate(exif.lat, exif.lng, true), left, top + 130);

    ctx.textAlign = "center";
    ctx.fillStyle = theme.poetry;
    ctx.font = "300 54px 'Segoe UI', 'PingFang SC', sans-serif";
    ctx.fillText(place.poem, canvas.width / 2, top + 266);
    ctx.restore();

    drawGoldSeal(place.shortSeal, left, top + 352);
    drawFooterMeta(left, right, top + 402, theme, exif, solarTerm, code);
  }

  function drawScaleRule(left, right, y, theme) {
    const width = right - left;
    ctx.save();
    ctx.strokeStyle = theme.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();

    for (let i = 0; i <= 48; i += 1) {
      const x = left + (width / 48) * i;
      const tick = i % 6 === 0 ? 16 : 8;
      ctx.beginPath();
      ctx.moveTo(x, y - tick / 2);
      ctx.lineTo(x, y + tick / 2);
      ctx.stroke();
    }

    const center = left + width / 2;
    ctx.beginPath();
    ctx.arc(center, y, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - 24, y);
    ctx.lineTo(center + 24, y);
    ctx.moveTo(center, y - 24);
    ctx.lineTo(center, y + 24);
    ctx.stroke();
    ctx.restore();
  }

  function drawGoldSeal(text, x, y) {
    ctx.save();
    const gradient = ctx.createLinearGradient(x, y - 28, x + 180, y + 28);
    gradient.addColorStop(0, "#5e4822");
    gradient.addColorStop(0.48, "#f8df9c");
    gradient.addColorStop(1, "#7b5927");
    ctx.fillStyle = gradient;
    ctx.font = "700 46px 'Segoe UI', 'Noto Sans SC', sans-serif";
    ctx.fillText(text, x, y);
    ctx.strokeStyle = "rgba(96, 65, 14, 0.24)";
    ctx.strokeText(text, x, y);

    ctx.translate(x + 140, y - 46);
    ctx.rotate(-0.06);
    ctx.strokeStyle = "rgba(161, 47, 36, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 84, 84);
    ctx.fillStyle = "rgba(161, 47, 36, 0.12)";
    ctx.fillRect(0, 0, 84, 84);
    ctx.fillStyle = "rgba(161, 47, 36, 0.9)";
    ctx.font = "700 24px 'Segoe UI', 'Noto Sans SC', sans-serif";
    ctx.fillText("山河志", 7, 50);
    ctx.restore();
  }

  function drawFooterMeta(left, right, y, theme, exif, solarTerm, code) {
    const qrX = right - 120;
    const qrY = y - 116;

    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = theme.text;
    ctx.font = "400 20px 'Segoe UI', sans-serif";
    ctx.fillText(`${exif.aperture}   ${exif.shutter}   ${exif.iso}   ${exif.focal}`, left, y);
    ctx.fillStyle = theme.muted;
    ctx.font = "400 18px 'Segoe UI', sans-serif";
    ctx.fillText(`${solarTerm} / ${formatDate(exif.captureDate)}`, left, y + 34);
    ctx.restore();

    drawMicroMatrix(qrX, qrY, 92, code);

    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = theme.text;
    ctx.font = "400 22px 'Consolas', 'Courier New', monospace";
    ctx.fillText(`NO. ${code}`, right, y - 18);
    ctx.fillStyle = theme.muted;
    ctx.font = "400 16px 'Consolas', 'Courier New', monospace";
    ctx.fillText("ARCHIVE / CYBERHASSEL", right, y + 18);
    ctx.restore();
  }

  function drawEditorialSeal(photoArea, place, theme) {
    const cx = photoArea.x + photoArea.w - 190;
    const cy = photoArea.y + 170;

    ctx.save();
    ctx.strokeStyle = theme.gold;
    ctx.fillStyle = theme.goldSoft;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 104, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 84, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "700 26px 'Segoe UI', 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(place.shortSeal, cx, cy + 12);

    ctx.font = "400 16px 'Segoe UI', sans-serif";
    ctx.fillText("CYBERHASSEL FIELD ISSUE", cx, cy - 18);
    ctx.fillText(place.name.replace(" · ", " / "), cx, cy + 40);

    ctx.strokeStyle = theme.goldSoft;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const y = cy - 24 + i * 22;
      ctx.beginPath();
      ctx.moveTo(cx + 112, y);
      ctx.quadraticCurveTo(cx + 158, y + 6, cx + 190, y - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMicroMatrix(x, y, size, seedText) {
    const cells = 21;
    const cell = size / cells;
    const seed = textHash(seedText + APP_URL);

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#111111";

    for (let row = 0; row < cells; row += 1) {
      for (let col = 0; col < cells; col += 1) {
        if (isFinderCell(row, col, cells) || pseudoBit(seed, row, col)) {
          ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
        }
      }
    }
    ctx.restore();
  }

  function isFinderCell(row, col, cells) {
    return inFinder(row, col, 0, 0)
      || inFinder(row, col, cells - 7, 0)
      || inFinder(row, col, 0, cells - 7);
  }

  function inFinder(row, col, startCol, startRow) {
    const inside = row >= startRow && row < startRow + 7 && col >= startCol && col < startCol + 7;
    if (!inside) return false;
    const r = row - startRow;
    const c = col - startCol;
    return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
  }

  function pseudoBit(seed, row, col) {
    const value = (seed + row * 97 + col * 193 + row * col * 17) % 11;
    return value === 0 || value === 3 || value === 7;
  }

  function buildTheme(dominant) {
    const luminance = (0.2126 * dominant.r + 0.7152 * dominant.g + 0.0722 * dominant.b) / 255;
    if (luminance < 0.46) {
      return {
        paper: "#efe7dc",
        paperShadow: "#e1d6ca",
        card: "#141414",
        edge: "rgba(255,255,255,0.08)",
        innerEdge: "rgba(255,255,255,0.03)",
        text: "#f2eee7",
        muted: "rgba(242,238,231,0.72)",
        poetry: "rgba(242,238,231,0.64)",
        rule: "rgba(242,238,231,0.28)",
        gold: "rgba(236, 205, 135, 0.92)",
        goldSoft: "rgba(236, 205, 135, 0.46)"
      };
    }
    return {
      paper: "#f9f6f0",
      paperShadow: "#ece6dd",
      card: "#f2ede4",
      edge: "rgba(0,0,0,0.08)",
      innerEdge: "rgba(0,0,0,0.04)",
      text: "#171717",
      muted: "rgba(23,23,23,0.62)",
      poetry: "rgba(23,23,23,0.52)",
      rule: "rgba(23,23,23,0.22)",
      gold: "rgba(169, 123, 33, 0.92)",
      goldSoft: "rgba(169, 123, 33, 0.42)"
    };
  }

  function enrichExif(exif, place) {
    const captureDate = exif.captureDate || new Date();
    const lat = exif.lat ?? place.fallbackLat;
    const lng = exif.lng ?? place.fallbackLng;
    return {
      captureDate,
      lat,
      lng,
      aperture: exif.aperture || "f/4.0",
      shutter: exif.shutter || "1/2000s",
      iso: exif.iso || "ISO 64",
      focal: exif.focal || "55mm",
      cameraLabel: exif.camera || FALLBACK_CAMERA
    };
  }

  function buildCertificateCode(place) {
    const now = new Date();
    const seed = `${place.id}-${state.file?.name || "archive"}-${now.toISOString()}`;
    const serial = Math.abs(textHash(seed)).toString().padStart(5, "0").slice(0, 5);
    return `CBH-${now.getFullYear()}-${place.shortSeal.toUpperCase()}-${serial}`;
  }

  function resolveSolarTerm(date) {
    const target = new Date(date);
    let nearest = SOLAR_TERMS[0];
    let min = Number.POSITIVE_INFINITY;
    for (const term of SOLAR_TERMS) {
      const d = new Date(target.getFullYear(), term.month - 1, term.day);
      const diff = Math.abs(d.getTime() - target.getTime());
      if (diff < min) {
        min = diff;
        nearest = term;
      }
    }
    return nearest.name;
  }

  function formatCoordinate(lat, lng, includeSeconds) {
    return `${toDms(lat, true, includeSeconds)}, ${toDms(lng, false, includeSeconds)}`;
  }

  function toDms(value, isLat, includeSeconds) {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutesRaw = (abs - degrees) * 60;
    const minutes = Math.floor(minutesRaw);
    const seconds = Math.round((minutesRaw - minutes) * 60);
    const suffix = isLat ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "W");
    if (includeSeconds) {
      return `${degrees}°${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}"${suffix}`;
    }
    return `${degrees}°${String(minutes).padStart(2, "0")}'${suffix}`;
  }

  function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hour}:${minute}`;
  }

  function matchPlace(exif, fileName) {
    const name = (fileName || "").toLowerCase();
    const explicit = POETRY_LIBRARY.find((entry) => {
      return name.includes(entry.shortSeal.toLowerCase()) || name.includes(entry.id.split("-").at(-1));
    });
    if (explicit) return explicit;

    if (typeof exif.lat === "number" && typeof exif.lng === "number") {
      const byBbox = POETRY_LIBRARY.find((entry) => {
        const box = entry.bbox;
        return exif.lat >= box.minLat
          && exif.lat <= box.maxLat
          && exif.lng >= box.minLng
          && exif.lng <= box.maxLng;
      });
      if (byBbox) return byBbox;
    }

    return {
      id: "default-archive",
      name: "FIELD ARCHIVE",
      shortSeal: "阅界",
      poem: "天地有大美，而不言。",
      fallbackLat: 39.9042,
      fallbackLng: 116.4074
    };
  }

  function sampleDominantColor(image) {
    const probe = document.createElement("canvas");
    probe.width = 48;
    probe.height = 48;
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    probeCtx.drawImage(image, 0, 0, probe.width, probe.height);
    const { data } = probeCtx.getImageData(0, 0, probe.width, probe.height);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 16) {
      const alpha = data[i + 3] / 255;
      if (alpha < 0.8) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }
    return {
      r: Math.round(r / count || 0),
      g: Math.round(g / count || 0),
      b: Math.round(b / count || 0)
    };
  }

  function exportPoster() {
    const filename = `cyberhassel-${Date.now()}.png`;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      exportResultImage.src = dataUrl;
      downloadResultLink.href = dataUrl;
      downloadResultLink.download = filename;
      revealInlineSave(dataUrl, filename);
      openExportOverlay();
      attemptDownload(dataUrl, filename);
      setStatus("成片已准备好。若浏览器不自动下载，请长按弹出的图片保存。");
      return;
    } catch (error) {
      // Fall through to blob export for browsers that reject data URLs.
    }

    if (typeof canvas.toBlob !== "function") {
      setStatus("当前浏览器不支持这一步导出。请截图发我，我继续给你兜底。");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("导出失败了，这次不是你的问题。请再点一次，或者截图发我继续修。");
        return;
      }

      if (exportObjectUrl) {
        URL.revokeObjectURL(exportObjectUrl);
      }

      exportObjectUrl = URL.createObjectURL(blob);
      exportResultImage.src = exportObjectUrl;
      downloadResultLink.href = exportObjectUrl;
      downloadResultLink.download = filename;
      revealInlineSave(exportObjectUrl, filename);
      openExportOverlay();
      attemptDownload(exportObjectUrl, filename);
      setStatus("成片已准备好。若浏览器不自动下载，请长按弹出的图片保存。");
    }, "image/png");
  }

  function attemptDownload(url, filename) {
    const link = document.getElementById("downloadLinkTemplate").content.firstElementChild.cloneNode(true);
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openExportOverlay() {
    exportOverlay.hidden = false;
    exportOverlay.setAttribute("aria-hidden", "false");
  }

  function closeExportOverlay() {
    exportOverlay.hidden = true;
    exportOverlay.setAttribute("aria-hidden", "true");
  }

  function revealInlineSave(url, filename) {
    inlineSaveImage.src = url;
    inlineDownloadLink.href = url;
    inlineDownloadLink.download = filename;
    inlineSavePanel.hidden = false;
    inlineSavePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function syncExportPreview(serial) {
    exportPreview.src = canvas.toDataURL("image/png");
    serialText.textContent = serial;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = reject;
      image.src = url;
    });
  }

  async function readExif(file) {
    try {
      const buffer = await file.arrayBuffer();
      return parseJpegExif(buffer);
    } catch (error) {
      return {};
    }
  }

  function parseJpegExif(buffer) {
    const view = new DataView(buffer);
    if (view.getUint16(0, false) !== 0xffd8) return {};

    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      const size = view.getUint16(offset, false);
      if (marker === 0xffe1) {
        return parseExifSegment(view, offset + 2, size - 2);
      }
      offset += size;
    }
    return {};
  }

  function parseExifSegment(view, start, length) {
    if (readAscii(view, start, 4) !== "Exif") return {};

    const tiffStart = start + 6;
    const little = readAscii(view, tiffStart, 2) === "II";
    const getShort = (offset) => view.getUint16(offset, little);
    const getLong = (offset) => view.getUint32(offset, little);

    const firstIfdOffset = getLong(tiffStart + 4);
    const ifd0 = readIfd(view, tiffStart, tiffStart + firstIfdOffset, little);
    const exifIfdOffset = ifd0.get(0x8769);
    const gpsIfdOffset = ifd0.get(0x8825);
    const exifIfd = exifIfdOffset ? readIfd(view, tiffStart, tiffStart + exifIfdOffset, little) : new Map();
    const gpsIfd = gpsIfdOffset ? readIfd(view, tiffStart, tiffStart + gpsIfdOffset, little) : new Map();

    const gps = parseGps(gpsIfd);
    return {
      camera: valueAsString(ifd0.get(0x0110)) || valueAsString(ifd0.get(0x010f)) || "",
      aperture: formatAperture(valueAsNumber(exifIfd.get(0x829d))),
      shutter: formatShutter(exifIfd.get(0x829a)),
      iso: formatIso(valueAsNumber(exifIfd.get(0x8827))),
      focal: formatFocal(valueAsNumber(exifIfd.get(0x920a))),
      captureDate: parseExifDate(valueAsString(exifIfd.get(0x9003)) || valueAsString(ifd0.get(0x0132))),
      lat: gps.lat,
      lng: gps.lng
    };
  }

  function readIfd(view, tiffStart, offset, little) {
    const getShort = (at) => view.getUint16(at, little);
    const getLong = (at) => view.getUint32(at, little);
    const count = getShort(offset);
    const result = new Map();

    for (let i = 0; i < count; i += 1) {
      const entry = offset + 2 + i * 12;
      const tag = getShort(entry);
      const type = getShort(entry + 2);
      const valueCount = getLong(entry + 4);
      const valueOffset = entry + 8;
      const totalBytes = typeSize(type) * valueCount;
      const actualOffset = totalBytes <= 4 ? valueOffset : tiffStart + getLong(valueOffset);
      result.set(tag, readTagValue(view, actualOffset, type, valueCount, little));
    }
    return result;
  }

  function typeSize(type) {
    switch (type) {
      case 1:
      case 2:
      case 7:
        return 1;
      case 3:
        return 2;
      case 4:
      case 9:
        return 4;
      case 5:
      case 10:
        return 8;
      default:
        return 0;
    }
  }

  function readTagValue(view, offset, type, count, little) {
    if (type === 2) {
      return readAscii(view, offset, count).replace(/\0+$/, "");
    }
    if (type === 3) {
      if (count === 1) return view.getUint16(offset, little);
      return Array.from({ length: count }, (_, i) => view.getUint16(offset + i * 2, little));
    }
    if (type === 4) {
      if (count === 1) return view.getUint32(offset, little);
      return Array.from({ length: count }, (_, i) => view.getUint32(offset + i * 4, little));
    }
    if (type === 5) {
      if (count === 1) {
        return [
          view.getUint32(offset, little),
          view.getUint32(offset + 4, little)
        ];
      }
      return Array.from({ length: count }, (_, i) => ([
        view.getUint32(offset + i * 8, little),
        view.getUint32(offset + i * 8 + 4, little)
      ]));
    }
    if (type === 1 || type === 7) {
      if (count === 1) return view.getUint8(offset);
      return Array.from({ length: count }, (_, i) => view.getUint8(offset + i));
    }
    return null;
  }

  function parseGps(gpsIfd) {
    const latRef = valueAsString(gpsIfd.get(1)) || "N";
    const latValue = gpsIfd.get(2);
    const lngRef = valueAsString(gpsIfd.get(3)) || "E";
    const lngValue = gpsIfd.get(4);
    return {
      lat: latValue ? dmsToDecimal(latValue, latRef) : undefined,
      lng: lngValue ? dmsToDecimal(lngValue, lngRef) : undefined
    };
  }

  function dmsToDecimal(value, ref) {
    const [deg, min, sec] = value.map(valueAsNumber);
    const decimal = deg + min / 60 + sec / 3600;
    return ref === "S" || ref === "W" ? -decimal : decimal;
  }

  function valueAsString(value) {
    return typeof value === "string" ? value : "";
  }

  function valueAsNumber(value) {
    if (typeof value === "number") return value;
    if (Array.isArray(value) && value.length === 2) {
      return value[1] ? value[0] / value[1] : 0;
    }
    return 0;
  }

  function formatAperture(value) {
    return value ? `f/${value.toFixed(1)}` : "";
  }

  function formatShutter(value) {
    const exposure = valueAsNumber(value);
    if (!exposure) return "";
    if (exposure >= 1) return `${stripZero(exposure.toFixed(1))}s`;
    return `1/${Math.round(1 / exposure)}s`;
  }

  function formatIso(value) {
    return value ? `ISO ${Math.round(value)}` : "";
  }

  function formatFocal(value) {
    return value ? `${Math.round(value)}mm` : "";
  }

  function parseExifDate(value) {
    if (!value) return null;
    const normalized = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function readAscii(view, start, length) {
    let text = "";
    for (let i = 0; i < length; i += 1) {
      text += String.fromCharCode(view.getUint8(start + i));
    }
    return text;
  }

  function drawLetterSpacedText(text, x, y, gap) {
    let cursor = x;
    for (const char of text) {
      ctx.fillText(char, cursor, y);
      cursor += ctx.measureText(char).width + gap;
    }
  }

  function roundRect(target, x, y, w, h, r) {
    target.beginPath();
    target.moveTo(x + r, y);
    target.arcTo(x + w, y, x + w, y + h, r);
    target.arcTo(x + w, y + h, x, y + h, r);
    target.arcTo(x, y + h, x, y, r);
    target.arcTo(x, y, x + w, y, r);
    target.closePath();
  }

  function clipRoundRect(target, x, y, w, h, r) {
    roundRect(target, x, y, w, h, r);
    target.clip();
  }

  function stripZero(value) {
    return value.replace(/\.0$/, "");
  }

  function textHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
})();
