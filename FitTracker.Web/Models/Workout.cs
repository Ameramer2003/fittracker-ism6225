namespace FitTracker.Web.Models;

public class Workout
{
    public int      Id         { get; set; }
    public DateOnly Date       { get; set; }
    public string   Exercise   { get; set; } = string.Empty;
    public string   Category   { get; set; } = string.Empty;  // Chest/Back/Legs/Shoulders/Arms/Core/Cardio/Full Body
    public string   Difficulty { get; set; } = string.Empty;  // Beginner/Intermediate/Advanced
    public int      Sets       { get; set; }
    public int      Reps       { get; set; }
    public decimal  Weight     { get; set; }
    public int      Calories   { get; set; }
    public int      Duration   { get; set; }
    public string   Equipment  { get; set; } = string.Empty;
    public string?  Notes      { get; set; }
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}
