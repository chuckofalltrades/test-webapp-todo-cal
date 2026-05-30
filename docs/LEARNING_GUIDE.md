# Learning Guide: Vue + Nuxt + Nuxt UI

This guide explains the demo app in practical terms and maps what you see in code to framework concepts.

## 1) What this app demonstrates

The app intentionally stays small, but still shows key ideas:

- **Vue reactivity** with `ref`, `computed`, and event-based component communication.
- **Nuxt structure** (`app/pages`, `app/components`, `app/composables`) and auto-imports.
- **Nuxt UI components** for polished UI without building every element from scratch.
- **State sharing** via a composable that internally uses Nuxt `useState`.
- **Client-side persistence** with `localStorage`.

---

## 2) Folder/file walkthrough

### `app/pages/index.vue`
Main page that wires everything together.

Concepts shown:
- Page-level state (`activeView`)
- Global todo state access through `useTodos()`
- Derived stats with `computed`
- Conditional rendering (`v-if` / `v-else`) to switch between list/calendar

### `app/composables/useTodos.ts`
Reusable state and todo actions.

Concepts shown:
- Nuxt composable pattern
- Shared reactive app state with `useState`
- Action methods (`addTodo`, `toggleComplete`, `removeTodo`)
- Persistence (`loadFromStorage`, `saveToStorage`)

### `app/components/TodoComposer.vue`
Form for creating todos.

Concepts shown:
- `v-model` bindings
- Computed form validation (`canSubmit`)
- `defineEmits` to send data up to parent
- Tag parsing from comma-separated input

### `app/components/TodoList.vue`
List presentation + filtering.

Concepts shown:
- `defineProps` and `defineEmits`
- Computed filtering by status and tag
- UI list actions (toggle complete / remove)

### `app/components/TodoCalendar.vue`
Calendar-like month grid using JavaScript `Date`.

Concepts shown:
- Building calendar cells with computed logic
- Mapping todos by date (`Map<string, TodoItem[]>`)
- Selecting a day and rendering related todos

### `app/types/todo.ts`
Shared TypeScript interface for todo objects.

Concept shown:
- Basic typing for consistency and editor support.

---

## 3) Why this is easier than plain JS in larger projects

Compared to a single script file app:

- **Components split concerns**: input form, list, calendar each in their own file.
- **Composable centralizes logic**: state and actions stay in one place.
- **Reactive UI updates automatically**: you modify data; Vue handles DOM updates.
- **Nuxt conventions reduce setup work**: routes, auto-imports, tooling are pre-wired.
- **Nuxt UI gives consistent design system** without manually styling every control.

---

## 4) Beginner exercises (recommended)

Try these in order:

1. Add a **priority** field (`low`, `medium`, `high`) and show it in list + calendar.
2. Add a filter for **only overdue** open tasks.
3. Add a **search box** to filter todos by title.
4. Add an **edit todo** action.
5. Replace localStorage with a backend API route when ready.

---

## 5) Notes about comments in code

The components/composable are intentionally commented to explain:
- What each block does
- Why certain framework patterns are used
- Where data flows between parent and child

As you gain confidence, you can remove or reduce explanatory comments and keep only high-value ones.

---

## 6) Suggested learning path for this repository

1. Start with `index.vue` to understand app flow.
2. Open `useTodos.ts` to understand shared state/actions.
3. Review `TodoComposer.vue` for form handling and emits.
4. Review `TodoList.vue` for filtering logic.
5. Review `TodoCalendar.vue` for computed calendar construction.
6. Run the app and experiment with small changes.

This pattern is a strong base for moving from plain JavaScript apps to larger Vue/Nuxt applications.
