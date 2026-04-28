// ===================================================
// FitTracker | js/storage.js
// Model Layer -- localStorage persistence
// ISM 6225 | University of South Florida
// ===================================================

const FitStorage = (() => {
  const KEY = 'fittracker_workouts';

  // Compute a date string N days ago from today
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  // Default seed data -- loaded only on first visit
  const SEED = [
    { id:  1, date: daysAgo(56), exercise: 'Bench Press',     category: 'Chest',     difficulty: 'Intermediate', sets: 4, reps: 10, weight: 135, calories: 320, duration: 45, equipment: 'Barbell',       notes: 'Felt strong. Controlled tempo.',      createdAt: new Date(Date.now()-56*86400000).toISOString() },
    { id:  2, date: daysAgo(49), exercise: 'Barbell Squat',   category: 'Legs',      difficulty: 'Advanced',     sets: 5, reps:  8, weight: 185, calories: 450, duration: 60, equipment: 'Barbell',       notes: 'Depth improved significantly.',       createdAt: new Date(Date.now()-49*86400000).toISOString() },
    { id:  3, date: daysAgo(42), exercise: 'Pull-Ups',        category: 'Back',      difficulty: 'Intermediate', sets: 4, reps:  8, weight:   0, calories: 200, duration: 30, equipment: 'Bodyweight',    notes: 'Paused at top for extra engagement.', createdAt: new Date(Date.now()-42*86400000).toISOString() },
    { id:  4, date: daysAgo(35), exercise: 'Overhead Press',  category: 'Shoulders', difficulty: 'Intermediate', sets: 3, reps: 10, weight:  95, calories: 180, duration: 35, equipment: 'Barbell',       notes: 'Form focus session.',                 createdAt: new Date(Date.now()-35*86400000).toISOString() },
    { id:  5, date: daysAgo(28), exercise: 'Deadlift',        category: 'Back',      difficulty: 'Advanced',     sets: 3, reps:  5, weight: 225, calories: 400, duration: 50, equipment: 'Barbell',       notes: 'Personal best! Back stayed neutral.', createdAt: new Date(Date.now()-28*86400000).toISOString() },
    { id:  6, date: daysAgo(21), exercise: 'Treadmill Run',   category: 'Cardio',    difficulty: 'Beginner',     sets: 1, reps:  1, weight:   0, calories: 350, duration: 30, equipment: 'Treadmill',     notes: '5.5 mph steady state.',               createdAt: new Date(Date.now()-21*86400000).toISOString() },
    { id:  7, date: daysAgo(18), exercise: 'Bicep Curls',     category: 'Arms',      difficulty: 'Beginner',     sets: 4, reps: 12, weight:  35, calories: 120, duration: 20, equipment: 'Dumbbell',      notes: 'Slow negatives.',                     createdAt: new Date(Date.now()-18*86400000).toISOString() },
    { id:  8, date: daysAgo(14), exercise: 'Plank',           category: 'Core',      difficulty: 'Beginner',     sets: 5, reps:  1, weight:   0, calories:  80, duration: 15, equipment: 'Bodyweight',    notes: '60 seconds each set.',                createdAt: new Date(Date.now()-14*86400000).toISOString() },
    { id:  9, date: daysAgo(11), exercise: 'Leg Press',       category: 'Legs',      difficulty: 'Intermediate', sets: 4, reps: 12, weight: 250, calories: 300, duration: 40, equipment: 'Cable Machine', notes: 'Full range of motion.',               createdAt: new Date(Date.now()-11*86400000).toISOString() },
    { id: 10, date: daysAgo(7),  exercise: 'Cable Rows',      category: 'Back',      difficulty: 'Intermediate', sets: 3, reps: 10, weight:  80, calories: 200, duration: 30, equipment: 'Cable Machine', notes: 'Squeezed scapula at peak.',           createdAt: new Date(Date.now()-7*86400000).toISOString()  },
    { id: 11, date: daysAgo(4),  exercise: 'Tricep Pushdown', category: 'Arms',      difficulty: 'Beginner',     sets: 4, reps: 15, weight:  50, calories: 130, duration: 25, equipment: 'Cable Machine', notes: 'High reps to finish arms day.',       createdAt: new Date(Date.now()-4*86400000).toISOString()  },
    { id: 12, date: daysAgo(1),  exercise: 'Lateral Raises',  category: 'Shoulders', difficulty: 'Beginner',     sets: 3, reps: 15, weight:  20, calories: 100, duration: 20, equipment: 'Dumbbell',      notes: 'Light weight, great pump.',           createdAt: new Date(Date.now()-1*86400000).toISOString()  },
  ];

  // Initialize storage with seed data if empty
  function init() {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
    }
  }

  // READ ALL
  function getAll() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  // READ ONE by ID
  function getById(id) {
    return getAll().find(w => w.id === parseInt(id));
  }

  // CREATE -- generate new ID, prepend to list
  function create(workout) {
    const all = getAll();
    const maxId = all.length > 0 ? Math.max(...all.map(w => w.id)) : 0;
    const newWorkout = {
      ...workout,
      id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    all.unshift(newWorkout);
    localStorage.setItem(KEY, JSON.stringify(all));
    return newWorkout;
  }

  // UPDATE by ID
  function update(id, changes) {
    const all = getAll();
    const idx = all.findIndex(w => w.id === parseInt(id));
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...changes };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  }

  // DELETE by ID
  function remove(id) {
    const all = getAll().filter(w => w.id !== parseInt(id));
    localStorage.setItem(KEY, JSON.stringify(all));
    return all;
  }

  // Compute summary stats
  function getStats() {
    const all = getAll();
    const totalCal  = all.reduce((s, w) => s + (parseInt(w.calories)  || 0), 0);
    const totalSets = all.reduce((s, w) => s + (parseInt(w.sets)      || 0), 0);
    const cats      = new Set(all.map(w => w.category)).size;
    return { total: all.length, totalCal, totalSets, cats };
  }

  // Group workouts by ISO week for chart data (last N weeks)
  function getWeeklyData(numWeeks = 8) {
    const all = getAll();
    const weeks = [];
    for (let i = numWeeks - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const label = `Week ${numWeeks - i}`;
      const entries = all.filter(w => {
        const d = new Date(w.date);
        return d >= start && d < end;
      });
      weeks.push({
        label,
        calories: entries.reduce((s, w) => s + (parseInt(w.calories) || 0), 0),
        duration: entries.length > 0 ? Math.round(entries.reduce((s, w) => s + (parseInt(w.duration) || 0), 0) / entries.length) : 0,
        count: entries.length
      });
    }
    return weeks;
  }

  // Category breakdown for doughnut chart
  function getCategoryBreakdown() {
    const all = getAll();
    const counts = {};
    all.forEach(w => { counts[w.category] = (counts[w.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  return { init, getAll, getById, create, update, remove, getStats, getWeeklyData, getCategoryBreakdown };
})();
