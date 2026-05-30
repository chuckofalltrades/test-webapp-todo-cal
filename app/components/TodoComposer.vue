<script setup lang="ts">
/**
 * Input form for creating todos.
 * Demonstrates v-model, emits, computed validation, and simple tag parsing.
 */
const emit = defineEmits<{
  submit: [payload: { title: string, dueDate: string, tags: string[] }]
}>()

const title = ref('')
const dueDate = ref('')
const tagInput = ref('')

// Split comma-separated tags and normalize whitespace/casing.
const parsedTags = computed(() => {
  return tagInput.value
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean)
})

const canSubmit = computed(() => title.value.trim().length > 0)

const submit = () => {
  if (!canSubmit.value) {
    return
  }

  emit('submit', {
    title: title.value,
    dueDate: dueDate.value,
    tags: parsedTags.value
  })

  // Reset fields after successful emit.
  title.value = ''
  dueDate.value = ''
  tagInput.value = ''
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">
        Add a Todo
      </h2>
      <p class="text-sm text-muted mt-1">
        Try adding tags like <code>work, urgent, learning</code>.
      </p>
    </template>

    <div class="space-y-4">
      <UFormField label="Task title" required>
        <UInput
          v-model="title"
          placeholder="Example: Build Nuxt practice project"
          icon="i-lucide-list-todo"
        />
      </UFormField>

      <UFormField label="Due date (optional)">
        <UInput
          v-model="dueDate"
          type="date"
          icon="i-lucide-calendar-days"
        />
      </UFormField>

      <UFormField label="Tags (comma separated)">
        <UInput
          v-model="tagInput"
          placeholder="work, urgent, frontend"
          icon="i-lucide-tag"
        />
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in parsedTags"
          :key="tag"
          color="primary"
          variant="soft"
        >
          #{{ tag }}
        </UBadge>
      </div>

      <UButton
        color="primary"
        icon="i-lucide-plus"
        :disabled="!canSubmit"
        @click="submit"
      >
        Add todo
      </UButton>
    </div>
  </UCard>
</template>
