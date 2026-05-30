/**
 * useTodos.js — Composable for all todo state and operations
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LEARNING NOTE: What is a "composable"?
 *
 * In Vue 3, a composable is a plain JavaScript function whose name starts with
 * "use" (by convention) that uses Vue's Composition API (ref, computed, watch,
 * etc.) to encapsulate and share stateful logic.
 *
 * Think of it like a "super-powered utility function" that can hold reactive
 * state.  Instead of scattering your data and logic across every component,
 * you put it here once and import it anywhere you need it.
 *
 * Nuxt auto-imports everything in the composables/ folder, so you never need
 * to write `import { useTodos } from '~/composables/useTodos'` — just call
 * useTodos() anywhere in your <script setup>.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * LEARNING NOTE: useState vs ref
 *
 * Nuxt's useState() is like Vue's ref(), but it is *shared across the entire
 * app* (all components, all pages) and it survives navigation between pages.
 * It's Nuxt's built-in, SSR-safe global state.
 *
 * ref() alone is local to the component that calls it.
 * useState() is global.
 *
 * For a real app you'd consider Pinia (a state-management library), but
 * useState() is perfect for learning and small apps.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------------
// Todo data shape (schema)
// ---------------------------------------------------------------------------
// Each todo object looks like this:
//
// {
//   id:          String   — unique identifier, e.g. "1a2b3c"
//   title:       String   — required short label
//   description: String   — optional longer notes
//   tags:        String[] — open-ended list of tag strings, e.g. ["work","urgent"]
//   dueDate:     String   — optional ISO date "YYYY-MM-DD", or null
//   completed:   Boolean  — true when the task is done
//   createdAt:   String   — ISO timestamp when it was created
// }

export function useTodos() {
  // -------------------------------------------------------------------------
  // LEARNING NOTE: useState(key, initializer)
  //
  // The first argument is a unique string key — Nuxt uses this to share the
  // same reactive value across components.  The second argument is a function
  // that returns the *initial* value (only called once on first access).
  //
  // We load from localStorage so todos persist across browser refreshes.
  // -------------------------------------------------------------------------
  const todos = useState('todos', () => {
    // Only runs in the browser (not during server-side rendering)
    if (import.meta.client) {
      const stored = localStorage.getItem('nuxt-todos')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // If the stored data is corrupted, start fresh
          return []
        }
      }
    }
    // Default: a handful of sample todos so the app isn't empty on first load
    return [
      {
        id: 'sample-1',
        title: 'Explore this app\'s source code',
        description: 'Check out the composables/, components/, and pages/ folders.',
        tags: ['learning', 'nuxt'],
        dueDate: null,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample-2',
        title: 'Try adding a new todo',
        description: 'Click the "Add Todo" button and fill in the form.',
        tags: ['getting-started'],
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // tomorrow
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample-3',
        title: 'Switch to the Calendar view',
        description: 'Click "Calendar" in the nav bar to see todos on a month grid.',
        tags: ['getting-started', 'calendar'],
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample-4',
        title: 'Toggle dark mode',
        description: 'Use the sun/moon icon in the top-right corner.',
        tags: ['ui'],
        dueDate: null,
        completed: true,
        createdAt: new Date().toISOString()
      }
    ]
  })

  // -------------------------------------------------------------------------
  // LEARNING NOTE: watch() — react to data changes
  //
  // watch(source, callback) runs the callback whenever `source` changes.
  // Here we watch `todos` deeply (deep: true means it watches nested changes
  // like editing a property inside a todo object, not just the array itself).
  //
  // Every change is immediately saved to localStorage so data persists.
  // -------------------------------------------------------------------------
  if (import.meta.client) {
    watch(
      todos,
      (newValue) => {
        localStorage.setItem('nuxt-todos', JSON.stringify(newValue))
      },
      { deep: true } // watch nested property changes too
    )
  }

  // -------------------------------------------------------------------------
  // LEARNING NOTE: computed() — derived / calculated values
  //
  // computed() creates a reactive value that is automatically recalculated
  // whenever its dependencies change.  It's like a cached formula.
  //
  // If `todos` hasn't changed, Vue won't re-run the function — it just
  // returns the cached result.  This is more efficient than calling a regular
  // function inside your template.
  // -------------------------------------------------------------------------

  /** All unique tags used across todos — used to show tag filter chips */
  const allTags = computed(() => {
    // Use a Set to collect unique tag values
    const tagSet = new Set()
    todos.value.forEach(todo => {
      todo.tags.forEach(tag => tagSet.add(tag))
    })
    // Convert Set → sorted Array for predictable display order
    return [...tagSet].sort()
  })

  /** Count of incomplete todos */
  const activeCount = computed(() =>
    todos.value.filter(t => !t.completed).length
  )

  /** Count of completed todos */
  const completedCount = computed(() =>
    todos.value.filter(t => t.completed).length
  )

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Generate a short unique ID (no external library needed) */
  function generateId() {
    // crypto.randomUUID() is available in all modern browsers
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
  }

  // -------------------------------------------------------------------------
  // CRUD operations
  //
  // LEARNING NOTE: These are plain functions — not reactive themselves — but
  // they mutate the reactive `todos.value` array, which triggers Vue to
  // update any components that depend on it.
  // -------------------------------------------------------------------------

  /**
   * Add a brand-new todo.
   * @param {object} data  Partial todo (id and createdAt are auto-assigned)
   */
  function addTodo(data) {
    todos.value.push({
      id: generateId(),
      title: data.title,
      description: data.description || '',
      tags: data.tags || [],
      dueDate: data.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString()
    })
  }

  /**
   * Update an existing todo by ID.
   * @param {string} id       The todo to update
   * @param {object} changes  Only the fields you want to change
   */
  function updateTodo(id, changes) {
    // Array.findIndex returns -1 if not found
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      // Object spread (...) merges the existing todo with the new changes.
      // This avoids overwriting fields you didn't intend to touch.
      todos.value[index] = { ...todos.value[index], ...changes }
    }
  }

  /**
   * Delete a todo by ID.
   * @param {string} id
   */
  function deleteTodo(id) {
    // filter() returns a new array without the deleted item
    todos.value = todos.value.filter(t => t.id !== id)
  }

  /**
   * Flip the completed flag on a todo.
   * @param {string} id
   */
  function toggleComplete(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  /**
   * Get all todos whose dueDate matches a given YYYY-MM-DD string.
   * Used by the calendar to show todos on specific days.
   * @param {string} dateStr  e.g. "2025-06-15"
   * @returns {object[]}
   */
  function getTodosForDate(dateStr) {
    return todos.value.filter(t => t.dueDate === dateStr)
  }

  /**
   * Delete all completed todos at once.
   */
  function clearCompleted() {
    todos.value = todos.value.filter(t => !t.completed)
  }

  // -------------------------------------------------------------------------
  // Return everything that components can use
  //
  // LEARNING NOTE: Composables return an object with the reactive values and
  // functions you want to expose.  Components destructure this object:
  //
  //   const { todos, addTodo, deleteTodo } = useTodos()
  //
  // Because `todos` is a useState ref, the same reactive object is shared
  // across every component that calls useTodos().
  // -------------------------------------------------------------------------
  return {
    todos,
    allTags,
    activeCount,
    completedCount,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    getTodosForDate,
    clearCompleted
  }
}
