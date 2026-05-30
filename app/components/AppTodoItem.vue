<!--
  AppTodoItem.vue — A single row in the todo list
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: Vue Single-File Components (SFCs)

  A .vue file has three optional sections:
    <script setup> — Component logic (JavaScript/TypeScript)
    <template>     — Component HTML (with Vue directives)
    <style>        — Component CSS (scoped = only applies to this component)

  The `setup` attribute on <script> activates the "Composition API script
  setup" syntax — the modern, recommended way to write Vue 3 components.
  Everything declared at the top level (refs, functions, etc.) is automatically
  available in the <template> without needing a `return` statement.
  ─────────────────────────────────────────────────────────────────────────────

  LEARNING NOTE: Props and Emits

  Props  — data passed DOWN  from parent to child (parent → child)
  Emits  — events fired UP   from child to parent (child → parent)

  This component receives a `todo` prop from the list page and emits
  `edit` and `delete` events back when the user clicks those buttons.
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
// defineProps() declares what data this component accepts from its parent.
// The parent passes it like: <AppTodoItem :todo="myTodo" />
// The colon : means we are binding a dynamic JavaScript value (not a string).
const props = defineProps({
  todo: {
    type: Object,    // must be a JavaScript object
    required: true   // parent MUST provide this — Vue warns if missing
  }
})

// defineEmits() declares events this component can fire to its parent.
// We fire 'edit' when the user clicks the edit button.
// We fire 'delete' when the user clicks the delete button.
// We fire 'toggle' when the user clicks the checkbox.
const emit = defineEmits(['edit', 'delete', 'toggle'])

// useTodos() gives us the toggleComplete function.
// LEARNING NOTE: Even though we defined toggleComplete in the composable,
// we emit 'toggle' upward and let the parent (index.vue) call toggleComplete.
// This pattern keeps components "dumb" — they display data and signal intent,
// while the parent or composable handles the actual state change.
// (Alternatively we could call toggleComplete directly here — both are valid.)

// ──────────────────────────────────────────────────────────────────────────
// Computed helpers (derived display values)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Format a YYYY-MM-DD due date into something human-readable.
 * computed() caches this — it only recalculates when props.todo.dueDate changes.
 */
const formattedDueDate = computed(() => {
  if (!props.todo.dueDate) return null

  // Parse the date string into a Date object.
  // We append T12:00:00 to avoid timezone-shift issues when parsing date-only strings.
  const date = new Date(props.todo.dueDate + 'T12:00:00')

  // Intl.DateTimeFormat is a built-in browser API for locale-aware formatting.
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', // "Jun"
    day: 'numeric', // "15"
    year: 'numeric' // "2025"
  }).format(date)
})

/**
 * Is the due date in the past (and the todo not yet completed)?
 * We use this to show overdue todos in red.
 */
const isOverdue = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return false
  // Compare date strings directly — YYYY-MM-DD strings sort lexicographically
  const today = new Date().toISOString().slice(0, 10) // "2025-06-15"
  return props.todo.dueDate < today
})

/**
 * Is the due date today?
 */
const isDueToday = computed(() => {
  if (!props.todo.dueDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return props.todo.dueDate === today
})
</script>

<template>
  <!--
    UCard — A Nuxt UI container with built-in padding, border, and shadow.
    The `class` attribute adds extra Tailwind CSS utility classes on top.

    LEARNING NOTE: Tailwind CSS uses utility classes — small, single-purpose
    classes that map directly to CSS properties:
      transition-all  → adds CSS transitions to all properties
      opacity-60      → sets opacity: 0.6
      hover:opacity-100 → opacity: 1 on mouse hover

    Tailwind classes are composed together rather than writing custom CSS rules.
  -->
  <UCard
    class="transition-all"
    :class="{ 'opacity-60': todo.completed }"
  >
    <!--
      The UCard `#header` slot (optional) — content rendered in the card header.
      Nuxt UI components expose "slots" for inserting custom content into
      specific parts of the component.  #header is the named slot.
    -->

    <!-- Main content area: checkbox + title + metadata -->
    <div class="flex items-start gap-3">

      <!--
        LEARNING NOTE: @click is shorthand for v-on:click
        It attaches a click event listener.

        emit('toggle', todo.id) fires the 'toggle' event with the todo's ID
        as the payload.  The parent (index.vue) listens for it with
        @toggle="toggleComplete".
      -->
      <UCheckbox
        :model-value="todo.completed"
        :ui="{ base: 'mt-1 shrink-0' }"
        @update:model-value="emit('toggle', todo.id)"
      />

      <!-- Title + tags + due date -->
      <div class="flex-1 min-w-0">

        <!--
          LEARNING NOTE: :class with an object
          When :class receives an object, each key is a CSS class and each
          value is a boolean that determines whether the class is applied.
          'line-through' will only be added when todo.completed is true.
        -->
        <p
          class="font-medium text-sm break-words"
          :class="{
            'line-through text-muted': todo.completed
          }"
        >
          {{ todo.title }}
        </p>

        <!--
          LEARNING NOTE: v-if / v-else
          These directives conditionally render elements.
          If todo.description is a non-empty string, show the description.
          The && trick: empty string "" is falsy in JS, so this only shows
          when there IS a description.
        -->
        <p
          v-if="todo.description"
          class="text-sm text-muted mt-0.5 break-words"
        >
          {{ todo.description }}
        </p>

        <!--
          Tags and due date row
        -->
        <div class="flex flex-wrap items-center gap-1.5 mt-2">

          <!--
            LEARNING NOTE: v-for
            Renders a list item for each element in the array.
            :key is required — Vue uses it to track which items changed
            for efficient DOM updates.  Always use a unique, stable value.
          -->
          <UBadge
            v-for="tag in todo.tags"
            :key="tag"
            variant="subtle"
            color="primary"
            size="sm"
          >
            #{{ tag }}
          </UBadge>

          <!--
            Due date badge — color changes based on urgency.
            isOverdue / isDueToday are computed properties defined above.
          -->
          <UBadge
            v-if="todo.dueDate"
            :color="isOverdue ? 'error' : isDueToday ? 'warning' : 'neutral'"
            variant="subtle"
            size="sm"
            :icon="isOverdue ? 'i-lucide-alert-circle' : 'i-lucide-calendar'"
          >
            {{ formattedDueDate }}
            <span v-if="isOverdue" class="ml-0.5">— overdue</span>
            <span v-else-if="isDueToday" class="ml-0.5">— today!</span>
          </UBadge>
        </div>
      </div>

      <!--
        Action buttons: Edit and Delete
        These are in a flex column so they stack vertically on small screens.
      -->
      <div class="flex gap-1 shrink-0">
        <UButton
          icon="i-lucide-pencil"
          variant="ghost"
          color="neutral"
          size="xs"
          aria-label="Edit todo"
          @click="emit('edit', todo)"
        />
        <UButton
          icon="i-lucide-trash-2"
          variant="ghost"
          color="error"
          size="xs"
          aria-label="Delete todo"
          @click="emit('delete', todo.id)"
        />
      </div>
    </div>
  </UCard>
</template>
