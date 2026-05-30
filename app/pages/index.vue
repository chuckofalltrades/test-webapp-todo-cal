<script setup lang="ts">
/**
 * Main demo page.
 * This file connects composable state + UI components to show:
 * - Vue reactivity (ref/computed)
 * - Nuxt composables (useState through useTodos)
 * - Nuxt UI components for polished UI quickly
 */
const {
  todos,
  loadFromStorage,
  addTodo,
  toggleComplete,
  removeTodo
} = useTodos()

const activeView = ref<'list' | 'calendar'>('list')

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(todo => todo.completed).length
  const open = total - completed

  return {
    total,
    completed,
    open
  }
})

onMounted(() => {
  loadFromStorage()
})
</script>

<template>
  <div class="space-y-6">
    <UPageHero
      title="Nuxt + Vue + Nuxt UI Learning Todo"
      description="A beginner-friendly demo showing component-based development, reactive state, and a polished UI with minimal code."
    >
      <template #links>
        <div class="flex flex-wrap gap-2">
          <UBadge
            color="primary"
            variant="soft"
          >
            Total: {{ stats.total }}
          </UBadge>
          <UBadge
            color="warning"
            variant="soft"
          >
            Open: {{ stats.open }}
          </UBadge>
          <UBadge
            color="success"
            variant="soft"
          >
            Done: {{ stats.completed }}
          </UBadge>
        </div>
      </template>
    </UPageHero>

    <TodoComposer @submit="addTodo($event.title, $event.dueDate, $event.tags)" />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            Choose a view
          </h2>

          <UButtonGroup>
            <UButton
              :variant="activeView === 'list' ? 'solid' : 'soft'"
              icon="i-lucide-list"
              @click="activeView = 'list'"
            >
              List
            </UButton>
            <UButton
              :variant="activeView === 'calendar' ? 'solid' : 'soft'"
              icon="i-lucide-calendar"
              @click="activeView = 'calendar'"
            >
              Calendar
            </UButton>
          </UButtonGroup>
        </div>
      </template>

      <p class="text-sm text-muted">
        This toggle demonstrates conditional rendering in Vue with a shared reactive state.
      </p>
    </UCard>

    <TodoList
      v-if="activeView === 'list'"
      :todos="todos"
      @toggle="toggleComplete"
      @remove="removeTodo"
    />

    <TodoCalendar
      v-else
      :todos="todos"
    />
  </div>
</template>
