<!--
  AppTodoModal.vue — Modal dialog for adding and editing todos
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: v-model on custom components

  In HTML, v-model on <input> binds a value two-ways:
    <input v-model="myText" />  ↔  reads/writes myText when user types

  With custom components, v-model works through a "modelValue" prop and an
  "update:modelValue" emit.  Nuxt UI's UModal uses this pattern:
    :model-value="isOpen"           ← parent passes the "open" boolean
    @update:model-value="isOpen = $event"  ← component fires this to close itself

  You can also write this as: v-model="isOpen"
  Both are equivalent — v-model is just a shorthand for the above.
  ─────────────────────────────────────────────────────────────────────────────

  LEARNING NOTE: Props with defaults

  A prop can have a `default` value so you don't have to pass it every time.
  Here `todo` defaults to null — when adding a new todo, the parent doesn't
  pass a todo object, so we get null and show an empty form.
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
  /** Controls whether the modal is visible */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * When editing, the parent passes the existing todo object.
   * When adding, this is null and we show a blank form.
   */
  todo: {
    type: Object,
    default: null
  }
})

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits([
  'update:modelValue', // Required for v-model to work on this component
  'save'              // Fired when the user submits the form
])

// ─── Form state ──────────────────────────────────────────────────────────────
// LEARNING NOTE: ref() creates a reactive "box" around a value.
// You read/write the value via `.value` in script, but Vue's template
// automatically unwraps it so you just write {{ title }} there.

const title = ref('')
const description = ref('')
const dueDate = ref('')
const tags = ref([])       // array of tag strings currently on this todo
const tagInput = ref('')   // the text the user is typing into the tag input

// ─── Watch for prop changes ───────────────────────────────────────────────────
// LEARNING NOTE: watch() with { immediate: true }
// Normally watch() only runs when the value CHANGES after mount.
// With immediate: true, it also runs once right away when the component mounts.
//
// We watch `props.todo` so that when the parent swaps out which todo is being
// edited, we repopulate the form fields.

watch(
  () => props.todo, // arrow function to watch a specific prop
  (newTodo) => {
    if (newTodo) {
      // Editing mode: fill form with the existing todo's values
      title.value = newTodo.title
      description.value = newTodo.description || ''
      dueDate.value = newTodo.dueDate || ''
      tags.value = [...newTodo.tags] // copy the array (avoid mutating the original)
    } else {
      // Adding mode: clear everything
      title.value = ''
      description.value = ''
      dueDate.value = ''
      tags.value = []
    }
    tagInput.value = ''
  },
  { immediate: true }
)

// ─── Computed ────────────────────────────────────────────────────────────────
/** Dialog title changes based on whether we are adding or editing */
const modalTitle = computed(() => props.todo ? 'Edit Todo' : 'Add Todo')

/** Prevent saving if the title is empty */
const canSave = computed(() => title.value.trim().length > 0)

// ─── Tag management ──────────────────────────────────────────────────────────

/**
 * Add the current tagInput text as a tag.
 * Called when the user presses Enter in the tag input or clicks "Add".
 */
function addTag() {
  const cleaned = tagInput.value.trim().toLowerCase()
  // Don't add blank tags or duplicates
  if (cleaned && !tags.value.includes(cleaned)) {
    tags.value.push(cleaned)
  }
  tagInput.value = ''
}

/**
 * Remove a tag by its index in the array.
 * @param {number} index
 */
function removeTag(index) {
  tags.value.splice(index, 1)
}

/**
 * If the user types a space or comma in the tag field, treat it as
 * "finish this tag and start the next one".
 */
function onTagKeydown(event) {
  if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
    event.preventDefault() // don't add a space/comma to the input
    addTag()
  }
  // Backspace on empty input removes the last tag
  if (event.key === 'Backspace' && tagInput.value === '' && tags.value.length > 0) {
    tags.value.pop()
  }
}

// ─── Form submission ──────────────────────────────────────────────────────────

function handleSave() {
  if (!canSave.value) return

  // Emit the 'save' event with the form data.
  // The parent (index.vue) listens: @save="onSave"
  emit('save', {
    title: title.value.trim(),
    description: description.value.trim(),
    dueDate: dueDate.value || null,
    tags: [...tags.value]
  })

  // Close the modal
  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <!--
    UModal — Nuxt UI's accessible modal component.

    :model-value / @update:model-value  wire up the open/close state.
    This is what makes v-model work on UModal.

    The `title` prop sets the modal header text.
  -->
  <UModal
    :model-value="modelValue"
    :title="modalTitle"
    @update:model-value="handleClose"
  >
    <!--
      The default slot is the modal body content.
      We wrap everything in a form so the user can press Enter to submit.
    -->
    <template #body>
      <!--
        LEARNING NOTE: @submit.prevent
        .prevent is a Vue event modifier — it automatically calls
        event.preventDefault() to stop the browser from doing a full page
        reload (the default form submit behavior).
      -->
      <form class="space-y-4" @submit.prevent="handleSave">

        <!-- Title field (required) -->
        <UFormField label="Title" required>
          <UInput
            v-model="title"
            placeholder="What needs to be done?"
            autofocus
            class="w-full"
          />
        </UFormField>

        <!-- Description field (optional) -->
        <UFormField label="Description">
          <UTextarea
            v-model="description"
            placeholder="Add some notes (optional)…"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <!-- Due date field (optional) -->
        <UFormField label="Due Date">
          <UInput
            v-model="dueDate"
            type="date"
            class="w-full"
          />
        </UFormField>

        <!-- Tags field -->
        <UFormField label="Tags">
          <!--
            Tag chips displayed above the input
            v-for renders one UBadge per tag in the tags array.
          -->
          <div class="flex flex-wrap gap-1.5 mb-2">
            <UBadge
              v-for="(tag, index) in tags"
              :key="tag"
              color="primary"
              variant="subtle"
              class="cursor-pointer"
              @click="removeTag(index)"
            >
              #{{ tag }}
              <!-- × button inside the badge to remove it -->
              <UIcon name="i-lucide-x" class="ml-1 w-3 h-3" />
            </UBadge>
          </div>

          <!-- Tag input -->
          <div class="flex gap-2">
            <UInput
              v-model="tagInput"
              placeholder="Type a tag and press Enter…"
              class="flex-1"
              @keydown="onTagKeydown"
            />
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              icon="i-lucide-plus"
              :disabled="!tagInput.trim()"
              @click="addTag"
            >
              Add
            </UButton>
          </div>
          <p class="text-xs text-muted mt-1">
            Press Enter, comma, or space to add a tag. Click a tag to remove it.
          </p>
        </UFormField>
      </form>
    </template>

    <!--
      Footer slot — action buttons
      :disabled prevents saving when title is empty (canSave computed prop)
    -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          :disabled="!canSave"
          @click="handleSave"
        >
          {{ todo ? 'Save Changes' : 'Add Todo' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
