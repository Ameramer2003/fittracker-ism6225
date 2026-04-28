# ⚡ FitTracker — ISM 6225 Application Development for Analytics

A fully functional fitness analytics web application built for ISM 6225 at the University of South Florida. FitTracker lets users log workouts with real CRUD operations backed by localStorage, visualize progress through live Chart.js dashboards driven by real stored data, browse exercises from a live external REST API, and receive AI-powered fitness guidance through a Botpress chatbot.

---

## 👥 Team

| Name | Role |
|------|------|
| Amer Amer | Front End and Full Stack Developer, MVC Architecture|
| [Team Member Name] | [Role and contributions] |
| Nada Belafqih | Azure Deployment Support & Documentation |
| [Team Member Name] | [Role and contributions] |

**Course:** ISM 6225 — Application Development for Analytics  
**University:** University of South Florida

---

## 🌐 Live Deployment

**Azure Static Web Apps:** `[INSERT AZURE URL HERE]`  
**GitHub Repository:** https://github.com/Ameramer2003/fittracker-ism6225.git

---

## 📄 Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with live stats from localStorage |
| Analytics | `visualizations.html` | Three Chart.js charts driven by real localStorage data |
| Exercise Library | `exercises.html` | Live exercise data fetched from wger REST API |
| Log Workout | `create.html` | CREATE — saves new workout to localStorage |
| My Log | `read.html` | READ — loads and filters workouts from localStorage |
| Edit Entry | `update.html` | UPDATE — modifies existing localStorage workout |
| Delete Entry | `delete.html` | DELETE — removes workout from localStorage with confirmation |
| AI Coach | `mybot.html` | FitBot — Botpress AI fitness assistant |
| About | `about.html` | Team info, MVC architecture, API docs, ERD |

---

## 🏗️ JavaScript MVC Architecture

The application follows a clean MVC pattern implemented in vanilla JavaScript:

```
js/
├── storage.js           ← MODEL: localStorage CRUD + seed data + chart data helpers
├── workoutController.js ← CONTROLLER: CRUD business logic, form reading, filtering
└── apiController.js     ← API CONTROLLER: fetch() calls to wger.de REST API

HTML pages              ← VIEWS: render data, capture user input, delegate to controllers
```

### Model (storage.js)
The `FitStorage` singleton manages all data persistence:
- `init()` — Seeds localStorage with 12 sample workouts on first visit
- `getAll()` — Returns all workout entries
- `getById(id)` — Returns a single entry
- `create(workout)` — Adds a new entry with auto-generated ID
- `update(id, changes)` — Modifies an existing entry
- `remove(id)` — Deletes an entry
- `getStats()` — Returns summary counts for the home page
- `getWeeklyData(n)` — Groups workouts by week for chart data
- `getCategoryBreakdown()` — Groups workouts by category for doughnut chart

### Controllers
- `WorkoutController` handles form-to-storage mapping for Create, Read (filter), Update, Delete
- `ApiController` handles `fetch()` calls to the wger API with error handling

### Views
Each HTML page only renders data and delegates logic:
- **create.html** reads URL params to pre-fill from Exercise Library, calls `WorkoutController.handleCreate()`
- **read.html** calls `WorkoutController.getFiltered()` and links each row to `update.html?id=X` and `delete.html?id=X`
- **update.html** reads `?id` from URL, loads entry via `FitStorage.getById()`, saves via `WorkoutController.handleUpdate()`
- **delete.html** reads `?id` from URL, confirms type-to-delete, removes via `WorkoutController.handleDelete()`
- **visualizations.html** calls `FitStorage.getWeeklyData()` and `FitStorage.getCategoryBreakdown()` for all chart data

---

## 🌍 API Integration

**API:** wger REST API (https://wger.de/api/v2/)  
**Authentication:** None required (free, open-source, CORS-enabled)  
**Implementation:** `js/apiController.js` using the browser's native `fetch()` API

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /exercisecategory/?format=json` | Fetches muscle group categories to populate filter pills |
| `GET /exerciseinfo/?format=json&language=2&limit=20` | Fetches exercises with English names, muscles, and equipment |
| `GET /exerciseinfo/?format=json&language=2&category={id}` | Filters exercises by selected muscle group |

### Exercise Library Flow
1. Page loads → `ApiController.getCategories()` fetches all categories → renders filter pills
2. User selects category → `ApiController.getExercises(categoryId)` fetches filtered exercises
3. Exercises render as cards showing name, muscles, equipment, and description
4. "Add to Workout" button links to `create.html?exercise=NAME&category=CATEGORY`
5. `create.html` reads URL params and pre-fills the workout form

---

## 💾 Data Persistence

FitTracker uses the **Web Storage API (localStorage)** for client-side persistence.

- **Key:** `fittracker_workouts`
- **Value:** JSON array of workout objects
- **Seed data:** 12 sample workouts are loaded on first visit if localStorage is empty
- **Data survives:** browser refresh, tab close, browser restart
- **Data resets:** when localStorage is cleared or the user clicks "Clear Site Data"

### Workout Object Schema

```json
{
  "id": 1,
  "date": "2025-04-08",
  "exercise": "Bench Press",
  "category": "Chest",
  "difficulty": "Intermediate",
  "sets": 4,
  "reps": 10,
  "weight": 135,
  "calories": 320,
  "duration": 45,
  "equipment": "Barbell",
  "notes": "Felt strong today.",
  "createdAt": "2025-04-08T10:00:00.000Z"
}
```

---

## 📊 Data Visualizations

All three charts on the Analytics page (`visualizations.html`) are computed from real localStorage data:

| Chart | Type | Data Source |
|-------|------|-------------|
| Weekly Calories Burned | Bar | `FitStorage.getWeeklyData(8)` — sums calories per week |
| Workout Duration Trend | Line | `FitStorage.getWeeklyData(8)` — averages duration per week |
| Exercise Category Mix | Doughnut | `FitStorage.getCategoryBreakdown()` — counts by category |

Charts update automatically when new workouts are logged.

---

## 🤖 FitBot — AI Chatbot

FitBot is built on **Botpress** and trained on a 10-row curated exercise dataset including exercise names, categories, muscle groups, difficulty, equipment, sets, reps, and estimated calorie burns.

**Sample questions:**
- "What exercises target the chest?"
- "How many calories does a deadlift burn?"
- "Show me beginner exercises"
- "What equipment do I need for pull-ups?"

---

## 🗂️ Data Model (ERD)

Three-tier normalized relational structure (logical model):

```
Users (UserID PK, FirstName, LastName, Email, Age, WeightLbs, HeightIn)
  └── Workouts (WorkoutID PK, UserID FK, WorkoutDate, DurationMin, TotalCalories, Notes, CreatedAt)
        └── Exercises (ExerciseID PK, WorkoutID FK, ExerciseName, Category, Sets, Reps, WeightLbs, CaloriesBurned, Equipment)
```

- One **User** → Many **Workouts** (one-to-many)
- One **Workout** → Many **Exercises** (one-to-many)

---

## 📁 File Structure

```
fittracker/
├── index.html           ← Home — dynamic stats from localStorage
├── create.html          ← Log Workout (CREATE)
├── read.html            ← My Log (READ)
├── update.html          ← Edit Entry (UPDATE)
├── delete.html          ← Delete Entry (DELETE)
├── exercises.html       ← Exercise Library (External API)
├── visualizations.html  ← Analytics (Chart.js driven by localStorage)
├── mybot.html           ← AI Coach (Botpress)
├── about.html           ← About Us, ERD, MVC explanation
├── styles.css           ← Global dark athletic theme (CSS variables)
├── README.md            ← This file
└── js/
    ├── storage.js           ← Model layer (localStorage)
    ├── workoutController.js ← CRUD controller
    └── apiController.js     ← External API controller
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and semantic markup |
| CSS3 + CSS Variables | Dark athletic theme, responsive layout |
| JavaScript (ES6+) | MVC architecture, CRUD logic, API calls |
| localStorage API | Client-side data persistence |
| Chart.js 4.4 | Interactive data visualizations |
| wger REST API | Live exercise library data |
| Botpress | AI fitness chatbot |
| GitHub | Version control |
| Azure Static Web Apps | Cloud hosting and deployment |

---

## 🚀 Deployment

### Running Locally
Open `index.html` directly in a browser or use VS Code Live Server extension.

### Azure Deployment
1. Push repo to GitHub
2. Create Azure Static Web App
3. Connect to your GitHub repository
4. Set build output to `/` (root)
5. Deploy — Azure will auto-build from main branch

---

## ✅ Project Checklist

| Requirement | Status |
|-------------|--------|
| CRUD — Create | ✅ create.html saves to localStorage |
| CRUD — Read | ✅ read.html loads from localStorage with search/filter |
| CRUD — Update | ✅ update.html edits localStorage entries by ID |
| CRUD — Delete | ✅ delete.html removes localStorage entries with confirmation |
| MVC Architecture | ✅ storage.js (Model) + controllers (Controller) + HTML (View) |
| Data Persistence | ✅ localStorage with seed data on first visit |
| External API | ✅ wger.de REST API via fetch() in apiController.js |
| Data Visualizations | ✅ 3 Chart.js charts driven by real localStorage data |
| AI Chatbot | ✅ Botpress FitBot on AI Coach page |
| About Us Page | ✅ Team members, MVC explanation, ERD, API docs |
| ERD | ✅ SVG entity-relationship diagram on About page |
| GitHub README | ✅ This file |
| Azure Deployment | ⏳ Deploy and update URL above |
| Reflection Document | ⏳ Add to repo |
| Presentation Slides | ⏳ Prepare separately |
| Git Log | Run `git log --pretty=format:"%h - %an - %ad - %s" --date=short` and include in submission |
