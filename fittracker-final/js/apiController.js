// ===================================================
// FitTracker | js/apiController.js
// External API Controller -- wger.de REST API
// ISM 6225 | University of South Florida
//
// wger (https://wger.de) is a free, open-source
// fitness API. No API key required. CORS enabled.
// API docs: https://wger.de/api/v2/
// ===================================================

const ApiController = {
  BASE: 'https://wger.de/api/v2',
  LANG: 2, // 2 = English

  // Fetch all exercise categories
  async getCategories() {
    const res = await fetch(`${this.BASE}/exercisecategory/?format=json`);
    if (!res.ok) throw new Error(`Category fetch failed: ${res.status}`);
    const data = await res.json();
    return data.results; // [{id, name}, ...]
  },

  // Fetch exercises with full info (English only)
  // Optional categoryId filters by muscle group category
  async getExercises(categoryId = null, offset = 0, limit = 20) {
    let url = `${this.BASE}/exerciseinfo/?format=json&language=${this.LANG}&limit=${limit}&offset=${offset}`;
    if (categoryId) url += `&category=${categoryId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Exercise fetch failed: ${res.status}`);
    const data = await res.json();

    // Normalize each exercise to a flat object
    const exercises = data.results
      .map(ex => {
        const eng = ex.translations.find(t => t.language === this.LANG);
        if (!eng || !eng.name.trim()) return null; // Skip if no English name

        // Strip HTML tags from description
        const rawDesc = (eng.description || '').replace(/<[^>]+>/g, '').trim();
        const description = rawDesc.length > 0
          ? rawDesc.substring(0, 220) + (rawDesc.length > 220 ? '...' : '')
          : 'No description available.';

        return {
          id:          ex.id,
          name:        eng.name.trim(),
          description,
          category:    ex.category  ? ex.category.name  : 'General',
          categoryId:  ex.category  ? ex.category.id    : null,
          muscles:     ex.muscles.map(m => m.name_en || m.name).filter(Boolean).join(', ') || 'Various',
          equipment:   ex.equipment.map(e => e.name).filter(Boolean).join(', ')            || 'Bodyweight',
        };
      })
      .filter(Boolean);

    return {
      exercises,
      total: data.count,
      hasMore: !!data.next,
      nextOffset: offset + limit,
    };
  },
};
