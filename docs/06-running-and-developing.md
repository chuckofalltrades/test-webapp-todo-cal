# 06 — Running and Developing the App

## Prerequisites

- **Node.js** v18 or higher  
  Check: `node --version`  
  Download: https://nodejs.org (choose "LTS" version)

- **npm** (comes bundled with Node.js)  
  Check: `npm --version`

---

## Getting started

```bash
# 1. Navigate to the project folder
cd test-webapp-todo-cal

# 2. Install dependencies (only needed once, or after adding new packages)
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## npm scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload at http://localhost:3000 |
| `npm run build` | Build for production (outputs to `.output/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code for style/error issues |
| `npm run typecheck` | Check TypeScript types |

---

## Hot Module Replacement (HMR)

When running `npm run dev`, changes you make to `.vue` files appear in the browser
**instantly** — no manual refresh needed.  Vue's HMR updates only the changed
component while preserving the app's state.

Try it:
1. Open the app in your browser
2. Add a todo
3. Edit `app/pages/index.vue` — change the "My Todos" heading text
4. Save the file
5. Watch the browser update instantly without losing your todo!

---

## Project dependencies explained

Open `package.json` to see all dependencies:

```json
{
  "dependencies": {
    "@iconify-json/lucide": "icon definitions for Lucide icons",
    "@iconify-json/simple-icons": "icon definitions for brand logos",
    "@nuxt/ui": "the UI component library (includes Tailwind CSS)",
    "nuxt": "the Nuxt framework itself",
    "tailwindcss": "CSS utility framework"
  },
  "devDependencies": {
    "@nuxt/eslint": "ESLint integration for Nuxt",
    "eslint": "the JavaScript linter",
    "typescript": "TypeScript compiler",
    "vue-tsc": "TypeScript checker for Vue files"
  }
}
```

**dependencies** — needed to run the app in production  
**devDependencies** — only needed during development/building

---

## Folder structure recap

```
app/
├── app.vue              ← Edit the header/footer here
├── app.config.ts        ← Change the primary color here
├── assets/css/main.css  ← Add global CSS here
│
├── pages/               ← Add a new page: create pages/mypage.vue → /mypage
├── components/          ← Add reusable components here (auto-imported)
└── composables/         ← Add shared logic here (auto-imported)

nuxt.config.ts           ← App-level configuration
```

---

## How to add a new page

1. Create `app/pages/my-new-page.vue`:

```vue
<script setup>
useSeoMeta({ title: 'My New Page' })
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">My New Page</h1>
    <p class="mt-2 text-muted">Hello from my new page!</p>
  </UContainer>
</template>
```

2. Add it to the nav in `app/app.vue`:

```vue
<UNavigationMenu
  :items="[
    { label: 'Todos', to: '/', icon: 'i-lucide-list-todo' },
    { label: 'Calendar', to: '/calendar', icon: 'i-lucide-calendar-days' },
    { label: 'My Page', to: '/my-new-page', icon: 'i-lucide-star' }  ← add this
  ]"
/>
```

That's it — navigate to http://localhost:3000/my-new-page.

---

## How to add a new component

1. Create `app/components/AppMyWidget.vue`:

```vue
<script setup>
defineProps({
  message: { type: String, required: true }
})
</script>

<template>
  <UCard>
    <p>{{ message }}</p>
  </UCard>
</template>
```

2. Use it anywhere — no import needed:

```vue
<AppMyWidget message="Hello!" />
```

By convention, prefix your components with `App` to distinguish them from Nuxt UI
components (which start with `U`).

---

## How to change the color theme

Edit `app/app.config.ts`:

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue'  // try: red, orange, green, sky, violet, pink, etc.
    }
  }
})
```

Save and the entire app changes color immediately (HMR).

---

## Clearing your data

All todos are stored in your browser's `localStorage`.

To reset to the default sample todos, open the browser console (F12 → Console) and run:

```js
localStorage.removeItem('nuxt-todos')
location.reload()
```

Or navigate to DevTools → Application → Local Storage → right-click and Clear.

---

## Ideas for extending this app

Once you're comfortable with the codebase, try these challenges:

### Beginner
- [ ] Add a "priority" field (low/medium/high) to todos
- [ ] Show priority as a colored badge on `AppTodoItem.vue`
- [ ] Add a "sort by due date" option to the list page

### Intermediate
- [ ] Add a **Statistics** page (`pages/stats.vue`) showing:
  - Total todos, completed %, most used tags
  - Use `computed()` and Nuxt UI's chart components or a bar made with divs
- [ ] Add **drag-and-drop** reordering of todos (try `@vueuse/core`'s `useSortable`)
- [ ] Make tags editable inline without opening the full modal

### Advanced
- [ ] Persist data to a real database using **Nuxt's server routes** (`server/api/todos.ts`)
- [ ] Add **user authentication** with [Nuxt Auth](https://auth.nuxt.com/)
- [ ] Deploy to **Vercel** or **Netlify** with `npm run build`

---

## Learning resources

| Resource | URL |
|----------|-----|
| Vue 3 docs | https://vuejs.org/guide/ |
| Nuxt 3 docs | https://nuxt.com/docs |
| Nuxt UI docs | https://ui.nuxt.com |
| Tailwind CSS docs | https://tailwindcss.com/docs |
| Vue School (video) | https://vueschool.io |
| Icônes (icon browser) | https://icones.js.org |
