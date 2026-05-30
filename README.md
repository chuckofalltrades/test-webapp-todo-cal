# NuxtTodo — A Vue 3 + Nuxt 3 + Nuxt UI Learning App

A todo list app with open-ended tagging and a calendar view, built as a **demo and learning project** to explore:

- **[Vue 3](https://vuejs.org/)** — the reactive component framework
- **[Nuxt 3](https://nuxt.com/)** — the meta-framework (routing, auto-imports, SSR)
- **[Nuxt UI v4](https://ui.nuxt.com/)** — pre-built accessible components + Tailwind CSS

All source files are **heavily commented** to explain every concept as you read them.
The [`docs/`](./docs/) folder contains detailed learning guides.

## Features

- ✅ Add, edit, and delete todos
- 🏷️ Open-ended tagging — type any tags you like
- 📅 Optional due dates with overdue highlighting
- 🔍 Search and filter by tag or completion status
- 📆 Calendar view — month grid showing todos by due date
- 🌙 Dark mode toggle
- 💾 Auto-saved to `localStorage` (no server needed)

## Quick start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/01-project-overview.md](./docs/01-project-overview.md) | App structure, data flow, todo schema |
| [docs/02-vue3-concepts.md](./docs/02-vue3-concepts.md) | ref, computed, watch, v-model, props, emits |
| [docs/03-nuxt3-concepts.md](./docs/03-nuxt3-concepts.md) | File routing, auto-imports, useState, SSR |
| [docs/04-nuxt-ui-guide.md](./docs/04-nuxt-ui-guide.md) | Component reference, Tailwind, icons, slots |
| [docs/05-state-and-composables.md](./docs/05-state-and-composables.md) | Composables, shared state, localStorage |
| [docs/06-running-and-developing.md](./docs/06-running-and-developing.md) | Dev workflow, extending the app, resources |

## Tech stack

```
Vue 3  ←  component system, reactivity
  └── Nuxt 3  ←  file-based routing, auto-imports, useState
       └── Nuxt UI v4  ←  UButton, UModal, UCard, UInput, …
            └── Tailwind CSS v4  ←  utility classes
```
