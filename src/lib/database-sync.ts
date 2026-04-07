import { supabase } from './supabase';

const STORAGE_KEY = 'oregent:hackathons';

export async function initDatabaseSync() {
  console.log('Initializing Supabase Sync for LocalStorage...');

  try {
    // 1. Fetch initial state from Supabase
    const { data: hackathons, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error (Table might not exist yet):', error.message);
    } else if (hackathons && hackathons.length > 0) {
      // 2. Format database snake_case back to camelCase expected by the UI
      const formattedData = hackathons.map((h: any) => ({
        name: h.name,
        slug: h.slug,
        theme: h.theme,
        startDate: h.start_date || "",
        durationHours: h.duration_hours || 24,
        submissions: h.submissions || 0,
        evaluated: h.evaluated || 0,
        status: h.status || "live",
      }));

      // Override local storage with fresh data from Supabase
      // We use the original setItem so we don't trigger the monkey patch below yet
      Object.getPrototypeOf(window.localStorage).setItem.call(window.localStorage, STORAGE_KEY, JSON.stringify(formattedData));
      console.log('Loaded data from Supabase into LocalStorage');
    }
  } catch (err) {
    console.error('Failed to sync from Supabase:', err);
  }

  // 3. Monkey patch localStorage.setItem to mirror writes to Supabase
  const originalSetItem = window.localStorage.setItem;

  window.localStorage.setItem = function (key: string, value: string) {
    originalSetItem.apply(this, [key, value]); // Call original

    if (key === STORAGE_KEY) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Prepare payload for Supabase (camelCase -> snake_case)
          const payload = parsed.map((h: any) => ({
            name: h.name,
            slug: h.slug,
            theme: h.theme,
            start_date: h.startDate,
            duration_hours: parseInt(h.durationHours) || 24,
            submissions: parseInt(h.submissions) || 0,
            evaluated: parseInt(h.evaluated) || 0,
            status: h.status || "live",
          }));

          // Upsert entire array into Supabase
          supabase
            .from('hackathons')
            .upsert(payload, { onConflict: 'slug' })
            .then(({ error }) => {
              if (error) console.error('Supabase write error:', error.message);
            });
        }
      } catch (e) {
        console.error('Failed to parse localStorage value to sync:', e);
      }
    }
  };
}
