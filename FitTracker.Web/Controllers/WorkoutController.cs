using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitTracker.Web.Data;
using FitTracker.Web.Models;
using FitTracker.Web.Models.ViewModels;

namespace FitTracker.Web.Controllers;

public class WorkoutController : Controller
{
    private readonly FitTrackerDbContext _db;

    public WorkoutController(FitTrackerDbContext db) => _db = db;

    // GET /Workout
    public async Task<IActionResult> Index(string query = "", string category = "")
    {
        var workouts = _db.Workouts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
            workouts = workouts.Where(w =>
                w.Exercise.Contains(query) ||
                w.Category.Contains(query) ||
                (w.Notes != null && w.Notes.Contains(query)));

        if (!string.IsNullOrWhiteSpace(category))
            workouts = workouts.Where(w => w.Category == category);

        var list = await workouts.OrderByDescending(w => w.Date).ToListAsync();

        var vm = new WorkoutListViewModel
        {
            Workouts = list,
            Query    = query,
            Category = category
        };
        return View(vm);
    }

    // GET /Workout/Create
    public IActionResult Create(string? exercise = null, string? category = null)
    {
        var vm = new WorkoutFormViewModel
        {
            Date     = DateOnly.FromDateTime(DateTime.Today),
            Exercise = exercise ?? string.Empty,
            Category = category ?? string.Empty
        };
        return View(vm);
    }

    // POST /Workout/Create
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(WorkoutFormViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var workout = new Workout
        {
            Date       = vm.Date,
            Exercise   = vm.Exercise,
            Category   = vm.Category,
            Difficulty = vm.Difficulty,
            Sets       = vm.Sets,
            Reps       = vm.Reps,
            Weight     = vm.Weight,
            Calories   = vm.Calories,
            Duration   = vm.Duration,
            Equipment  = vm.Equipment,
            Notes      = vm.Notes,
            CreatedAt  = DateTime.UtcNow
        };

        _db.Workouts.Add(workout);
        await _db.SaveChangesAsync();

        TempData["Success"] = $"Workout \"{workout.Exercise}\" logged successfully!";
        return RedirectToAction(nameof(Index));
    }

    // GET /Workout/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        var workout = await _db.Workouts.FindAsync(id);
        if (workout == null) return NotFound();

        var vm = new WorkoutFormViewModel
        {
            Id         = workout.Id,
            Date       = workout.Date,
            Exercise   = workout.Exercise,
            Category   = workout.Category,
            Difficulty = workout.Difficulty,
            Sets       = workout.Sets,
            Reps       = workout.Reps,
            Weight     = workout.Weight,
            Calories   = workout.Calories,
            Duration   = workout.Duration,
            Equipment  = workout.Equipment,
            Notes      = workout.Notes
        };
        return View(vm);
    }

    // POST /Workout/Edit/5
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, WorkoutFormViewModel vm)
    {
        if (id != vm.Id) return BadRequest();
        if (!ModelState.IsValid) return View(vm);

        var workout = await _db.Workouts.FindAsync(id);
        if (workout == null) return NotFound();

        workout.Date       = vm.Date;
        workout.Exercise   = vm.Exercise;
        workout.Category   = vm.Category;
        workout.Difficulty = vm.Difficulty;
        workout.Sets       = vm.Sets;
        workout.Reps       = vm.Reps;
        workout.Weight     = vm.Weight;
        workout.Calories   = vm.Calories;
        workout.Duration   = vm.Duration;
        workout.Equipment  = vm.Equipment;
        workout.Notes      = vm.Notes;

        await _db.SaveChangesAsync();

        TempData["Success"] = $"Workout \"{workout.Exercise}\" updated successfully!";
        return RedirectToAction(nameof(Index));
    }

    // GET /Workout/Delete/5
    public async Task<IActionResult> Delete(int id)
    {
        var workout = await _db.Workouts.FindAsync(id);
        if (workout == null) return NotFound();
        return View(workout);
    }

    // POST /Workout/Delete/5
    [HttpPost, ActionName("Delete"), ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var workout = await _db.Workouts.FindAsync(id);
        if (workout != null)
        {
            _db.Workouts.Remove(workout);
            await _db.SaveChangesAsync();
            TempData["Success"] = $"Workout \"{workout.Exercise}\" deleted.";
        }
        return RedirectToAction(nameof(Index));
    }

    // GET /Workout/Visualizations
    public async Task<IActionResult> Visualizations()
    {
        // Pass all workouts as JSON for Chart.js to consume client-side
        var workouts = await _db.Workouts
            .OrderBy(w => w.Date)
            .Select(w => new {
                date       = w.Date.ToString("yyyy-MM-dd"),
                exercise   = w.Exercise,
                category   = w.Category,
                difficulty = w.Difficulty,
                sets       = w.Sets,
                reps       = w.Reps,
                weight     = w.Weight,
                calories   = w.Calories,
                duration   = w.Duration
            })
            .ToListAsync();

        ViewBag.WorkoutsJson = System.Text.Json.JsonSerializer.Serialize(workouts);
        return View();
    }
}
