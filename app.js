const STORAGE_KEY = "liftlog_sets_v1";

const DEFAULT_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull Up",
  "Incline Bench",
  "Leg Press",
  "Romanian Deadlift",
  "Biceps Curl",
  "Triceps Pushdown",
  "Lateral Raise"
];

let sets = loadSets();

const els = {
  form: document.getElementById("setForm"),
  exerciseSelect: document.getElementById("exerciseSelect"),
  customExercise: document.getElementById("customExercise"),
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
  todayCount: document.getElementById("todayCount")
};

function loadSets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
  return set.weight * set.reps;
}

function getAllExercises() {
  return [...new Set([...DEFAULT_EXERCISES, ...sets.map(set => set.exercise)])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function renderExerciseOptions() {
  const selectedExercise = els.exerciseSelect.value;
  const selectedFilter = els.filterExercise.value;
  const exercises = getAllExercises();

  els.exerciseSelect.innerHTML = exercises
    .map(exercise => `<option value="${escapeHTML(exercise)}">${escapeHTML(exercise)}</option>`)
    .join("");

  els.filterExercise.innerHTML = ["All", ...exercises]
    .map(exercise => `<option value="${escapeHTML(exercise)}">${escapeHTML(exercise)}</option>`)
    .join("");

  if (selectedExercise) els.exerciseSelect.value = selectedExercise;
  if (selectedFilter) els.filterExercise.value = selectedFilter;
}

function renderStats() {
  const today = localDateString();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const todaySets = sets.filter(set => set.date === today);
  const weeklySets = sets.filter(set => set.timestamp >= sevenDaysAgo);
  const weeklyVolume = weeklySets.reduce((sum, set) => sum + setVolume(set), 0);
  const totalVolume = sets.reduce((sum, set) => sum + setVolume(set), 0);
  const bestSet = sets.reduce((best, set) => {
    const currentMax = estimatedOneRepMax(set.weight, set.reps);
    const bestMax = best ? estimatedOneRepMax(best.weight, best.reps) : 0;
    return currentMax > bestMax ? set : best;
  }, null);

  els.todayBadge.textContent = formatDate(today);
  els.todayCount.textContent = `${todaySets.length} set${todaySets.length === 1 ? "" : "s"}`;

  const cards = [
    {
      label: "Today",
      value: `${todaySets.length}`,
      extra: "sets logged"
    },
    {
      label: "7-day volume",
      value: `${formatNumber(weeklyVolume)} kg`,
      extra: `${weeklySets.length} sets`
    },
    {
      label: "Total volume",
      value: `${formatNumber(totalVolume)} kg`,
      extra: "all time"
    },
    {
      label: "Best e1RM",
      value: bestSet ? `${formatNumber(estimatedOneRepMax(bestSet.weight, bestSet.reps), 1)} kg` : "—",
      extra: bestSet ? bestSet.exercise : "log a set first"
    }
  ];

  els.stats.innerHTML = cards.map(card => `
    <article class="stat-card">
      <div class="stat-label">${card.label}</div>
      <div class="stat-value">${card.value}</div>
      <div class="stat-extra">${escapeHTML(card.extra)}</div>
    </article>
  `).join("");
}

function renderSetList(container, list, options = {}) {
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">No sets yet.</div>`;
    return;
  }

  container.innerHTML = list.map(set => {
    const e1rm = estimatedOneRepMax(set.weight, set.reps);
    const dateText = options.showDate ? `${formatDate(set.date)} · ` : "";
    const rirText = set.rir === null || set.rir === "" ? "RIR —" : `RIR ${set.rir}`;
    const notes = set.notes ? `<div class="set-notes">${escapeHTML(set.notes)}</div>` : "";

    return `
      <article class="set-row">
        <div>
          <div class="set-title">${escapeHTML(set.exercise)}</div>
          <div class="set-meta">
            ${dateText}${formatNumber(set.weight, 1)} kg × ${set.reps} reps · ${rirText}<br>
            Volume: ${formatNumber(setVolume(set), 1)} kg · e1RM: ${formatNumber(e1rm, 1)} kg
          </div>
          ${notes}
        </div>
        <button class="danger-button" type="button" data-delete-id="${set.id}">Delete</button>
      </article>
    `;
  }).join("");
}

function renderLists() {
  const today = localDateString();
  const todaySets = sets
    .filter(set => set.date === today)
    .sort((a, b) => b.timestamp - a.timestamp);

  const filter = els.filterExercise.value || "All";
  const filteredSets = sets
    .filter(set => filter === "All" || set.exercise === filter)
    .sort((a, b) => b.timestamp - a.timestamp);

  renderSetList(els.todayList, todaySets, { showDate: false });
  renderSetList(els.historyList, filteredSets, { showDate: true });
}

function render() {
  renderExerciseOptions();
  renderStats();
  renderLists();
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

  if (!exercise || !Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps <= 0) {
    alert("Please enter a valid exercise, weight and reps.");
    return;
  }

  const now = Date.now();
  sets.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(now),
    date: localDateString(new Date(now)),
    timestamp: now,
    exercise,
    weight,
    reps,
    rir,
    notes
  });

  saveSets();
  els.form.reset();
  els.exerciseSelect.value = exercise;
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
    version: 1,
    exportedAt: new Date().toISOString(),
    sets
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

      if (!Array.isArray(importedSets)) {
        throw new Error("Invalid backup file.");
      }

      const confirmed = confirm("Importing will merge this backup with your current data. Continue?");
      if (!confirmed) return;

      const existingIds = new Set(sets.map(set => set.id));
      const cleaned = importedSets
        .filter(set => set.exercise && Number.isFinite(Number(set.weight)) && Number.isFinite(Number(set.reps)))
        .map(set => ({
          id: set.id && !existingIds.has(set.id) ? set.id : (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
          date: set.date || localDateString(),
          timestamp: Number(set.timestamp) || Date.now(),
          exercise: String(set.exercise),
          weight: Number(set.weight),
          reps: Number.parseInt(set.reps, 10),
          rir: set.rir === null || set.rir === "" || set.rir === undefined ? null : Number.parseInt(set.rir, 10),
          notes: set.notes ? String(set.notes) : ""
        }));

      sets = [...sets, ...cleaned];
      saveSets();
      render();
      alert(`Imported ${cleaned.length} sets.`);
    } catch (error) {
      alert("Could not import this file. Make sure it is a LiftLog JSON backup.");
    } finally {
      els.importFile.value = "";
    }
  };
  reader.readAsText(file);
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
els.filterExercise.addEventListener("change", renderLists);
els.exportBtn.addEventListener("click", exportBackup);
els.importFile.addEventListener("change", importBackup);
document.addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) deleteSet(deleteButton.dataset.deleteId);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // App still works without offline cache.
    });
  });
}

render();
