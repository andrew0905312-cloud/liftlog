const SETS_KEY = "liftlog_sets_v1";
const ROUTINES_KEY = "liftlog_routines_v1";
const EXERCISE_META_KEY = "liftlog_exercise_meta_v1";

const EXERCISE_DATABASE = [
  { name: "Bench Press", muscle: "Chest", category: "Compound" },
  { name: "Squat", muscle: "Quads", category: "Compound" },
  { name: "Deadlift", muscle: "Hamstrings", category: "Compound" },
  { name: "Overhead Press", muscle: "Shoulders", category: "Compound" },
  { name: "Barbell Row", muscle: "Back", category: "Compound" },
  { name: "Pull Up", muscle: "Back", category: "Compound" },
  { name: "Incline Bench", muscle: "Chest", category: "Compound" },
  { name: "Leg Press", muscle: "Quads", category: "Compound" },
  { name: "Romanian Deadlift", muscle: "Hamstrings", category: "Compound" },
  { name: "Biceps Curl", muscle: "Biceps", category: "Isolation" },
  { name: "Triceps Pushdown", muscle: "Triceps", category: "Isolation" },
  { name: "Lateral Raise", muscle: "Shoulders", category: "Isolation" }
];

const DEFAULT_ROUTINES = [
  { id: "routine-push", name: "Push Day", exercises: ["Bench Press", "Incline Bench", "Overhead Press", "Lateral Raise", "Triceps Pushdown"] },
  { id: "routine-pull", name: "Pull Day", exercises: ["Pull Up", "Barbell Row", "Romanian Deadlift", "Biceps Curl"] },
  { id: "routine-legs", name: "Leg Day", exercises: ["Squat", "Leg Press", "Romanian Deadlift"] }
];

let exerciseMeta = loadObject(EXERCISE_META_KEY);
let sets = loadArray(SETS_KEY).map(cleanSet).filter(Boolean);
let routines = loadArray(ROUTINES_KEY);

if (routines.length === 0) {
  routines = DEFAULT_ROUTINES;
  saveRoutines();
}

seedExerciseMeta();
saveExerciseMeta();

const els = {
  form: document.getElementById("setForm"),
  routineSelect: document.getElementById("routineSelect"),
  exerciseSelect: document.getElementById("exerciseSelect"),
  customExercise: document.getElementById("customExercise"),
  muscleSelect: document.getElementById("muscleSelect"),
  weightInput: document.getElementById("weightInput"),
  repsInput: document.getElementById("repsInput"),
  rirInput: document.getElementById("rirInput"),
  notesInput: document.getElementById("notesInput"),
  stats: document.getElementById("stats"),
  todayList: document.getElementById("todayList"),
  historyList: document.getElementById("historyList"),
  filterExercise: document.getElementById("filterExercise"),
  exportBtn: document.getElementById("exportBtn"),
  importFile: document.getElementById("importFile"),
  todayBadge: document.getElementById("todayBadge"),
  todayCount: document.getElementById("todayCount"),
  routineForm: document.getElementById("routineForm"),
  routineName: document.getElementById("routineName"),
  routineExercises: document.getElementById("routineExercises"),
  routineList: document.getElementById("routineList"),
  clearRoutineForm: document.getElementById("clearRoutineForm"),
  weeklyMetrics: document.getElementById("weeklyMetrics"),
  progressExercise: document.getElementById("progressExercise"),
  chartMetric: document.getElementById("chartMetric"),
  prBoard: document.getElementById("prBoard"),
  progressChart: document.getElementById("progressChart"),
  oneRmForm: document.getElementById("oneRmForm"),
  calcWeight: document.getElementById("calcWeight"),
  calcReps: document.getElementById("calcReps"),
  oneRmResult: document.getElementById("oneRmResult"),
  percentageTable: document.getElementById("percentageTable")
};

function loadArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadObject(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveSets() {
  localStorage.setItem(SETS_KEY, JSON.stringify(sets));
}

function saveRoutines() {
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}

function saveExerciseMeta() {
  localStorage.setItem(EXERCISE_META_KEY, JSON.stringify(exerciseMeta));
}

function uid(prefix = "id") {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function seedExerciseMeta() {
  EXERCISE_DATABASE.forEach(exercise => {
    if (!exerciseMeta[exercise.name]) {
      exerciseMeta[exercise.name] = {
        muscle: exercise.muscle,
        category: exercise.category
      };
    }
  });

  sets.forEach(set => {
    if (!exerciseMeta[set.exercise]) {
      exerciseMeta[set.exercise] = { muscle: set.muscle || "Other", category: "Custom" };
    }
  });

  routines.flatMap(routine => routine.exercises || []).forEach(exercise => {
    if (!exerciseMeta[exercise]) exerciseMeta[exercise] = { muscle: "Other", category: "Custom" };
  });
}

function cleanSet(set) {
  if (!set || !set.exercise) return null;

  const weight = Number(set.weight);
  const reps = Number.parseInt(set.reps, 10);
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) return null;

  const timestamp = Number(set.timestamp) || Date.now();
  const date = set.date || localDateString(new Date(timestamp));
  const rirValue = set.rir === null || set.rir === "" || set.rir === undefined
    ? null
    : Number.parseInt(set.rir, 10);

  return {
    id: set.id || uid("set"),
    date,
    timestamp,
    exercise: String(set.exercise),
    weight,
    reps,
    rir: Number.isFinite(rirValue) ? rirValue : null,
    notes: set.notes ? String(set.notes) : "",
    routineName: set.routineName ? String(set.routineName) : "",
    muscle: set.muscle ? String(set.muscle) : getMuscleForExercise(String(set.exercise))
  };
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
}

function estimatedOneRepMax(weight, reps) {
  return weight * (1 + reps / 30);
}

function setVolume(set) {
  return Number(set.weight) * Number(set.reps);
}

function getMuscleForExercise(exercise) {
  return exerciseMeta[exercise]?.muscle || "Other";
}

function getAllExercises() {
  const defaults = EXERCISE_DATABASE.map(exercise => exercise.name);
  const fromSets = sets.map(set => set.exercise);
  const fromRoutines = routines.flatMap(routine => routine.exercises || []);
  return [...new Set([...defaults, ...fromSets, ...fromRoutines])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function getRoutineById(id) {
  return routines.find(routine => routine.id === id);
}

function getRollingWeekSets() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sets.filter(set => Number(set.timestamp) >= sevenDaysAgo);
}

function renderOptions() {
  const selectedExercise = els.exerciseSelect.value;
  const selectedFilter = els.filterExercise.value;
  const selectedProgress = els.progressExercise.value;
  const selectedRoutine = els.routineSelect.value;
  const exercises = getAllExercises();

  const exerciseOptions = exercises
    .map(exercise => `<option value="${escapeHTML(exercise)}">${escapeHTML(exercise)}</option>`)
    .join("");

  els.exerciseSelect.innerHTML = exerciseOptions;
  els.filterExercise.innerHTML = ["All", ...exercises]
    .map(exercise => `<option value="${escapeHTML(exercise)}">${escapeHTML(exercise)}</option>`)
    .join("");
  els.progressExercise.innerHTML = exercises
    .map(exercise => `<option value="${escapeHTML(exercise)}">${escapeHTML(exercise)}</option>`)
    .join("");

  els.routineSelect.innerHTML = [
    `<option value="">No routine</option>`,
    ...routines.map(routine => `<option value="${escapeHTML(routine.id)}">${escapeHTML(routine.name)}</option>`)
  ].join("");

  if (selectedExercise && exercises.includes(selectedExercise)) els.exerciseSelect.value = selectedExercise;
  if (selectedFilter) els.filterExercise.value = selectedFilter;
  if (selectedProgress && exercises.includes(selectedProgress)) els.progressExercise.value = selectedProgress;
  if (selectedRoutine && routines.some(routine => routine.id === selectedRoutine)) els.routineSelect.value = selectedRoutine;
}

function renderStats() {
  const today = localDateString();
  const todaySets = sets.filter(set => set.date === today);
  const weeklySets = getRollingWeekSets();
  const weeklyVolume = weeklySets.reduce((sum, set) => sum + setVolume(set), 0);
  const totalVolume = sets.reduce((sum, set) => sum + setVolume(set), 0);
  const bestSet = getBestSet(sets, set => estimatedOneRepMax(set.weight, set.reps));
  const trainedDays = new Set(weeklySets.map(set => set.date)).size;

  els.todayBadge.textContent = formatDate(today);
  els.todayCount.textContent = `${todaySets.length} set${todaySets.length === 1 ? "" : "s"}`;

  const cards = [
    { label: "Today", value: `${todaySets.length}`, extra: "sets logged" },
    { label: "7-day volume", value: `${formatNumber(weeklyVolume)} kg`, extra: `${weeklySets.length} sets · ${trainedDays} days` },
    { label: "Total volume", value: `${formatNumber(totalVolume)} kg`, extra: "all time" },
    {
      label: "Best e1RM",
      value: bestSet ? `${formatNumber(estimatedOneRepMax(bestSet.weight, bestSet.reps), 1)} kg` : "—",
      extra: bestSet ? bestSet.exercise : "log a set first"
    }
  ];

  els.stats.innerHTML = cards.map(card => `
    <article class="stat-card">
      <div class="stat-label">${escapeHTML(card.label)}</div>
      <div class="stat-value">${escapeHTML(card.value)}</div>
      <div class="stat-extra">${escapeHTML(card.extra)}</div>
    </article>
  `).join("");
}

function renderRoutines() {
  if (routines.length === 0) {
    els.routineList.innerHTML = `<div class="empty-state">No saved routines yet.</div>`;
    return;
  }

  els.routineList.innerHTML = routines.map(routine => `
    <article class="routine-card">
      <h3>${escapeHTML(routine.name)}</h3>
      <div class="muted">${routine.exercises.length} exercise${routine.exercises.length === 1 ? "" : "s"}</div>
      <div class="chip-row">
        ${routine.exercises.slice(0, 8).map(exercise => `<span class="chip">${escapeHTML(exercise)}</span>`).join("")}
        ${routine.exercises.length > 8 ? `<span class="chip">+${routine.exercises.length - 8}</span>` : ""}
      </div>
      <div class="routine-card-actions">
        <button class="secondary-button" type="button" data-use-routine="${escapeHTML(routine.id)}">Use routine</button>
        <button class="danger-button" type="button" data-delete-routine="${escapeHTML(routine.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}

function renderWeeklyMetrics() {
  const weeklySets = getRollingWeekSets();
  const daysTrained = new Set(weeklySets.map(set => set.date)).size;
  const weeklyVolume = weeklySets.reduce((sum, set) => sum + setVolume(set), 0);
  const rirSets = weeklySets.filter(set => set.rir !== null && Number.isFinite(Number(set.rir)));
  const avgRir = rirSets.length
    ? rirSets.reduce((sum, set) => sum + Number(set.rir), 0) / rirSets.length
    : null;

  const muscleSets = groupAndSum(weeklySets, set => set.muscle || getMuscleForExercise(set.exercise), () => 1);
  const muscleVolume = groupAndSum(weeklySets, set => set.muscle || getMuscleForExercise(set.exercise), setVolume);
  const topExercises = groupAndSum(weeklySets, set => set.exercise, setVolume).slice(0, 5);

  els.weeklyMetrics.innerHTML = `
    <article class="insight-card">
      <div class="insight-label">Training week</div>
      <div class="stat-value">${daysTrained} day${daysTrained === 1 ? "" : "s"}</div>
      <div class="insight-extra">${weeklySets.length} sets · ${formatNumber(weeklyVolume)} kg</div>
    </article>

    <article class="insight-card">
      <div class="insight-label">Average RIR</div>
      <div class="stat-value">${avgRir === null ? "—" : formatNumber(avgRir, 1)}</div>
      <div class="insight-extra">Based on ${rirSets.length} set${rirSets.length === 1 ? "" : "s"} with RIR</div>
    </article>

    <article class="insight-card">
      <div class="insight-label">Top volume exercise</div>
      <div class="stat-value">${topExercises[0] ? formatNumber(topExercises[0].value) + " kg" : "—"}</div>
      <div class="insight-extra">${topExercises[0] ? escapeHTML(topExercises[0].key) : "No data yet"}</div>
    </article>

    <article class="insight-card">
      <div class="insight-label">Sets by muscle</div>
      ${renderBreakdown(muscleSets, "sets")}
    </article>

    <article class="insight-card">
      <div class="insight-label">Volume by muscle</div>
      ${renderBreakdown(muscleVolume, "kg")}
    </article>

    <article class="insight-card">
      <div class="insight-label">Top exercises</div>
      ${renderBreakdown(topExercises, "kg")}
    </article>
  `;
}

function renderBreakdown(items, suffix) {
  if (!items.length) return `<div class="empty-state">No data yet.</div>`;
  const max = Math.max(...items.map(item => item.value), 1);
  return `<div class="breakdown-list">
    ${items.slice(0, 5).map(item => {
      const width = Math.max(4, Math.round((item.value / max) * 100));
      return `
        <div class="breakdown-item">
          <span>${escapeHTML(item.key)}</span>
          <strong>${formatNumber(item.value, suffix === "kg" ? 0 : 0)} ${suffix}</strong>
          <div class="bar"><span style="width:${width}%"></span></div>
        </div>
      `;
    }).join("")}
  </div>`;
}

function groupAndSum(list, keyFn, valueFn) {
  const map = new Map();
  list.forEach(item => {
    const key = keyFn(item) || "Other";
    map.set(key, (map.get(key) || 0) + valueFn(item));
  });
  return [...map.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}

function renderTodayAndHistory() {
  const today = localDateString();
  const todaySets = sets
    .filter(set => set.date === today)
    .sort((a, b) => a.timestamp - b.timestamp);

  const filter = els.filterExercise.value || "All";
  const filteredSets = sets
    .filter(set => filter === "All" || set.exercise === filter)
    .sort((a, b) => b.timestamp - a.timestamp);

  renderGroupedSets(els.todayList, todaySets, { compactDate: true });
  renderGroupedSets(els.historyList, filteredSets, { compactDate: false });
}

function renderGroupedSets(container, list, options = {}) {
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">No sets yet.</div>`;
    return;
  }

  const dateGroups = groupBy(list, set => set.date)
    .sort((a, b) => b.key.localeCompare(a.key));

  container.innerHTML = dateGroups.map(dateGroup => {
    const daySets = dateGroup.items.sort((a, b) => a.timestamp - b.timestamp);
    const dailyVolume = daySets.reduce((sum, set) => sum + setVolume(set), 0);
    const exercises = [...new Set(daySets.map(set => set.exercise))];
    const routineNames = [...new Set(daySets.map(set => set.routineName).filter(Boolean))];
    const exerciseGroups = groupBy(daySets, set => set.exercise);

    return `
      <article class="day-group">
        <header class="day-header">
          <div>
            <div class="day-title">${options.compactDate ? "Today" : formatDate(dateGroup.key)}</div>
            <div class="day-meta">
              ${daySets.length} set${daySets.length === 1 ? "" : "s"} · ${exercises.length} exercise${exercises.length === 1 ? "" : "s"}
              ${routineNames.length ? ` · ${routineNames.map(escapeHTML).join(", ")}` : ""}
            </div>
          </div>
          <div class="day-volume">${formatNumber(dailyVolume)} kg<span>volume</span></div>
        </header>
        ${exerciseGroups.map(group => renderExerciseGroup(group.key, group.items)).join("")}
      </article>
    `;
  }).join("");
}

function renderExerciseGroup(exercise, exerciseSets) {
  const volume = exerciseSets.reduce((sum, set) => sum + setVolume(set), 0);
  const best = getBestSet(exerciseSets, set => estimatedOneRepMax(set.weight, set.reps));

  return `
    <section class="exercise-group">
      <div class="exercise-heading">
        <span>${escapeHTML(exercise)}</span>
        <span class="mini-badge">${exerciseSets.length} set${exerciseSets.length === 1 ? "" : "s"} · ${formatNumber(volume)} kg</span>
      </div>
      ${exerciseSets.map((set, index) => renderSetRow(set, index + 1, best && best.id === set.id)).join("")}
    </section>
  `;
}

function renderSetRow(set, number, isBest = false) {
  const e1rm = estimatedOneRepMax(set.weight, set.reps);
  const rirText = set.rir === null || set.rir === "" ? "RIR —" : `RIR ${set.rir}`;
  const routineText = set.routineName ? ` · ${escapeHTML(set.routineName)}` : "";
  const notes = set.notes ? `<div class="set-notes">${escapeHTML(set.notes)}</div>` : "";

  return `
    <article class="set-row">
      <div>
        <div class="set-title">Set ${number}${isBest ? " · Best e1RM" : ""}</div>
        <div class="set-meta">
          ${formatNumber(set.weight, 1)} kg × ${set.reps} reps · ${rirText}${routineText}<br>
          Volume: ${formatNumber(setVolume(set), 1)} kg · e1RM: ${formatNumber(e1rm, 1)} kg
        </div>
        ${notes}
      </div>
      <button class="danger-button" type="button" data-delete-id="${escapeHTML(set.id)}">Delete</button>
    </article>
  `;
}

function groupBy(list, keyFn) {
  const map = new Map();
  list.forEach(item => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return [...map.entries()].map(([key, items]) => ({ key, items }));
}

function getBestSet(list, scoreFn) {
  return list.reduce((best, item) => {
    if (!best) return item;
    return scoreFn(item) > scoreFn(best) ? item : best;
  }, null);
}

function renderProgress() {
  const exercise = els.progressExercise.value || getAllExercises()[0];
  const exerciseSets = sets
    .filter(set => set.exercise === exercise)
    .sort((a, b) => a.timestamp - b.timestamp);

  renderPRBoard(exercise, exerciseSets);
  renderChart(exercise, exerciseSets);
}

function renderPRBoard(exercise, exerciseSets) {
  if (exerciseSets.length === 0) {
    els.prBoard.innerHTML = `
      <article class="pr-card">
        <div class="pr-label">${escapeHTML(exercise)}</div>
        <div class="pr-value">—</div>
        <div class="pr-extra">No sets logged yet</div>
      </article>
    `;
    return;
  }

  const heaviest = getBestSet(exerciseSets, set => set.weight);
  const bestE1rm = getBestSet(exerciseSets, set => estimatedOneRepMax(set.weight, set.reps));
  const bestVolume = getBestSet(exerciseSets, set => setVolume(set));
  const totalVolume = exerciseSets.reduce((sum, set) => sum + setVolume(set), 0);

  const cards = [
    {
      label: "Heaviest set",
      value: `${formatNumber(heaviest.weight, 1)} kg`,
      extra: `${heaviest.reps} reps · ${formatDate(heaviest.date)}`
    },
    {
      label: "Best e1RM",
      value: `${formatNumber(estimatedOneRepMax(bestE1rm.weight, bestE1rm.reps), 1)} kg`,
      extra: `${formatNumber(bestE1rm.weight, 1)} × ${bestE1rm.reps} · ${formatDate(bestE1rm.date)}`
    },
    {
      label: "Best set volume",
      value: `${formatNumber(setVolume(bestVolume), 1)} kg`,
      extra: `${formatNumber(bestVolume.weight, 1)} × ${bestVolume.reps} · ${formatDate(bestVolume.date)}`
    },
    {
      label: "Exercise total",
      value: `${formatNumber(totalVolume)} kg`,
      extra: `${exerciseSets.length} set${exerciseSets.length === 1 ? "" : "s"} logged`
    }
  ];

  els.prBoard.innerHTML = cards.map(card => `
    <article class="pr-card">
      <div class="pr-label">${escapeHTML(card.label)}</div>
      <div class="pr-value">${escapeHTML(card.value)}</div>
      <div class="pr-extra">${escapeHTML(card.extra)}</div>
    </article>
  `).join("");
}

function getChartSeries(exerciseSets, metric) {
  const byDate = groupBy(exerciseSets, set => set.date)
    .sort((a, b) => a.key.localeCompare(b.key));

  return byDate.map(group => {
    let value = 0;
    if (metric === "e1rm") {
      const best = getBestSet(group.items, set => estimatedOneRepMax(set.weight, set.reps));
      value = best ? estimatedOneRepMax(best.weight, best.reps) : 0;
    }
    if (metric === "weight") {
      const best = getBestSet(group.items, set => set.weight);
      value = best ? best.weight : 0;
    }
    if (metric === "volume") {
      value = group.items.reduce((sum, set) => sum + setVolume(set), 0);
    }
    return { label: formatShortDate(group.key), date: group.key, value };
  });
}

function renderChart(exercise, exerciseSets) {
  const metric = els.chartMetric.value;
  const series = getChartSeries(exerciseSets, metric);
  const label = metric === "e1rm" ? "Estimated 1RM" : metric === "weight" ? "Top weight" : "Daily volume";
  drawLineChart(els.progressChart, series, `${exercise} · ${label}`);
}

function drawLineChart(canvas, series, title) {
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(600, Math.floor(rect.width * ratio));
  canvas.height = Math.floor(260 * ratio);

  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 44 * ratio, right: 20 * ratio, bottom: 42 * ratio, left: 54 * ratio };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue("--text").trim() || "#f9fafb";
  const muted = styles.getPropertyValue("--muted").trim() || "#9ca3af";
  const line = "rgba(255,255,255,0.13)";
  const accent = styles.getPropertyValue("--accent").trim() || "#38bdf8";
  const accent2 = styles.getPropertyValue("--accent-2").trim() || "#22c55e";

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = text;
  ctx.font = `${14 * ratio}px system-ui, sans-serif`;
  ctx.fillText(title, padding.left, 24 * ratio);

  if (series.length === 0) {
    ctx.fillStyle = muted;
    ctx.font = `${13 * ratio}px system-ui, sans-serif`;
    ctx.fillText("No data yet for this exercise.", padding.left, padding.top + 48 * ratio);
    return;
  }

  const values = series.map(point => point.value);
  const minRaw = Math.min(...values);
  const maxRaw = Math.max(...values);
  const range = maxRaw - minRaw || Math.max(maxRaw, 1);
  const min = Math.max(0, minRaw - range * 0.12);
  const max = maxRaw + range * 0.12;

  ctx.strokeStyle = line;
  ctx.lineWidth = 1 * ratio;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
  }
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = `${11 * ratio}px system-ui, sans-serif`;
  for (let i = 0; i <= 4; i++) {
    const value = max - ((max - min) / 4) * i;
    const y = padding.top + (chartHeight / 4) * i + 4 * ratio;
    ctx.fillText(formatNumber(value, 0), 8 * ratio, y);
  }

  const points = series.map((point, index) => {
    const x = padding.left + (series.length === 1 ? chartWidth / 2 : (chartWidth / (series.length - 1)) * index);
    const y = padding.top + chartHeight - ((point.value - min) / (max - min || 1)) * chartHeight;
    return { ...point, x, y };
  });

  const gradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
  gradient.addColorStop(0, accent);
  gradient.addColorStop(1, accent2);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3 * ratio;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4 * ratio, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  });

  const labelsToShow = points.length <= 5
    ? points
    : points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 4) === 0);

  ctx.fillStyle = muted;
  ctx.font = `${10 * ratio}px system-ui, sans-serif`;
  labelsToShow.forEach(point => {
    ctx.fillText(point.label, point.x - 18 * ratio, height - 16 * ratio);
  });
}

function updateOneRmCalculator() {
  const weight = Number(els.calcWeight.value);
  const reps = Number.parseInt(els.calcReps.value, 10);

  if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) {
    els.oneRmResult.textContent = "Estimated 1RM: —";
    els.percentageTable.innerHTML = "";
    return;
  }

  const oneRm = estimatedOneRepMax(weight, reps);
  els.oneRmResult.textContent = `Estimated 1RM: ${formatNumber(oneRm, 1)} kg`;

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65];
  els.percentageTable.innerHTML = percentages.map(percent => `
    <article class="percent-card">
      <div class="percent-label">${percent}%</div>
      <div class="percent-value">${formatNumber(oneRm * percent / 100, 1)} kg</div>
    </article>
  `).join("");
}

function addSet(event) {
  event.preventDefault();

  const customExercise = els.customExercise.value.trim();
  const selectedExercise = els.exerciseSelect.value;
  const exercise = customExercise || selectedExercise;
  const weight = Number(els.weightInput.value);
  const reps = Number.parseInt(els.repsInput.value, 10);
  const rirRaw = els.rirInput.value.trim();
  const rir = rirRaw === "" ? null : Number.parseInt(rirRaw, 10);
  const notes = els.notesInput.value.trim();
  const selectedRoutine = getRoutineById(els.routineSelect.value);
  const muscle = customExercise ? els.muscleSelect.value : getMuscleForExercise(exercise);

  if (!exercise || !Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps <= 0) {
    alert("Please enter a valid exercise, weight and reps.");
    return;
  }

  if (customExercise) {
    exerciseMeta[customExercise] = { muscle, category: "Custom" };
    saveExerciseMeta();
  }

  const now = Date.now();
  sets.push({
    id: uid("set"),
    date: localDateString(new Date(now)),
    timestamp: now,
    exercise,
    weight,
    reps,
    rir: Number.isFinite(rir) ? rir : null,
    notes,
    routineName: selectedRoutine ? selectedRoutine.name : "",
    muscle
  });

  saveSets();
  const keepRoutine = els.routineSelect.value;
  els.form.reset();
  els.routineSelect.value = keepRoutine;
  els.exerciseSelect.value = exercise;
  render();
}

function saveRoutine(event) {
  event.preventDefault();
  const name = els.routineName.value.trim();
  const exercises = els.routineExercises.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  if (!name || exercises.length === 0) {
    alert("Add a routine name and at least one exercise.");
    return;
  }

  exercises.forEach(exercise => {
    if (!exerciseMeta[exercise]) exerciseMeta[exercise] = { muscle: "Other", category: "Custom" };
  });

  const existingIndex = routines.findIndex(routine => routine.name.toLowerCase() === name.toLowerCase());
  const routine = {
    id: existingIndex >= 0 ? routines[existingIndex].id : uid("routine"),
    name,
    exercises
  };

  if (existingIndex >= 0) routines[existingIndex] = routine;
  else routines.push(routine);

  saveRoutines();
  saveExerciseMeta();
  els.routineForm.reset();
  render();
}

function useRoutine(id) {
  const routine = getRoutineById(id);
  if (!routine) return;

  els.routineSelect.value = routine.id;
  if (routine.exercises[0]) els.exerciseSelect.value = routine.exercises[0];
  document.getElementById("log").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteRoutine(id) {
  const routine = getRoutineById(id);
  if (!routine) return;

  const confirmed = confirm(`Delete routine "${routine.name}"? This will not delete your logged sets.`);
  if (!confirmed) return;

  routines = routines.filter(item => item.id !== id);
  saveRoutines();
  render();
}

function deleteSet(id) {
  const confirmed = confirm("Delete this set?");
  if (!confirmed) return;

  sets = sets.filter(set => set.id !== id);
  saveSets();
  render();
}

function exportBackup() {
  const backup = {
    app: "LiftLog",
    version: 2,
    exportedAt: new Date().toISOString(),
    sets,
    routines,
    exerciseMeta
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `liftlog-backup-${localDateString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedSets = Array.isArray(parsed) ? parsed : parsed.sets;
      const importedRoutines = Array.isArray(parsed.routines) ? parsed.routines : [];
      const importedMeta = parsed.exerciseMeta && typeof parsed.exerciseMeta === "object" ? parsed.exerciseMeta : {};

      if (!Array.isArray(importedSets)) throw new Error("Invalid backup file.");

      const confirmed = confirm("Importing will merge this backup with your current data. Continue?");
      if (!confirmed) return;

      const existingIds = new Set(sets.map(set => set.id));
      const cleanedSets = importedSets
        .map(cleanSet)
        .filter(Boolean)
        .map(set => ({
          ...set,
          id: set.id && !existingIds.has(set.id) ? set.id : uid("set")
        }));

      const existingRoutineNames = new Set(routines.map(routine => routine.name.toLowerCase()));
      const cleanedRoutines = importedRoutines
        .filter(routine => routine && routine.name && Array.isArray(routine.exercises))
        .filter(routine => !existingRoutineNames.has(String(routine.name).toLowerCase()))
        .map(routine => ({
          id: routine.id || uid("routine"),
          name: String(routine.name),
          exercises: routine.exercises.map(String).filter(Boolean)
        }));

      sets = [...sets, ...cleanedSets];
      routines = [...routines, ...cleanedRoutines];
      exerciseMeta = { ...exerciseMeta, ...importedMeta };
      seedExerciseMeta();
      saveSets();
      saveRoutines();
      saveExerciseMeta();
      render();
      alert(`Imported ${cleanedSets.length} sets and ${cleanedRoutines.length} routines.`);
    } catch (error) {
      alert("Could not import this file. Make sure it is a LiftLog JSON backup.");
    } finally {
      els.importFile.value = "";
    }
  };
  reader.readAsText(file);
}

function render() {
  seedExerciseMeta();
  renderOptions();
  renderStats();
  renderRoutines();
  renderWeeklyMetrics();
  renderProgress();
  renderTodayAndHistory();
  updateOneRmCalculator();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.form.addEventListener("submit", addSet);
els.routineForm.addEventListener("submit", saveRoutine);
els.clearRoutineForm.addEventListener("click", () => els.routineForm.reset());
els.filterExercise.addEventListener("change", renderTodayAndHistory);
els.progressExercise.addEventListener("change", renderProgress);
els.chartMetric.addEventListener("change", renderProgress);
els.exportBtn.addEventListener("click", exportBackup);
els.importFile.addEventListener("change", importBackup);
els.calcWeight.addEventListener("input", updateOneRmCalculator);
els.calcReps.addEventListener("input", updateOneRmCalculator);
window.addEventListener("resize", renderProgress);

document.addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) deleteSet(deleteButton.dataset.deleteId);

  const useRoutineButton = event.target.closest("[data-use-routine]");
  if (useRoutineButton) useRoutine(useRoutineButton.dataset.useRoutine);

  const deleteRoutineButton = event.target.closest("[data-delete-routine]");
  if (deleteRoutineButton) deleteRoutine(deleteRoutineButton.dataset.deleteRoutine);
});

els.routineSelect.addEventListener("change", () => {
  const routine = getRoutineById(els.routineSelect.value);
  if (routine && routine.exercises[0]) {
    els.exerciseSelect.value = routine.exercises[0];
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // App still works without offline cache.
    });
  });
}

render();
