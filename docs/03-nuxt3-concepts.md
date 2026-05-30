# 03 — Nuxt 3 Concepts

Nuxt is a *meta-framework* built on top of Vue.  It adds conventions and features
that make building real apps much easier.  Think of it as "Vue with batteries included."

---

## Why use Nuxt instead of plain Vue?

| Plain Vue (Vite)          | Nuxt 3                            |
|---------------------------|-----------------------------------|
| Manual router setup       | File-based routing (automatic)    |
| Manual imports everywhere | Auto-imports (no `import` needed) |
| Client-side only (by default) | SSR / SSG / hybrid rendering  |
| Manual `<head>` management | `useHead()` / `useSeoMeta()`     |
| No built-in state         | `useState()` for shared state     |
| Manual server setup       | Built-in API routes (`server/`)   |

For a learning project, Nuxt's conventions reduce boilerplate so you can focus
on *what* you're building rather than *how to wire things up*.

---

## File-based routing

This is one of Nuxt's most important features.

You do NOT write a router config.  Instead, every `.vue` file in `pages/` becomes a route:

```
pages/
  index.vue          →   /
  calendar.vue       →   /calendar
  about.vue          →   /about
  users/
    index.vue        →   /users
    [id].vue         →   /users/123  (dynamic route — id is a URL parameter)
```

The URL structure mirrors the folder structure.  Simple and predictable.

### Dynamic routes

Square brackets in a filename create a dynamic route:
```
pages/todos/[id].vue  →  /todos/abc123  →  /todos/xyz789
```

Inside the page you can access the parameter:
```js
const route = useRoute()
const id = route.params.id   // "abc123"
```

*This project doesn't use dynamic routes, but it's useful to know.*

---

## `<NuxtLink>` — client-side navigation

```vue
<NuxtLink to="/calendar">Go to Calendar</NuxtLink>
```

This renders an `<a>` tag but intercepts the click.  Instead of doing a full browser reload
(like a normal `<a href="/calendar">`), it:
1. Updates the URL in the address bar
2. Swaps in the new page component in-place
3. The rest of the app (header, footer, shared state) stays mounted

This makes navigation feel instant — it's what makes a Single-Page Application (SPA) feel
like a native app.

---

## Auto-imports

Nuxt automatically imports:
- Everything in `composables/` — use `useTodos()` without importing it
- Everything in `components/` — use `<AppTodoItem />` without importing it
- Vue core functions — use `ref()`, `computed()`, `watch()` without importing them
- Nuxt composables — use `useRoute()`, `useState()`, `useHead()`, etc.

**Without Nuxt:**
```js
import { ref, computed } from 'vue'
import { useTodos } from '~/composables/useTodos'
import AppTodoItem from '~/components/AppTodoItem.vue'
```

**With Nuxt (nothing needed):**
```js
const { todos } = useTodos()
// ref, computed, AppTodoItem are all already available
```

This dramatically reduces the amount of boilerplate you write.

---

## `useState()` — Nuxt shared state

```js
const todos = useState('todos', () => [])
```

`useState(key, initializer)`:
- Creates a reactive value identified by `key`
- `initializer` is called once to produce the starting value
- The same reactive object is returned every time any component calls `useState('todos', ...)`
- It's SSR-safe (works correctly during server-side rendering)

Compare:
```js
// ref() — local to the component that declares it
const count = ref(0)  // each component gets its own count

// useState() — shared across the entire app
const count = useState('count', () => 0)  // all components share the same count
```

---

## `useHead()` and `useSeoMeta()`

These composables let you control the `<head>` section of the page reactively:

```js
useHead({
  title: 'My Page',
  meta: [{ name: 'description', content: 'Hello' }]
})

useSeoMeta({
  title: 'My Page',
  description: 'Hello',
  ogTitle: 'My Page',        // for social sharing previews
  twitterCard: 'summary'
})
```

Because these are reactive, you can use computed values:
```js
const pageTitle = computed(() => `${todos.value.length} todos — NuxtTodo`)
useSeoMeta({ title: pageTitle })
// The browser tab title updates as todos change!
```

---

## `nuxt.config.ts` — central configuration

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],          // add Nuxt UI
  css: ['~/assets/css/main.css'], // global CSS
  devtools: { enabled: true }     // browser DevTools panel
})
```

The `modules` array is where you add Nuxt ecosystem packages.
Each module can add auto-imports, components, plugins, build config, etc.

---

## `app.config.ts` — runtime app config

```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'violet' }
  }
})
```

Unlike `nuxt.config.ts` (which runs at build time), `app.config.ts` is available
at runtime and is reactive.  Nuxt UI reads this to set up its design tokens.

---

## Server-Side Rendering (SSR) — what it means

Nuxt can *render your Vue app on the server* before sending HTML to the browser.
This means:
- The user sees content immediately (no blank page while JS loads)
- Search engines can index the content
- Better performance on slow connections

For `localStorage` (which only exists in the browser), you need to guard against SSR:

```js
if (import.meta.client) {
  // This code only runs in the browser, not on the server
  const saved = localStorage.getItem('todos')
}
```

`import.meta.client` is `true` in the browser and `false` on the server.
`import.meta.server` is the opposite.

In this app, since todos live in localStorage, SSR would give everyone the same
empty starting state.  The client then *hydrates* with the real localStorage data.

---

## Nuxt DevTools

When running `npm run dev`, click the small Nuxt icon that appears in the bottom-right
corner (or press `Shift+Alt+D`) to open **Nuxt DevTools**:

- **Pages** — see all routes and navigate to them
- **Components** — interactive component tree
- **Imports** — see all auto-imported functions and components
- **State** — inspect `useState()` values live
- **Timeline** — performance profiling

This is an invaluable learning tool — use it to see exactly how the app is structured.
