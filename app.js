(() => {
  "use strict";

  const STORAGE_KEY = "mindfulBell.settings.v1";
  const LOG_KEY = "mindfulBell.log.v1";
  const CIRC = 2 * Math.PI * 52;

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
    message: "หยุดสักครู่... หายใจเข้าลึกๆ แล้วรู้สึกตัว",
    notifyEnabled: true,
    wakeLock: false,
    runtime: { running: false, anchorTime: null },
  };

  let settings = loadSettings();
  let log = loadLog();

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
  const messageInput = el("message");
  const notifyEnabledInput = el("notifyEnabled");
  const wakeLockInput = el("wakeLock");
  const permissionHint = el("permissionHint");
  const logList = el("logList");
  const clearLogBtn = el("clearLog");
  const installBtn = el("installBtn");

  // ---- storage ----
  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneSafe(defaults);
      const saved = JSON.parse(raw);
      return Object.assign(structuredCloneSafe(defaults), saved, {
        runtime: Object.assign({}, defaults.runtime, saved.runtime || {}),
      });
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
  async function sendNotification() {
    if (!settings.notifyEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const title = "ระฆังเตือนสติ";
    const options = {
      body: settings.message || "หยุดสักครู่ หายใจเข้าลึกๆ",
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

  function ringBell() {
    playSound(settings.sound, settings.volume);
    addLogEntry(new Date());
    sendNotification();
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
  function addLogEntry(date) {
    log.unshift({ t: date.getTime() });
    log = log.slice(0, 30);
    saveLog();
    renderLog();
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
      li.innerHTML = `<span>${formatClock(d)} น.</span><span>${dateLabel}</span>`;
      logList.appendChild(li);
    });
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

  messageInput.addEventListener("change", () => {
    settings.message = messageInput.value.trim() || defaults.message;
    saveSettings();
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
    playSound(settings.sound, settings.volume);
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
    messageInput.value = settings.message;
    notifyEnabledInput.checked = settings.notifyEnabled;
    wakeLockInput.checked = settings.wakeLock;
    document.querySelectorAll(".sound-choice").forEach((b) => b.classList.toggle("active", b.dataset.sound === settings.sound));

    initModeUI();
    renderFixedTimes();
    renderLog();
    updatePermissionHint();
    updateToggleUI();
    updateUI();
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
