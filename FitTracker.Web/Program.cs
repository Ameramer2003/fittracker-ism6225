using Microsoft.EntityFrameworkCore;
using FitTracker.Web.Data;
using FitTracker.Web.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register EF Core with Azure SQL
// Connection string is stored in User Secrets (dev) or Azure App Config (prod) -- never in this file
builder.Services.AddDbContext<FitTrackerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Apply any pending EF migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FitTrackerDbContext>();
    db.Database.Migrate();

    // Seed only if the table is empty -- mirrors FitStorage.init() from storage.js
    if (!db.Workouts.Any())
    {
        var today = DateTime.Today;
        db.Workouts.AddRange(
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-56)), Exercise = "Bench Press",     Category = "Chest",     Difficulty = "Intermediate", Sets = 4, Reps = 10, Weight = 135, Calories = 320, Duration = 45, Equipment = "Barbell",       Notes = "Felt strong. Controlled tempo.",       CreatedAt = DateTime.UtcNow.AddDays(-56) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-49)), Exercise = "Barbell Squat",   Category = "Legs",      Difficulty = "Advanced",     Sets = 5, Reps = 8,  Weight = 185, Calories = 450, Duration = 60, Equipment = "Barbell",       Notes = "Depth improved significantly.",        CreatedAt = DateTime.UtcNow.AddDays(-49) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-42)), Exercise = "Pull-Ups",        Category = "Back",      Difficulty = "Intermediate", Sets = 4, Reps = 8,  Weight = 0,   Calories = 200, Duration = 30, Equipment = "Bodyweight",    Notes = "Paused at top for extra engagement.",  CreatedAt = DateTime.UtcNow.AddDays(-42) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-35)), Exercise = "Overhead Press",  Category = "Shoulders", Difficulty = "Intermediate", Sets = 3, Reps = 10, Weight = 95,  Calories = 180, Duration = 35, Equipment = "Barbell",       Notes = "Form focus session.",                  CreatedAt = DateTime.UtcNow.AddDays(-35) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-28)), Exercise = "Deadlift",        Category = "Back",      Difficulty = "Advanced",     Sets = 3, Reps = 5,  Weight = 225, Calories = 400, Duration = 50, Equipment = "Barbell",       Notes = "Personal best! Back stayed neutral.",  CreatedAt = DateTime.UtcNow.AddDays(-28) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-21)), Exercise = "Treadmill Run",   Category = "Cardio",    Difficulty = "Beginner",     Sets = 1, Reps = 1,  Weight = 0,   Calories = 350, Duration = 30, Equipment = "Treadmill",     Notes = "5.5 mph steady state.",                CreatedAt = DateTime.UtcNow.AddDays(-21) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-18)), Exercise = "Bicep Curls",     Category = "Arms",      Difficulty = "Beginner",     Sets = 4, Reps = 12, Weight = 35,  Calories = 120, Duration = 20, Equipment = "Dumbbell",      Notes = "Slow negatives.",                      CreatedAt = DateTime.UtcNow.AddDays(-18) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-14)), Exercise = "Plank",           Category = "Core",      Difficulty = "Beginner",     Sets = 5, Reps = 1,  Weight = 0,   Calories = 80,  Duration = 15, Equipment = "Bodyweight",    Notes = "60 seconds each set.",                 CreatedAt = DateTime.UtcNow.AddDays(-14) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-11)), Exercise = "Leg Press",       Category = "Legs",      Difficulty = "Intermediate", Sets = 4, Reps = 12, Weight = 250, Calories = 300, Duration = 40, Equipment = "Cable Machine", Notes = "Full range of motion.",                CreatedAt = DateTime.UtcNow.AddDays(-11) },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-7)),  Exercise = "Cable Rows",      Category = "Back",      Difficulty = "Intermediate", Sets = 3, Reps = 10, Weight = 80,  Calories = 200, Duration = 30, Equipment = "Cable Machine", Notes = "Squeezed scapula at peak.",            CreatedAt = DateTime.UtcNow.AddDays(-7)  },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-4)),  Exercise = "Tricep Pushdown", Category = "Arms",      Difficulty = "Beginner",     Sets = 4, Reps = 15, Weight = 50,  Calories = 130, Duration = 25, Equipment = "Cable Machine", Notes = "High reps to finish arms day.",        CreatedAt = DateTime.UtcNow.AddDays(-4)  },
            new Workout { Date = DateOnly.FromDateTime(today.AddDays(-1)),  Exercise = "Lateral Raises",  Category = "Shoulders", Difficulty = "Beginner",     Sets = 3, Reps = 15, Weight = 20,  Calories = 100, Duration = 20, Equipment = "Dumbbell",      Notes = "Light weight, great pump.",            CreatedAt = DateTime.UtcNow.AddDays(-1)  }
        );
        db.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
