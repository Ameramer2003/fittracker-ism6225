using Microsoft.AspNetCore.Mvc;

namespace FitTracker.Web.Controllers;

public class ExerciseController : Controller
{
    // GET /Exercise
    public IActionResult Index() => View();
}
