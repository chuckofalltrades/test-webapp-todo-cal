<!--
  AppCalendar.vue — A month-grid calendar that shows todo due dates
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: Building a calendar from scratch with computed properties

  This component demonstrates how to use JavaScript's Date object together
  with Vue's computed() to build a dynamic calendar grid entirely in code —
  no external calendar library needed.

  Key concepts shown here:
    - computed() for derived data structures (the day grid)
    - $emit for communicating selected dates up to the parent
    - Template slots (#default) for customizable day cells
    - CSS Grid via Tailwind for the 7-column calendar layout
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
  /**
   * A function the parent provides to ask "how many todos are on this date?"
   * This is called a "render prop" pattern — we receive a function as a prop.
   * @type {(dateStr: string) => object[]}
   */
  getTodosForDate: {
    type: Function,
    required: true
  },
  /** The currently selected date (YYYY-MM-DD string), or null */
  selectedDate: {
    type: String,
    default: null
  }
})

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits(['select-date'])

// ─── Reactive state ───────────────────────────────────────────────────────────
// We track which year + month the user is currently viewing.
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth()) // 0 = January, 11 = December

// ─── Computed: calendar metadata ─────────────────────────────────────────────

/** Human-readable "June 2025" label for the calendar header */
const monthLabel = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(viewYear.value, viewMonth.value, 1))
})

/** Today's date as YYYY-MM-DD for highlighting */
const todayStr = computed(() => new Date().toISOString().slice(0, 10))

/**
 * Build the array of day cells for the calendar grid.
 *
 * A calendar month grid has 7 columns (Sun–Sat) and up to 6 rows.
 * We need to:
 *  1. Find what day of the week the 1st falls on (to add leading empty cells)
 *  2. Find how many days are in the month
 *  3. Optionally add trailing empty cells to complete the last row
 *
 * Each cell is either:
 *   { empty: true }                   — a blank cell before the 1st or after the last
 *   { date: "2025-06-15", day: 15, ... } — a real day cell
 */
const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value

  // new Date(year, month, 0).getDate() gives the last day of the *previous* month.
  // new Date(year, month + 1, 0).getDate() gives the last day of the *current* month.
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // getDay() returns 0 (Sunday) through 6 (Saturday)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const cells = []

  // Add leading empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ empty: true })
  }

  // Add a cell for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Build the YYYY-MM-DD string
    const month2 = String(month + 1).padStart(2, '0') // "06"
    const day2 = String(day).padStart(2, '0')         // "05"
    const dateStr = `${year}-${month2}-${day2}`        // "2025-06-05"

    const todosOnDay = props.getTodosForDate(dateStr)

    cells.push({
      empty: false,
      day,
      dateStr,
      isToday: dateStr === todayStr.value,
      isSelected: dateStr === props.selectedDate,
      todos: todosOnDay,
      hasCompleted: todosOnDay.some(t => t.completed),
      hasIncomplete: todosOnDay.some(t => !t.completed)
    })
  }

  // Pad trailing cells so the grid always ends on a Saturday
  const remainder = cells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < (7 - remainder); i++) {
      cells.push({ empty: true })
    }
  }

  return cells
})

// ─── Navigation ──────────────────────────────────────────────────────────────

/** Go to the previous month */
function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

/** Go to the next month */
function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

/** Jump back to the current month */
function goToToday() {
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
}

// ─── Day selection ────────────────────────────────────────────────────────────

function selectDay(cell) {
  if (cell.empty) return
  emit('select-date', cell.dateStr)
}
</script>

<template>
  <UCard>
    <!-- ── Calendar header: navigation ── -->
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <!-- Previous month button -->
        <UButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          color="neutral"
          aria-label="Previous month"
          @click="prevMonth"
        />

        <!-- Month/year label, clickable to jump to today -->
        <div class="text-center">
          <h2 class="font-semibold text-base">{{ monthLabel }}</h2>
        </div>

        <!-- Next month button -->
        <div class="flex gap-1">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            @click="goToToday"
          >
            Today
          </UButton>
          <UButton
            icon="i-lucide-chevron-right"
            variant="ghost"
            color="neutral"
            aria-label="Next month"
            @click="nextMonth"
          />
        </div>
      </div>
    </template>

    <!-- ── Day-of-week header row ── -->
    <!--
      CSS Grid with 7 equal columns.
      Tailwind class: grid-cols-7 → grid-template-columns: repeat(7, minmax(0, 1fr))
    -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="dayName in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
        :key="dayName"
        class="text-center text-xs font-medium text-muted py-1"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- ── Day cells grid ── -->
    <!--
      Each cell is either an empty placeholder (before the 1st or after the last)
      or a clickable day with todo indicators.
    -->
    <div class="grid grid-cols-7 gap-px">
      <div
        v-for="(cell, index) in calendarDays"
        :key="index"
        class="min-h-[60px] p-1 rounded cursor-pointer transition-colors"
        :class="[
          cell.empty
            ? 'cursor-default'
            : 'hover:bg-elevated',
          cell.isToday && !cell.empty
            ? 'ring-2 ring-primary ring-inset'
            : '',
          cell.isSelected && !cell.empty
            ? 'bg-primary/10'
            : ''
        ]"
        @click="selectDay(cell)"
      >
        <!-- Empty cells show nothing -->
        <template v-if="!cell.empty">
          <!-- Day number -->
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full"
              :class="cell.isToday ? 'bg-primary text-white' : ''"
            >
              {{ cell.day }}
            </span>
          </div>

          <!--
            Todo count indicator dots.
            We show colored dots: green for completed, yellow for incomplete.
            v-if only renders the dots section if there are any todos on that day.
          -->
          <div v-if="cell.todos.length > 0" class="mt-1 flex flex-wrap gap-0.5">
            <!--
              Show up to 3 dots and then a "+N more" indicator.
              Math.min() ensures we don't try to show more dots than there are todos.
            -->
            <span
              v-for="n in Math.min(cell.todos.length, 3)"
              :key="n"
              class="w-1.5 h-1.5 rounded-full"
              :class="cell.todos[n - 1]?.completed ? 'bg-success' : 'bg-primary'"
            />
            <span
              v-if="cell.todos.length > 3"
              class="text-[9px] text-muted leading-none"
            >
              +{{ cell.todos.length - 3 }}
            </span>
          </div>

          <!-- Count label for accessibility / clarity -->
          <div v-if="cell.todos.length > 0" class="mt-0.5">
            <span class="text-[10px] text-muted">
              {{ cell.todos.length }} {{ cell.todos.length === 1 ? 'todo' : 'todos' }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </UCard>
</template>
