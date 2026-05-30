# 05 — State Management and Composables

This doc explains how data flows through the app and why we used a composable
instead of just putting state directly in each component.

---

## The problem: sharing state between components

Imagine you have a todo on the list page and a todo on the calendar page.
They should show the same data.  How do you keep them in sync?

**Option 1: Prop drilling**
Pass the todo array down from a parent component to each child, grandchild, etc.
Works for simple cases, but becomes unwieldy with deeply nested components.

```
App.vue → passes todos →
  ListPage.vue → passes todos →
    TodoItem.vue → needs to delete? → must emit up 3 levels!
```

**Option 2: Global state (what we use)**
Put the state somewhere global that any component can access directly.

In this app:
```
useTodos() composable
   │
   ├── pages/index.vue  ──── const { todos, addTodo } = useTodos()
   └── pages/calendar.vue ── const { todos, getTodosForDate } = useTodos()
```

Both pages read from and write to the *same* `todos` array.

---

## What is a composable?

A composable is a JavaScript function that:
1. Starts with `use` (by convention: `useTodos`, `useCounter`, `useTheme`)
2. Uses Vue's Composition API inside it (`ref`, `computed`, `watch`, etc.)
3. Returns reactive state and functions

It's the Vue 3 equivalent of a React Hook.

```js
// composables/useCounter.js — a simple example
export function useCounter() {
  const count = ref(0)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = 0 }

  const isZero = computed(() => count.value === 0)

  return { count, increment, decrement, reset, isZero }
}
```

Usage in any component:
```js
const { count, increment } = useCounter()
```

---

## `useState()` — the key to sharing state

The magic that makes `useTodos()` share state across components:

```js
// Without useState — each call creates its own separate todos array
const todos1 = ref([])   // component A's todos
const todos2 = ref([])   // component B's todos — DIFFERENT, not shared!

// With useState — all calls with the same key share ONE reactive value
const todos = useState('todos', () => [])
// Any component that calls useState('todos', ...) gets the same array
```

`useState(key, initializer)`:
- `key` — a unique string identifier for this piece of state
- `initializer` — a function returning the initial value (called only once)
- Returns the same reactive ref every time for the same key

When `useTodos()` is called in `index.vue`:
```js
const todos = useState('todos', () => [...defaultTodos])
```

When `useTodos()` is called in `calendar.vue`:
```js
const todos = useState('todos', () => [...defaultTodos])
// ↑ The initializer is IGNORED because 'todos' already exists.
// The SAME reactive ref from index.vue is returned.
```

---

## The full useTodos composable explained

```js
export function useTodos() {

  // 1. SHARED STATE — all consumers of useTodos() share this
  const todos = useState('todos', () => loadFromLocalStorage())

  // 2. PERSISTENCE — watch for changes and save to localStorage
  if (import.meta.client) {
    watch(todos, (newValue) => {
      localStorage.setItem('nuxt-todos', JSON.stringify(newValue))
    }, { deep: true })
  }

  // 3. DERIVED STATE — computed values based on todos
  const allTags = computed(() => {
    const tagSet = new Set()
    todos.value.forEach(todo => todo.tags.forEach(t => tagSet.add(t)))
    return [...tagSet].sort()
  })

  // 4. OPERATIONS — functions that mutate the shared state
  function addTodo(data) {
    todos.value.push({ id: crypto.randomUUID(), ...data, completed: false })
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  // 5. EXPOSE — return what components need
  return { todos, allTags, addTodo, deleteTodo, /* ... */ }
}
```

---

## Why `{ deep: true }` on the watcher?

```js
watch(todos, callback, { deep: true })
```

Without `deep: true`, the watcher only fires when `todos.value` itself is replaced
(i.e., you assign a new array).  It does NOT fire when you mutate a property of
an existing todo object.

```js
// This triggers the watcher (array reference changes):
todos.value = todos.value.filter(t => t.id !== id)

// This does NOT trigger without deep: true:
todos.value[0].completed = true  // mutating a nested property
```

With `deep: true`, Vue walks the entire object tree and watches for any change.

**Trade-off:** `deep: true` is slightly more expensive because Vue has to track
more references.  For a small array like todos, it's totally fine.

---

## Immutable update patterns

Notice how `updateTodo` creates a new object instead of mutating:

```js
function updateTodo(id, changes) {
  const index = todos.value.findIndex(t => t.id === id)
  todos.value[index] = { ...todos.value[index], ...changes }
  //                     ↑ spread existing      ↑ spread new values
}
```

The object spread `{ ...a, ...b }` creates a *new* object with all properties from `a`
plus all properties from `b` (with `b` overriding any duplicates).

This pattern is common in Vue/React because:
1. It's explicit about what changed
2. Vue can detect the change reliably
3. It creates an audit trail (you can keep the old object if needed)

---

## localStorage — browser persistence

`localStorage` is a key-value store built into every browser.  Data persists
across page refreshes and even browser restarts until cleared.

```js
// Write (strings only — use JSON for objects)
localStorage.setItem('key', JSON.stringify(myObject))

// Read
const raw = localStorage.getItem('key')  // returns null if not found
const data = raw ? JSON.parse(raw) : null

// Delete
localStorage.removeItem('key')

// Clear everything
localStorage.clear()
```

**Limitations:**
- ~5MB storage limit per domain
- Strings only (use JSON.stringify/parse)
- Synchronous (blocks the main thread — fine for small data)
- Not accessible during server-side rendering (use `import.meta.client` guard)

To view your app's localStorage data:
1. Open browser DevTools (F12)
2. Application tab → Storage → Local Storage
3. Click your domain (usually `localhost:3000`)

---

## Alternatives to this approach

As your app grows, you might want more sophisticated state management:

| Approach | Best for |
|----------|----------|
| `useState()` + composable (this app) | Small to medium apps, learning |
| **Pinia** | Medium to large apps, complex state with actions/getters |
| **Vuex** (Vue 2 era) | Legacy code — avoid for new projects |
| Server state (Nuxt's `useFetch`) | Data that lives on a server/database |

**Pinia** is the officially recommended state management library for Vue 3.
It's similar to what we built here but more structured:

```js
// stores/todos.js (Pinia)
export const useTodoStore = defineStore('todos', () => {
  const todos = ref([])
  const allTags = computed(() => ...)
  function addTodo(data) { ... }
  return { todos, allTags, addTodo }
})
```

The patterns you learned here transfer directly to Pinia.
