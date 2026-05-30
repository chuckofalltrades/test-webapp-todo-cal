# 04 — Nuxt UI Guide

**Nuxt UI v4** is a component library built on top of:
- **Tailwind CSS v4** — utility-class styling
- **Reka UI** (formerly Radix Vue) — headless, accessible component primitives
- **Vite** — fast build tooling

It gives you polished, accessible UI components that work in light and dark mode out of the box.

---

## How Nuxt UI components are used

All Nuxt UI components start with `U`:

```vue
<UButton @click="doSomething">Click me</UButton>
<UInput v-model="search" placeholder="Search…" />
<UCard>Card content here</UCard>
<UBadge color="primary">New</UBadge>
```

No import needed — Nuxt auto-imports them.

---

## Icon system

Nuxt UI uses **Iconify** for icons.  This project has two icon collections installed:
- `lucide` — general purpose icons (prefix: `i-lucide-`)
- `simple-icons` — brand logos (prefix: `i-simple-icons-`)

Usage:
```vue
<UIcon name="i-lucide-check" />
<UButton icon="i-lucide-plus">Add</UButton>
```

Browse icons at: https://icones.js.org
(Filter by "lucide" or "simple-icons" to find names.)

Icon name format: `i-{collection}-{icon-name}`
```
i-lucide-trash-2       →  trash icon with line through it
i-lucide-calendar      →  calendar icon
i-lucide-check-square  →  checkmark in a square
```

---

## Key components used in this app

### `UApp`
Must wrap the entire app.  Sets up design tokens, dark mode, toast portals.

```vue
<UApp>
  <!-- everything else goes here -->
</UApp>
```

---

### `UHeader` / `UFooter` / `UMain`
Layout components for the page shell.

```vue
<UHeader>
  <template #left><!-- logo/nav --></template>
  <template #body><!-- center nav --></template>
  <template #right><!-- buttons --></template>
</UHeader>
<UMain>
  <NuxtPage />
</UMain>
<UFooter>
  <template #left><!-- copyright --></template>
</UFooter>
```

---

### `UContainer`
Constrains content width and adds horizontal padding.

```vue
<UContainer class="py-8 max-w-3xl">
  <!-- page content -->
</UContainer>
```

---

### `UButton`

```vue
<!-- Basic -->
<UButton>Click me</UButton>

<!-- With icon -->
<UButton icon="i-lucide-plus">Add Todo</UButton>

<!-- Icon only -->
<UButton icon="i-lucide-trash-2" aria-label="Delete" />

<!-- Variants -->
<UButton variant="solid">Solid (default)</UButton>
<UButton variant="outline">Outline</UButton>
<UButton variant="ghost">Ghost</UButton>
<UButton variant="subtle">Subtle</UButton>

<!-- Colors -->
<UButton color="primary">Primary</UButton>
<UButton color="neutral">Neutral</UButton>
<UButton color="error">Danger</UButton>

<!-- Sizes -->
<UButton size="xs">Extra small</UButton>
<UButton size="sm">Small</UButton>
<UButton size="md">Medium (default)</UButton>
<UButton size="lg">Large</UButton>
<UButton size="xl">Extra large</UButton>

<!-- Disabled -->
<UButton :disabled="!canSave">Save</UButton>
```

---

### `UInput` / `UTextarea`

```vue
<UInput v-model="text" placeholder="Type here…" />
<UInput v-model="text" type="date" />
<UInput v-model="search" icon="i-lucide-search" />
<UTextarea v-model="notes" :rows="3" placeholder="Notes…" />
```

---

### `UFormField` (wraps inputs with a label)

```vue
<UFormField label="Title" required>
  <UInput v-model="title" />
</UFormField>
```

---

### `UCheckbox`

```vue
<!-- Uncontrolled -->
<UCheckbox v-model="isChecked" label="Done" />

<!-- Controlled (using model-value + event) -->
<UCheckbox
  :model-value="todo.completed"
  @update:model-value="toggleComplete(todo.id)"
/>
```

---

### `UBadge`

```vue
<UBadge>Default</UBadge>
<UBadge color="primary" variant="solid">Solid</UBadge>
<UBadge color="primary" variant="subtle">Subtle</UBadge>
<UBadge color="error" variant="outline">Error outline</UBadge>
<UBadge icon="i-lucide-calendar">With icon</UBadge>
```

---

### `UCard`

```vue
<UCard>
  <!-- Default slot = card body -->
  Body content here
</UCard>

<UCard>
  <template #header>
    <!-- Rendered above body with border below -->
    Card title
  </template>

  Body content here

  <template #footer>
    <!-- Rendered below body with border above -->
    Footer actions
  </template>
</UCard>
```

---

### `UModal`

```vue
<script setup>
const isOpen = ref(false)
</script>

<template>
  <UButton @click="isOpen = true">Open Modal</UButton>

  <UModal v-model="isOpen" title="My Dialog">
    <template #body>
      <!-- Modal content -->
      <p>Hello from the modal!</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
        <UButton @click="save">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
```

`v-model` on `UModal` controls visibility.  The modal closes when you:
- Click outside of it
- Press Escape
- Set the bound value to `false`

---

### `UNavigationMenu`

```vue
<UNavigationMenu
  :items="[
    { label: 'Home', to: '/', icon: 'i-lucide-home' },
    { label: 'About', to: '/about', icon: 'i-lucide-info' }
  ]"
/>
```

Automatically highlights the active route with Nuxt's router.

---

### `UColorModeButton`

```vue
<UColorModeButton />
```

That's it!  Nuxt UI handles all the dark/light mode switching logic automatically
using Tailwind's `dark:` variant.  The user's preference is saved in localStorage.

---

## Tailwind CSS utility classes

Tailwind replaces traditional CSS with small utility classes.  Instead of writing:

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
}
```

You write:
```html
<div class="flex flex-col gap-4 p-4 rounded-lg">
```

### Common utilities used in this project

| Class | CSS |
|-------|-----|
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `gap-2` | `gap: 8px` (2 × 4px base unit) |
| `p-4` | `padding: 16px` |
| `px-4` | `padding-left/right: 16px` |
| `py-8` | `padding-top/bottom: 32px` |
| `mt-2` | `margin-top: 8px` |
| `text-sm` | `font-size: 0.875rem` |
| `font-medium` | `font-weight: 500` |
| `rounded-lg` | `border-radius: 8px` |
| `w-full` | `width: 100%` |
| `max-w-3xl` | `max-width: 48rem` |
| `grid` | `display: grid` |
| `grid-cols-7` | `grid-template-columns: repeat(7, 1fr)` |
| `hidden` | `display: none` |
| `opacity-60` | `opacity: 0.6` |
| `line-through` | `text-decoration: line-through` |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `cursor-pointer` | `cursor: pointer` |
| `transition-colors` | adds smooth CSS color transitions |

### Responsive prefixes

```html
<!-- Full width on mobile, 3 columns on large screens -->
<div class="grid grid-cols-1 lg:grid-cols-3">
```

Breakpoints:
- `sm:` — ≥640px
- `md:` — ≥768px
- `lg:` — ≥1024px
- `xl:` — ≥1280px
- `2xl:` — ≥1536px

### Dark mode

```html
<!-- Gray text normally, white text in dark mode -->
<p class="text-gray-600 dark:text-white">Hello</p>
```

Nuxt UI handles toggling the `dark` class on `<html>` for you.

---

## Slots — how components accept custom content

Slots are "holes" in a component where you can insert arbitrary content.

**Default slot:**
```vue
<!-- Component definition -->
<template>
  <div class="card">
    <slot />  <!-- content goes here -->
  </div>
</template>

<!-- Usage -->
<MyCard>Hello!</MyCard>
<!-- renders: <div class="card">Hello!</div> -->
```

**Named slots:**
```vue
<!-- Component definition -->
<template>
  <div>
    <header><slot name="header" /></header>
    <main><slot /></main>   <!-- default slot -->
    <footer><slot name="footer" /></footer>
  </div>
</template>

<!-- Usage -->
<MyCard>
  <template #header>My Title</template>
  Main content
  <template #footer>Footer text</template>
</MyCard>
```

The `#header` shorthand is equivalent to `v-slot:header`.
You see this extensively with `UCard`, `UHeader`, `UModal`, etc.
