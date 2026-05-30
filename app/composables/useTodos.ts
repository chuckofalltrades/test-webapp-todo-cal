import type { TodoItem } from '~/types/todo'

const STORAGE_KEY = 'nuxt-ui-todo-demo-items'

/**
 * Central place for Todo state.
 * Nuxt auto-imports this composable so page/components can call useTodos() directly.
 */
export const useTodos = () => {
  // useState keeps this reactive across the whole app.
  const todos = useState<TodoItem[]>('todos', () => [])

  /** Load items from localStorage once on client side. */
  const loadFromStorage = () => {
    if (!import.meta.client) {
      return
    }

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved) as TodoItem[]
      todos.value = parsed
    } catch {
      // If data is corrupted we fall back to an empty list.
      todos.value = []
    }
  }

  /** Save items after every change so refresh keeps data. */
  const saveToStorage = () => {
    if (!import.meta.client) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
  }

  const addTodo = (title: string, dueDate: string, tags: string[]) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      return
    }

    const uniqueTags = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))]

    todos.value.unshift({
      id: Date.now(),
      title: cleanTitle,
      dueDate,
      tags: uniqueTags,
      completed: false,
      createdAt: new Date().toISOString()
    })

    saveToStorage()
  }

  const toggleComplete = (id: number) => {
    const todo = todos.value.find(item => item.id === id)
    if (!todo) {
      return
    }

    todo.completed = !todo.completed
    saveToStorage()
  }

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(item => item.id !== id)
    saveToStorage()
  }

  return {
    todos,
    loadFromStorage,
    addTodo,
    toggleComplete,
    removeTodo
  }
}
