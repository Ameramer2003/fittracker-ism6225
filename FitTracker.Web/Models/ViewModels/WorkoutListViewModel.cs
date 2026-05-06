namespace FitTracker.Web.Models.ViewModels;

public class WorkoutListViewModel
{
    public List<Workout> Workouts  { get; set; } = new();
    public string        Query     { get; set; } = string.Empty;
    public string        Category  { get; set; } = string.Empty;

    public static readonly List<string> Categories = new()
    {
        "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"
    };
}
