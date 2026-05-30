<!--
  app.vue — The root component of the entire application
  ─────────────────────────────────────────────────────────────────────────────
  LEARNING NOTE: app.vue vs layouts

  app.vue is the outermost shell of your Nuxt app.  It wraps every page.
  You can also create layouts in the layouts/ folder for more flexibility
  (e.g. a different shell for authenticated vs. public pages).

  For a simple app like this, app.vue is sufficient.

  <NuxtPage /> is where the current page's content gets rendered.
  When you navigate to /calendar, Nuxt swaps in pages/calendar.vue here.
  ─────────────────────────────────────────────────────────────────────────────

  LEARNING NOTE: UApp

  UApp is Nuxt UI's required root component.  It sets up:
    - The design system (colors, fonts)
    - Toast notifications
    - Modal/dialog portals
    - Dark mode support

  Always wrap your whole app in <UApp>.
  ─────────────────────────────────────────────────────────────────────────────
-->

<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'NuxtTodo',
  description: 'A Vue 3 + Nuxt 3 + Nuxt UI todo app with tagging and calendar view.'
})
</script>

<template>
  <!--
    UApp must wrap everything.
    The `tooltip` and `toaster` components inside are optional Nuxt UI
    providers — they let any component trigger toasts / tooltips without
    needing to inject them manually.
  -->
  <UApp>

    <!--
      UHeader — Nuxt UI's sticky top navigation bar.
      It has named slots:
        #left   — left side content (logo, nav links)
        #right  — right side content (buttons, user menu)
    -->
    <UHeader>
      <template #left>
        <!-- App name / logo — NuxtLink navigates to home without reload -->
        <NuxtLink to="/" class="font-bold text-lg tracking-tight flex items-center gap-2">
          <UIcon name="i-lucide-check-square" class="w-5 h-5 text-primary" />
          NuxtTodo
        </NuxtLink>
      </template>

      <!-- Center: navigation links -->
      <template #body>
        <!--
          LEARNING NOTE: UNavigationMenu
          This renders a horizontal nav bar.
          Each item has a `label` and `to` (the route path).
          NuxtLink powers the navigation — no full page reload.
        -->
        <UNavigationMenu
          :items="[
            { label: 'Todos', to: '/', icon: 'i-lucide-list-todo' },
            { label: 'Calendar', to: '/calendar', icon: 'i-lucide-calendar-days' }
          ]"
        />
      </template>

      <template #right>
        <!--
          UColorModeButton — Automatically switches between light and dark mode.
          Nuxt UI handles all the dark mode CSS switching via Tailwind's `dark:`
          variant.  No extra configuration needed!
        -->
        <UColorModeButton />
      </template>
    </UHeader>

    <!--
      UMain wraps the page content.
      It adds the correct top padding to account for the fixed header height.
    -->
    <UMain>
      <!--
        NuxtPage renders the current page component.
        Nuxt automatically maps the URL to the right file in pages/.
      -->
      <NuxtPage />
    </UMain>

    <!-- Simple footer -->
    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with
          <a href="https://nuxt.com" target="_blank" class="underline hover:text-primary">Nuxt</a>
          +
          <a href="https://ui.nuxt.com" target="_blank" class="underline hover:text-primary">Nuxt UI</a>
          · A learning project
        </p>
      </template>
      <template #right>
        <p class="text-xs text-muted">
          Data saved in your browser's localStorage
        </p>
      </template>
    </UFooter>
  </UApp>
</template>

