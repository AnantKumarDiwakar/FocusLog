// 1. CONNECT TO HTML ELEMENTS
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const pipBtn = document.getElementById("pip-btn");
const orientationBadgeEl = document.getElementById("orientation-badge");

const subjectSelect = document.getElementById("subject-select");
const toggleSubjectBtn = document.getElementById("toggle-subject-btn");
const addSubjectRow = document.getElementById("add-subject-row");
const newSubjectInput = document.getElementById("new-subject-input");
const saveSubjectBtn = document.getElementById("save-subject-btn");
const tagButtons = document.querySelectorAll(".tag-pill");
const sessionNoteInput = document.getElementById("session-note-input");
const studyFieldsEl = document.getElementById("study-fields");

const breakPromptEl = document.getElementById("break-prompt");
const quickBreakButtons = document.querySelectorAll(".quick-break-btn");
const dismissBreakBtn = document.getElementById("dismiss-break-btn");

const dailyGoalTextEl = document.getElementById("daily-goal-text");
const dailyGoalPercentEl = document.getElementById("daily-goal-percent");
const dailyGoalFillEl = document.getElementById("daily-goal-fill");
const editGoalBtn = document.getElementById("edit-goal-btn");
const goalEditRow = document.getElementById("goal-edit-row");
const dailyGoalInput = document.getElementById("daily-goal-input");
const saveGoalBtn = document.getElementById("save-goal-btn");

const subjectTargetsListEl = document.getElementById("subject-targets-list");
const editTargetsBtn = document.getElementById("edit-targets-btn");

const modeStopwatchBtn = document.getElementById("mode-stopwatch-btn");
const modeCountdownBtn = document.getElementById("mode-countdown-btn");
const modeBreakBtn = document.getElementById("mode-break-btn");
const countdownPresetsEl = document.getElementById("countdown-presets");
const presetButtons = document.querySelectorAll(".preset-pill");
const customMinsInput = document.getElementById("custom-mins-input");
const breakPresetsEl = document.getElementById("break-presets");
const breakButtons = document.querySelectorAll(".break-pill");

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const finishBtn = document.getElementById("finish-btn");

const toggleManualBtn = document.getElementById("toggle-manual-btn");
const manualEntryForm = document.getElementById("manual-entry-form");
const manualSubjectSelect = document.getElementById("manual-subject");
const manualTagSelect = document.getElementById("manual-tag");
const manualDateInput = document.getElementById("manual-date");
const manualHoursInput = document.getElementById("manual-hours");
const manualMinsInput = document.getElementById("manual-mins");
const manualNoteInput = document.getElementById("manual-note");
const saveManualBtn = document.getElementById("save-manual-btn");
const cancelManualBtn = document.getElementById("cancel-manual-btn");

const filterSearchInput = document.getElementById("filter-search");
const filterSubjectSelect = document.getElementById("filter-subject");
const filterTagSelect = document.getElementById("filter-tag");
const filterSummaryEl = document.getElementById("filter-summary");

const sessionList = document.getElementById("session-list");
const todayTotalEl = document.getElementById("today-total");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file");

const streakValueEl = document.getElementById("streak-value");
const sharePriceValueEl = document.getElementById("share-price-value");
const sharePriceDeltaEl = document.getElementById("share-price-delta");
const weekTotalEl = document.getElementById("week-total");
const alltimeTotalEl = document.getElementById("alltime-total");
const heatmapGridEl = document.getElementById("heatmap-grid");
const shareCanvas = document.getElementById("share-chart");
const subjectCanvas = document.getElementById("subject-chart");
const dailyCanvas = document.getElementById("daily-chart");

// 2. APPLICATION STATE & CONFIG
const SESSIONS_KEY = "focuslog_sessions_v1";
const SUBJECTS_KEY = "focuslog_subjects_v1";
const SETTINGS_KEY = "focuslog_settings_v1";

const COLOR_PALETTE = [
  "#3b82f6", "#a855f7", "#f59e0b", "#10b981",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16",
  "#6366f1", "#14b8a6"
];

const DEFAULT_SUBJECTS = [
  { name: "Political Science", color: "#3b82f6", dailyTargetMins: 90 },
  { name: "Philosophy", color: "#a855f7", dailyTargetMins: 90 },
  { name: "Aptitude & Reasoning", color: "#f59e0b", dailyTargetMins: 45 },
  { name: "Current Affairs", color: "#10b981", dailyTargetMins: 45 }
];

let subjects = [];
let sessions = [];
let settings = { dailyGoalMins: 240, theme: "dark" };
let selectedTag = "Reading";
let isManagingSubjects = false;

// Timer & Mini-Window State
let timerMode = "stopwatch";
let lastStudyMode = "stopwatch";
let countdownTargetMins = 25;
let breakTargetMins = 5;
let startTime = null;
let accumulatedMs = 0;
let timerInterval = null;
let miniWindow = null;

let shareChartInstance = null;
let subjectChartInstance = null;
let dailyChartInstance = null;

// 3. HELPER FUNCTIONS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getLocalDateKey(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatBadgeDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatMinsLabel(mins) {
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours === 0) return `${remMins}m`;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h 0m`;
}

function getElapsedMs() {
  if (startTime === null) return accumulatedMs;
  return accumulatedMs + (Date.now() - startTime);
}

function sortSessionsNewestFirst() {
  sessions.sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    return b.id - a.id;
  });
}

function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const startAt = ctx.currentTime + idx * 0.18;
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.6);
    });
  } catch (err) {
    console.warn("Audio chime blocked or unsupported:", err);
  }
}

// 4. THEME & ORIENTATION ENGINE
function applyTheme(themeName) {
  settings.theme = themeName === "light" ? "light" : "dark";
  document.body.classList.toggle("light-mode", settings.theme === "light");
  themeToggleBtn.textContent = settings.theme === "light" ? "🌙 Dark" : "☀️ Light";
  syncMiniWindowUI();
}

function toggleTheme() {
  applyTheme(settings.theme === "light" ? "dark" : "light");
  saveData();
  updateAnalytics();
}

function updateOrientationBadge() {
  const isPortrait = window.matchMedia("(orientation: portrait)").matches || window.innerWidth < 980;
  orientationBadgeEl.textContent = isPortrait ? "↕ Portrait Stack" : "↔ Landscape Cockpit";
}

// 5. FLOATING ALWAYS-ON-TOP MINI WINDOW (PiP / Popup)
async function openMiniPlayer() {
  if (miniWindow && !miniWindow.closed) {
    miniWindow.focus();
    return;
  }

  try {
    if ("documentPictureInPicture" in window) {
      miniWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 215
      });
    } else {
      miniWindow = window.open(
        "",
        "FocusLogMini",
        "width=320,height=225,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
      );
    }
  } catch (err) {
    console.warn("Falling back to standard popup window:", err);
    miniWindow = window.open(
      "",
      "FocusLogMini",
      "width=320,height=225,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
    );
  }

  if (!miniWindow) {
    alert("Pop-up blocked! Please allow pop-ups for FocusLog to open the mini timer.");
    return;
  }

  const doc = miniWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>FocusLog Mini</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body {
          background: #0f1115; color: #f3f4f6;
          display: flex; flex-direction: column; justify-content: space-between;
          height: 100vh; padding: 14px 16px; user-select: none;
        }
        body.light { background: #ffffff; color: #0f172a; }
        .top-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .subj { font-size: 0.86rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tag { font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; background: #1e293b; color: #60a5fa; font-weight: 600; }
        body.light .tag { background: #dbeafe; color: #1d4ed8; }
        .clock { font-size: 2.65rem; font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; letter-spacing: 1.5px; margin: 6px 0; }
        .clock.break { color: #f59e0b; }
        .btns { display: flex; gap: 8px; }
        button {
          flex: 1; padding: 9px 10px; border: none; border-radius: 8px;
          font-size: 0.84rem; font-weight: 700; cursor: pointer;
        }
        button:disabled { opacity: 0.35; cursor: not-allowed; }
        .b-toggle { background: #3b82f6; color: #fff; }
        .b-finish { background: #10b981; color: #052e16; }
      </style>
    </head>
    <body>
      <div class="top-row">
        <span id="m-subj" class="subj">Subject</span>
        <span id="m-tag" class="tag">Reading</span>
      </div>
      <div id="m-clock" class="clock">00:00:00</div>
      <div class="btns">
        <button id="m-toggle" class="b-toggle">Start</button>
        <button id="m-finish" class="b-finish" disabled>Finish & Save</button>
      </div>
    </body>
    </html>
  `);
  doc.close();

  doc.getElementById("m-toggle").addEventListener("click", () => {
    if (startTime !== null) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  doc.getElementById("m-finish").addEventListener("click", () => {
    finishSession(false);
  });

  syncMiniWindowUI();
}

function syncMiniWindowUI() {
  if (!miniWindow || miniWindow.closed) return;
  const doc = miniWindow.document;
  const mSubj = doc.getElementById("m-subj");
  if (!mSubj) return;

  doc.body.classList.toggle("light", settings.theme === "light");
  mSubj.textContent = timerMode === "break" ? "Rest Break" : subjectSelect.value;
  doc.getElementById("m-tag").textContent = timerMode === "break" ? `${breakTargetMins}m` : selectedTag;

  const mClock = doc.getElementById("m-clock");
  mClock.textContent = timerDisplay.textContent;
  mClock.classList.toggle("break", timerMode === "break");

  const mToggle = doc.getElementById("m-toggle");
  const mFinish = doc.getElementById("m-finish");

  if (startTime !== null) {
    mToggle.textContent = "Pause";
  } else if (accumulatedMs > 0) {
    mToggle.textContent = "Resume";
  } else {
    mToggle.textContent = "Start";
  }

  mFinish.textContent = timerMode === "break" ? "End Break" : "Finish & Save";
  mFinish.disabled = startTime === null && accumulatedMs === 0;
}

// 6. STORAGE ENGINE
function saveData() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (typeof scheduleCloudPush === "function") scheduleCloudPush();
}

function loadData() {
  const rawSettings = localStorage.getItem(SETTINGS_KEY);
  if (rawSettings) {
    try {
      const parsed = JSON.parse(rawSettings);
      if (parsed && typeof parsed.dailyGoalMins === "number") {
        settings.dailyGoalMins = parsed.dailyGoalMins;
      }
      if (parsed && parsed.theme) {
        settings.theme = parsed.theme;
      }
    } catch { /* keep default */ }
  }

  const rawSubjects = localStorage.getItem(SUBJECTS_KEY);
  if (rawSubjects) {
    try {
      const parsedSubj = JSON.parse(rawSubjects);
      if (Array.isArray(parsedSubj) && parsedSubj.length > 0) {
        subjects = parsedSubj.map((s) => ({
          name: s.name,
          color: s.color || "#3b82f6",
          dailyTargetMins: typeof s.dailyTargetMins === "number" ? s.dailyTargetMins : 60
        }));
      } else {
        subjects = [...DEFAULT_SUBJECTS];
      }
    } catch {
      subjects = [...DEFAULT_SUBJECTS];
    }
  } else {
    subjects = [...DEFAULT_SUBJECTS];
  }

  const rawSessions = localStorage.getItem(SESSIONS_KEY);
  if (rawSessions) {
    try {
      const parsedSess = JSON.parse(rawSessions);
      if (Array.isArray(parsedSess)) {
        sessions = parsedSess;
        sortSessionsNewestFirst();
      }
    } catch (err) {
      console.error("Failed to parse saved sessions:", err);
    }
  }
}

// 7. TIMER MODE, BREAKS & CONTROLS
function resetIdleDisplay() {
  document.title = "FocusLog — Study Tracker";
  if (timerMode === "stopwatch") {
    timerDisplay.textContent = "00:00:00";
  } else if (timerMode === "countdown") {
    timerDisplay.textContent = formatClock(countdownTargetMins * 60000);
  } else {
    timerDisplay.textContent = formatClock(breakTargetMins * 60000);
  }
  syncMiniWindowUI();
}

function switchTimerMode(newMode) {
  if (startTime !== null || accumulatedMs > 0) return;

  if (newMode === "stopwatch" || newMode === "countdown") {
    lastStudyMode = newMode;
  }

  timerMode = newMode;
  const isBreak = newMode === "break";

  modeStopwatchBtn.classList.toggle("active", newMode === "stopwatch");
  modeCountdownBtn.classList.toggle("active", newMode === "countdown");
  modeBreakBtn.classList.toggle("active", isBreak);

  countdownPresetsEl.hidden = newMode !== "countdown";
  breakPresetsEl.hidden = !isBreak;
  studyFieldsEl.hidden = isBreak;
  timerDisplay.classList.toggle("break-active", isBreak);

  if (isBreak) {
    finishBtn.textContent = "End Break";
    finishBtn.classList.remove("btn-success");
    finishBtn.classList.add("btn-warning");
  } else {
    finishBtn.textContent = "Finish & Save";
    finishBtn.classList.remove("btn-warning");
    finishBtn.classList.add("btn-success");
  }

  resetIdleDisplay();
}

function setCountdownMinutes(mins) {
  const validMins = Math.max(1, Math.min(300, Number(mins) || 25));
  countdownTargetMins = validMins;

  presetButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.mins) === validMins);
  });

  if (startTime === null && accumulatedMs === 0 && timerMode === "countdown") {
    resetIdleDisplay();
  }
}

function setBreakMinutes(mins) {
  const validMins = Math.max(1, Math.min(120, Number(mins) || 5));
  breakTargetMins = validMins;

  breakButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.mins) === validMins);
  });

  if (startTime === null && accumulatedMs === 0 && timerMode === "break") {
    resetIdleDisplay();
  }
}

function selectSessionTag(tagName) {
  selectedTag = tagName;
  tagButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tag === tagName);
  });
  syncMiniWindowUI();
}

function setControlsLocked(locked) {
  subjectSelect.disabled = locked;
  toggleSubjectBtn.disabled = locked;
  modeStopwatchBtn.disabled = locked;
  modeCountdownBtn.disabled = locked;
  modeBreakBtn.disabled = locked;
  customMinsInput.disabled = locked;
  presetButtons.forEach((btn) => { btn.disabled = locked; });
  breakButtons.forEach((btn) => { btn.disabled = locked; });
  tagButtons.forEach((btn) => { btn.disabled = locked; });
  if (locked) {
    addSubjectRow.hidden = true;
  }
}

function updateClockScreen() {
  const elapsed = getElapsedMs();

  if (timerMode === "stopwatch") {
    const floorSeconds = Math.floor(elapsed / 1000) * 1000;
    const formatted = formatClock(floorSeconds);
    timerDisplay.textContent = formatted;
    document.title = `${formatted} • ${subjectSelect.value}`;
    syncMiniWindowUI();
    return;
  }

  const activeMins = timerMode === "break" ? breakTargetMins : countdownTargetMins;
  const targetMs = activeMins * 60000;
  const remaining = Math.max(0, targetMs - elapsed);
  const formatted = formatClock(remaining);
  timerDisplay.textContent = formatted;
  document.title = `${formatted} • ${timerMode === "break" ? "Break" : subjectSelect.value}`;
  syncMiniWindowUI();

  if (remaining === 0) {
    finishSession(true);
  }
}

function startTimer() {
  breakPromptEl.hidden = true;
  startTime = Date.now();
  timerInterval = setInterval(updateClockScreen, 250);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  finishBtn.disabled = false;
  setControlsLocked(true);
  syncMiniWindowUI();
}

function pauseTimer() {
  accumulatedMs += Date.now() - startTime;
  startTime = null;
  clearInterval(timerInterval);

  startBtn.textContent = "Resume";
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  document.title = `Paused • FocusLog`;
  syncMiniWindowUI();
}

function finishSession(autoCompleted = false) {
  clearInterval(timerInterval);
  const wasBreak = timerMode === "break";

  if (wasBreak) {
    if (autoCompleted) {
      playCompletionChime();
    }
  } else {
    const targetMs = countdownTargetMins * 60000;
    const rawElapsed = getElapsedMs();
    const finalMs = autoCompleted && timerMode === "countdown" ? targetMs : rawElapsed;

    if (finalMs >= 1000) {
      const now = new Date();
      const noteText = sessionNoteInput.value.trim();

      const newSession = {
        id: Date.now(),
        subject: subjectSelect.value,
        tag: selectedTag,
        note: noteText,
        durationMs: finalMs,
        date: getLocalDateKey(now),
        timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      sessions.unshift(newSession);
      sortSessionsNewestFirst();
      saveData();
      refreshAllViews();

      sessionNoteInput.value = "";
      breakPromptEl.hidden = false;

      if (autoCompleted) {
        playCompletionChime();
      }
    }
  }

  startTime = null;
  accumulatedMs = 0;
  timerInterval = null;

  startBtn.textContent = "Start";
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  finishBtn.disabled = true;
  setControlsLocked(false);

  if (wasBreak) {
    switchTimerMode(lastStudyMode);
  } else {
    resetIdleDisplay();
  }
}

function startQuickBreak(mins) {
  breakPromptEl.hidden = true;
  switchTimerMode("break");
  setBreakMinutes(mins);
  startTimer();
}

function deleteSession(id) {
  const target = sessions.find((s) => s.id === id);
  const details = target
    ? `"${target.subject}" (${formatBadgeDuration(target.durationMs)} on ${target.date || "Today"})`
    : "this study session";

  const confirmed = confirm(`Are you sure you want to delete ${details}?`);
  if (!confirmed) return;

  if (typeof recordDeletedSessionId === "function") recordDeletedSessionId(id);
  sessions = sessions.filter((session) => session.id !== id);
  saveData();
  refreshAllViews();
}

// 8. MANUAL OFFLINE SESSION LOGGING
function openManualForm() {
  manualSubjectSelect.value = subjectSelect.value;
  manualTagSelect.value = selectedTag;
  manualDateInput.value = getLocalDateKey();
  manualDateInput.max = getLocalDateKey();
  manualHoursInput.value = "1";
  manualMinsInput.value = "0";
  manualNoteInput.value = "";
  manualEntryForm.hidden = false;
  manualHoursInput.focus();
}

function saveManualSession() {
  const hrs = Math.max(0, Math.min(23, Number(manualHoursInput.value) || 0));
  const mins = Math.max(0, Math.min(59, Number(manualMinsInput.value) || 0));
  const totalMins = hrs * 60 + mins;

  if (totalMins <= 0) {
    alert("Please enter a duration of at least 1 minute.");
    return;
  }

  const chosenDate = manualDateInput.value || getLocalDateKey();
  const isToday = chosenDate === getLocalDateKey();
  const now = new Date();

  const manualSession = {
    id: Date.now(),
    subject: manualSubjectSelect.value,
    tag: manualTagSelect.value,
    note: manualNoteInput.value.trim(),
    durationMs: totalMins * 60000,
    date: chosenDate,
    timestamp: isToday
      ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Manual entry"
  };

  sessions.unshift(manualSession);
  sortSessionsNewestFirst();
  saveData();
  refreshAllViews();
  manualEntryForm.hidden = true;
}

// 9. CUSTOM SUBJECTS & FULL SUBJECT MANAGER
function renderSubjectDropdowns(selectName = null) {
  const prevMain = selectName || subjectSelect.value;
  const prevFilter = filterSubjectSelect.value || "ALL";

  subjectSelect.innerHTML = "";
  manualSubjectSelect.innerHTML = "";
  filterSubjectSelect.innerHTML = `<option value="ALL">All Subjects</option>`;

  subjects.forEach((subj) => {
    const opt1 = document.createElement("option");
    opt1.value = subj.name;
    opt1.textContent = subj.name;
    subjectSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = subj.name;
    opt2.textContent = subj.name;
    manualSubjectSelect.appendChild(opt2);

    const opt3 = document.createElement("option");
    opt3.value = subj.name;
    opt3.textContent = subj.name;
    filterSubjectSelect.appendChild(opt3);
  });

  if (prevMain && subjects.some((s) => s.name === prevMain)) {
    subjectSelect.value = prevMain;
    manualSubjectSelect.value = prevMain;
  }

  if (prevFilter === "ALL" || subjects.some((s) => s.name === prevFilter)) {
    filterSubjectSelect.value = prevFilter;
  }
}

function handleAddSubject() {
  const cleanName = newSubjectInput.value.trim();
  if (!cleanName) return;

  const exists = subjects.some((s) => s.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    alert(`"${cleanName}" is already in your subject list.`);
    return;
  }

  // If re-adding a previously deleted subject, remove it from the deleted list
  if (typeof unrecordDeletedSubjectName === "function") {
    unrecordDeletedSubjectName(cleanName);
  }

  const assignedColor = COLOR_PALETTE[subjects.length % COLOR_PALETTE.length];
  subjects.push({ name: cleanName, color: assignedColor, dailyTargetMins: 60 });
  saveData();

  renderSubjectDropdowns(cleanName);
  refreshAllViews();
  newSubjectInput.value = "";
  addSubjectRow.hidden = true;
}

function deleteSubjectAtIndex(idx) {
  if (subjects.length <= 1) {
    alert("You must keep at least one subject.");
    return;
  }
  const targetSubj = subjects[idx];
  const confirmed = confirm(
    `Remove "${targetSubj.name}" from your subject list? (Past logged sessions for "${targetSubj.name}" will remain in your history.)`
  );
  if (!confirmed) return;

  if (typeof recordDeletedSubjectName === "function") {
    recordDeletedSubjectName(targetSubj.name);
  }

  subjects.splice(idx, 1);
  saveData();
  renderSubjectDropdowns();
  refreshAllViews();
}

function saveManagedSubjects() {
  const rows = subjectTargetsListEl.querySelectorAll(".subject-manage-row");
  const updatedSubjects = [];

  for (const row of rows) {
    const idx = Number(row.dataset.index);
    const oldSubj = subjects[idx];
    if (!oldSubj) continue;

    const newName = row.querySelector(".subject-name-input").value.trim() || oldSubj.name;
    const newColor = row.querySelector(".subject-color-input").value || oldSubj.color;
    const rawTarget = Number(row.querySelector(".subject-target-input").value);
    const newTarget = rawTarget >= 5 && rawTarget <= 720 ? rawTarget : oldSubj.dailyTargetMins;

    if (newName !== oldSubj.name) {
      // Mark old name as deleted so Cloud Sync doesn't re-import it
      if (typeof recordDeletedSubjectName === "function") {
        recordDeletedSubjectName(oldSubj.name);
      }
      if (typeof unrecordDeletedSubjectName === "function") {
        unrecordDeletedSubjectName(newName);
      }
      sessions.forEach((s) => {
        if (s.subject === oldSubj.name) {
          s.subject = newName;
        }
      });
    }

    updatedSubjects.push({
      name: newName,
      color: newColor,
      dailyTargetMins: newTarget
    });
  }

  if (updatedSubjects.length > 0) {
    subjects = updatedSubjects;
    saveData();
    renderSubjectDropdowns();
  }
}

function renderGoalProgress(todayTotalMs, todaySubjectMsMap) {
  const goalMs = settings.dailyGoalMins * 60000;
  const pct = goalMs > 0 ? Math.round((todayTotalMs / goalMs) * 100) : 0;
  const clampedWidth = Math.min(100, pct);

  dailyGoalTextEl.textContent = `${formatBadgeDuration(todayTotalMs)} / ${formatMinsLabel(settings.dailyGoalMins)}`;
  dailyGoalPercentEl.textContent = `${pct}%`;
  dailyGoalPercentEl.classList.toggle("complete", pct >= 100);

  dailyGoalFillEl.style.width = `${clampedWidth}%`;
  dailyGoalFillEl.classList.toggle("complete", pct >= 100);

  subjectTargetsListEl.innerHTML = "";

  subjects.forEach((subj, index) => {
    if (isManagingSubjects) {
      const manageRow = document.createElement("div");
      manageRow.className = "subject-manage-row";
      manageRow.dataset.index = index;

      manageRow.innerHTML = `
        <input type="color" class="subject-color-input" value="${escapeHtml(subj.color)}" title="Pick subject color" />
        <input type="text" class="subject-name-input" value="${escapeHtml(subj.name)}" maxlength="40" placeholder="Subject name" />
        <div class="target-edit-box">
          <input type="number" class="subject-target-input" min="5" max="720" step="5" value="${subj.dailyTargetMins || 60}" />
          <span class="subject-target-stats">m</span>
        </div>
        <button type="button" class="subject-delete-btn" title="Delete subject" ${subjects.length <= 1 ? "disabled" : ""}>&times;</button>
      `;

      manageRow.querySelector(".subject-delete-btn").addEventListener("click", () => {
        saveManagedSubjects();
        deleteSubjectAtIndex(index);
      });

      subjectTargetsListEl.appendChild(manageRow);
      return;
    }

    const loggedMs = todaySubjectMsMap[subj.name] || 0;
    const targetMins = subj.dailyTargetMins || 60;
    const targetMs = targetMins * 60000;
    const subjPct = targetMs > 0 ? Math.min(100, Math.round((loggedMs / targetMs) * 100)) : 0;

    const row = document.createElement("div");
    row.className = "subject-target-item";

    row.innerHTML = `
      <div class="subject-target-top">
        <div class="subject-name-wrap">
          <span class="color-dot" style="background-color: ${escapeHtml(subj.color)};"></span>
          <span>${escapeHtml(subj.name)}</span>
        </div>
        <span class="subject-target-stats">${formatBadgeDuration(loggedMs)} / ${formatMinsLabel(targetMins)} (${subjPct}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${subjPct}%; background-color: ${escapeHtml(subj.color)};"></div>
      </div>
    `;

    subjectTargetsListEl.appendChild(row);
  });
}

// 10. FILTERED SESSION LIST RENDERING
function clearFilters() {
  filterSearchInput.value = "";
  filterSubjectSelect.value = "ALL";
  filterTagSelect.value = "ALL";
  renderSessions();
}

function renderSessions() {
  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    filterSummaryEl.innerHTML = "";
    sessionList.innerHTML = `<li class="empty-state">No sessions logged yet. Hit Start or "+ Log Past" to begin.</li>`;
    return;
  }

  const searchQuery = filterSearchInput.value.trim().toLowerCase();
  const subjectFilter = filterSubjectSelect.value;
  const tagFilter = filterTagSelect.value;
  const isFiltered = searchQuery !== "" || subjectFilter !== "ALL" || tagFilter !== "ALL";

  const filtered = sessions.filter((s) => {
    if (subjectFilter !== "ALL" && s.subject !== subjectFilter) return false;
    if (tagFilter !== "ALL" && s.tag !== tagFilter) return false;
    if (searchQuery) {
      const haystack = `${s.subject} ${s.tag || ""} ${s.note || ""} ${s.date || ""}`.toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }
    return true;
  });

  let filteredMs = 0;
  for (const s of filtered) {
    filteredMs += s.durationMs;
  }

  const labelText = isFiltered
    ? `Showing ${filtered.length} of ${sessions.length} sessions • Filtered total: <strong>${formatBadgeDuration(filteredMs)}</strong>`
    : `${sessions.length} total ${sessions.length === 1 ? "session" : "sessions"}`;

  filterSummaryEl.innerHTML = isFiltered
    ? `<span>${labelText}</span><button type="button" id="clear-filters-btn" class="clear-filter-btn">Clear filters</button>`
    : `<span>${labelText}</span>`;

  if (isFiltered) {
    document.getElementById("clear-filters-btn").addEventListener("click", clearFilters);
  }

  if (filtered.length === 0) {
    sessionList.innerHTML = `<li class="empty-state">No sessions match your current filter.</li>`;
    return;
  }

  filtered.forEach((session) => {
    const li = document.createElement("li");
    li.className = "session-item";
    const dateLabel = session.date || "Today";
    const tagHtml = session.tag
      ? `<span class="session-tag-badge">${escapeHtml(session.tag)}</span>`
      : "";
    const noteHtml = session.note
      ? `<div class="session-note">${escapeHtml(session.note)}</div>`
      : "";

    li.innerHTML = `
      <div>
        <div class="session-subject">${escapeHtml(session.subject)}</div>
        <div class="session-meta">${tagHtml}${escapeHtml(dateLabel)} • ${escapeHtml(session.timestamp)}</div>
        ${noteHtml}
      </div>
      <div class="session-right">
        <div class="session-duration">${formatBadgeDuration(session.durationMs)}</div>
        <button class="delete-btn" title="Delete session">&times;</button>
      </div>
    `;

    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteSession(session.id);
    });

    sessionList.appendChild(li);
  });
}

// 11. ANALYTICS & SHARE PRICE ENGINE
function getChartThemeColors() {
  const isLight = settings.theme === "light";
  return {
    tick: isLight ? "#475569" : "#9ba3b0",
    grid: isLight ? "#e2e8f0" : "#252a34",
    emptyRing: isLight ? "#e2e8f0" : "#252a34"
  };
}

function getSubjectColor(subjectName) {
  const found = subjects.find((s) => s.name === subjectName);
  return found ? found.color : "#64748b";
}

function calculateSharePriceSeries(dailyMap) {
  const allDates = Object.keys(dailyMap).sort();
  const firstEverDate = allDates.length > 0 ? allDates[0] : null;

  let price = 100.0;
  const labels = [];
  const prices = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    const mins = (dailyMap[key] || 0) / 60000;

    if (firstEverDate && key >= firstEverDate) {
      if (mins > 0) {
        const hours = mins / 60;
        const goalBonus = mins >= settings.dailyGoalMins ? 2.5 : 0;
        price += hours * 4.0 + goalBonus;
      } else if (i > 0) {
        price = Math.max(10.0, price - 3.5);
      }
    }

    labels.push(i === 0 ? "Today" : d.toLocaleDateString([], { month: "short", day: "numeric" }));
    prices.push(Number(price.toFixed(2)));
  }

  const currentPrice = prices[prices.length - 1];
  const yesterdayPrice = prices.length > 1 ? prices[prices.length - 2] : 100.0;
  const deltaPct = yesterdayPrice > 0 ? ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100 : 0;

  return { labels, prices, currentPrice, deltaPct };
}

function renderShareChart(labels, prices, isPositiveTrend) {
  if (shareChartInstance) {
    shareChartInstance.destroy();
  }

  const chartColors = getChartThemeColors();
  const lineColor = isPositiveTrend ? "#10b981" : "#ef4444";
  const fillColor = isPositiveTrend ? "rgba(16, 185, 129, 0.14)" : "rgba(239, 68, 68, 0.14)";

  shareChartInstance = new Chart(shareCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Share Price ($)",
        data: prices,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2.5,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartColors.tick, font: { size: 10 }, maxTicksLimit: 8 }
        },
        y: {
          grid: { color: chartColors.grid },
          ticks: {
            color: chartColors.tick,
            font: { size: 11 },
            callback: (val) => `$${val}`
          }
        }
      }
    }
  });
}

function updateAnalytics() {
  const todayKey = getLocalDateKey();
  const dailyMap = {};
  const subjectMap = {};
  const todaySubjectMap = {};
  let allTimeMs = 0;

  for (const s of sessions) {
    allTimeMs += s.durationMs;
    if (s.date) {
      dailyMap[s.date] = (dailyMap[s.date] || 0) + s.durationMs;
      if (s.date === todayKey) {
        todaySubjectMap[s.subject] = (todaySubjectMap[s.subject] || 0) + s.durationMs;
      }
    }
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationMs;
  }

  const todayMs = dailyMap[todayKey] || 0;
  todayTotalEl.textContent = formatBadgeDuration(todayMs);
  alltimeTotalEl.textContent = formatBadgeDuration(allTimeMs);

  renderGoalProgress(todayMs, todaySubjectMap);

  let streak = 0;
  const cursor = new Date();
  if (!dailyMap[getLocalDateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dailyMap[getLocalDateKey(cursor)] > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  streakValueEl.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;

  const shareStats = calculateSharePriceSeries(dailyMap);
  sharePriceValueEl.textContent = `$${shareStats.currentPrice.toFixed(2)}`;
  const sign = shareStats.deltaPct > 0 ? "+" : "";
  sharePriceDeltaEl.textContent = `${sign}${shareStats.deltaPct.toFixed(1)}%`;
  sharePriceDeltaEl.classList.toggle("up", shareStats.deltaPct > 0);
  sharePriceDeltaEl.classList.toggle("down", shareStats.deltaPct < 0);
  renderShareChart(shareStats.labels, shareStats.prices, shareStats.currentPrice >= 100);

  const last7Labels = [];
  const last7Minutes = [];
  let last7Ms = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    const dayMs = dailyMap[key] || 0;

    last7Ms += dayMs;
    last7Labels.push(i === 0 ? "Today" : d.toLocaleDateString([], { month: "short", day: "numeric" }));
    last7Minutes.push(Number((dayMs / 60000).toFixed(1)));
  }
  weekTotalEl.textContent = formatBadgeDuration(last7Ms);

  renderSubjectChart(subjectMap);
  renderDailyChart(last7Labels, last7Minutes);
  renderHeatmap(dailyMap);
}

function renderSubjectChart(subjectMap) {
  if (subjectChartInstance) {
    subjectChartInstance.destroy();
  }

  const chartColors = getChartThemeColors();
  const labels = Object.keys(subjectMap);
  const dataMins = labels.map((subj) => Number((subjectMap[subj] / 60000).toFixed(1)));
  const colors = labels.map((subj) => getSubjectColor(subj));
  const hasData = labels.length > 0;

  subjectChartInstance = new Chart(subjectCanvas, {
    type: "doughnut",
    data: {
      labels: hasData ? labels : ["No data yet"],
      datasets: [{
        data: hasData ? dataMins : [1],
        backgroundColor: hasData ? colors : [chartColors.emptyRing],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: chartColors.tick, boxWidth: 12, padding: 12, font: { size: 11 } }
        }
      }
    }
  });
}

function renderDailyChart(labels, dataMins) {
  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  const chartColors = getChartThemeColors();

  dailyChartInstance = new Chart(dailyCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Minutes",
        data: dataMins,
        backgroundColor: "#3b82f6",
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartColors.tick, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: chartColors.grid },
          ticks: { color: chartColors.tick, font: { size: 11 } }
        }
      }
    }
  });
}

function renderHeatmap(dailyMap) {
  heatmapGridEl.innerHTML = "";
  const totalDays = 84;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    const ms = dailyMap[key] || 0;
    const mins = ms / 60000;

    let level = "level-0";
    if (mins > 180) level = "level-4";
    else if (mins > 90) level = "level-3";
    else if (mins > 30) level = "level-2";
    else if (mins > 0) level = "level-1";

    const cell = document.createElement("div");
    cell.className = `heat-cell ${level}`;
    cell.title = `${key}: ${formatBadgeDuration(ms)}`;
    heatmapGridEl.appendChild(cell);
  }
}

function refreshAllViews() {
  renderSessions();
  updateAnalytics();
  syncMiniWindowUI();
}

// 12. JSON BACKUP
function exportBackup() {
  const backupPayload = {
    version: 7,
    settings,
    subjects,
    sessions
  };
  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `focuslog-backup-${getLocalDateKey()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      if (Array.isArray(imported)) {
        sessions = imported;
      } else if (imported && Array.isArray(imported.sessions)) {
        sessions = imported.sessions;
        if (Array.isArray(imported.subjects) && imported.subjects.length > 0) {
          subjects = imported.subjects;
        }
        if (imported.settings) {
          if (typeof imported.settings.dailyGoalMins === "number") {
            settings.dailyGoalMins = imported.settings.dailyGoalMins;
          }
          if (imported.settings.theme) {
            applyTheme(imported.settings.theme);
          }
        }
      } else {
        alert("Invalid backup file format.");
        return;
      }

      sortSessionsNewestFirst();
      saveData();
      renderSubjectDropdowns();
      refreshAllViews();
      alert(`Restored ${sessions.length} study sessions.`);
    } catch {
      alert("Could not read JSON file. Make sure it is a valid FocusLog backup.");
    }
  };

  reader.readAsText(file);
  importFileInput.value = "";
}

// 13. KEYBOARD SHORTCUTS & EVENT LISTENERS
document.addEventListener("keydown", (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName : "";
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

  if (e.shiftKey && e.key === "Enter") {
    if (!finishBtn.disabled) {
      e.preventDefault();
      finishSession(false);
    }
    return;
  }

  if (isTyping) return;

  if (e.code === "Space") {
    e.preventDefault();
    if (startTime !== null) {
      pauseTimer();
    } else {
      startTimer();
    }
    return;
  }

  if (startTime === null && accumulatedMs === 0 && timerMode !== "break") {
    const tagMap = { "1": "Reading", "2": "Practice", "3": "Revision", "4": "Mock Test" };
    if (tagMap[e.key]) {
      selectSessionTag(tagMap[e.key]);
    }
  }
});

themeToggleBtn.addEventListener("click", toggleTheme);
pipBtn.addEventListener("click", openMiniPlayer);
window.addEventListener("resize", updateOrientationBadge);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
finishBtn.addEventListener("click", () => finishSession(false));

modeStopwatchBtn.addEventListener("click", () => switchTimerMode("stopwatch"));
modeCountdownBtn.addEventListener("click", () => switchTimerMode("countdown"));
modeBreakBtn.addEventListener("click", () => switchTimerMode("break"));

presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    customMinsInput.value = "";
    setCountdownMinutes(Number(btn.dataset.mins));
  });
});

customMinsInput.addEventListener("input", () => {
  if (customMinsInput.value) {
    setCountdownMinutes(Number(customMinsInput.value));
  }
});

breakButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setBreakMinutes(Number(btn.dataset.mins));
  });
});

quickBreakButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    startQuickBreak(Number(btn.dataset.mins));
  });
});
dismissBreakBtn.addEventListener("click", () => {
  breakPromptEl.hidden = true;
});

toggleManualBtn.addEventListener("click", () => {
  if (manualEntryForm.hidden) {
    openManualForm();
  } else {
    manualEntryForm.hidden = true;
  }
});
cancelManualBtn.addEventListener("click", () => {
  manualEntryForm.hidden = true;
});
saveManualBtn.addEventListener("click", saveManualSession);

filterSearchInput.addEventListener("input", renderSessions);
filterSubjectSelect.addEventListener("change", renderSessions);
filterTagSelect.addEventListener("change", renderSessions);

editGoalBtn.addEventListener("click", () => {
  goalEditRow.hidden = !goalEditRow.hidden;
  if (!goalEditRow.hidden) {
    dailyGoalInput.value = settings.dailyGoalMins;
    dailyGoalInput.focus();
  }
});

saveGoalBtn.addEventListener("click", () => {
  const val = Number(dailyGoalInput.value);
  if (val >= 10 && val <= 1440) {
    settings.dailyGoalMins = val;
    saveData();
    refreshAllViews();
    goalEditRow.hidden = true;
  }
});

editTargetsBtn.addEventListener("click", () => {
  if (isManagingSubjects) {
    saveManagedSubjects();
    isManagingSubjects = false;
    editTargetsBtn.textContent = "Manage Subjects";
    editTargetsBtn.classList.remove("btn-accent");
  } else {
    isManagingSubjects = true;
    editTargetsBtn.textContent = "Save Changes";
    editTargetsBtn.classList.add("btn-accent");
  }
  refreshAllViews();
});

subjectSelect.addEventListener("change", syncMiniWindowUI);
toggleSubjectBtn.addEventListener("click", () => {
  addSubjectRow.hidden = !addSubjectRow.hidden;
  if (!addSubjectRow.hidden) newSubjectInput.focus();
});
saveSubjectBtn.addEventListener("click", handleAddSubject);
newSubjectInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddSubject();
});

tagButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectSessionTag(btn.dataset.tag);
  });
});

exportBtn.addEventListener("click", exportBackup);
importBtn.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", importBackup);

if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch((err) => {
    console.warn("Service worker registration skipped:", err);
  });
}

loadData();
applyTheme(settings.theme);
updateOrientationBadge();
renderSubjectDropdowns();
refreshAllViews();

// 14. PRIVATE GITHUB GIST CLOUD SYNC ENGINE
const GIST_TOKEN_KEY = "focuslog_gist_token_v1";
const GIST_ID_KEY = "focuslog_gist_id_v1";
const DELETED_IDS_KEY = "focuslog_deleted_ids_v1";
const DELETED_SUBJECTS_KEY = "focuslog_deleted_subjects_v1";
const GIST_FILENAME = "focuslog-cloud-sync.json";

const cloudToggleBtn = document.getElementById("cloud-toggle-btn");
const cloudStatusText = document.getElementById("cloud-status-text");
const cloudSyncCard = document.getElementById("cloud-sync-card");
const cloudLastSyncEl = document.getElementById("cloud-last-sync");
const gistTokenInput = document.getElementById("gist-token-input");
const saveCloudBtn = document.getElementById("save-cloud-btn");
const syncNowBtn = document.getElementById("sync-now-btn");
const disconnectCloudBtn = document.getElementById("disconnect-cloud-btn");

let gistToken = localStorage.getItem(GIST_TOKEN_KEY) || "";
let gistId = localStorage.getItem(GIST_ID_KEY) || "";
let deletedSessionIds = JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || "[]");
let deletedSubjectNames = JSON.parse(localStorage.getItem(DELETED_SUBJECTS_KEY) || "[]");
let pushTimeout = null;
let isSyncing = false;

function recordDeletedSessionId(id) {
  if (!deletedSessionIds.includes(id)) {
    deletedSessionIds.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedSessionIds));
  }
}

function recordDeletedSubjectName(name) {
  const lower = name.trim().toLowerCase();
  if (!deletedSubjectNames.includes(lower)) {
    deletedSubjectNames.push(lower);
    localStorage.setItem(DELETED_SUBJECTS_KEY, JSON.stringify(deletedSubjectNames));
  }
}

function unrecordDeletedSubjectName(name) {
  const lower = name.trim().toLowerCase();
  deletedSubjectNames = deletedSubjectNames.filter((n) => n !== lower);
  localStorage.setItem(DELETED_SUBJECTS_KEY, JSON.stringify(deletedSubjectNames));
}

function setCloudBadge(status, detailText = "") {
  if (!cloudStatusText) return;
  cloudStatusText.textContent = status;
  cloudToggleBtn.classList.toggle("cloud-ok", Boolean(gistToken && gistId));
  if (detailText && cloudLastSyncEl) {
    cloudLastSyncEl.textContent = detailText;
  }
}

async function findOrCreateSyncGist(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
  };

  const listRes = await fetch("https://api.github.com/gists?per_page=100", { headers });
  if (!listRes.ok) {
    throw new Error("Invalid GitHub token or network error.");
  }

  const gists = await listRes.json();
  const existing = gists.find((g) => g.files && g.files[GIST_FILENAME]);
  if (existing) {
    return existing.id;
  }

  const initialPayload = {
    version: 8,
    updatedAt: Date.now(),
    settings,
    subjects,
    sessions,
    deletedSessionIds,
    deletedSubjectNames
  };

  const createRes = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      description: "FocusLog Private Study Tracker Cloud Sync",
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(initialPayload, null, 2)
        }
      }
    })
  });

  if (!createRes.ok) {
    throw new Error("Could not create Secret Gist. Ensure your token has the 'gist' permission.");
  }

  const created = await createRes.json();
  return created.id;
}

async function syncWithGist(pushOnly = false) {
  if (!gistToken || isSyncing) return;
  isSyncing = true;
  setCloudBadge("Syncing...", "Syncing with GitHub Gist...");

  const headers = {
    Authorization: `Bearer ${gistToken}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  try {
    if (!gistId) {
      gistId = await findOrCreateSyncGist(gistToken);
      localStorage.setItem(GIST_ID_KEY, gistId);
    }

    if (!pushOnly) {
      const getRes = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      if (getRes.ok) {
        const gistData = await getRes.json();
        const fileObj = gistData.files && gistData.files[GIST_FILENAME];

        if (fileObj && fileObj.content) {
          const remote = JSON.parse(fileObj.content);

          // 1. Merge deleted session tombstones
          const remoteDeletedSessions = Array.isArray(remote.deletedSessionIds) ? remote.deletedSessionIds : [];
          deletedSessionIds = Array.from(new Set([...deletedSessionIds, ...remoteDeletedSessions]));
          localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedSessionIds));
          const deletedSessionSet = new Set(deletedSessionIds);

          // 2. Merge deleted subject tombstones
          const remoteDeletedSubjects = Array.isArray(remote.deletedSubjectNames) ? remote.deletedSubjectNames : [];
          deletedSubjectNames = Array.from(new Set([...deletedSubjectNames, ...remoteDeletedSubjects]));
          localStorage.setItem(DELETED_SUBJECTS_KEY, JSON.stringify(deletedSubjectNames));
          const deletedSubjectSet = new Set(deletedSubjectNames);

          // 3. Merge sessions by unique ID
          const sessionMap = new Map();
          if (Array.isArray(remote.sessions)) {
            remote.sessions.forEach((s) => {
              if (!deletedSessionSet.has(s.id)) sessionMap.set(s.id, s);
            });
          }
          sessions.forEach((s) => {
            if (!deletedSessionSet.has(s.id)) sessionMap.set(s.id, s);
          });
          sessions = Array.from(sessionMap.values());
          sortSessionsNewestFirst();

          // 4. Filter out any locally or remotely deleted subjects, then merge
          subjects = subjects.filter((s) => !deletedSubjectSet.has(s.name.toLowerCase()));
          if (Array.isArray(remote.subjects)) {
            remote.subjects.forEach((remSubj) => {
              const lowerName = remSubj.name.toLowerCase();
              const exists = subjects.some((locSubj) => locSubj.name.toLowerCase() === lowerName);
              if (!exists && !deletedSubjectSet.has(lowerName)) {
                subjects.push(remSubj);
              }
            });
          }

          if (subjects.length === 0) {
            subjects = [...DEFAULT_SUBJECTS];
          }

          localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
          localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
          renderSubjectDropdowns();
          refreshAllViews();
        }
      }
    }

    const mergedPayload = {
      version: 8,
      updatedAt: Date.now(),
      settings,
      subjects,
      sessions,
      deletedSessionIds,
      deletedSubjectNames
    };

    const patchRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(mergedPayload, null, 2)
          }
        }
      })
    });

    if (!patchRes.ok) {
      throw new Error("Failed to upload merged study sessions.");
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCloudBadge("Synced", `Last synced at ${timeStr}`);
  } catch (err) {
    console.error("Cloud sync error:", err);
    setCloudBadge("Sync Error", err.message);
  } finally {
    isSyncing = false;
  }
}

function scheduleCloudPush() {
  if (!gistToken) return;
  clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    syncWithGist(false);
  }, 1200);
}

if (cloudToggleBtn) {
  cloudToggleBtn.addEventListener("click", () => {
    cloudSyncCard.hidden = !cloudSyncCard.hidden;
    if (!cloudSyncCard.hidden && gistToken) {
      gistTokenInput.value = gistToken;
    }
  });

  saveCloudBtn.addEventListener("click", async () => {
    const rawToken = gistTokenInput.value.trim();
    if (!rawToken) {
      alert("Please paste your GitHub Personal Access Token.");
      return;
    }
    gistToken = rawToken;
    gistId = "";
    localStorage.setItem(GIST_TOKEN_KEY, gistToken);
    localStorage.removeItem(GIST_ID_KEY);
    await syncWithGist(false);
  });

  syncNowBtn.addEventListener("click", () => syncWithGist(false));

  disconnectCloudBtn.addEventListener("click", () => {
    gistToken = "";
    gistId = "";
    gistTokenInput.value = "";
    localStorage.removeItem(GIST_TOKEN_KEY);
    localStorage.removeItem(GIST_ID_KEY);
    setCloudBadge("Cloud Sync", "Disconnected");
  });

  if (gistToken) {
    setCloudBadge("Connected", "Syncing on startup...");
    syncWithGist(false);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && gistToken) {
      syncWithGist(false);
    }
  });
}