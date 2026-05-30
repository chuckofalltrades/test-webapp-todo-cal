<script setup lang="ts">
import type { TodoItem } from '~/types/todo'

/**
 * List view with filtering by status and selected tags.
 */
const props = defineProps<{
  todos: TodoItem[]
}>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()

const statusFilter = ref<'all' | 'open' | 'done'>('all')
const selectedTag = ref<string>('all')

const allTags = computed(() => {
  const tags = new Set<string>()

  for (const todo of props.todos) {
    for (const tag of todo.tags) {
      tags.add(tag)
    }
  }

  return ['all', ...Array.from(tags).sort()]
})

const filteredTodos = computed(() => {
  return props.todos.filter((todo) => {
    const matchesStatus = statusFilter.value === 'all'
      || (statusFilter.value === 'open' && !todo.completed)
      || (statusFilter.value === 'done' && todo.completed)

    const matchesTag = selectedTag.value === 'all' || todo.tags.includes(selectedTag.value)

    return matchesStatus && matchesTag
  })
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            Todo List
          </h2>
          <p class="text-sm text-muted mt-1">
            Filter by status and tags to explore reactive computed values.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UFormField label="Status">
            <USelect
              v-model="statusFilter"
              :items="[
                { label: 'All', value: 'all' },
                { label: 'Open', value: 'open' },
                { label: 'Done', value: 'done' }
              ]"
              class="w-36"
            />
          </UFormField>

          <UFormField label="Tag">
            <USelect
              v-model="selectedTag"
              :items="allTags.map(tag => ({ label: tag === 'all' ? 'All tags' : `#${tag}`, value: tag }))"
              class="w-44"
            />
          </UFormField>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <UAlert
        v-if="filteredTodos.length === 0"
        color="neutral"
        variant="subtle"
        icon="i-lucide-info"
        title="No todos match this filter"
        description="Try switching status or tag filters."
      />

      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="rounded-lg border border-default p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-2">
            <p
              class="font-medium"
              :class="todo.completed ? 'line-through text-muted' : ''"
            >
              {{ todo.title }}
            </p>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in todo.tags"
                :key="`${todo.id}-${tag}`"
                color="primary"
                variant="subtle"
              >
                #{{ tag }}
              </UBadge>

              <UBadge
                v-if="todo.dueDate"
                color="warning"
                variant="soft"
                icon="i-lucide-calendar"
              >
                {{ todo.dueDate }}
              </UBadge>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton
              size="xs"
              color="success"
              variant="soft"
              icon="i-lucide-check"
              @click="emit('toggle', todo.id)"
            >
              {{ todo.completed ? 'Undo' : 'Done' }}
            </UButton>

            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              @click="emit('remove', todo.id)"
            >
              Remove
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
