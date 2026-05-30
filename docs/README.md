# NuxtTodo — Documentation Index

This folder contains learning documentation for the **NuxtTodo** app.
Each doc covers a different layer of the stack.

## Reading order

| File | Topic |
|------|-------|
| [01-project-overview.md](./01-project-overview.md) | Big picture: what this app is and how it's structured |
| [02-vue3-concepts.md](./02-vue3-concepts.md) | Vue 3 fundamentals used in this project |
| [03-nuxt3-concepts.md](./03-nuxt3-concepts.md) | Nuxt 3 conventions and features |
| [04-nuxt-ui-guide.md](./04-nuxt-ui-guide.md) | How Nuxt UI components work |
| [05-state-and-composables.md](./05-state-and-composables.md) | Deep dive into composables and state management |
| [06-running-and-developing.md](./06-running-and-developing.md) | How to run, build, and extend the app |

## Quick-start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Tech stack at a glance

```
Browser
  └── Vue 3            (component system + reactivity)
       └── Nuxt 3      (routing, SSR, conventions, DX)
            └── Nuxt UI (pre-built accessible components, Tailwind CSS)
```

- **Vue 3** — The JavaScript UI framework.  You write components in `.vue` files.
- **Nuxt 3** — The meta-framework built on Vue.  Adds file-based routing, auto-imports, SSR, and more.
- **Nuxt UI v4** — A component library for Nuxt.  Gives you polished buttons, modals, inputs, etc., all styled with Tailwind CSS.
- **Tailwind CSS v4** — A utility-class CSS framework.  Instead of writing CSS rules, you apply small classes like `flex`, `gap-4`, `text-sm` directly in HTML.
