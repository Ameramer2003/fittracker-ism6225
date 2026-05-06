using System.ComponentModel.DataAnnotations;

namespace FitTracker.Web.Models.ViewModels;

public class WorkoutFormViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    [Required(ErrorMessage = "Exercise name is required.")]
    [StringLength(200, ErrorMessage = "Exercise name cannot exceed 200 characters.")]
    public string Exercise { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required.")]
    public string Category { get; set; } = string.Empty;

    [Required(ErrorMessage = "Difficulty is required.")]
    public string Difficulty { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sets is required.")]
    [Range(1, 20, ErrorMessage = "Sets must be between 1 and 20.")]
    public int Sets { get; set; }

    [Required(ErrorMessage = "Reps is required.")]
    [Range(1, 100, ErrorMessage = "Reps must be between 1 and 100.")]
    public int Reps { get; set; }

    [Range(0, 2000, ErrorMessage = "Weight must be between 0 and 2000 lbs.")]
    public decimal Weight { get; set; }

    [Range(0, 10000, ErrorMessage = "Calories must be between 0 and 10000.")]
    public int Calories { get; set; }

    [Required(ErrorMessage = "Duration is required.")]
    [Range(1, 300, ErrorMessage = "Duration must be between 1 and 300 minutes.")]
    public int Duration { get; set; }

    public string Equipment { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
    public string? Notes { get; set; }

    // Populate select lists in views
    public static readonly List<string> Categories = new()
    {
        "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"
    };

    public static readonly List<string> Difficulties = new()
    {
        "Beginner", "Intermediate", "Advanced"
    };

    public static readonly List<string> EquipmentOptions = new()
    {
        "Barbell", "Dumbbell", "Cable Machine", "Resistance Band",
        "Bodyweight", "Kettlebell", "Treadmill", "Other"
    };
}
