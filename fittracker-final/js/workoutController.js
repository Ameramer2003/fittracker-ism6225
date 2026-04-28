// ===================================================
// FitTracker | js/workoutController.js
// Controller Layer -- CRUD business logic
// ISM 6225 | University of South Florida
// ===================================================

const WorkoutController = {

  // CREATE -- read form fields and save to storage
  handleCreate(form) {
    const data = {
      date:       form.querySelector('#workout-date').value,
      exercise:   form.querySelector('#workout-exercise').value.trim(),
      category:   form.querySelector('#workout-category').value,
      difficulty: form.querySelector('#workout-difficulty').value,
      sets:       parseInt(form.querySelector('#workout-sets').value)      || 0,
      reps:       parseInt(form.querySelector('#workout-reps').value)      || 0,
      weight:     parseFloat(form.querySelector('#workout-weight').value)  || 0,
      calories:   parseInt(form.querySelector('#workout-calories').value)  || 0,
      duration:   parseInt(form.querySelector('#workout-duration').value)  || 0,
      equipment:  form.querySelector('#workout-equipment').value,
      notes:      form.querySelector('#workout-notes').value.trim(),
    };
    return FitStorage.create(data);
  },

  // READ -- return workouts matching optional text query and category filter
  getFiltered(query = '', category = '') {
    const q = query.toLowerCase().trim();
    return FitStorage.getAll().filter(w => {
      const matchQ = !q ||
        w.exercise.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        (w.notes && w.notes.toLowerCase().includes(q));
      const matchCat = !category || w.category === category;
      return matchQ && matchCat;
    });
  },

  // UPDATE -- save edited fields for an existing entry
  handleUpdate(id, form) {
    const data = {
      date:       form.querySelector('#edit-date').value,
      exercise:   form.querySelector('#edit-exercise').value.trim(),
      category:   form.querySelector('#edit-category').value,
      difficulty: form.querySelector('#edit-diff').value,
      sets:       parseInt(form.querySelector('#edit-sets').value)      || 0,
      reps:       parseInt(form.querySelector('#edit-reps').value)      || 0,
      weight:     parseFloat(form.querySelector('#edit-weight').value)  || 0,
      calories:   parseInt(form.querySelector('#edit-cal').value)       || 0,
      duration:   parseInt(form.querySelector('#edit-duration').value)  || 0,
      equipment:  form.querySelector('#edit-equipment').value,
      notes:      form.querySelector('#edit-notes').value.trim(),
    };
    return FitStorage.update(id, data);
  },

  // DELETE -- remove an entry by ID
  handleDelete(id) {
    return FitStorage.remove(id);
  },
};
