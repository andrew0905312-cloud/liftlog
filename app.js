const SETS_KEY = "liftlog_sets_v1";
const ROUTINES_KEY = "liftlog_routines_v1";
const EXERCISE_META_KEY = "liftlog_exercise_meta_v1";
const NUTRITION_KEY = "liftlog_nutrition_v1";

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


const DAILY_MEAL_ITEMS = [
  {
    id: "breakfast",
    name: "Breakfast · Gallo pinto",
    items: [
      { id: "breakfast-rice", name: "Cooked white rice", amount: "250 g" },
      { id: "breakfast-beans", name: "Cooked beans", amount: "100 g" },
      { id: "breakfast-eggs", name: "Jumbo eggs", amount: "2 units" }
    ]
  },
  {
    id: "snack",
    name: "Snack · Protein yogurt",
    items: [
      { id: "snack-yogurt", name: "0% Greek yogurt", amount: "150 g" },
      { id: "snack-whey", name: "Whey protein", amount: "15 g" },
      { id: "snack-fruit", name: "Mixed fruit", amount: "300 g" }
    ]
  },
  {
    id: "lunch",
    name: "Lunch · Chicken, rice and beans",
    items: [
      { id: "lunch-chicken", name: "Cooked chicken breast", amount: "125 g" },
      { id: "lunch-rice", name: "Cooked white rice", amount: "300 g" },
      { id: "lunch-beans", name: "Cooked beans", amount: "100 g" }
    ]
  },
  {
    id: "dinner",
    name: "Dinner · Tilapia, rice and fruit",
    items: [
      { id: "dinner-tilapia", name: "Cooked tilapia", amount: "110 g" },
      { id: "dinner-rice", name: "Cooked white rice", amount: "135 g" },
      { id: "dinner-fruit", name: "Mixed fruit", amount: "150 g" }
    ]
  }
];

const NUTRITION_DAYS = [
  {
    dayNumber: 1,
    weekday: "Sunday",
    recipes: {
      breakfast: "Classic gallo pinto with eggs: rice + beans with salt, pepper, garlic powder, onion powder and cilantro. Add 2 jumbo eggs.",
      snack: "Protein yogurt with fruit: Greek yogurt + whey until creamy. Add fruit on top.",
      lunch: "Lemon chicken: chicken breast with lemon, garlic, salt and pepper. Serve with rice and beans.",
      dinner: "Paprika tilapia: tilapia with paprika, lemon, salt and pepper. Serve with rice and fruit."
    }
  },
  {
    dayNumber: 2,
    weekday: "Monday",
    recipes: {
      breakfast: "Gallo pinto bowl: rice + beans, then mix in 2 scrambled jumbo eggs.",
      snack: "Cold yogurt bowl: Greek yogurt + whey + fruit, chilled for a thicker texture.",
      lunch: "Fajita-style chicken: chicken strips with paprika, cumin, garlic, pepper and lemon. Serve with rice and beans.",
      dinner: "Mild curry tilapia: tilapia with curry powder, garlic, salt, pepper and lemon. Serve with rice and fruit."
    }
  },
  {
    dayNumber: 3,
    weekday: "Tuesday",
    recipes: {
      breakfast: "Gallo pinto with omelette: rice + beans, with a 2-egg omelette on the side.",
      snack: "Thick yogurt smoothie: blend or mix yogurt, whey and part of the fruit. Use the rest as topping.",
      lunch: "Shredded chicken: chicken with garlic, lemon, salt, pepper and optional chili. Serve with rice and beans.",
      dinner: "Lemon tilapia: tilapia with plenty of lemon, garlic, salt and pepper. Serve with rice and fruit."
    }
  },
  {
    dayNumber: 4,
    weekday: "Wednesday",
    recipes: {
      breakfast: "Breakfast bowl: rice + beans in a bowl, topped with 2 scrambled jumbo eggs. Optional cilantro, chili or a little Lizano.",
      snack: "Frozen-fruit yogurt: Greek yogurt + whey with cold or frozen fruit for a dessert-like texture.",
      lunch: "Dry BBQ-style chicken: chicken with paprika, garlic, pepper, cumin and a pinch of salt. Serve with rice and beans.",
      dinner: "Shredded tilapia with rice: mix tilapia with rice, lemon, garlic, salt, pepper and cilantro. Add fruit."
    }
  },
  {
    dayNumber: 5,
    weekday: "Thursday",
    recipes: {
      breakfast: "Gallo pinto with boiled eggs: rice + beans with 2 boiled jumbo eggs, whole or chopped on top.",
      snack: "Dessert-style protein yogurt: Greek yogurt + whey until creamy, with fruit on top.",
      lunch: "Chicken with creamy beans: chicken and rice, with the beans slightly mashed for a creamier texture.",
      dinner: "Garlic-pepper tilapia: tilapia with garlic, black pepper, salt and lemon. Serve with rice and fruit."
    }
  }
];

const DAILY_NUTRITION_TARGET = {
  calories: "≈2100 kcal",
  protein: "150–152 g protein",
  totalItems: DAILY_MEAL_ITEMS.reduce((sum, meal) => sum + meal.items.length, 0)
};


let exerciseMeta = loadObject(EXERCISE_META_KEY);
let sets = loadArray(SETS_KEY).map(cleanSet).filter(Boolean);
let routines = loadArray(ROUTINES_KEY);
let nutrition = normalizeNutrition(loadObject(NUTRITION_KEY));

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
  percentageTable: document.getElementById("percentageTable"),
  nutritionBadge: document.getElementById("nutritionBadge"),
  nutritionOverview: document.getElementById("nutritionOverview"),
  nutritionMeals: document.getElementById("nutritionMeals"),
  nutritionWeek: document.getElementById("nutritionWeek"),
  nutritionNotes: document.getElementById("nutritionNotes"),
  checkAllNutritionBtn: document.getElementById("checkAllNutritionBtn"),
  clearNutritionBtn: document.getElementById("clearNutritionBtn"),
  pageViews: document.querySelectorAll("[data-page]"),
  tabButtons: document.querySelectorAll("[data-tab]"),
  homeSnapshot: document.getElementById("homeSnapshot"),
  homeRecentList: document.getElementById("homeRecentList")
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

function saveNutrition() {
  localStorage.setItem(NUTRITION_KEY, JSON.stringify(nutrition));
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


function normalizeNutrition(value) {
  const normalized = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  if (!normalized.days || typeof normalized.days !== "object" || Array.isArray(normalized.days)) {
    normalized.days = {};
  }
  return normalized;
}

function getNutritionDay(date = new Date()) {
  const dayIndex = date.getDay(); // 0 Sunday, 1 Monday, ... 4 Thursday
  if (dayIndex < 0 || dayIndex > 4) return null;
  return NUTRITION_DAYS[dayIndex];
}

function getNutritionDateString(date = new Date()) {
  return localDateString(date);
}

function getNutritionRecord(dateString = getNutritionDateString()) {
  if (!nutrition.days[dateString]) {
    nutrition.days[dateString] = { checkedItems: {}, notes: "" };
  }
  if (!nutrition.days[dateString].checkedItems || typeof nutrition.days[dateString].checkedItems !== "object") {
    nutrition.days[dateString].checkedItems = {};
  }
  if (typeof nutrition.days[dateString].notes !== "string") nutrition.days[dateString].notes = "";
  return nutrition.days[dateString];
}

function getNutritionItemIds() {
  return DAILY_MEAL_ITEMS.flatMap(meal => meal.items.map(item => `${meal.id}:${item.id}`));
}

function getNutritionCompletion(dateString = getNutritionDateString()) {
  const record = getNutritionRecord(dateString);
  const itemIds = getNutritionItemIds();
  const checked = itemIds.filter(id => record.checkedItems[id]).length;
  const total = itemIds.length;
  return {
    checked,
    total,
    percent: total ? Math.round((checked / total) * 100) : 0
  };
}

function getCurrentNutritionWeekDates(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  return Array.from({ length: 5 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function renderNutrition() {
  const today = new Date();
  const dateString = getNutritionDateString(today);
  const planDay = getNutritionDay(today);
  const record = getNutritionRecord(dateString);
  const completion = getNutritionCompletion(dateString);

  els.nutritionBadge.textContent = planDay
    ? `${planDay.weekday} · Day ${planDay.dayNumber}`
    : "Off plan day";

  const weekDates = getCurrentNutritionWeekDates(today);
  const weekCompletions = weekDates.map(date => getNutritionCompletion(localDateString(date)));
  const weekChecked = weekCompletions.reduce((sum, item) => sum + item.checked, 0);
  const weekTotal = weekCompletions.reduce((sum, item) => sum + item.total, 0);
  const mealsComplete = DAILY_MEAL_ITEMS.filter(meal => {
    return meal.items.every(item => record.checkedItems[`${meal.id}:${item.id}`]);
  }).length;

  els.nutritionOverview.innerHTML = [
    { label: "Today", value: `${completion.percent}%`, extra: `${completion.checked}/${completion.total} checks` },
    { label: "Meals complete", value: `${mealsComplete}/4`, extra: "breakfast, snack, lunch, dinner" },
    { label: "Daily target", value: DAILY_NUTRITION_TARGET.calories, extra: DAILY_NUTRITION_TARGET.protein },
    { label: "Plan week", value: `${weekTotal ? Math.round((weekChecked / weekTotal) * 100) : 0}%`, extra: `${weekChecked}/${weekTotal} checks · Sun–Thu` }
  ].map(card => `
    <article class="stat-card">
      <div class="stat-label">${escapeHTML(card.label)}</div>
      <div class="stat-value">${escapeHTML(card.value)}</div>
      <div class="stat-extra">${escapeHTML(card.extra)}</div>
    </article>
  `).join("");

  if (!planDay) {
    els.nutritionMeals.innerHTML = `
      <div class="off-plan-card">
        <strong>Friday/Saturday are outside this 5-day plan.</strong><br>
        Use this tab again on Sunday, or use the notes box below to record a free meal-plan note.
      </div>
    `;
  } else {
    els.nutritionMeals.innerHTML = DAILY_MEAL_ITEMS.map(meal => renderNutritionMeal(meal, planDay, record)).join("");
  }

  els.nutritionWeek.innerHTML = weekDates.map((date, index) => {
    const day = NUTRITION_DAYS[index];
    const ds = localDateString(date);
    const done = getNutritionCompletion(ds);
    const isToday = ds === dateString;
    return `
      <article class="nutrition-day-card${isToday ? " today" : ""}">
        <div class="nutrition-day-name">${escapeHTML(day.weekday)}</div>
        <div class="nutrition-day-date">Day ${day.dayNumber} · ${escapeHTML(formatShortDate(ds))}</div>
        <div class="nutrition-day-progress">${done.percent}% · ${done.checked}/${done.total}</div>
        <div class="bar"><span style="width:${Math.max(4, done.percent)}%"></span></div>
      </article>
    `;
  }).join("");

  els.nutritionNotes.value = record.notes || "";
}

function renderNutritionMeal(meal, planDay, record) {
  const checkedCount = meal.items.filter(item => record.checkedItems[`${meal.id}:${item.id}`]).length;
  return `
    <article class="nutrition-meal-card">
      <header class="nutrition-meal-header">
        <div>
          <div class="nutrition-meal-title">${escapeHTML(meal.name)}</div>
          <div class="nutrition-recipe">${escapeHTML(planDay.recipes[meal.id])}</div>
        </div>
        <span class="mini-badge">${checkedCount}/${meal.items.length}</span>
      </header>
      <div class="nutrition-check-list">
        ${meal.items.map(item => {
          const key = `${meal.id}:${item.id}`;
          const checked = record.checkedItems[key] ? "checked" : "";
          return `
            <label class="nutrition-check-row">
              <input type="checkbox" data-nutrition-item="${escapeHTML(key)}" ${checked} />
              <span class="nutrition-item-name">${escapeHTML(item.name)}</span>
              <span class="nutrition-item-amount">${escapeHTML(item.amount)}</span>
            </label>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function updateNutritionCheck(key, checked) {
  const dateString = getNutritionDateString();
  const record = getNutritionRecord(dateString);
  record.checkedItems[key] = Boolean(checked);
  saveNutrition();
  renderNutrition();
}

function markTodayNutritionComplete() {
  const record = getNutritionRecord(getNutritionDateString());
  getNutritionItemIds().forEach(id => {
    record.checkedItems[id] = true;
  });
  saveNutrition();
  renderNutrition();
}

function clearTodayNutrition() {
  const confirmed = confirm("Clear all nutrition checks for today?");
  if (!confirmed) return;
  const record = getNutritionRecord(getNutritionDateString());
  record.checkedItems = {};
  saveNutrition();
  renderNutrition();
}

function saveNutritionNotes() {
  const record = getNutritionRecord(getNutritionDateString());
  record.notes = els.nutritionNotes.value;
  saveNutrition();
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
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
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
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
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
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
}

function deleteSet(id) {
  const confirmed = confirm("Delete this set?");
  if (!confirmed) return;

  sets = sets.filter(set => set.id !== id);
  saveSets();
  render();
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
}

function exportBackup() {
  const backup = {
    app: "LiftLog",
    version: 3,
    exportedAt: new Date().toISOString(),
    sets,
    routines,
    exerciseMeta,
    nutrition
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
      const importedNutrition = parsed.nutrition && typeof parsed.nutrition === "object" ? normalizeNutrition(parsed.nutrition) : null;

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
      if (importedNutrition) {
        nutrition = normalizeNutrition({
          ...nutrition,
          days: { ...nutrition.days, ...importedNutrition.days }
        });
        saveNutrition();
      }
      seedExerciseMeta();
      saveSets();
      saveRoutines();
      saveExerciseMeta();
      render();
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
      alert(`Imported ${cleanedSets.length} sets and ${cleanedRoutines.length} routines.`);
    } catch (error) {
      alert("Could not import this file. Make sure it is a LiftLog JSON backup.");
    } finally {
      els.importFile.value = "";
    }
  };
  reader.readAsText(file);
}


function normalizeTab(tab) {
  const validTabs = new Set(["main", "nutrition", "log", "history", "stats"]);
  return validTabs.has(tab) ? tab : "main";
}

function getInitialTab() {
  const hash = window.location.hash.replace("#", "").trim();
  const aliases = {
    home: "main",
    main: "main",
    nutrition: "nutrition",
    log: "log",
    add: "log",
    addset: "log",
    history: "history",
    stats: "stats",
    statistics: "stats",
    progress: "stats"
  };
  return normalizeTab(aliases[hash] || hash || "main");
}

function setActiveTab(tab = "main", updateHash = true) {
  const activeTab = normalizeTab(tab);

  els.pageViews.forEach(view => {
    view.classList.toggle("active", view.dataset.page === activeTab);
  });

  els.tabButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });

  document.body.dataset.activeTab = activeTab;

  if (updateHash) {
    const nextHash = activeTab === "main" ? "#main" : `#${activeTab}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
    window.scrollTo(0, 0);
  }

  if (activeTab === "stats") {
    requestAnimationFrame(renderProgress);
  }
}

function renderHome() {
  if (!els.homeSnapshot || !els.homeRecentList) return;

  const today = localDateString();
  const todaySets = sets.filter(set => set.date === today);
  const weeklySets = getRollingWeekSets();
  const weeklyVolume = weeklySets.reduce((sum, set) => sum + setVolume(set), 0);
  const nutritionCompletion = getNutritionCompletion(today);
  const bestSet = getBestSet(sets, set => estimatedOneRepMax(set.weight, set.reps));

  const cards = [
    { label: "Gym today", value: `${todaySets.length}`, extra: "sets logged" },
    { label: "Nutrition", value: `${nutritionCompletion.percent}%`, extra: `${nutritionCompletion.checked}/${nutritionCompletion.total} checks today` },
    { label: "7-day volume", value: `${formatNumber(weeklyVolume)} kg`, extra: `${weeklySets.length} sets this week` },
    {
      label: "Best e1RM",
      value: bestSet ? `${formatNumber(estimatedOneRepMax(bestSet.weight, bestSet.reps), 1)} kg` : "—",
      extra: bestSet ? bestSet.exercise : "log a set first"
    }
  ];

  els.homeSnapshot.innerHTML = cards.map(card => `
    <article class="stat-card">
      <div class="stat-label">${escapeHTML(card.label)}</div>
      <div class="stat-value">${escapeHTML(card.value)}</div>
      <div class="stat-extra">${escapeHTML(card.extra)}</div>
    </article>
  `).join("");

  const recentSets = [...sets].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
  if (recentSets.length === 0) {
    els.homeRecentList.innerHTML = `<div class="empty-state">No sets logged yet. Tap <strong>Add set</strong> to start.</div>`;
    return;
  }

  els.homeRecentList.innerHTML = recentSets.map(set => `
    <div class="set-row">
      <div>
        <strong>${escapeHTML(set.exercise)}</strong>
        <div class="muted">${escapeHTML(formatShortDate(set.date))}${set.routineName ? ` · ${escapeHTML(set.routineName)}` : ""}</div>
      </div>
      <div class="set-meta">
        <span>${formatNumber(set.weight, 1)} kg × ${set.reps}</span>
        <span>e1RM ${formatNumber(estimatedOneRepMax(set.weight, set.reps), 1)} kg</span>
      </div>
    </div>
  `).join("");
}

function render() {
  seedExerciseMeta();
  renderOptions();
  renderStats();
  renderRoutines();
  renderNutrition();
  renderWeeklyMetrics();
  renderProgress();
  renderTodayAndHistory();
  renderHome();
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
els.checkAllNutritionBtn.addEventListener("click", markTodayNutritionComplete);
els.clearNutritionBtn.addEventListener("click", clearTodayNutrition);
els.nutritionNotes.addEventListener("input", saveNutritionNotes);
window.addEventListener("resize", renderProgress);

document.addEventListener("change", event => {
  const nutritionInput = event.target.closest("[data-nutrition-item]");
  if (nutritionInput) updateNutritionCheck(nutritionInput.dataset.nutritionItem, nutritionInput.checked);
});

document.addEventListener("click", event => {
  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) {
    event.preventDefault();
    setActiveTab(tabButton.dataset.tab);
    return;
  }

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
setActiveTab(getInitialTab(), false);
window.addEventListener("hashchange", () => setActiveTab(getInitialTab(), false));
