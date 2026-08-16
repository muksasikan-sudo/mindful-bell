(() => {
  "use strict";

  const STORAGE_KEY = "mindfulBell.settings.v1";
  const LOG_KEY = "mindfulBell.log.v1";
  const BG_KEY = "mindfulBell.bg.v1";
  const CIRC = 2 * Math.PI * 52;

  // Free-licensed photos from Wikimedia Commons (temples, Buddha statues, lotus flowers).
  const BACKGROUNDS = [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wat_Arun_Temple_Of_Dawn_%28121412175%29.jpeg/1920px-Wat_Arun_Temple_Of_Dawn_%28121412175%29.jpeg", caption: "วัดอรุณ ยามเย็น", credit: "Wikimedia Commons · CC BY 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Temple_of_the_Emerald_Buddha.jpg/1920px-Temple_of_the_Emerald_Buddha.jpg", caption: "วัดพระแก้ว", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg/1920px-Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg", caption: "วัดพระศรีรัตนศาสดาราม", credit: "Wikimedia Commons · CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Wat_Pho%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_05.jpg/1920px-Wat_Pho%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_05.jpg", caption: "พระพุทธไสยาสน์ วัดโพธิ์", credit: "Wikimedia Commons · CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Big_Buddha_Phuket%2C_Thailand.jpg/1920px-Big_Buddha_Phuket%2C_Thailand.jpg", caption: "พระใหญ่ภูเก็ต", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bangkok_Wat_Traimit_01.jpg/1920px-Bangkok_Wat_Traimit_01.jpg", caption: "พระพุทธรูปทองคำ วัดไตรมิตร", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Linh_Ung_Pagoda_morning_mist_Ba_Na_Hills_Da_Nang_Vietnam.jpg/1920px-Linh_Ung_Pagoda_morning_mist_Ba_Na_Hills_Da_Nang_Vietnam.jpg", caption: "พระพุทธรูปในสายหมอก", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/20171107_White_Temple_Chiang_Rai_0197_DxO.jpg/1920px-20171107_White_Temple_Chiang_Rai_0197_DxO.jpg", caption: "วัดร่องขุ่น เชียงราย", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/White_Temple_I.jpg/1920px-White_Temple_I.jpg", caption: "วัดร่องขุ่น", credit: "Wikimedia Commons · CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lotus_Pond.jpg/1920px-Lotus_Pond.jpg", caption: "บัวในบึง", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Lotus_flower_%28978659%29.jpg/1920px-Lotus_flower_%28978659%29.jpg", caption: "ดอกบัว", credit: "Wikimedia Commons · CC0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lotus_in_a_Pond.jpg/1920px-Lotus_in_a_Pond.jpg", caption: "ดอกบัวในสระ", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Pink_and_white_Nymphaea_water_lily_flowers%2C_%D0%B1%D0%B5%D0%BB_%D0%B8_%D1%80%D0%BE%D0%B7%D0%BE%D0%B2_%D0%BB%D0%BE%D1%82%D0%BE%D1%81.jpg/1920px-Pink_and_white_Nymphaea_water_lily_flowers%2C_%D0%B1%D0%B5%D0%BB_%D0%B8_%D1%80%D0%BE%D0%B7%D0%BE%D0%B2_%D0%BB%D0%BE%D1%82%D0%BE%D1%81.jpg", caption: "บัวสายสีชมพู", credit: "Wikimedia Commons · CC0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Sukhothai%2C_Lotus_flower%2C_Thailand.jpg/1920px-Sukhothai%2C_Lotus_flower%2C_Thailand.jpg", caption: "ดอกบัว สุโขทัย", credit: "Wikimedia Commons · CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pink_lotus_flower_blooming_in_a_village_lake_waters_ramanathapuram_tamilnadu_India.jpg/1920px-Pink_lotus_flower_blooming_in_a_village_lake_waters_ramanathapuram_tamilnadu_India.jpg", caption: "ดอกบัวบาน", credit: "Wikimedia Commons · CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Cherry_blossom_at_the_rock_garden_of_Ry%C5%8Dan-ji_Temple_in_Kyoto%2C_Japan.jpg", caption: "ซากุระ วัดเรียวอันจิ", credit: "Wikimedia Commons · CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Myohoin_temple_with_cherry_blossoms_in_Kyoto_-_Apr_7%2C_2014.jpg/1920px-Myohoin_temple_with_cherry_blossoms_in_Kyoto_-_Apr_7%2C_2014.jpg", caption: "ซากุระ วัดเมียวโฮอิน", credit: "Wikimedia Commons · CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Cherry_blossoms_at_Hasedera_Temple_%E9%95%B7%E8%B0%B7%E5%AF%BA%E6%A8%B1%E8%8A%B1_-_panoramio.jpg/1920px-Cherry_blossoms_at_Hasedera_Temple_%E9%95%B7%E8%B0%B7%E5%AF%BA%E6%A8%B1%E8%8A%B1_-_panoramio.jpg", caption: "ซากุระ วัดฮาเซเดระ", credit: "Wikimedia Commons · CC BY 3.0" },
  ];

  const SOUND_PRESETS = {
    tibetan: { base: 196.0, decay: 7.5, partials: [1, 1.49, 2.0, 2.66, 3.32, 4.07], gain: [1, 0.55, 0.4, 0.25, 0.15, 0.1] },
    temple: { base: 261.6, decay: 5.5, partials: [1, 1.83, 2.76, 4.6, 5.4], gain: [1, 0.5, 0.35, 0.2, 0.12] },
    chime: { base: 587.3, decay: 2.6, partials: [1, 2.0, 3.01, 4.2], gain: [1, 0.5, 0.3, 0.15] },
  };

  const defaults = {
    mode: "interval",
    intervalMinutes: 30,
    useActiveWindow: true,
    activeStart: "08:00",
    activeEnd: "21:00",
    fixedTimes: ["09:00", "12:00", "15:00", "18:00"],
    sound: "tibetan",
    volume: 0.8,
    messages: [
      "หยุดสักครู่... หายใจเข้าลึกๆ แล้วรู้สึกตัว",
      "มีสติรู้อยู่กับท่าทางปัจจุบัน นั่ง หรือยืน หรือเดิน หรือนอนอยู่",
      "ยิ้ม แล้วรู้สึกตัวว่ายิ้ม",
      "หายใจเข้าลึกๆ หายใจออกยาวๆ แล้วรู้ว่ากำลังหายใจอยู่",
      "ช้าลงหน่อย มีสติรู้อารมณ์ขณะนี้ เราอารมณ์เป็นอย่างไร ยินดีหรือยินร้าย",
      "ทุกข์หรือสุขย่อมผ่านไปเสมอ เพราะทุกอย่างนั้นมีเกิดขึ้น ตั้งอยู่ ดับไป",
      "มีสติในทุกย่างก้าว",
      "คิดก่อนพูด เพื่อตนเองและผู้อื่น",
    ],
    notifyEnabled: true,
    wakeLock: false,
    checkinEnabled: true,
    runtime: { running: false, anchorTime: null },
  };

  const EMOTIONS = [
    { key: "สุข", emoji: "🙂" },
    { key: "ทุกข์", emoji: "😔" },
    { key: "โกรธ", emoji: "😠" },
    { key: "ฟุ้งซ่าน", emoji: "🌀" },
    { key: "เสียใจ", emoji: "😢" },
    { key: "เฉยๆ", emoji: "😐" },
  ];

  let settings = loadSettings();
  let log = loadLog();
  let currentMessageIndex = -1;
  let checkinPhase = null;
  let checkinIsTest = false;
  let checkinLogEntry = null;
  let checkinBeforeEmotion = null;
  let checkinAfterEmotion = null;
  let checkinMessageText = "";

  let running = false;
  let audioCtx = null;
  let timerHandle = null;
  let uiTicker = null;
  let nextTriggerTime = null;
  let cycleStartTime = null;
  let cycleDuration = null;
  let wakeLockSentinel = null;
  let deferredInstallPrompt = null;

  // ---- DOM refs ----
  const el = (id) => document.getElementById(id);
  const toggleBtn = el("toggleBtn");
  const testBtn = el("testBtn");
  const ringState = el("ringState");
  const ringCountdown = el("ringCountdown");
  const ringSub = el("ringSub");
  const ringProgress = el("ringProgress");
  const modeTabs = document.querySelectorAll(".mode-tab");
  const intervalModePanel = el("intervalMode");
  const fixedModePanel = el("fixedMode");
  const intervalMinutesInput = el("intervalMinutes");
  const useActiveWindowInput = el("useActiveWindow");
  const activeWindowRow = el("activeWindowRow");
  const activeStartInput = el("activeStart");
  const activeEndInput = el("activeEnd");
  const fixedTimeList = el("fixedTimeList");
  const newFixedTimeInput = el("newFixedTime");
  const addFixedTimeBtn = el("addFixedTime");
  const soundGrid = el("soundGrid");
  const volumeInput = el("volume");
  const msgList = el("msgList");
  const newMsgTextInput = el("newMsgText");
  const addMsgBtn = el("addMsgBtn");
  const resetMsgsBtn = el("resetMsgsBtn");
  const ringMessageEl = el("ringMessage");
  const notifyEnabledInput = el("notifyEnabled");
  const wakeLockInput = el("wakeLock");
  const checkinEnabledInput = el("checkinEnabled");
  const checkinOverlay = el("checkinOverlay");
  const checkinBody = el("checkinBody");
  const checkinCloseBtn = el("checkinCloseBtn");
  const permissionHint = el("permissionHint");
  const logList = el("logList");
  const clearLogBtn = el("clearLog");
  const installBtn = el("installBtn");
  const bgCreditEl = el("bgCredit");
  const bgLayers = [el("bgLayerA"), el("bgLayerB")];
  let activeBgLayerIndex = 0;
  let currentBgIndex = -1;

  // ---- storage ----
  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneSafe(defaults);
      const saved = JSON.parse(raw);
      const merged = Object.assign(structuredCloneSafe(defaults), saved, {
        runtime: Object.assign({}, defaults.runtime, saved.runtime || {}),
      });
      if (!Array.isArray(saved.messages) || !saved.messages.length) {
        merged.messages = typeof saved.message === "string" && saved.message.trim()
          ? [saved.message.trim()]
          : structuredCloneSafe(defaults.messages);
      }
      delete merged.message;
      return merged;
    } catch (e) {
      return structuredCloneSafe(defaults);
    }
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveSettings() {
    settings.runtime = { running, anchorTime: runtimeAnchor };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLog() {
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 30)));
  }

  // ---- audio ----
  function ensureAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playSound(name, volume) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const preset = SOUND_PRESETS[name] || SOUND_PRESETS.tibetan;
    const now = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.value = Math.max(0, Math.min(1, volume));
    master.connect(ctx.destination);

    preset.partials.forEach((ratio, i) => {
      const amp = preset.gain[i] ?? 0.1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(amp, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + preset.decay);
      g.connect(master);

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = preset.base * ratio;
      osc.connect(g);
      osc.start(now);
      osc.stop(now + preset.decay + 0.2);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = preset.base * ratio * 1.003;
      osc2.connect(g);
      osc2.start(now);
      osc2.stop(now + preset.decay + 0.2);
    });

    const strikeDur = 0.05;
    const bufferSize = Math.floor(ctx.sampleRate * strikeDur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = preset.base * 1.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
  }

  function primeAudioOnFirstInteraction() {
    const handler = () => ensureAudioContext();
    ["pointerdown", "keydown"].forEach((evt) => document.addEventListener(evt, handler, { once: true }));
  }

  // ---- notifications ----
  async function sendNotification(body) {
    if (!settings.notifyEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const title = "ระฆังเตือนสติ";
    const options = {
      body: body || "หยุดสักครู่ หายใจเข้าลึกๆ",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: "mindful-bell",
      silent: true,
    };
    try {
      if (navigator.serviceWorker) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, options);
        return;
      }
    } catch (e) {
      /* fall through */
    }
    try {
      new Notification(title, options);
    } catch (e) {
      /* ignore */
    }
  }

  function updatePermissionHint() {
    if (!("Notification" in window)) {
      permissionHint.textContent = "เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนแบบข้อความ (เสียงระฆังยังทำงานตามปกติ)";
      permissionHint.className = "hint warn";
      return;
    }
    const p = Notification.permission;
    if (p === "granted") {
      permissionHint.textContent = "เปิดใช้งานการแจ้งเตือนแบบข้อความแล้ว";
      permissionHint.className = "hint ok";
    } else if (p === "denied") {
      permissionHint.textContent = "การแจ้งเตือนถูกปิดกั้นจากเบราว์เซอร์ หากต้องการข้อความแจ้งเตือน กรุณาเปิดสิทธิ์ในตั้งค่าเบราว์เซอร์ (เสียงระฆังยังทำงานตามปกติ)";
      permissionHint.className = "hint warn";
      notifyEnabledInput.checked = false;
      settings.notifyEnabled = false;
    } else {
      permissionHint.textContent = "ติ๊กถูกช่องด้านบนเพื่อขอสิทธิ์แจ้งเตือนแบบข้อความ";
      permissionHint.className = "hint";
    }
  }

  // ---- wake lock ----
  async function applyWakeLock() {
    if (!settings.wakeLock || !running) return releaseWakeLock();
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener("release", () => {
        wakeLockSentinel = null;
      });
    } catch (e) {
      /* likely not visible; ignore */
    }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {});
      wakeLockSentinel = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (settings.wakeLock && running) applyWakeLock();
      if (running && nextTriggerTime && Date.now() >= nextTriggerTime + 500) {
        clearTimeout(timerHandle);
        onTrigger();
      }
    }
  });

  // ---- scheduling ----
  let runtimeAnchor = null;

  function dateAt(base, hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0);
  }

  function getNextTriggerTimestamp(fromMs) {
    const from = new Date(fromMs);
    if (settings.mode === "fixed") {
      if (!settings.fixedTimes.length) return null;
      const times = [...settings.fixedTimes].sort();
      for (const t of times) {
        const cand = dateAt(from, t);
        if (cand.getTime() > fromMs) return cand.getTime();
      }
      const tomorrow = new Date(from);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dateAt(tomorrow, times[0]).getTime();
    }

    const intervalMs = Math.max(1, settings.intervalMinutes) * 60000;

    if (settings.useActiveWindow) {
      const startT = dateAt(from, settings.activeStart);
      const endT = dateAt(from, settings.activeEnd);
      if (endT.getTime() > startT.getTime()) {
        let t = startT.getTime();
        while (t <= endT.getTime()) {
          if (t > fromMs) return t;
          t += intervalMs;
        }
      }
      const tomorrow = new Date(from);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dateAt(tomorrow, settings.activeStart).getTime();
    }

    const anchor = runtimeAnchor || fromMs;
    if (anchor > fromMs) return anchor;
    const n = Math.floor((fromMs - anchor) / intervalMs) + 1;
    return anchor + n * intervalMs;
  }

  function scheduleNext() {
    nextTriggerTime = getNextTriggerTimestamp(Date.now());
    if (nextTriggerTime == null) {
      stop();
      return;
    }
    cycleStartTime = Date.now();
    cycleDuration = Math.max(1, nextTriggerTime - cycleStartTime);
    clearTimeout(timerHandle);
    timerHandle = setTimeout(onTrigger, Math.max(0, nextTriggerTime - Date.now()));
  }

  function onTrigger() {
    if (!running) return;
    ringBell();
    scheduleNext();
  }

  function pickNextMessageIndex() {
    if (!settings.messages.length) return -1;
    if (settings.messages.length === 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * settings.messages.length);
    } while (idx === currentMessageIndex);
    return idx;
  }

  function pickNextMessage() {
    const idx = pickNextMessageIndex();
    if (idx === -1) return "หยุดสักครู่... หายใจเข้าลึกๆ แล้วรู้สึกตัว";
    currentMessageIndex = idx;
    return settings.messages[idx];
  }

  function showRingMessage(text) {
    ringMessageEl.textContent = text;
    ringMessageEl.hidden = false;
  }

  function ringBell() {
    const msg = pickNextMessage();
    playSound(settings.sound, settings.volume);
    changeBackground();
    showRingMessage(msg);
    const entry = addLogEntry(new Date(), msg);
    sendNotification(msg);
    if (settings.checkinEnabled) {
      openCheckin(msg, { isTest: false, logEntry: entry });
    }
  }

  function start() {
    ensureAudioContext();
    running = true;
    runtimeAnchor = Date.now();
    saveSettings();
    scheduleNext();
    applyWakeLock();
    updateToggleUI();
    startUiTicker();
  }

  function stop() {
    running = false;
    nextTriggerTime = null;
    clearTimeout(timerHandle);
    releaseWakeLock();
    saveSettings();
    updateToggleUI();
    updateUI();
  }

  function resumeFromSaved() {
    if (settings.runtime && settings.runtime.running) {
      running = true;
      runtimeAnchor = settings.runtime.anchorTime || Date.now();
      scheduleNext();
      applyWakeLock();
      updateToggleUI();
      startUiTicker();
    }
  }

  // ---- UI ----
  function updateToggleUI() {
    toggleBtn.textContent = running ? "หยุด" : "เริ่ม";
    toggleBtn.classList.toggle("running", running);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatClock(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function setProgress(p) {
    const offset = CIRC - CIRC * Math.min(1, Math.max(0, p));
    ringProgress.style.strokeDashoffset = offset;
  }

  function updateUI() {
    if (!running || !nextTriggerTime) {
      ringState.textContent = "หยุดอยู่";
      ringCountdown.textContent = "--:--";
      ringSub.textContent = "กดเริ่มเพื่อตั้งเวลาระฆัง";
      setProgress(0);
      return;
    }
    const now = Date.now();
    const remain = Math.max(0, nextTriggerTime - now);
    const mm = Math.floor(remain / 60000);
    const ss = Math.floor((remain % 60000) / 1000);
    ringState.textContent = "กำลังทำงาน";
    ringCountdown.textContent = `${pad(mm)}:${pad(ss)}`;
    ringSub.textContent = `ครั้งถัดไปเวลา ${formatClock(new Date(nextTriggerTime))} น.`;
    const elapsed = now - cycleStartTime;
    setProgress(elapsed / cycleDuration);
  }

  function startUiTicker() {
    clearInterval(uiTicker);
    updateUI();
    uiTicker = setInterval(updateUI, 500);
  }

  // ---- log ----
  function addLogEntry(date, msg) {
    const entry = { t: date.getTime(), msg: msg || "", before: null, after: null };
    log.unshift(entry);
    log = log.slice(0, 30);
    saveLog();
    renderLog();
    return entry;
  }

  function renderLog() {
    logList.innerHTML = "";
    if (!log.length) {
      const li = document.createElement("li");
      li.className = "log-empty";
      li.textContent = "ยังไม่มีประวัติ";
      logList.appendChild(li);
      return;
    }
    const todayStr = new Date().toDateString();
    log.forEach((entry) => {
      const d = new Date(entry.t);
      const li = document.createElement("li");
      const isToday = d.toDateString() === todayStr;
      const dateLabel = isToday ? "วันนี้" : d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });

      const row = document.createElement("div");
      row.className = "log-row";
      const timeSpan = document.createElement("span");
      timeSpan.textContent = `${formatClock(d)} น.`;
      const dateSpan = document.createElement("span");
      dateSpan.textContent = dateLabel;
      row.appendChild(timeSpan);
      row.appendChild(dateSpan);
      li.appendChild(row);

      if (entry.msg) {
        const msgP = document.createElement("p");
        msgP.className = "log-msg";
        msgP.textContent = entry.msg;
        li.appendChild(msgP);
      }
      if (entry.before || entry.after) {
        const emoP = document.createElement("p");
        emoP.className = "log-emotions";
        emoP.textContent = `อารมณ์ก่อน: ${entry.before || "ข้าม"} · หลัง: ${entry.after || "ข้าม"}`;
        li.appendChild(emoP);
      }
      logList.appendChild(li);
    });
  }

  // ---- emotion check-in ----
  function buildEmotionGrid(onPick) {
    const grid = document.createElement("div");
    grid.className = "emotion-grid";
    EMOTIONS.forEach((e) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emotion-btn";
      const emoji = document.createElement("span");
      emoji.className = "emotion-emoji";
      emoji.textContent = e.emoji;
      const label = document.createElement("span");
      label.className = "emotion-label";
      label.textContent = e.key;
      btn.appendChild(emoji);
      btn.appendChild(label);
      btn.addEventListener("click", () => onPick(e.key));
      grid.appendChild(btn);
    });
    return grid;
  }

  function openCheckin(messageText, opts) {
    opts = opts || {};
    checkinIsTest = !!opts.isTest;
    checkinLogEntry = opts.logEntry || null;
    checkinPhase = "before";
    checkinBeforeEmotion = null;
    checkinAfterEmotion = null;
    checkinMessageText = messageText;
    checkinOverlay.classList.add("open");
    renderCheckin();
  }

  function persistCheckinEmotions() {
    if (!checkinLogEntry) return;
    checkinLogEntry.before = checkinBeforeEmotion;
    checkinLogEntry.after = checkinAfterEmotion;
    saveLog();
    renderLog();
  }

  function finishCheckin() {
    persistCheckinEmotions();
    checkinPhase = "done";
    renderCheckin();
  }

  function closeCheckin() {
    if (checkinPhase && checkinPhase !== "done" && (checkinBeforeEmotion || checkinAfterEmotion)) {
      persistCheckinEmotions();
    }
    checkinOverlay.classList.remove("open");
    checkinPhase = null;
  }

  function renderCheckin() {
    checkinBody.innerHTML = "";
    if (checkinPhase === "before") {
      const eyebrow = document.createElement("p");
      eyebrow.className = "checkin-eyebrow";
      eyebrow.textContent = "🔔 ระฆังดังแล้ว";
      const q = document.createElement("p");
      q.className = "checkin-question";
      q.textContent = "ตอนนี้อารมณ์เป็นอย่างไร?";
      checkinBody.appendChild(eyebrow);
      checkinBody.appendChild(q);
      checkinBody.appendChild(
        buildEmotionGrid((key) => {
          checkinBeforeEmotion = key;
          checkinPhase = "message";
          renderCheckin();
        })
      );
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "link-btn checkin-skip";
      skip.textContent = "ข้ามขั้นตอนนี้";
      skip.addEventListener("click", () => {
        checkinPhase = "message";
        renderCheckin();
      });
      checkinBody.appendChild(skip);
    } else if (checkinPhase === "message") {
      if (checkinBeforeEmotion) {
        const picked = document.createElement("p");
        picked.className = "checkin-picked";
        picked.textContent = `คุณรู้สึก: ${checkinBeforeEmotion}`;
        checkinBody.appendChild(picked);
      }
      const msg = document.createElement("p");
      msg.className = "checkin-message";
      msg.textContent = checkinMessageText;
      checkinBody.appendChild(msg);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary-btn checkin-primary";
      btn.textContent = "ฉันมีสติ";
      btn.addEventListener("click", () => {
        checkinPhase = "after";
        renderCheckin();
      });
      checkinBody.appendChild(btn);
    } else if (checkinPhase === "after") {
      const q = document.createElement("p");
      q.className = "checkin-question";
      q.textContent = "ตอนนี้อารมณ์เป็นอย่างไร?";
      const hint = document.createElement("p");
      hint.className = "checkin-hint";
      hint.textContent = "ให้เหลือเพียงรู้... โดยไม่ต้องตามไปเป็น";
      checkinBody.appendChild(q);
      checkinBody.appendChild(hint);
      checkinBody.appendChild(
        buildEmotionGrid((key) => {
          checkinAfterEmotion = key;
          finishCheckin();
        })
      );
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "link-btn checkin-skip";
      skip.textContent = "ข้ามขั้นตอนนี้";
      skip.addEventListener("click", finishCheckin);
      checkinBody.appendChild(skip);
    } else if (checkinPhase === "done") {
      const done = document.createElement("p");
      done.className = "checkin-done";
      done.textContent = "ขอกราบสาธุ อนุโมทนาบุญกับทุกท่าน 🙏\nสาธุ สาธุ สาธุ";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary-btn checkin-primary";
      btn.textContent = "ปิด";
      btn.addEventListener("click", closeCheckin);
      checkinBody.appendChild(done);
      checkinBody.appendChild(btn);
    }
  }

  checkinCloseBtn.addEventListener("click", closeCheckin);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && checkinOverlay.classList.contains("open")) closeCheckin();
  });

  // ---- background photo ----
  function pickNextBackgroundIndex() {
    if (BACKGROUNDS.length <= 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * BACKGROUNDS.length);
    } while (idx === currentBgIndex);
    return idx;
  }

  function applyBackground(idx, layerEl) {
    const item = BACKGROUNDS[idx];
    currentBgIndex = idx;
    const prevLayer = bgLayers[activeBgLayerIndex];
    layerEl.style.backgroundImage = `url("${item.url}")`;
    layerEl.classList.add("active");
    if (prevLayer !== layerEl) prevLayer.classList.remove("active");
    activeBgLayerIndex = bgLayers.indexOf(layerEl);
    bgCreditEl.textContent = `${item.caption} · ${item.credit}`;
    bgCreditEl.classList.add("show");
    try {
      localStorage.setItem(BG_KEY, String(idx));
    } catch (e) {
      /* ignore */
    }
  }

  function changeBackground() {
    const idx = pickNextBackgroundIndex();
    const item = BACKGROUNDS[idx];
    const nextLayer = bgLayers[1 - activeBgLayerIndex];
    const img = new Image();
    img.onload = () => applyBackground(idx, nextLayer);
    img.onerror = () => {
      /* offline or blocked: keep current background */
    };
    img.src = item.url;
  }

  function restoreBackground() {
    try {
      const raw = localStorage.getItem(BG_KEY);
      if (raw === null) return;
      const idx = parseInt(raw, 10);
      if (!Number.isInteger(idx) || !BACKGROUNDS[idx]) return;
      applyBackground(idx, bgLayers[0]);
    } catch (e) {
      /* ignore */
    }
  }

  // ---- fixed time list ----
  function renderFixedTimes() {
    fixedTimeList.innerHTML = "";
    if (!settings.fixedTimes.length) {
      const li = document.createElement("li");
      li.className = "time-list-empty";
      li.textContent = "ยังไม่มีเวลาที่ตั้งไว้";
      fixedTimeList.appendChild(li);
      return;
    }
    [...settings.fixedTimes].sort().forEach((t) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${t} น.`;
      const btn = document.createElement("button");
      btn.className = "remove-time";
      btn.setAttribute("aria-label", `ลบเวลา ${t}`);
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        settings.fixedTimes = settings.fixedTimes.filter((x) => x !== t);
        saveSettings();
        renderFixedTimes();
        if (running) scheduleNext();
      });
      li.appendChild(span);
      li.appendChild(btn);
      fixedTimeList.appendChild(li);
    });
  }

  // ---- message list ----
  function renderMessages() {
    msgList.innerHTML = "";
    if (!settings.messages.length) {
      const li = document.createElement("li");
      li.className = "msg-list-empty";
      li.textContent = "ยังไม่มีข้อความ เพิ่มข้อความแรกด้านล่าง";
      msgList.appendChild(li);
      return;
    }
    settings.messages.forEach((msg, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = msg;
      const btn = document.createElement("button");
      btn.className = "remove-msg";
      btn.setAttribute("aria-label", "ลบข้อความนี้");
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        settings.messages.splice(i, 1);
        saveSettings();
        renderMessages();
      });
      li.appendChild(span);
      li.appendChild(btn);
      msgList.appendChild(li);
    });
  }

  // ---- wiring ----
  function initModeUI() {
    modeTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === settings.mode));
    intervalModePanel.hidden = settings.mode !== "interval";
    fixedModePanel.hidden = settings.mode !== "fixed";
  }

  modeTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.mode = btn.dataset.mode;
      initModeUI();
      saveSettings();
      if (running) scheduleNext();
    });
  });

  intervalMinutesInput.addEventListener("change", () => {
    const v = Math.min(600, Math.max(1, parseInt(intervalMinutesInput.value, 10) || 30));
    intervalMinutesInput.value = v;
    settings.intervalMinutes = v;
    saveSettings();
    if (running) scheduleNext();
  });

  useActiveWindowInput.addEventListener("change", () => {
    settings.useActiveWindow = useActiveWindowInput.checked;
    activeWindowRow.style.display = settings.useActiveWindow ? "" : "none";
    saveSettings();
    if (running) scheduleNext();
  });

  activeStartInput.addEventListener("change", () => {
    settings.activeStart = activeStartInput.value || "08:00";
    saveSettings();
    if (running) scheduleNext();
  });

  activeEndInput.addEventListener("change", () => {
    settings.activeEnd = activeEndInput.value || "21:00";
    saveSettings();
    if (running) scheduleNext();
  });

  addFixedTimeBtn.addEventListener("click", () => {
    const v = newFixedTimeInput.value;
    if (!v) return;
    if (!settings.fixedTimes.includes(v)) {
      settings.fixedTimes.push(v);
      saveSettings();
      renderFixedTimes();
      if (running) scheduleNext();
    }
  });

  soundGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".sound-choice");
    if (!btn) return;
    settings.sound = btn.dataset.sound;
    document.querySelectorAll(".sound-choice").forEach((b) => b.classList.toggle("active", b === btn));
    saveSettings();
  });

  volumeInput.addEventListener("input", () => {
    settings.volume = Number(volumeInput.value) / 100;
    saveSettings();
  });

  function addMessageFromInput() {
    const v = newMsgTextInput.value.trim();
    if (!v) return;
    if (settings.messages.includes(v)) {
      newMsgTextInput.value = "";
      return;
    }
    settings.messages.push(v);
    newMsgTextInput.value = "";
    saveSettings();
    renderMessages();
  }

  addMsgBtn.addEventListener("click", addMessageFromInput);
  newMsgTextInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addMessageFromInput();
    }
  });

  resetMsgsBtn.addEventListener("click", () => {
    if (!window.confirm("คืนค่าข้อความเตือนสติกลับเป็นชุดเริ่มต้น 8 ข้อความ? ข้อความที่เพิ่ม/ลบเองจะหายไป")) return;
    settings.messages = structuredCloneSafe(defaults.messages);
    saveSettings();
    renderMessages();
  });

  notifyEnabledInput.addEventListener("change", async () => {
    settings.notifyEnabled = notifyEnabledInput.checked;
    if (settings.notifyEnabled && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    updatePermissionHint();
    if (settings.notifyEnabled) {
      notifyEnabledInput.checked = settings.notifyEnabled;
    }
    saveSettings();
  });

  wakeLockInput.addEventListener("change", () => {
    settings.wakeLock = wakeLockInput.checked;
    saveSettings();
    applyWakeLock();
  });

  checkinEnabledInput.addEventListener("change", () => {
    settings.checkinEnabled = checkinEnabledInput.checked;
    saveSettings();
  });

  clearLogBtn.addEventListener("click", () => {
    log = [];
    saveLog();
    renderLog();
  });

  toggleBtn.addEventListener("click", () => {
    ensureAudioContext();
    if (running) stop();
    else start();
  });

  testBtn.addEventListener("click", () => {
    ensureAudioContext();
    const msg = pickNextMessage();
    playSound(settings.sound, settings.volume);
    changeBackground();
    showRingMessage(msg);
    if (settings.checkinEnabled) {
      openCheckin(msg, { isTest: true, logEntry: null });
    }
  });

  // install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    installBtn.hidden = true;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  });
  window.addEventListener("appinstalled", () => {
    installBtn.hidden = true;
  });

  // ---- init ----
  function init() {
    ringProgress.style.strokeDasharray = String(CIRC);
    setProgress(0);

    intervalMinutesInput.value = settings.intervalMinutes;
    useActiveWindowInput.checked = settings.useActiveWindow;
    activeWindowRow.style.display = settings.useActiveWindow ? "" : "none";
    activeStartInput.value = settings.activeStart;
    activeEndInput.value = settings.activeEnd;
    volumeInput.value = Math.round(settings.volume * 100);
    notifyEnabledInput.checked = settings.notifyEnabled;
    wakeLockInput.checked = settings.wakeLock;
    checkinEnabledInput.checked = settings.checkinEnabled;
    document.querySelectorAll(".sound-choice").forEach((b) => b.classList.toggle("active", b.dataset.sound === settings.sound));

    initModeUI();
    renderFixedTimes();
    renderMessages();
    renderLog();
    updatePermissionHint();
    updateToggleUI();
    updateUI();
    restoreBackground();
    primeAudioOnFirstInteraction();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }

    resumeFromSaved();
  }

  init();
})();
