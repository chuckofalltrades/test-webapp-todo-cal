<script setup lang="ts">
import type { TodoItem } from '~/types/todo'

/**
 * Simple calendar grid built from native Date + computed values.
 * It highlights day cells with due todos and lists tasks for selected day.
 */
const props = defineProps<{
  todos: TodoItem[]
}>()

const monthCursor = ref(new Date())
const selectedDate = ref<string>('')

const monthLabel = computed(() => {
  return monthCursor.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
})

const monthCells = computed(() => {
  const year = monthCursor.value.getFullYear()
  const month = monthCursor.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const firstWeekDay = firstDay.getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ date: string, day: number, inMonth: boolean }> = []

  // Add leading days from previous month for calendar alignment.
  for (let i = 0; i < firstWeekDay; i++) {
    cells.push({
      date: '',
      day: 0,
      inMonth: false
    })
  }

  // Add real days in current month.
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    cells.push({
      date: date.toISOString().split('T')[0] || '',
      day,
      inMonth: true
    })
  }

  return cells
})

const todosByDate = computed(() => {
  const map = new Map<string, TodoItem[]>()

  for (const todo of props.todos) {
    if (!todo.dueDate) {
      continue
    }

    const existing = map.get(todo.dueDate) || []
    existing.push(todo)
    map.set(todo.dueDate, existing)
  }

  return map
})

const selectedDateTodos = computed(() => {
  if (!selectedDate.value) {
    return []
  }

  return todosByDate.value.get(selectedDate.value) || []
})

const moveMonth = (offset: number) => {
  const next = new Date(monthCursor.value)
  next.setMonth(next.getMonth() + offset)
  monthCursor.value = next
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">
          Calendar View
        </h2>

        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="soft"
            icon="i-lucide-chevron-left"
            @click="moveMonth(-1)"
          />

          <span class="text-sm font-medium min-w-40 text-center">{{ monthLabel }}</span>

          <UButton
            size="xs"
            variant="soft"
            icon="i-lucide-chevron-right"
            @click="moveMonth(1)"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid grid-cols-7 gap-2 text-xs text-muted">
        <div
          v-for="weekday in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="weekday"
          class="text-center font-medium"
        >
          {{ weekday }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="cell in monthCells"
          :key="`${monthLabel}-${cell.day}-${cell.date}`"
          class="min-h-16 rounded-md border border-default p-2 text-left"
          :class="[
            !cell.inMonth ? 'bg-elevated/20 opacity-50 cursor-not-allowed' : 'hover:bg-elevated/40',
            selectedDate === cell.date ? 'ring-2 ring-primary' : ''
          ]"
          :disabled="!cell.inMonth"
          @click="selectedDate = cell.date"
        >
          <div class="text-xs">
            {{ cell.day || '' }}
          </div>
          <div
            v-if="cell.date && (todosByDate.get(cell.date)?.length || 0) > 0"
            class="mt-1"
          >
            <UBadge
              size="sm"
              color="primary"
              variant="solid"
            >
              {{ todosByDate.get(cell.date)?.length }}
            </UBadge>
          </div>
        </button>
      </div>

      <USeparator />

      <div>
        <h3 class="font-medium mb-2">
          {{ selectedDate ? `Todos due on ${selectedDate}` : 'Select a day to inspect todos' }}
        </h3>

        <UAlert
          v-if="selectedDate && selectedDateTodos.length === 0"
          color="neutral"
          variant="subtle"
          title="No todos due on selected date"
        />

        <ul class="space-y-2">
          <li
            v-for="todo in selectedDateTodos"
            :key="todo.id"
            class="rounded-md border border-default p-2"
          >
            <p
              class="font-medium"
              :class="todo.completed ? 'line-through text-muted' : ''"
            >
              {{ todo.title }}
            </p>
            <div class="flex gap-2 mt-1">
              <UBadge
                v-for="tag in todo.tags"
                :key="`${todo.id}-calendar-${tag}`"
                variant="soft"
              >
                #{{ tag }}
              </UBadge>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>
