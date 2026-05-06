# FitTracker — ASP.NET MVC Migration Plan
### Vanilla JS / localStorage → ASP.NET Core MVC + Entity Framework Core + Azure SQL

> **Security Rule — Enforced Throughout All Phases:**
> The Azure SQL connection string contains credentials and **must never be committed to source control**.
> Credentials are stored exclusively in:
> - **Local dev:** .NET User Secrets (`dotnet user-secrets`)
> - **Production:** Azure App Service → Configuration → Application Settings (environment variable)
>
> `appsettings.json` will only contain a **placeholder key** — never the actual connection string.

---

## Project Context

| Item | Detail |
|---|---|
| **Current Stack** | HTML5, CSS3, Vanilla JS, localStorage, wger REST API |
| **Target Stack** | ASP.NET Core MVC (.NET 8), Entity Framework Core, Azure SQL |
| **Azure SQL Server** | `fitnessdbs.database.windows.net` |
| **Azure SQL Database** | `fitnessDB` |
| **Subscription ID** | `a157d4cb-ec6c-4999-8a71-0df9b0a3a812` |
| **Original App Location** | `fittracker-final/` — left intact throughout migration |
| **New App Location** | `FitTracker.Web/` — created alongside original |

---

## Source → Target Page Mapping

| Original File | MVC Controller | Action | Route |
|---|---|---|---|
| `index.html` | `HomeController` | `Index()` | `/` |
| `about.html` | `HomeController` | `About()` | `/Home/About` |
| `read.html` | `WorkoutController` | `Index()` | `/Workout` |
| `create.html` | `WorkoutController` | `Create()` | `/Workout/Create` |
| `update.html` | `WorkoutController` | `Edit(id)` | `/Workout/Edit/{id}` |
| `delete.html` | `WorkoutController` | `Delete(id)` | `/Workout/Delete/{id}` |
| `exercises.html` | `ExerciseController` | `Index()` | `/Exercise` |
| `visualizations.html` | `WorkoutController` | `Visualizations()` | `/Workout/Visualizations` |
| `mybot.html` | `HomeController` | `Bot()` | `/Home/Bot` |

---

## Asset Migration Map

| Original Asset | Destination | Changes |
|---|---|---|
| `styles.css` | `wwwroot/css/styles.css` | ❌ None — copy as-is |
| `js/apiController.js` | `wwwroot/js/apiController.js` | ❌ None — copy as-is |
| `images/*` | `wwwroot/images/` | ❌ None — copy as-is |
| Chart.js CDN tag | `_Layout.cshtml` or per-view | ❌ None — same CDN link |
| Google Fonts CDN | `_Layout.cshtml` `<head>` | ❌ None — same link |

---

## Data Model

The `Workout` entity maps **1-to-1** from the `storage.js` object shape:

```csharp
public class Workout
{
    public int      Id         { get; set; }
    public DateOnly Date       { get; set; }
    public string   Exercise   { get; set; }
    public string   Category   { get; set; }   // Chest/Back/Legs/Shoulders/Arms/Core/Cardio/Full Body
    public string   Difficulty { get; set; }   // Beginner/Intermediate/Advanced
    public int      Sets       { get; set; }
    public int      Reps       { get; set; }
    public decimal  Weight     { get; set; }
    public int      Calories   { get; set; }
    public int      Duration   { get; set; }
    public string   Equipment  { get; set; }
    public string?  Notes      { get; set; }
    public DateTime CreatedAt  { get; set; }
}
```

---
---

## Phase 1 — Project Scaffold & Azure SQL Connection

**Goal:** A runnable .NET MVC app that successfully connects to `fitnessDB` on Azure SQL. No pages, no data yet — just the foundation verified to be solid before building on top of it.

### Tasks

1. **Create the MVC project** inside the repo alongside `fittracker-final/`:
   ```
   dotnet new mvc -n FitTracker.Web
   ```

2. **Install NuGet packages:**
   ```
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   dotnet add package Microsoft.EntityFrameworkCore.Tools
   dotnet add package Microsoft.EntityFrameworkCore.Design
   ```

3. **Create `FitTrackerDbContext`** in `Data/FitTrackerDbContext.cs` with an empty `DbSet<Workout>` placeholder.

4. **Store connection string in User Secrets** (never in a file):
   ```bash
   dotnet user-secrets init
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-connection-string>"
   ```

5. **Wire DbContext** in `Program.cs`:
   ```csharp
   builder.Services.AddDbContext<FitTrackerDbContext>(options =>
       options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
   ```

6. **`appsettings.json`** gets only a placeholder — safe to commit:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "-- SET VIA USER SECRETS OR AZURE APP CONFIG --"
   }
   ```

7. **`HomeController.Index()`** returns a placeholder view: `"FitTracker MVC — Phase 1 Complete"`.

8. **Run first EF migration:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### ✅ Phase 1 Verification Checklist

- [ ] `dotnet run` launches without errors at `https://localhost:5001`
- [ ] Browser displays the Phase 1 placeholder text
- [ ] Azure Portal → `fitnessDB` → Tables shows `dbo.Workouts` table created
- [ ] `SELECT TOP 1 * FROM dbo.Workouts` runs in Azure Portal Query Editor (returns empty, no error)
- [ ] `git diff` / `git status` shows **zero** credential strings in any tracked file
- [ ] `appsettings.json` contains only the placeholder string

**→ Await approval before Phase 2**

---

## Phase 2 — Data Model, EF Migration & Seed Data

**Goal:** The complete `Workout` schema exists in Azure SQL with all 12 seed records loaded using relative dates that match the original `daysAgo()` logic.

### Tasks

1. **Create model classes:**
   - `Models/Workout.cs` — full entity with all 13 fields
   - `Models/ViewModels/WorkoutFormViewModel.cs` — form binding model with data annotations
   - `Models/ViewModels/HomeViewModel.cs` — 4 stats for homepage counters

2. **Update `FitTrackerDbContext`** with the full `Workout` entity configuration (max lengths, required fields, decimal precision).

3. **Add EF migration** for the complete schema:
   ```bash
   dotnet ef migrations add AddWorkoutSchema
   dotnet ef database update
   ```

4. **Dynamic seeder in `Program.cs`** — mirrors `FitStorage.init()` exactly:
   ```csharp
   // Runs on startup; only seeds if table is empty
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
   ```

### ✅ Phase 2 Verification Checklist

- [ ] `dotnet ef database update` applies with no errors
- [ ] Azure Portal Query Editor: `SELECT COUNT(*) FROM dbo.Workouts` returns **12**
- [ ] Azure Portal Query Editor: `SELECT Exercise, Date FROM dbo.Workouts ORDER BY Date` shows correct relative dates
- [ ] Most recent record date = yesterday; oldest = ~56 days ago
- [ ] `dotnet run` still launches cleanly with no startup errors

**→ Await approval before Phase 3**

---

## Phase 3 — Shared Layout & Static Assets

**Goal:** The dark athletic theme, navbar, fonts, and footer render identically inside MVC across all pages before any real content is built.

### Tasks

1. **Copy static assets** (no edits):
   ```
   fittracker-final/styles.css           → FitTracker.Web/wwwroot/css/styles.css
   fittracker-final/js/apiController.js  → FitTracker.Web/wwwroot/js/apiController.js
   fittracker-final/images/*             → FitTracker.Web/wwwroot/images/
   ```

2. **Create `Views/Shared/_Layout.cshtml`** containing:
   - `<head>` with Google Fonts CDN (Bebas Neue + Manrope), `styles.css` link
   - Full navbar with all 7 links using `asp-controller` / `asp-action` tag helpers
   - Hamburger `toggleNav()` script
   - `@RenderBody()` placeholder
   - Footer

3. **MVC Route → Original URL mapping** (for nav links):
   ```
   index.html        → asp-controller="Home"     asp-action="Index"
   visualizations    → asp-controller="Workout"  asp-action="Visualizations"
   exercises.html    → asp-controller="Exercise" asp-action="Index"
   create.html       → asp-controller="Workout"  asp-action="Create"
   read.html         → asp-controller="Workout"  asp-action="Index"
   mybot.html        → asp-controller="Home"     asp-action="Bot"
   about.html        → asp-controller="Home"     asp-action="About"
   ```

4. **Create stub controller actions + empty views** for all 9 routes so no nav link 404s.

5. **Update `HomeController.Index()`** to use `_Layout` and render the placeholder content.

### ✅ Phase 3 Verification Checklist

- [ ] App launches; dark background (`#0b0f0e`) and green accent (`#00e676`) visible
- [ ] Bebas Neue font renders on headings; Manrope on body text
- [ ] All 7 navbar links are present and clickable (stub views are fine)
- [ ] Zero 404 errors when clicking through all nav links
- [ ] Hamburger menu opens/closes on a narrow browser viewport (< 768px)
- [ ] Footer renders at the bottom of every page
- [ ] Browser DevTools → Network: `styles.css` returns HTTP 200 from `wwwroot`
- [ ] Team photos load at `/images/` paths on the About stub page

**→ Await approval before Phase 4**

---

## Phase 4 — Homepage & Workout Log (Read)

**Goal:** The first two data-driven pages fully working end-to-end, replacing `index.html` and `read.html` with real Azure SQL data.

### Tasks

**Homepage (`HomeController.Index`):**
1. Query 4 aggregate stats via EF:
   ```csharp
   var model = new HomeViewModel {
       TotalWorkouts = await _db.Workouts.CountAsync(),
       TotalCalories = await _db.Workouts.SumAsync(w => w.Calories),
       TotalSets     = await _db.Workouts.SumAsync(w => w.Sets),
       Categories    = await _db.Workouts.Select(w => w.Category).Distinct().CountAsync()
   };
   ```
2. `Views/Home/Index.cshtml` — full hero, stats strip, feature cards, CRUD quick-access cards copied from `index.html`; `localStorage` references removed; `animateCounter()` JS preserved; stat values injected via Razor:
   ```html
   <script>
     animateCounter(document.getElementById('stat-total'), @Model.TotalWorkouts);
     animateCounter(document.getElementById('stat-cal'),   @Model.TotalCalories);
     animateCounter(document.getElementById('stat-sets'),  @Model.TotalSets);
     animateCounter(document.getElementById('stat-cats'),  @Model.Categories);
   </script>
   ```

**Workout Log (`WorkoutController.Index`):**
1. EF LINQ filter mirrors `WorkoutController.getFiltered()` from `workoutController.js`:
   ```csharp
   public async Task<IActionResult> Index(string query = "", string category = "")
   {
       var workouts = _db.Workouts.AsQueryable();
       if (!string.IsNullOrWhiteSpace(query))
           workouts = workouts.Where(w =>
               w.Exercise.Contains(query) ||
               w.Category.Contains(query) ||
               w.Notes.Contains(query));
       if (!string.IsNullOrWhiteSpace(category))
           workouts = workouts.Where(w => w.Category == category);
       return View(await workouts.OrderByDescending(w => w.Date).ToListAsync());
   }
   ```
2. `Views/Workout/Index.cshtml` — search input, category filter pills, sortable table, empty state; all from `read.html`.

### ✅ Phase 4 Verification Checklist

- [ ] Homepage stat counters animate to correct values on page load
- [ ] Verify stats match Azure SQL: `SELECT COUNT(*), SUM(Calories), SUM(Sets) FROM dbo.Workouts`
- [ ] Workout log displays all 12 seed records in the table
- [ ] Search box filters rows (e.g. type "bench" → shows only Bench Press)
- [ ] Category filter (e.g. "Back") shows only Back workouts
- [ ] Empty state message appears when search returns no results
- [ ] No `localStorage` or `FitStorage` references remain in these two views
- [ ] No JavaScript console errors on either page

**→ Await approval before Phase 5**

---

## Phase 5 — Create, Update & Delete (Full CRUD)

**Goal:** All three write operations working against Azure SQL, including the Exercise Library → Create pre-fill deep-link.

### Tasks

**Create (`WorkoutController.Create`):**
1. `[HttpGet]` — accepts `string exercise` and `string category` query params; pre-fills `WorkoutFormViewModel`:
   ```csharp
   public IActionResult Create(string exercise = null, string category = null)
   {
       var model = new WorkoutFormViewModel {
           Exercise = exercise,
           Category = category,
           Date     = DateOnly.FromDateTime(DateTime.Today)
       };
       return View(model);
   }
   ```
2. `[HttpPost]` — validates `ModelState`, calls `_db.Workouts.Add()` + `SaveChangesAsync()`, redirects to `/Workout` on success.
3. `Views/Workout/Create.cshtml` — identical form layout from `create.html`; `asp-for` tag helpers; `asp-validation-for` inline errors; success alert on redirect.

**Edit (`WorkoutController.Edit`):**
1. `[HttpGet]` — loads existing record by ID, populates `WorkoutFormViewModel`.
2. `[HttpPost]` — updates record via EF, saves, redirects.
3. `Views/Workout/Edit.cshtml` — same form layout as Create with "Update Workout" heading.

**Delete (`WorkoutController.Delete`):**
1. `[HttpGet]` — loads record, shows confirmation view with workout summary card.
2. `[HttpPost]` — removes record via EF, saves, redirects.
3. `Views/Workout/Delete.cshtml` — type-to-confirm safety UI matching the original `delete.html` pattern.

**Server-side validation on all POST actions** via `WorkoutFormViewModel` data annotations:
```csharp
[Required] public string Exercise   { get; set; }
[Required] public string Category   { get; set; }
[Required] public string Difficulty { get; set; }
[Range(1, 20)]   public int Sets     { get; set; }
[Range(1, 100)]  public int Reps     { get; set; }
[Range(0, 2000)] public decimal Weight { get; set; }
```

### ✅ Phase 5 Verification Checklist

- [ ] Navigate to `/Exercise` → click "Add to Workout" on any card → `/Workout/Create` opens with exercise name and category pre-filled
- [ ] Submit the create form → Azure Portal: `SELECT COUNT(*) FROM dbo.Workouts` increases by 1
- [ ] New workout appears at the top of the `/Workout` log
- [ ] Click Edit on any workout → form loads with existing values
- [ ] Save edit → changes persist in Azure SQL (`SELECT * FROM dbo.Workouts WHERE Id = X`)
- [ ] Click Delete → confirmation page shows workout summary
- [ ] Complete deletion → record removed from Azure SQL; count decreases by 1
- [ ] Submit create form with empty required fields → inline validation errors appear (no page reload to error page)
- [ ] Success message shows after create and edit

**→ Await approval before Phase 6**

---

## Phase 6 — Exercise Library

**Goal:** Exercise Library page working in MVC with the wger API integration and "Add to Workout" deep-link fully intact.

### Tasks

1. **`ExerciseController.Index()`** — returns `Views/Exercise/Index.cshtml` (no backend logic needed; all API calls remain client-side).

2. **`Views/Exercise/Index.cshtml`** — copy HTML structure from `exercises.html`; update:
   - `<link>` → `~/css/styles.css`
   - `<script src="js/apiController.js">` → `<script src="~/js/apiController.js">`
   - `create.html?exercise=...` deep-link URL in `buildCard()` → `/Workout/Create?exercise=...`
   - Nav links → `asp-controller/asp-action` tag helpers
   - All other HTML, JS state variables, skeleton loaders, search, pills, load more, error state — **unchanged**

3. **`CAT_MAP`** stays in the JavaScript — no server-side equivalent needed.

4. The `apiController.js` in `wwwroot/js/` is already copied from Phase 3 — no edits required.

### ✅ Phase 6 Verification Checklist

- [ ] `/Exercise` loads and shows skeleton loaders briefly, then exercise cards
- [ ] Category filter pills populate dynamically from wger API
- [ ] Searching "squat" filters cards client-side correctly
- [ ] "Load More" appends the next batch of exercises
- [ ] "Add to Workout" on any card navigates to `/Workout/Create?exercise=X&category=Y` with form pre-filled
- [ ] Simulated API failure (disable network in DevTools) shows the error state with "Try Again" button
- [ ] No JavaScript console errors

**→ Await approval before Phase 7**

---

## Phase 7 — Analytics & Visualizations

**Goal:** All Chart.js charts render from Azure SQL data with identical appearance to the original `visualizations.html`.

### Tasks

1. **`VisualizationsViewModel`** — typed properties for each chart dataset:
   ```csharp
   public class VisualizationsViewModel
   {
       public List<WeeklyStatPoint> WeeklyCalories  { get; set; }
       public List<WeeklyStatPoint> WeeklyDuration  { get; set; }
       public List<CategoryCount>   CategoryBreakdown { get; set; }
       public List<CategoryCount>   DifficultyDist   { get; set; }
       public List<WeeklyStatPoint> WeeklySets       { get; set; }
       public List<CategoryCount>   EquipmentUsage   { get; set; }
       // Insight strip
       public int    TotalCalories   { get; set; }
       public double AvgDuration     { get; set; }
       public string TopCategory     { get; set; }
       public int    TotalWorkouts   { get; set; }
   }
   ```

2. **`WorkoutController.Visualizations(string range = "all")`** — EF aggregate queries filtered by `range` param (7d / 30d / 90d / all).

3. **`Views/Workout/Visualizations.cshtml`**:
   - Chart.js CDN script tag (same version: `chart.js@4.4.0`)
   - Razor serializes model to JS variables:
     ```html
     <script>
       const weeklyCalData  = @Html.Raw(Json.Serialize(Model.WeeklyCalories));
       const categoryData   = @Html.Raw(Json.Serialize(Model.CategoryBreakdown));
       // ... etc.
     </script>
     ```
   - All `new Chart(ctx, { ... })` config blocks copied **unchanged** from `visualizations.html` — only the data source variable names are updated
   - Filter buttons (7D / 30D / 90D / All) post to `?range=X` — page reloads with filtered controller data
   - Insight strip values from `@Model.TotalCalories`, `@Model.AvgDuration`, etc.

### ✅ Phase 7 Verification Checklist

- [ ] All 6 charts render on page load with correct colors and dark theme styling
- [ ] Insight strip shows correct totals — verify against: `SELECT SUM(Calories), AVG(Duration) FROM dbo.Workouts`
- [ ] "7D" filter shows only workouts from the last 7 days
- [ ] "30D" and "90D" filters change chart data correctly
- [ ] "All" filter restores full dataset
- [ ] Log a new workout (Phase 5 flow) then reload Visualizations — new data is reflected
- [ ] Charts are visually identical to the original `visualizations.html` (compare side-by-side)
- [ ] No Chart.js console errors

**→ Await approval before Phase 8**

---

## Phase 8 — Remaining Pages, Cleanup & Final QA

**Goal:** Every page migrated, every `.html` link dead, the original `fittracker-final/` preserved as reference, and the app passes a full end-to-end walkthrough.

### Tasks

1. **About page** (`HomeController.About` → `Views/Home/About.cshtml`):
   - Copy HTML from `about.html`; update 3 text references:
     - `"persisted to localStorage"` → `"persisted to Azure SQL"`
     - Add tech chips: `ASP.NET Core MVC`, `Entity Framework Core`, `Azure SQL`
   - Image paths: `./images/` → `~/images/`
   - Nav links → tag helpers

2. **AI Coach page** (`HomeController.Bot` → `Views/Home/Bot.cshtml`):
   - Copy HTML from `mybot.html`
   - Botpress embed script copied as-is into the Razor view
   - Nav links → tag helpers

3. **Global link audit** — search all `.cshtml` files for any remaining `*.html` href values and replace with tag helpers.

4. **`fittracker-final/` preserved** — original folder left untouched as permanent reference.

5. **`.gitignore` audit** — confirm `appsettings.Development.json` (if it contains secrets), `secrets.json`, and user secrets path are excluded.

6. **README update** in `FitTracker.Web/` with:
   - How to set up user secrets for local dev
   - How to run: `dotnet run`
   - How to apply migrations: `dotnet ef database update`

### ✅ Phase 8 — Final Verification Checklist

- [ ] About page renders with team cards, photos, and updated tech chip list
- [ ] AI Coach / Botpress widget loads and is interactive
- [ ] `grep -r "\.html" FitTracker.Web/Views/` returns zero results
- [ ] Full end-to-end walkthrough passes:
  1. Home → stats animate correctly
  2. Exercise Library → search, filter, load more work
  3. Click "Add to Workout" → Create form pre-fills
  4. Submit → new record in log
  5. Edit the new record → changes save
  6. Delete the record → removed from log and Azure SQL
  7. Analytics → charts reflect current data
  8. About → page renders cleanly
  9. AI Coach → widget loads
- [ ] Zero browser console errors on any page
- [ ] Zero `.html` hrefs remain in any Razor view
- [ ] `git log --oneline` shows no commit containing credential strings

---

## Effort Summary

| Phase | Deliverable | Est. Time |
|---|---|---|
| 1 | MVC scaffold + Azure SQL connection | ~1 hr |
| 2 | Workout entity + schema + 12 seed records | ~1.5 hrs |
| 3 | Dark theme layout + all static assets | ~1 hr |
| 4 | Homepage stats + Workout log from Azure SQL | ~2 hrs |
| 5 | Full CRUD (Create / Edit / Delete) | ~3 hrs |
| 6 | Exercise Library + Add to Workout flow | ~1 hr |
| 7 | All 6 analytics charts from Azure SQL | ~2.5 hrs |
| 8 | About, AI Coach, cleanup, final QA | ~1 hr |
| **Total** | | **~13 hrs** |

---

## Technology Stack Reference

| Layer | Technology |
|---|---|
| Web Framework | ASP.NET Core MVC (.NET 8) |
| ORM | Entity Framework Core 8 |
| Database | Azure SQL (SQL Server) |
| Auth / Secrets | .NET User Secrets (dev) · Azure App Config (prod) |
| Charts | Chart.js 4.4.0 (CDN) — unchanged |
| External API | wger REST API (wger.de) — client-side fetch, unchanged |
| CSS | Custom dark theme (styles.css) — unchanged |
| Fonts | Google Fonts CDN — unchanged |
| AI Widget | Botpress embed — unchanged |

---

*Plan authored: May 6, 2026 — FitTracker ISM 6225, University of South Florida*
