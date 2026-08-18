(() => {
  "use strict";

  const STORAGE_KEY = "mindfulBell.settings.v1";
  const LOG_KEY = "mindfulBell.log.v1";
  const BG_KEY = "mindfulBell.bg.v1";
  const MERIT_KEY = "mindfulBell.merit.v1";
  const MINDFUL_MERIT_CATEGORY = "ภาวนามัย";
  let ringPathLength = 0;

  // The 10 บุญกิริยาวัตถุ (bases of meritorious action).
  const MERIT_CATEGORIES = [
    { key: "ทานมัย", desc: "ให้และแบ่งปัน", emoji: "🎁" },
    { key: "ศีลมัย", desc: "รักษาศีล งดเว้นชั่ว", emoji: "🛡️" },
    { key: "ภาวนามัย", desc: "ฝึกจิตให้สงบและมีปัญญา", emoji: "🧘" },
    { key: "อปจายนมัย", desc: "อ่อนน้อมถ่อมตน", emoji: "🙇" },
    { key: "เวยยาวัจจมัย", desc: "ช่วยเหลือขวนขวายกิจที่ดี", emoji: "🤝" },
    { key: "ปัตติทานมัย", desc: "อุทิศส่วนบุญให้ผู้อื่น", emoji: "🎗️" },
    { key: "ปัตตานุโมทนามัย", desc: "ยินดีในความดีของผู้อื่น", emoji: "🙌" },
    { key: "ธัมมัสสวนมัย", desc: "ฟังธรรม", emoji: "👂" },
    { key: "ธัมมเทสนามัย", desc: "แสดงหรือบอกเล่าธรรมะ", emoji: "📖" },
    { key: "ทิฏฐุชุกัมม์", desc: "ปรับความเห็นให้ถูกต้อง", emoji: "🧭" },
  ];

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

  const SESSION_INTRO = "ขอเรียนเชิญทุกท่านมาสร้างบุญ ฝึกทบทวนธรรมไปพร้อมๆกันครับ";

  // Fixed reading tone - no longer user-adjustable. Slower-than-native rates
  // make most system TTS voices (e.g. Windows' bundled Thai voice) garble or
  // drop words rather than sound calm, so this stays at native pace.
  const TTS_PITCH = 1;
  const TTS_RATE = 1;

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
      "ทุกข์หรือสุขย่อมผ่านไปเสมอ เพราะทุกสิ่งนั้นมีเกิดขึ้น ตั้งอยู่ ดับไป",
      "การขออนุโมทนาบุญ คือ ตามหลักพระพุทธศาสนา มีอานิสงส์และผลบุญในทางเดียวกับการกล่าวคำว่า \"สาธุ\" จัดอยู่ใน \"ปัตตานุโมทนามัย\" (บุญที่เกิดจากการยินดีในความดีของผู้อื่น) เช่นเดียวกัน อานิสงส์เด่นชัดดังนี้ ขยายกระแสบุญให้ใหญ่ขึ้น (ทวีคูณบุญ), ชำระจิตใจให้บริสุทธิ์จากกิเลส, อานิสงส์ดึงดูดกัลยาณมิตรและพวกพ้อง, ได้ทิพยสมบัติตามความเลื่อมใสของจิต",
      "\"สาธุ\" แปลว่า \"ดีแล้ว\" หรือ \"ชอบแล้ว ประเสริฐแล้ว\" ที่ใช้เปล่งวาจาเพื่อแสดงความเห็นชอบ อนุโมทนาบุญ และน้อมรับสิ่งดีงาม โดยมีอานิสงส์สำคัญดังนี้ ได้ส่วนแบ่งแห่งบุญกุศล, กำจัดกิเลสและตระกูลความริษยา, ส่งผลให้เกิดในสุคติภูมิและมีทิพยสมบัติ, อานิสงส์ทางกายภาพและวจีกรรม และเกื้อหนุนต่อการบรรลุมรรคผลนิพพาน",
      "วิธีการทำบุญ (บุญกิริยาวัตถุ 10) 1.บุญที่เกิดจากการให้ทานและการแบ่งปัน 2.บุญที่เกิดจากการรักษาศีลและความสำรวม 3.บุญที่เกิดจากการเจริญภาวนาหรือการพัฒนาจิตใจ 4.บุญที่เกิดจากการมีความอ่อนน้อมถ่อมตน 5.บุญที่เกิดจากการช่วยเหลือขวนขวายในกิจการงานที่ดี 6.บุญที่เกิดจากการยินดีในความดีของผู้อื่น 7.บุญที่เกิดจากการอุทิศส่วนบุญให้ผู้อื่น 8.บุญที่เกิดจากการฟังธรรม 9.บุญที่เกิดจากการแสดงธรรมหรือให้ความรู้ที่ถูกต้อง 10.บุญที่เกิดจากการปรับความเห็นให้ถูกต้องตามทำนองคลองธรรม",
      "บุญ คือ ความดี ความประพฤติชอบทางกาย วาจา และใจ หรือเครื่องชำระจิตใจให้สะอาดบริสุทธิ์ ผ่องใสจากกิเลส ให้ผลเป็นความสุขความเจริญแก่ผู้กระทำ ตรงข้ามกับบาป",
      "มีสติรู้ทันจิต: เมื่อจิตเคลื่อนไปคิด จิตเคลื่อนไปสุข จิตเคลื่อนไปทุกข์ หรือโกรธ ให้มีสติรู้ทันความเปลี่ยนแปลงนั้น",
      "รู้ทันความเปลี่ยนแปลงของจิต จะเห็นการเกิดขึ้น ตั้งอยู่ และดับไป",
      "มีสติรู้กายรู้ใจตามความเป็นจริง ด้วยจิตที่ตั้งมั่นและเป็นกลาง",
      "หายใจเข้า...หายใจออก...รู้ตัวอยู่กับลมหายใจ",
      "ตอนนี้คุณกำลังทำอะไรอยู่ รู้สึกอย่างไร ออกมาเป็นผู้ดู",
      "ผ่อนคลายร่างกาย ยิ้มเบาๆให้กับตัวเอง เห็นว่าตัวเองกำลังยิ้มทั้งภายนอกและภายในใช่หรือไม่",
      "หยุดสักครู่ รู้สึกถึงเท้าที่แตะพื้น รู้สึกถึงร่างกายส่วนอื่นที่กำลังเคลื่อนไหวอยู่",
      "ตาเห็นรูป จิตเกิดความเปลี่ยนแปลง ให้รู้ทัน",
      "หูได้ยินเสียง จิตเกิดความเปลี่ยนแปลง ให้รู้ทัน",
      "จมูกได้กลิ่น จิตเกิดความเปลี่ยนแปลง ให้รู้ทัน",
      "ลิ้นกระทบรส จิตเกิดความเปลี่ยนแปลง ให้รู้ทัน",
      "กายกระทบสัมผัส จิตเกิดความเปลี่ยนแปลง ให้รู้ทัน",
      "เมื่อจิตเกิดความปรุงแต่งต่อจากการนึกถึงคนๆหนึ่ง เช่นนึกถึงคนที่ชอบจะเกิดความสุขขึ้นมา หรือนึกถึงคนที่ไม่ชอบจะเกิดความทุกข์ขึ้นมา ให้เราก็มีสติรู้ทัน",
      "ไม่ว่าเราจะเจอสิ่งที่ดีหรือไม่ดีก็ตาม เราเลือกไม่ได้ กรรมมันส่งผลมาให้ เรามีหน้าต้องทำกรรมใหม่ที่ดี",
      "เกิดกระทบอารมณ์ จิตเกิดความเปลี่ยนแปลง จิตให้ค่า แล้วก็เกิดความยินดียินร้าย เกิดความพอใจไม่พอใจขึ้นมา...ให้รู้ทัน",
      "ฝึกรู้ทันจิตไปโดยไม่บังคับจิตให้เคลิ้มหรือเพ่งนิ่งจนเกินไป แต่ให้รู้ตัวด้วยจิตที่ตั้งมั่น",
      "กายและใจนี้ไม่ใช่ตัวตนที่แท้จริง แต่เป็นเพียงสิ่งเกิด ดับ และเป็นตัวทุกข์ เมื่อจิตเห็นความจริงจะคลายความยึดถือ",
    ],
    notifyEnabled: true,
    wakeLock: false,
    checkinEnabled: true,
    ttsEnabled: true,
    ttsVoiceURI: "",
    meritReminderEnabled: true,
    meritReminderTime: "21:00",
    userDisplayName: "",
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

  const POSTURES = [
    { key: "นั่ง", emoji: "🧘" },
    { key: "นอน", emoji: "🛌" },
    { key: "ยืน", emoji: "🧍" },
    { key: "เดิน", emoji: "🚶" },
  ];

  // Split into intro/detail so speech plays as two shorter utterances
  // instead of one long one - long single utterances are where the Thai
  // system voice tends to garble words. Wording is unchanged either way.
  const POSTURE_GUIDANCE = {
    "ยืน": { intro: "ตอนนี้คุณอยู่ในท่ายืน", detail: "ให้รู้สึกตัวทั่วพร้อม ตั้งกายตรงมั่นคง รู้ว่ากำลังยืน ทรงตัวด้วยเท้าทั้งสองข้าง และลมหายใจเข้าออก" },
    "เดิน": { intro: "ตอนนี้คุณอยู่ในท่าเดิน", detail: "ให้รู้สึกถึงการก้าวเท้า ขยับเท้า หรือน้ำหนักที่กระทบพื้น และลมหายใจเข้าออก" },
    "นั่ง": { intro: "ตอนนี้คุณอยู่ในท่านั่ง", detail: "ให้รู้สึกถึงน้ำหนักตัวที่กดทับ และฐานที่ตั้งมั่นของร่างกาย และลมหายใจเข้าออก" },
    "นอน": { intro: "ตอนนี้คุณอยู่ในท่านอน", detail: "ให้รู้สึกถึงการผ่อนคลาย การสัมผัสพื้นหรือที่นอน และลมหายใจเข้าออก" },
  };

  function postureGuidanceText(key) {
    const g = POSTURE_GUIDANCE[key];
    return g ? `${g.intro} ${g.detail}` : "";
  }


  let settings = loadSettings();
  let log = loadLog();
  let currentMessageIndex = -1;
  let availableVoices = [];
  let autoVoicePicked = false;
  let checkinPhase = null;
  let checkinIsTest = false;
  let checkinLogEntry = null;
  let checkinBeforeEmotion = null;
  let checkinAfterEmotion = null;
  let checkinIntensity = null;
  let checkinPosture = null;
  let checkinMessageText = "";
  let meritLog = loadMeritLog();
  let meritReminderTimerHandle = null;
  let meritPhase = null;
  let meritSummaryText = "";

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
  const toggleMsgsBtn = el("toggleMsgsBtn");
  const msgListWrap = el("msgListWrap");
  const ringMessageEl = el("ringMessage");
  const notifyEnabledInput = el("notifyEnabled");
  const wakeLockInput = el("wakeLock");
  const checkinEnabledInput = el("checkinEnabled");
  const checkinOverlay = el("checkinOverlay");
  const checkinBody = el("checkinBody");
  const checkinCloseBtn = el("checkinCloseBtn");
  const ttsEnabledInput = el("ttsEnabled");
  const permissionHint = el("permissionHint");
  const logList = el("logList");
  const clearLogBtn = el("clearLog");
  const toggleLogBtn = el("toggleLogBtn");
  const meritTotalEl = el("meritTotal");
  const meritListEl = el("meritList");
  const meritCatGrid = el("meritCatGrid");
  const newMeritDetailInput = el("newMeritDetail");
  const meritReminderEnabledInput = el("meritReminderEnabled");
  const meritReminderTimeInput = el("meritReminderTime");
  const userDisplayNameInput = el("userDisplayName");
  const shareMeritBtn = el("shareMeritBtn");
  const shareMeritHint = el("shareMeritHint");
  const clearMeritBtn = el("clearMerit");
  const meritOverlay = el("meritOverlay");
  const meritBody = el("meritBody");
  const meritCloseBtn = el("meritCloseBtn");
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
    const handler = () => {
      ensureAudioContext();
      primeSpeech();
    };
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
      requireInteraction: true,
      renotify: true,
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

  // ---- text-to-speech ----
  const ttsSupported = "speechSynthesis" in window;

  // The Web Speech API exposes no gender field on a voice, so this falls back to
  // matching known voice names by platform (Windows/macOS/iOS/Android/Chrome OS).
  const FEMALE_NAME_HINTS = ["premwadee", "achara", "kanya", "narisa", "female", "หญิง", "woman", "zira", "samantha", "victoria", "susan", "karen", "moira", "tessa", "catherine", "kate", "linda", "google ไทย หญิง"];
  const MALE_NAME_HINTS = ["pattara", "niwat", "ekkarat", "male", "ชาย", "\\bman\\b", "david", "mark", "daniel", "george", "fred", "alex", "james"];

  function findVoiceForGender(gender) {
    const thai = availableVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("th"));
    const pool = thai.length ? thai : availableVoices;
    const hints = gender === "female" ? FEMALE_NAME_HINTS : MALE_NAME_HINTS;
    const oppositeHints = gender === "female" ? MALE_NAME_HINTS : FEMALE_NAME_HINTS;

    const named = pool.find((v) => hints.some((h) => new RegExp(h, "i").test(v.name)));
    if (named) return named;

    const notOpposite = pool.filter((v) => !oppositeHints.some((h) => new RegExp(h, "i").test(v.name)));
    return notOpposite[0] || pool[0] || null;
  }

  function loadVoices() {
    if (!ttsSupported) return;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    availableVoices = voices;
    if (!settings.ttsVoiceURI && !autoVoicePicked) {
      autoVoicePicked = true;
      const femaleVoice = findVoiceForGender("female");
      if (femaleVoice) {
        settings.ttsVoiceURI = femaleVoice.voiceURI;
        saveSettings();
      }
    }
  }

  function primeSpeech() {
    if (!ttsSupported) return;
    try {
      speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    } catch (e) {
      /* ignore */
    }
  }

  function speakMessage(text, onEnd, pitchOverride) {
    if (!settings.ttsEnabled || !ttsSupported || !text) {
      if (onEnd) onEnd();
      return;
    }
    try {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "th-TH";
      utter.pitch = typeof pitchOverride === "number" ? pitchOverride : TTS_PITCH;
      utter.rate = TTS_RATE;
      utter.volume = Math.max(0, Math.min(1, settings.volume));
      if (settings.ttsVoiceURI) {
        const v = availableVoices.find((v) => v.voiceURI === settings.ttsVoiceURI);
        if (v) utter.voice = v;
      }
      if (onEnd) {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          onEnd();
        };
        utter.onend = finish;
        utter.onerror = finish;
        // Safety net: some browsers occasionally never fire onend.
        setTimeout(finish, Math.min(15000, Math.max(2500, text.length * 90)));
      }
      // Calling speak() synchronously right after cancel() can silently drop
      // the utterance in Chrome/Edge after the engine has been used a few
      // times in the same session. Deferring a tick, plus a pause/resume
      // nudge, works around that stuck-queue bug.
      setTimeout(() => {
        speechSynthesis.resume();
        speechSynthesis.speak(utter);
      }, 60);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  // Long messages (numbered lists, comma-separated anisong lists) read as one
  // run-on utterance are hard to follow even at rate=1. This breaks them into
  // shorter phrase-sized chunks - on their own numbered item, on commas for
  // list sentences, and finally word-wrapped as a fallback for any clause
  // that's still long with no punctuation to break on - without touching the
  // wording itself.
  function wrapWords(text, maxLen) {
    const words = text.split(/\s+/).filter(Boolean);
    const out = [];
    let buf = "";
    words.forEach((w) => {
      const candidate = buf ? `${buf} ${w}` : w;
      if (candidate.length > maxLen && buf) {
        out.push(buf);
        buf = w;
      } else {
        buf = candidate;
      }
    });
    if (buf) out.push(buf);
    return out;
  }

  function splitForSpeech(text) {
    if (!text) return [];
    const maxLen = 70;
    const normalized = text.replace(/(\d{1,2})\.(?=\S)/g, "\n$1. ");
    const lines = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
    const chunks = [];
    lines.forEach((line) => {
      if (line.length <= maxLen) {
        chunks.push(line);
        return;
      }
      const commaParts = line.split(/,\s*/);
      let buf = "";
      commaParts.forEach((part) => {
        const candidate = buf ? `${buf}, ${part}` : part;
        if (candidate.length > maxLen && buf) {
          chunks.push(buf);
          buf = part;
        } else {
          buf = candidate;
        }
      });
      if (buf) chunks.push(buf);
    });
    const wrapped = [];
    chunks.forEach((c) => {
      if (c.length <= maxLen * 1.4) {
        wrapped.push(c);
      } else {
        wrapWords(c, maxLen).forEach((w) => wrapped.push(w));
      }
    });
    return wrapped.length ? wrapped : [text];
  }

  function speakChunks(chunks, onEnd, pitchOverride) {
    if (!chunks.length) {
      if (onEnd) onEnd();
      return;
    }
    let i = 0;
    function next() {
      if (i >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }
      speakMessage(chunks[i++], next, pitchOverride);
    }
    next();
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

  function bellDecayMs(sound) {
    const preset = SOUND_PRESETS[sound] || SOUND_PRESETS.tibetan;
    return preset.decay * 1000 + 300;
  }

  function ringBell() {
    const msg = pickNextMessage();
    changeBackground();
    showRingMessage(msg);
    const entry = addLogEntry(new Date(), msg);
    sendNotification(msg);

    playSound("chime", settings.volume);
    setTimeout(() => {
      if (settings.checkinEnabled) {
        openCheckin(msg, { isTest: false, logEntry: entry });
      }
    }, bellDecayMs("chime"));
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
    const offset = ringPathLength - ringPathLength * Math.min(1, Math.max(0, p));
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
    const entry = { t: date.getTime(), msg: msg || "", before: null, after: null, intensity: null, posture: null };
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
        let text = `อารมณ์ก่อน: ${entry.before || "ข้าม"} · หลัง: ${entry.after || "ข้าม"}`;
        if (entry.intensity) text += ` (${entry.intensity})`;
        if (entry.posture) text += ` · อิริยาบถ: ${entry.posture}`;
        emoP.textContent = text;
        li.appendChild(emoP);
      }
      logList.appendChild(li);
    });
  }

  // ---- merit pool (เสบียงบุญ) ----
  function loadMeritLog() {
    try {
      const raw = localStorage.getItem(MERIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMeritLog() {
    localStorage.setItem(MERIT_KEY, JSON.stringify(meritLog.slice(0, 500)));
  }

  function isSameDay(t1, t2) {
    return new Date(t1).toDateString() === new Date(t2).toDateString();
  }

  function getTodayMeritEntries() {
    const now = Date.now();
    return meritLog.filter((e) => isSameDay(e.t, now));
  }

  function addMeritEntry(category, detail, source) {
    const entry = { t: Date.now(), category: category || "ทานมัย", detail: detail || "", source: source || "manual" };
    meritLog.unshift(entry);
    meritLog = meritLog.slice(0, 500);
    saveMeritLog();
    renderMeritPanel();
    return entry;
  }

  function getMeritGroupedToday() {
    const groups = {};
    const order = [];
    getTodayMeritEntries().forEach((e) => {
      const cat = e.category || "ทานมัย";
      if (!groups[cat]) {
        groups[cat] = { count: 0, details: [] };
        order.push(cat);
      }
      groups[cat].count += 1;
      if (e.detail) groups[cat].details.push(e.detail);
    });
    return { groups, order };
  }

  function renderMeritPanel() {
    const { groups, order } = getMeritGroupedToday();
    const total = order.reduce((sum, cat) => sum + groups[cat].count, 0);
    meritTotalEl.textContent = `${total} ครั้ง`;

    meritListEl.innerHTML = "";
    if (!order.length) {
      const li = document.createElement("li");
      li.className = "log-empty";
      li.textContent = "วันนี้ยังไม่มีบุญสะสม";
      meritListEl.appendChild(li);
      return;
    }
    // Show in the canonical บุญกิริยาวัตถุ 10 order, only categories used today.
    MERIT_CATEGORIES.filter((c) => groups[c.key]).forEach((c) => {
      const g = groups[c.key];
      const li = document.createElement("li");
      const row = document.createElement("div");
      row.className = "log-row";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${c.emoji} ${c.key}`;
      const countSpan = document.createElement("span");
      countSpan.textContent = `${g.count} ครั้ง`;
      row.appendChild(nameSpan);
      row.appendChild(countSpan);
      li.appendChild(row);
      if (g.details.length) {
        const detailP = document.createElement("p");
        detailP.className = "log-msg";
        detailP.textContent = g.details.join(" · ");
        li.appendChild(detailP);
      }
      meritListEl.appendChild(li);
    });
  }

  function buildMeritSummaryText() {
    const { groups, order } = getMeritGroupedToday();
    if (!order.length) {
      return "วันนี้ยังไม่มีบุญที่บันทึกไว้เลย ลองทบทวนดูว่าวันนี้ได้ทำความดีอะไรบ้าง";
    }
    const total = order.reduce((sum, cat) => sum + groups[cat].count, 0);
    const parts = MERIT_CATEGORIES.filter((c) => groups[c.key]).map((c) => `${c.key} ${groups[c.key].count} ครั้ง`);
    return `วันนี้คุณได้สร้างบุญไว้ดังนี้ ${parts.join(", ")} รวมทั้งหมด ${total} ครั้ง`;
  }

  // Human-readable version for sharing outside the app (LINE, Facebook, etc.)
  // No accounts/backend involved - this just formats text for the OS share
  // sheet or clipboard, so others can see and reply "อนุโมทนา" wherever shared.
  function buildShareSummaryText() {
    const { groups, order } = getMeritGroupedToday();
    const who = (settings.userDisplayName || "").trim() || "ฉัน";
    if (!order.length) {
      return `🙏 วันนี้ ${who} ยังไม่ได้บันทึกบุญไว้เลย`;
    }
    const total = order.reduce((sum, cat) => sum + groups[cat].count, 0);
    const lines = MERIT_CATEGORIES.filter((c) => groups[c.key]).map((c) => `${c.emoji} ${c.key} ${groups[c.key].count} ครั้ง`);
    return `🙏 บุญที่ ${who} ทำวันนี้\n${lines.join("\n")}\n\nรวมทั้งหมด ${total} ครั้ง\n\nขอเชิญร่วมอนุโมทนาบุญด้วยกัน สาธุ`;
  }

  function getNextMeritTriggerTimestamp(fromMs) {
    const from = new Date(fromMs);
    const time = settings.meritReminderTime || "21:00";
    const cand = dateAt(from, time);
    if (cand.getTime() > fromMs) return cand.getTime();
    const tomorrow = new Date(from);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateAt(tomorrow, time).getTime();
  }

  function scheduleMeritReminder() {
    clearTimeout(meritReminderTimerHandle);
    if (!settings.meritReminderEnabled) return;
    const next = getNextMeritTriggerTimestamp(Date.now());
    meritReminderTimerHandle = setTimeout(triggerMeritReminder, Math.max(0, next - Date.now()));
  }

  function triggerMeritReminder() {
    const summary = buildMeritSummaryText();
    playSound("chime", settings.volume);
    setTimeout(() => {
      openMeritOverlay(summary);
      speakChunks(splitForSpeech(summary));
    }, bellDecayMs("chime"));
    scheduleMeritReminder();
  }

  // The Web Speech API has a single sequential queue - there is no way to make
  // two utterances truly overlap into a "many voices at once" sound. This
  // speaks the line twice back-to-back with a shifted pitch on the second
  // pass as the closest practical approximation of a group response.
  function speakGroupBlessing(text) {
    if (!settings.ttsEnabled || !ttsSupported) return;
    speakMessage(text, () => {
      speakMessage(text, null, Math.max(0, Math.min(2, TTS_PITCH - 0.2)));
    });
  }

  function openMeritOverlay(summaryText) {
    meritPhase = "summary";
    meritSummaryText = summaryText;
    meritOverlay.classList.add("open");
    renderMeritOverlay();
  }

  function closeMeritOverlay() {
    meritOverlay.classList.remove("open");
    meritPhase = null;
  }

  function renderMeritOverlay() {
    meritBody.innerHTML = "";
    if (meritPhase === "summary") {
      const eyebrow = document.createElement("p");
      eyebrow.className = "checkin-eyebrow";
      eyebrow.textContent = "🙏 ถึงเวลาอนุโมทนาบุญ";
      const msg = document.createElement("p");
      msg.className = "checkin-message";
      msg.textContent = meritSummaryText;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary-btn checkin-primary";
      btn.textContent = "อธิษฐานบุญ";
      btn.addEventListener("click", () => {
        meritPhase = "blessing";
        renderMeritOverlay();
        speakGroupBlessing("ขออนุโมทนาบุญกับทุกท่าน สาธุ สาธุ สาธุ");
      });
      meritBody.appendChild(eyebrow);
      meritBody.appendChild(msg);
      meritBody.appendChild(btn);
    } else if (meritPhase === "blessing") {
      const done = document.createElement("p");
      done.className = "checkin-done";
      done.textContent = "ขออนุโมทนาบุญกับทุกท่าน 🙏\nสาธุ สาธุ สาธุ";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary-btn checkin-primary";
      btn.textContent = "ปิด";
      btn.addEventListener("click", closeMeritOverlay);
      meritBody.appendChild(done);
      meritBody.appendChild(btn);
    }
  }

  function renderMeritCatGrid() {
    meritCatGrid.innerHTML = "";
    MERIT_CATEGORIES.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "merit-cat-choice";
      const nameEl = document.createElement("span");
      nameEl.className = "merit-cat-name";
      const emoji = document.createElement("span");
      emoji.className = "merit-cat-emoji";
      emoji.textContent = c.emoji;
      nameEl.appendChild(emoji);
      nameEl.appendChild(document.createTextNode(c.key));
      const descEl = document.createElement("span");
      descEl.className = "merit-cat-desc";
      descEl.textContent = c.desc;
      btn.appendChild(nameEl);
      btn.appendChild(descEl);
      btn.addEventListener("click", () => {
        const detail = newMeritDetailInput.value.trim();
        addMeritEntry(c.key, detail, "manual");
        newMeritDetailInput.value = "";
      });
      meritCatGrid.appendChild(btn);
    });
  }

  meritReminderEnabledInput.addEventListener("change", () => {
    settings.meritReminderEnabled = meritReminderEnabledInput.checked;
    saveSettings();
    scheduleMeritReminder();
  });

  meritReminderTimeInput.addEventListener("change", () => {
    settings.meritReminderTime = meritReminderTimeInput.value || "21:00";
    saveSettings();
    scheduleMeritReminder();
  });

  userDisplayNameInput.addEventListener("change", () => {
    settings.userDisplayName = userDisplayNameInput.value.trim();
    saveSettings();
  });

  shareMeritBtn.addEventListener("click", async () => {
    const text = buildShareSummaryText();
    shareMeritHint.textContent = "";
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // user closed the share sheet without picking anything - not an error
      }
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        shareMeritHint.textContent = "คัดลอกข้อความแล้ว วางไปที่แอปที่ต้องการแชร์ได้เลย";
      } catch (e) {
        shareMeritHint.textContent = "คัดลอกไม่สำเร็จ ลองอีกครั้ง";
      }
      return;
    }
    shareMeritHint.textContent = "เบราว์เซอร์นี้ไม่รองรับการแชร์อัตโนมัติ";
  });

  clearMeritBtn.addEventListener("click", () => {
    meritLog = [];
    saveMeritLog();
    renderMeritPanel();
  });

  meritCloseBtn.addEventListener("click", closeMeritOverlay);

  // ---- emotion check-in ----
  function buildOptionGrid(list, onPick) {
    const grid = document.createElement("div");
    grid.className = "emotion-grid";
    list.forEach((e) => {
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
    checkinPhase = "posture";
    checkinBeforeEmotion = null;
    checkinAfterEmotion = null;
    checkinIntensity = null;
    checkinPosture = null;
    checkinMessageText = messageText;
    checkinOverlay.classList.add("open");
    renderCheckin();
  }

  function persistCheckinEmotions() {
    if (!checkinLogEntry) return;
    checkinLogEntry.before = checkinBeforeEmotion;
    checkinLogEntry.after = checkinAfterEmotion;
    checkinLogEntry.intensity = checkinIntensity;
    checkinLogEntry.posture = checkinPosture;
    saveLog();
    renderLog();
  }

  function finishCheckin() {
    persistCheckinEmotions();
    checkinOverlay.classList.remove("open");
    checkinPhase = null;
  }

  function closeCheckin() {
    if (checkinPhase && (checkinBeforeEmotion || checkinAfterEmotion || checkinPosture)) {
      persistCheckinEmotions();
    }
    checkinOverlay.classList.remove("open");
    checkinPhase = null;
  }

  function renderCheckin() {
    checkinBody.innerHTML = "";
    if (checkinPhase === "posture") {
      const eyebrow = document.createElement("p");
      eyebrow.className = "checkin-eyebrow";
      eyebrow.textContent = "🔔 ระฆังดังแล้ว";
      const q = document.createElement("p");
      q.className = "checkin-question";
      q.textContent = "ตอนนี้คุณอยู่ในอิริยาบถแบบใด?";
      checkinBody.appendChild(eyebrow);
      checkinBody.appendChild(q);
      checkinBody.appendChild(
        buildOptionGrid(POSTURES, (key) => {
          checkinPosture = key;
          checkinPhase = "postureGuidance";
          renderCheckin();
        })
      );
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "link-btn checkin-skip";
      skip.textContent = "ข้ามขั้นตอนนี้";
      skip.addEventListener("click", () => {
        checkinPhase = "before";
        renderCheckin();
      });
      checkinBody.appendChild(skip);
      speakMessage(q.textContent, () => speakMessage("นั่งหรือนอนหรือยืนหรือเดิน"));
    } else if (checkinPhase === "postureGuidance") {
      const msg = document.createElement("p");
      msg.className = "checkin-message";
      msg.textContent = postureGuidanceText(checkinPosture);
      checkinBody.appendChild(msg);

      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        checkinPhase = "before";
        renderCheckin();
      };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary-btn checkin-primary";
      btn.textContent = "ต่อไป";
      btn.addEventListener("click", advance);
      checkinBody.appendChild(btn);

      const guidance = POSTURE_GUIDANCE[checkinPosture];
      if (guidance) {
        speakMessage(guidance.intro, () => speakMessage(guidance.detail, advance));
      } else {
        advance();
      }
    } else if (checkinPhase === "before") {
      const q = document.createElement("p");
      q.className = "checkin-question";
      q.textContent = "ตอนนี้อารมณ์ของคุณเป็นอย่างไร?";
      checkinBody.appendChild(q);
      checkinBody.appendChild(
        buildOptionGrid(EMOTIONS, (key) => {
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
      speakMessage(q.textContent);
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
        if (!checkinIsTest) addMeritEntry(MINDFUL_MERIT_CATEGORY, "ฝึกมีสติ", "mindfulness");
        checkinPhase = "after";
        renderCheckin();
      });
      checkinBody.appendChild(btn);
      speakMessage(SESSION_INTRO, () => speakChunks(splitForSpeech(checkinMessageText)));
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
        buildOptionGrid(EMOTIONS, (key) => {
          checkinAfterEmotion = key;
          if (checkinBeforeEmotion && key === checkinBeforeEmotion) {
            checkinPhase = "intensity";
            renderCheckin();
          } else {
            finishCheckin();
          }
        })
      );
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "link-btn checkin-skip";
      skip.textContent = "ข้ามขั้นตอนนี้";
      skip.addEventListener("click", finishCheckin);
      checkinBody.appendChild(skip);
    } else if (checkinPhase === "intensity") {
      const q = document.createElement("p");
      q.className = "checkin-question";
      q.textContent = `ตอนนี้ "${checkinAfterEmotion}" มากขึ้น หรือลดลง เมื่อเทียบกับก่อนหน้า?`;
      checkinBody.appendChild(q);

      const grid = document.createElement("div");
      grid.className = "intensity-grid";
      [
        { key: "มากขึ้น", emoji: "📈" },
        { key: "ลดลง", emoji: "📉" },
      ].forEach(({ key, emoji }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "intensity-btn";
        const em = document.createElement("span");
        em.className = "intensity-emoji";
        em.textContent = emoji;
        const label = document.createElement("span");
        label.textContent = key;
        btn.appendChild(em);
        btn.appendChild(label);
        btn.addEventListener("click", () => {
          checkinIntensity = key;
          finishCheckin();
        });
        grid.appendChild(btn);
      });
      checkinBody.appendChild(grid);

      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "link-btn checkin-skip";
      skip.textContent = "ข้ามขั้นตอนนี้";
      skip.addEventListener("click", finishCheckin);
      checkinBody.appendChild(skip);
    }
  }

  checkinCloseBtn.addEventListener("click", closeCheckin);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (checkinOverlay.classList.contains("open")) closeCheckin();
    if (meritOverlay.classList.contains("open")) closeMeritOverlay();
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
    if (!window.confirm(`คืนค่าข้อความเตือนสติกลับเป็นชุดเริ่มต้น ${defaults.messages.length} ข้อความ? ข้อความที่เพิ่ม/ลบเองจะหายไป`)) return;
    settings.messages = structuredCloneSafe(defaults.messages);
    saveSettings();
    renderMessages();
  });

  toggleMsgsBtn.addEventListener("click", () => {
    const expanded = toggleMsgsBtn.getAttribute("aria-expanded") === "true";
    const next = !expanded;
    toggleMsgsBtn.setAttribute("aria-expanded", String(next));
    msgListWrap.hidden = !next;
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

  ttsEnabledInput.addEventListener("change", () => {
    settings.ttsEnabled = ttsEnabledInput.checked;
    saveSettings();
  });

  clearLogBtn.addEventListener("click", () => {
    log = [];
    saveLog();
    renderLog();
  });

  toggleLogBtn.addEventListener("click", () => {
    const nowHidden = !logList.hidden;
    logList.hidden = nowHidden;
    toggleLogBtn.textContent = nowHidden ? "แสดงประวัติ" : "ซ่อนประวัติ";
  });

  toggleBtn.addEventListener("click", () => {
    ensureAudioContext();
    if (running) stop();
    else start();
  });

  testBtn.addEventListener("click", () => {
    ensureAudioContext();
    const msg = pickNextMessage();
    changeBackground();
    showRingMessage(msg);

    playSound("chime", settings.volume);
    setTimeout(() => {
      if (settings.checkinEnabled) {
        openCheckin(msg, { isTest: true, logEntry: null });
      }
    }, bellDecayMs("chime"));
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

  // Native <input type="time"> shows AM/PM based on the OS/browser locale,
  // not the page's lang="th" - so Thai users still see "08:00 AM" regardless.
  // These hour/minute selects guarantee a 24-hour "น." display for everyone,
  // while still exposing a .value ("HH:MM") + "change" event so the rest of
  // the app can treat it exactly like the native input it replaced.
  function initTimePicker(container, initialValue) {
    const hourSelect = document.createElement("select");
    hourSelect.className = "time-hour";
    hourSelect.setAttribute("aria-label", "ชั่วโมง");
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = String(h).padStart(2, "0");
      opt.textContent = opt.value;
      hourSelect.appendChild(opt);
    }
    const colon = document.createElement("span");
    colon.className = "time-colon";
    colon.textContent = ":";
    const minuteSelect = document.createElement("select");
    minuteSelect.className = "time-minute";
    minuteSelect.setAttribute("aria-label", "นาที");
    for (let m = 0; m < 60; m++) {
      const opt = document.createElement("option");
      opt.value = String(m).padStart(2, "0");
      opt.textContent = opt.value;
      minuteSelect.appendChild(opt);
    }
    const suffix = document.createElement("span");
    suffix.className = "time-suffix";
    suffix.textContent = "น.";

    container.innerHTML = "";
    container.appendChild(hourSelect);
    container.appendChild(colon);
    container.appendChild(minuteSelect);
    container.appendChild(suffix);

    function apply(value) {
      const m = /^(\d{1,2}):(\d{1,2})$/.exec(value || "");
      if (!m) return;
      hourSelect.value = String(Math.min(23, Number(m[1]))).padStart(2, "0");
      minuteSelect.value = String(Math.min(59, Number(m[2]))).padStart(2, "0");
    }
    apply(initialValue);

    Object.defineProperty(container, "value", {
      get() {
        return `${hourSelect.value}:${minuteSelect.value}`;
      },
      set(v) {
        apply(v);
      },
    });

    const fireChange = () => container.dispatchEvent(new Event("change"));
    hourSelect.addEventListener("change", fireChange);
    minuteSelect.addEventListener("change", fireChange);
  }

  // ---- init ----
  function init() {
    initTimePicker(activeStartInput, settings.activeStart);
    initTimePicker(activeEndInput, settings.activeEnd);
    initTimePicker(newFixedTimeInput, "09:00");
    initTimePicker(meritReminderTimeInput, settings.meritReminderTime);

    ringPathLength = ringProgress.getTotalLength();
    ringProgress.style.strokeDasharray = String(ringPathLength);
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

    ttsEnabledInput.checked = settings.ttsEnabled;
    if (!ttsSupported) {
      settings.ttsEnabled = false;
      ttsEnabledInput.checked = false;
      ttsEnabledInput.disabled = true;
    } else {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    meritReminderEnabledInput.checked = settings.meritReminderEnabled;
    meritReminderTimeInput.value = settings.meritReminderTime;
    userDisplayNameInput.value = settings.userDisplayName || "";
    renderMeritCatGrid();
    renderMeritPanel();
    scheduleMeritReminder();

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
