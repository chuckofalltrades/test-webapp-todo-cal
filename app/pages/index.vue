<!--
  pages/index.vue — The main Todo List page
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: Nuxt file-based routing

  Any .vue file you create inside the pages/ folder automatically becomes a
  route in your app.  You don't have to configure a router manually.

    pages/index.vue      →  / (the home page)
    pages/calendar.vue   →  /calendar
    pages/about.vue      →  /about

  Nuxt reads the file name and builds the URL from it.  This is called
  "file-based routing" and is one of Nuxt's most powerful conventions.
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
// ─── SEO metadata ────────────────────────────────────────────────────────────
// LEARNING NOTE: useHead() and useSeoMeta() are Nuxt composables for setting
// <head> content (title, meta tags, etc.).  They are reactive, so if you
// change a reactive value they use, the <head> updates automatically.
// These are auto-imported — no import statement needed.
useSeoMeta({
  title: 'Todo List — NuxtTodo',
  description: 'Manage your tasks with tags and due dates.'
})

// ─── State from composable ───────────────────────────────────────────────────
// LEARNING NOTE: Destructuring a composable
//
// useTodos() returns an object with all the things we need.
// We pull out only what this page needs using JS destructuring:
//   const { todos, addTodo } = useTodos()
//
// todos    — the reactive array (useState under the hood)
// allTags  — computed: unique tags across all todos
// addTodo  — function to add a new todo
// etc.
const {
  todos,
  allTags,
  activeCount,
  completedCount,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleComplete,
  clearCompleted
} = useTodos()

// ─── Filter / search state ────────────────────────────────────────────────────
// ref() creates a reactive value.  When it changes, any computed() or template
// that reads it will automatically re-render.
const searchQuery = ref('')        // text the user has typed in the search box
const selectedTag = ref(null)      // tag name being filtered, or null for "all"
const showCompleted = ref(true)    // toggle whether completed todos are visible

// ─── Modal state ─────────────────────────────────────────────────────────────
const isModalOpen = ref(false)
const editingTodo = ref(null) // null = "Add" mode, object = "Edit" mode

// ─── Filtered todos ───────────────────────────────────────────────────────────
// LEARNING NOTE: computed() creates a derived value that automatically updates
// when any of its dependencies (searchQuery, selectedTag, showCompleted, todos)
// change.  This avoids manually calling a "filter" function everywhere.
const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    // 1. Filter by completion visibility
    if (!showCompleted.value && todo.completed) return false

    // 2. Filter by selected tag
    if (selectedTag.value && !todo.tags.includes(selectedTag.value)) return false

    // 3. Filter by search text (case-insensitive match on title or description)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchesTitle = todo.title.toLowerCase().includes(q)
      const matchesDesc = todo.description.toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc) return false
    }

    return true
  })
})

// ─── Open / close modal helpers ──────────────────────────────────────────────

function openAddModal() {
  editingTodo.value = null   // clear editing target → "Add" mode
  isModalOpen.value = true
}

function openEditModal(todo) {
  editingTodo.value = todo   // set editing target → "Edit" mode
  isModalOpen.value = true
}

// ─── Save handler (handles both Add and Edit) ────────────────────────────────

function onSave(formData) {
  if (editingTodo.value) {
    // Edit mode: update the existing todo
    updateTodo(editingTodo.value.id, formData)
  } else {
    // Add mode: create a brand new todo
    addTodo(formData)
  }
  // Modal closes itself via its own emit after calling this
}

// ─── Confirm before deleting ─────────────────────────────────────────────────
function onDelete(id) {
  // A simple browser confirm dialog — good enough for a learning project.
  // A production app would use a custom confirmation modal.
  if (confirm('Delete this todo?')) {
    deleteTodo(id)
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl">

    <!-- ── Page header ── -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">My Todos</h1>
        <!--
          LEARNING NOTE: Template expressions {{ }}
          Anything inside {{ }} is evaluated as JavaScript and inserted as text.
          activeCount and completedCount are computed refs — .value is
          automatically unwrapped in templates.
        -->
        <p class="text-sm text-muted mt-0.5">
          {{ activeCount }} active · {{ completedCount }} completed
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="openAddModal">
        Add Todo
      </UButton>
    </div>

    <!-- ── Search + filter bar ── -->
    <UCard class="mb-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search input -->
        <UInput
          v-model="searchQuery"
          placeholder="Search todos…"
          icon="i-lucide-search"
          class="flex-1"
        />

        <!-- Show/hide completed toggle -->
        <UButton
          :icon="showCompleted ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          variant="outline"
          color="neutral"
          @click="showCompleted = !showCompleted"
        >
          {{ showCompleted ? 'Hide done' : 'Show done' }}
        </UButton>
      </div>

      <!--
        Tag filter chips
        v-if only renders this section if there are any tags at all.
      -->
      <div v-if="allTags.length > 0" class="flex flex-wrap gap-1.5 mt-3">
        <!-- "All" chip to clear the filter -->
        <UBadge
          :variant="selectedTag === null ? 'solid' : 'subtle'"
          color="neutral"
          class="cursor-pointer"
          @click="selectedTag = null"
        >
          All
        </UBadge>

        <!--
          One chip per unique tag.
          Clicking it sets selectedTag — the filteredTodos computed re-runs.
        -->
        <UBadge
          v-for="tag in allTags"
          :key="tag"
          :variant="selectedTag === tag ? 'solid' : 'subtle'"
          color="primary"
          class="cursor-pointer"
          @click="selectedTag = selectedTag === tag ? null : tag"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </UCard>

    <!-- ── Todo list ── -->
    <!--
      LEARNING NOTE: v-if / v-else-if / v-else chain
      Only one branch renders.  Vue checks them in order and renders the first
      truthy one.
    -->
    <div v-if="filteredTodos.length > 0" class="flex flex-col gap-2">
      <!--
        AppTodoItem is our custom component (components/AppTodoItem.vue).
        Nuxt auto-imports it — no import statement needed.

        We bind props with : prefix and listen to emits with @ prefix:
          :todo="todo"         passes the todo object as a prop
          @toggle="..."        listens for the 'toggle' emit
          @edit="..."          listens for the 'edit' emit
          @delete="..."        listens for the 'delete' emit
      -->
      <AppTodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="toggleComplete"
        @edit="openEditModal"
        @delete="onDelete"
      />
    </div>

    <!-- Empty state: no todos match the filter -->
    <div
      v-else-if="todos.length > 0"
      class="text-center py-12 text-muted"
    >
      <UIcon name="i-lucide-filter-x" class="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p>No todos match your current filters.</p>
      <UButton
        variant="ghost"
        color="neutral"
        class="mt-2"
        @click="searchQuery = ''; selectedTag = null; showCompleted = true"
      >
        Clear filters
      </UButton>
    </div>

    <!-- Empty state: no todos at all -->
    <div v-else class="text-center py-12 text-muted">
      <UIcon name="i-lucide-clipboard-list" class="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p>No todos yet. Click <strong>Add Todo</strong> to get started!</p>
    </div>

    <!-- ── Footer actions ── -->
    <div v-if="completedCount > 0" class="mt-4 text-right">
      <UButton
        variant="ghost"
        color="error"
        size="sm"
        icon="i-lucide-trash-2"
        @click="clearCompleted"
      >
        Clear {{ completedCount }} completed
      </UButton>
    </div>

    <!-- ── Add/Edit Modal ── -->
    <!--
      v-model="isModalOpen" is shorthand for:
        :model-value="isModalOpen"
        @update:model-value="isModalOpen = $event"

      :todo="editingTodo" passes the todo being edited (or null for "add" mode).
      @save="onSave" handles the form submission.
    -->
    <AppTodoModal
      v-model="isModalOpen"
      :todo="editingTodo"
      @save="onSave"
    />
  </UContainer>
</template>
