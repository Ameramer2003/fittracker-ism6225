# ⚡ FitTracker — ISM 6225 Application Development for Analytics

A modern fitness analytics web application built with **C# ASP.NET Core 10 MVC** for ISM 6225 at the University of South Florida. FitTracker provides a robust backend for logging workouts, managing exercises, tracking progress through data visualizations, and delivering AI-powered fitness guidance.

**Modernized from:** Legacy HTML/JavaScript frontend with localStorage to a full-stack C# application with SQL Server database, Entity Framework ORM, and professional MVC architecture.

---

## 👥 Team

| Name | Role |
|------|------|
| Amer Amer | Full Stack Developer, C# MVC Architecture, Database Design |
| Nairi Keeney | Testing and Delivery |
| Nada Belafqih | Azure Deployment Support & Documentation |
| Ronald Berle | API Integration & Schema Design |

**Course:** ISM 6225 — Application Development for Analytics  
**University:** University of South Florida

---

## 🌐 Live Deployment

**GitHub Repository:** https://github.com/Ameramer2003/fittracker-ism6225.git  
**Azure Deployment:** *In progress*

---

## 📄 Pages & Controllers

| Page | Controller | Description |
|------|-----------|-------------|
| Home | `HomeController` | Dashboard with user stats and recent workouts |
| Workouts | `WorkoutController` | List all workouts (Index) |
| Create Workout | `WorkoutController` | CREATE — Add new workout entry |
| Edit Workout | `WorkoutController` | UPDATE — Modify existing workout |
| Delete Workout | `WorkoutController` | DELETE — Remove workout with confirmation |
| Exercises | `ExerciseController` | List and search exercises from external API |
| Visualizations | `WorkoutController` | Analytics dashboard with charts |
| About | `HomeController` | About the application and team |

---

## 🏗️ ASP.NET Core MVC Architecture

The application follows the classic MVC pattern with clean separation of concerns:

```
FitTracker.Web/
├── Controllers/
│   ├── HomeController.cs       ← Home, About, Privacy, Bot pages
│   ├── WorkoutController.cs    ← CRUD operations for workouts
│   └── ExerciseController.cs   ← Exercise library management
├── Models/
│   ├── Workout.cs              ← Workout entity
│   └── ViewModels/
│       ├── HomeViewModel.cs     ← Dashboard data
│       ├── WorkoutFormViewModel.cs     ← Create/Edit form
│       └── WorkoutListViewModel.cs     ← List display
├── Data/
│   └── FitTrackerDbContext.cs  ← Entity Framework DbContext
├── Migrations/
│   └── [database migrations]   ← Schema versioning
├── Views/
│   ├── Home/
│   ├── Workout/
│   ├── Exercise/
│   └── Shared/                 ← Layout, shared components
└── wwwroot/
    ├── css/                    ← Stylesheets
    ├── js/                     ← Client-side scripts
    └── lib/                    ← Bootstrap, jQuery, libraries
```

### Models (Data Layer)
- **Workout** — Represents a single workout entry with date, exercise, category, sets, reps, weight, duration, calories, notes
- **Exercise** — Represents an exercise template (name, category, difficulty, equipment)
- **User** — (Future) Will track user account information

### Controllers (Business Logic)
- **WorkoutController** — Handles all CRUD operations for workouts with validation and error handling
- **ExerciseController** — Manages exercise library and external API integration
- **HomeController** — Serves dashboard and static pages

### Views (Presentation Layer)
- Razor views (.cshtml) for rendering HTML with embedded C# logic
- Shared _Layout.cshtml for consistent page structure
- Bootstrap-based responsive UI

---

## 💾 Data Persistence

FitTracker uses **SQL Server** with **Entity Framework Core** for data persistence.

### Database Schema

```sql
-- Workouts table
CREATE TABLE Workouts (
    WorkoutId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT,
    ExerciseName NVARCHAR(255),
    Category NVARCHAR(100),
    Difficulty NVARCHAR(50),
    Sets INT,
    Reps INT,
    Weight DECIMAL(10,2),
    Calories INT,
    Duration INT,
    Equipment NVARCHAR(255),
    Notes NVARCHAR(MAX),
    WorkoutDate DATE,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

### Entity-Relationship Diagram (Logical Model)

```
Users (1) ──→ (many) Workouts
├── UserId (PK)
├── FirstName
├── LastName
├── Email
└── ...

Workouts
├── WorkoutId (PK)
├── UserId (FK)
├── ExerciseName
├── Category
├── Difficulty
├── Sets
├── Reps
├── Weight
├── Calories
├── Duration
├── Equipment
├── Notes
├── WorkoutDate
└── CreatedAt
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| C# 13 | Primary backend language |
| ASP.NET Core 10 | Web framework and runtime |
| Entity Framework Core 10 | ORM for database access |
| SQL Server | Relational database |
| Razor Views | Server-side HTML templating |
| Bootstrap 5 | Responsive UI framework |
| JavaScript (ES6+) | Client-side interactivity |
| Chart.js | Data visualization |
| GitHub | Version control |
| Azure App Service | Cloud hosting and deployment |

---

## 🚀 Getting Started

### Prerequisites
- .NET 10 SDK or later
- SQL Server (LocalDB or Express for local development)
- Visual Studio 2022 or Visual Studio Code with C# extension

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ameramer2003/fittracker-ism6225.git
   cd fittracker-ism6225
   ```

2. **Navigate to the project:**
   ```bash
   cd FitTracker.Web
   ```

3. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

4. **Update the database:**
   ```bash
   dotnet ef database update
   ```

5. **Run the application:**
   ```bash
   dotnet run
   ```

6. **Open in browser:**
   ```
   https://localhost:5001
   ```

### Database Setup

The application uses Entity Framework Core with automatic migrations:

```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# View migrations
dotnet ef migrations list
```

### Configuration

Update connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FitTrackerDb;Trusted_Connection=true;"
  }
}
```

---

## 📦 Building for Production

```bash
# Build release version
dotnet build -c Release

# Publish to folder
dotnet publish -c Release -o ./publish

# Run from published folder
dotnet ./publish/FitTracker.Web.dll
```

---

## 🌐 Deployment

### Azure App Service

1. Create an Azure App Service for .NET
2. Configure SQL Server database in Azure
3. Update connection string in Azure Application Settings
4. Deploy via GitHub Actions or Visual Studio Publish
5. Set environment to Production

### GitHub Actions

The repository includes CI/CD workflows for automatic deployment on push to main branch.

---

## ✅ Project Checklist

| Requirement | Status |
|-------------|--------|
| CRUD — Create | ✅ POST /Workout/Create saves new workouts |
| CRUD — Read | ✅ GET /Workout/Index lists all workouts with filtering |
| CRUD — Update | ✅ POST /Workout/Edit modifies existing workouts |
| CRUD — Delete | ✅ POST /Workout/Delete removes workouts with confirmation |
| MVC Architecture | ✅ Controllers + Models + Razor Views |
| Database Persistence | ✅ SQL Server with Entity Framework Core |
| Entity Framework | ✅ Code-First migrations and DbContext |
| Error Handling | ✅ Exception handling and validation |
| Responsive UI | ✅ Bootstrap-based responsive design |
| About Us Page | ✅ Team members, architecture, tech stack |
| GitHub README | ✅ This file |
| Git Log | ✅ Available via `git log --oneline` |

---

## 📚 Additional Resources

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [Razor Views Documentation](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/razor)
- [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/)
