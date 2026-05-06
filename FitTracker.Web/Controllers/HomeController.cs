using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitTracker.Web.Data;
using FitTracker.Web.Models;
using FitTracker.Web.Models.ViewModels;

namespace FitTracker.Web.Controllers;

public class HomeController : Controller
{
    private readonly FitTrackerDbContext _db;

    public HomeController(FitTrackerDbContext db) => _db = db;

    public async Task<IActionResult> Index()
    {
        var vm = new HomeViewModel
        {
            TotalWorkouts = await _db.Workouts.CountAsync(),
            TotalCalories = await _db.Workouts.SumAsync(w => (int?)w.Calories) ?? 0,
            TotalSets     = await _db.Workouts.SumAsync(w => (int?)w.Sets)     ?? 0,
            Categories    = await _db.Workouts.Select(w => w.Category).Distinct().CountAsync()
        };
        return View(vm);
    }

    public IActionResult About() => View();

    public IActionResult Bot() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
