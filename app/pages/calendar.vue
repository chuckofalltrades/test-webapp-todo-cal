<!--
  pages/calendar.vue — Calendar view for todos with due dates
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: Multiple pages in Nuxt

  Since this file is pages/calendar.vue, Nuxt automatically creates the
  route /calendar for it.  No router config needed.  The user can navigate
  here by clicking the "Calendar" link in the nav bar (see app.vue).

  NuxtLink (used in app.vue) handles client-side navigation — it updates
  the URL and swaps the page component WITHOUT doing a full browser refresh,
  making the app feel fast and app-like.  This is called a Single-Page
  Application (SPA) navigation.
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
useSeoMeta({
  title: 'Calendar — NuxtTodo',
  description: 'View your todos on a calendar.'
})

// Pull in the composable — same shared state as index.vue.
// LEARNING NOTE: Because todos uses useState() internally, both pages
// share the EXACT same todo array.  Adding a todo on the list page
// immediately shows up here too.
const { todos, getTodosForDate, addTodo, toggleComplete, deleteTodo } = useTodos()

// ─── Selected day state ───────────────────────────────────────────────────────
const selectedDate = ref(null)   // YYYY-MM-DD string or null

// ─── Todos for the selected day ───────────────────────────────────────────────
const selectedDayTodos = computed(() => {
  if (!selectedDate.value) return []
  return getTodosForDate(selectedDate.value)
})

/** Human-readable label for the selected day, e.g. "Thursday, June 15, 2025" */
const selectedDayLabel = computed(() => {
  if (!selectedDate.value) return null
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(selectedDate.value + 'T12:00:00'))
})

// ─── Quick-add from the calendar ─────────────────────────────────────────────
const isModalOpen = ref(false)

// When the user clicks "Add" in the day panel, pre-fill the due date
// with the selected day.  We do this by creating a "draft" todo object
// that AppTodoModal will load into its form.
const draftTodo = ref(null)

function openAddForDate() {
  // We pass a special object to the modal to pre-fill the date.
  // Note: this is NOT a real todo — it's just form defaults.
  // We set it to null first to ensure the modal's watcher triggers.
  draftTodo.value = null
  // Use nextTick so the watch sees the null → object change
  nextTick(() => {
    draftTodo.value = {
      // id = null signals "this is a draft, not an existing todo"
      id: null,
      title: '',
      description: '',
      tags: [],
      dueDate: selectedDate.value,
      completed: false
    }
    isModalOpen.value = true
  })
}

function onSave(formData) {
  addTodo(formData)
}

function onDelete(id) {
  if (confirm('Delete this todo?')) {
    deleteTodo(id)
  }
}

// ─── Handle calendar day selection ───────────────────────────────────────────
function onSelectDate(dateStr) {
  // Clicking an already-selected day deselects it (toggle)
  selectedDate.value = selectedDate.value === dateStr ? null : dateStr
}
</script>

<template>
  <UContainer class="py-8 max-w-5xl">

    <!-- ── Page header ── -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Calendar</h1>
      <p class="text-sm text-muted mt-0.5">
        Click a day to see its todos. Colored dots = todos due that day.
      </p>
    </div>

    <!--
      Two-column layout on larger screens, single column on mobile.
      Tailwind responsive prefixes: lg:grid-cols-3 = 3 columns on "lg" screens
      (≥1024px) and above.  Without the prefix it applies to all screen sizes.
    -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── Calendar takes 2 of 3 columns ── -->
      <div class="lg:col-span-2">
        <!--
          AppCalendar is our custom component (components/AppCalendar.vue).
          We pass it:
            :get-todos-for-date — function prop for looking up todos by date
            :selected-date      — currently highlighted date
          And listen for:
            @select-date        — when the user clicks a day
        -->
        <AppCalendar
          :get-todos-for-date="getTodosForDate"
          :selected-date="selectedDate"
          @select-date="onSelectDate"
        />

        <!-- Legend -->
        <div class="flex items-center gap-4 mt-3 px-1 text-xs text-muted">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary inline-block" />
            Incomplete todo
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-success inline-block" />
            Completed todo
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full ring-2 ring-primary inline-flex items-center justify-center text-[10px]">
              •
            </span>
            Today
          </div>
        </div>
      </div>

      <!-- ── Day detail panel (1 of 3 columns) ── -->
      <div>
        <!--
          v-if shows the panel only when a day is selected.
          v-else shows a placeholder prompt.
        -->
        <UCard v-if="selectedDate">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="font-semibold text-sm">{{ selectedDayLabel }}</p>
                <p class="text-xs text-muted">
                  {{ selectedDayTodos.length }}
                  {{ selectedDayTodos.length === 1 ? 'todo' : 'todos' }}
                </p>
              </div>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                variant="outline"
                @click="openAddForDate"
              >
                Add
              </UButton>
            </div>
          </template>

          <!--
            List the todos for the selected day.
            We show a compact version here (no edit/delete on calendar view)
            but you could also reuse AppTodoItem if you prefer.
          -->
          <div v-if="selectedDayTodos.length > 0" class="space-y-2">
            <div
              v-for="todo in selectedDayTodos"
              :key="todo.id"
              class="flex items-start gap-2 p-2 rounded-lg hover:bg-elevated transition-colors"
            >
              <!-- Complete toggle -->
              <UCheckbox
                :model-value="todo.completed"
                class="mt-0.5 shrink-0"
                @update:model-value="toggleComplete(todo.id)"
              />

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium break-words"
                  :class="{ 'line-through text-muted': todo.completed }"
                >
                  {{ todo.title }}
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1 mt-1">
                  <UBadge
                    v-for="tag in todo.tags"
                    :key="tag"
                    variant="subtle"
                    color="primary"
                    size="xs"
                  >
                    #{{ tag }}
                  </UBadge>
                </div>
              </div>

              <!-- Delete from calendar view -->
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="xs"
                @click="onDelete(todo.id)"
              />
            </div>
          </div>

          <div v-else class="text-sm text-muted text-center py-4">
            No todos due this day.
            <br>
            <UButton
              variant="ghost"
              size="sm"
              class="mt-1"
              @click="openAddForDate"
            >
              Add one
            </UButton>
          </div>
        </UCard>

        <!-- No day selected yet -->
        <UCard v-else>
          <div class="text-center py-8 text-muted">
            <UIcon
              name="i-lucide-calendar-check"
              class="w-10 h-10 mx-auto mb-2 opacity-40"
            />
            <p class="text-sm">Click a day on the calendar to see its todos.</p>
          </div>
        </UCard>

        <!-- ── All upcoming todos (sidebar summary) ── -->
        <UCard class="mt-4">
          <template #header>
            <p class="font-semibold text-sm">Upcoming (next 7 days)</p>
          </template>

          <!--
            Inline computed: we filter todos to show only those due within
            the next 7 days and not yet completed.
            LEARNING NOTE: You can compute values directly in the template
            using JavaScript expressions, but for complex logic it's better
            to use a computed() in <script setup> for readability.
          -->
          <div class="space-y-1.5">
            <template
              v-for="todo in todos
                .filter(t => {
                  if (!t.dueDate || t.completed) return false
                  const due = new Date(t.dueDate + 'T12:00:00')
                  const now = new Date()
                  const diff = (due - now) / 86400000
                  return diff >= -1 && diff <= 7
                })
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 8)"
              :key="todo.id"
            >
              <div
                class="flex items-center gap-2 text-xs cursor-pointer hover:text-primary transition-colors"
                @click="selectedDate = todo.dueDate"
              >
                <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5 shrink-0 text-muted" />
                <span class="truncate flex-1">{{ todo.title }}</span>
                <span class="text-muted shrink-0">{{ todo.dueDate }}</span>
              </div>
            </template>

            <p
              v-if="todos.filter(t => t.dueDate && !t.completed).length === 0"
              class="text-xs text-muted text-center py-2"
            >
              No upcoming todos with due dates.
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- ── Add Todo Modal (pre-filled with selected date) ── -->
    <AppTodoModal
      v-model="isModalOpen"
      :todo="draftTodo"
      @save="onSave"
    />
  </UContainer>
</template>
