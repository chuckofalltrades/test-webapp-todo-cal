# 02 — Vue 3 Concepts

Vue 3 is the JavaScript framework powering this app.
This doc explains the key Vue concepts you'll see throughout the source code.

---

## Single-File Components (SFCs)

Every `.vue` file is a **Single-File Component**.  It has up to three sections:

```vue
<script setup>
// JavaScript logic goes here
</script>

<template>
  <!-- HTML with Vue directives goes here -->
</template>

<style scoped>
/* CSS goes here (scoped = only applies to this component) */
</style>
```

The `setup` attribute on `<script>` enables the modern **Composition API** syntax.
Everything you declare at the top level of `<script setup>` is automatically available
in `<template>` — no need to `return` anything.

---

## Reactivity: `ref()` and `computed()`

### `ref()` — a reactive variable

```js
const count = ref(0)         // creates a reactive "box" around 0
count.value++                // read/write via .value in <script>
// In <template>: {{ count }} — Vue auto-unwraps .value there
```

When `count.value` changes, Vue automatically re-renders any template that uses it.
This is the core of Vue's **reactivity system**.

### `computed()` — a derived value

```js
const doubled = computed(() => count.value * 2)
// doubled.value is always count.value * 2, recalculated automatically
```

`computed()` is like a formula: it watches its dependencies and recalculates only when needed.
It's more efficient than calling a function in the template because it **caches** the result.

**Where you see this in the project:**
- `allTags` in `useTodos.js` — unique tags across all todos
- `filteredTodos` in `pages/index.vue` — todos after search/tag filter is applied
- `calendarDays` in `AppCalendar.vue` — the 6×7 grid of day cells

---

## Template directives

Directives are special attributes that start with `v-`.  They let you bind JavaScript to HTML.

### `v-model` — two-way binding

```vue
<input v-model="searchQuery" />
```

Equivalent to:
```vue
<input :value="searchQuery" @input="searchQuery = $event.target.value" />
```

The input shows `searchQuery` and updates it when the user types.

**Where you see this:** every `<UInput>`, `<UTextarea>`, `<UCheckbox>` in the modals and filter bar.

---

### `v-for` — render a list

```vue
<li v-for="todo in todos" :key="todo.id">
  {{ todo.title }}
</li>
```

- Renders one `<li>` for each todo in the array.
- `:key` is **required** — Vue uses it to track which items changed for efficient updates.
  Always use a unique, stable value (like an ID, not an index).

**Where you see this:** `<AppTodoItem>` loop in `index.vue`, tag badges in `AppTodoModal.vue`.

---

### `v-if` / `v-else-if` / `v-else` — conditional rendering

```vue
<p v-if="todos.length > 0">You have todos!</p>
<p v-else-if="loading">Loading…</p>
<p v-else">No todos yet.</p>
```

Only the matching element is added to the DOM.

**Where you see this:** Empty states in `index.vue`, the day panel in `calendar.vue`.

---

### `v-bind` (shorthand `:`) — dynamic attribute

```vue
<UButton :disabled="!canSave" />
<!-- equivalent to: v-bind:disabled="!canSave" -->
```

Without `:` the value is a literal string.  With `:` it's a JavaScript expression.

```vue
<UBadge color="primary" />        <!-- "primary" is a string literal -->
<UBadge :color="activeColor" />   <!-- activeColor is a variable -->
```

---

### `v-on` (shorthand `@`) — event listeners

```vue
<UButton @click="openAddModal" />
<!-- equivalent to: v-on:click="openAddModal" -->
```

You can also use inline expressions:
```vue
<UButton @click="count++" />
<UButton @click="selectedTag = null" />
```

**Event modifiers** add common behavior automatically:
```vue
<form @submit.prevent="handleSave">  <!-- calls event.preventDefault() for you -->
```

---

## Props and Emits — component communication

### Props (parent → child)

A parent passes data *down* to a child component via props:

```vue
<!-- Parent -->
<AppTodoItem :todo="myTodo" />

<!-- Child (AppTodoItem.vue) -->
<script setup>
const props = defineProps({
  todo: { type: Object, required: true }
})
</script>
```

The child can *read* props but **must not modify them directly** (one-way data flow).

### Emits (child → parent)

When something happens in the child, it fires an *event* upward:

```vue
<!-- Child emits an event -->
<script setup>
const emit = defineEmits(['delete'])
</script>
<template>
  <UButton @click="emit('delete', todo.id)" />
</template>

<!-- Parent listens -->
<AppTodoItem @delete="deleteTodo" />
```

The parent receives the event and decides what to do with it.
This keeps components decoupled — the child doesn't need to know *how* deleting works.

---

## `watch()` — react to changes

```js
watch(searchQuery, (newValue, oldValue) => {
  console.log('Search changed to:', newValue)
})

// Watch deeply nested objects:
watch(todos, (newValue) => {
  localStorage.setItem('todos', JSON.stringify(newValue))
}, { deep: true })

// Run immediately on mount too:
watch(props.todo, populateForm, { immediate: true })
```

**Where you see this:** `useTodos.js` watches `todos` to persist to localStorage.
`AppTodoModal.vue` watches `props.todo` to fill the form when editing.

---

## Lifecycle hooks

Vue components have a lifecycle (create → mount → update → unmount).
You can run code at specific points:

```js
onMounted(() => {
  // runs after the component's HTML is added to the page
  // safe to access the DOM here
})

onUnmounted(() => {
  // cleanup: clear timers, remove event listeners
})
```

**Where you see this:** Not used directly in this project (useTodos handles setup via `useState`),
but `import.meta.client` guards in the composable serve a similar purpose for SSR safety.

---

## `<script setup>` — what makes it special

Traditional Options API (Vue 2 style):
```js
export default {
  data() { return { count: 0 } },
  computed: { doubled() { return this.count * 2 } },
  methods: { increment() { this.count++ } }
}
```

Composition API with `<script setup>` (Vue 3 modern style):
```js
const count = ref(0)
const doubled = computed(() => count.value * 2)
function increment() { count.value++ }
```

Benefits of `<script setup>`:
- No `this` keyword (less confusing)
- No need to `return` variables to the template
- Composables extract and share logic cleanly
- Better TypeScript support
- Slightly better runtime performance
