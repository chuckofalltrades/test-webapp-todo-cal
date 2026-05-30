<script setup lang="ts">
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

const title = 'Nuxt Todo + Calendar Learning Demo'
const description = 'Hands-on demo app for learning Vue, Nuxt, and Nuxt UI through a todo list with tags and calendar view.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <div class="flex items-center gap-2">
          <AppLogo class="w-auto h-6 shrink-0" />
          <span class="font-semibold">Todo + Calendar Demo</span>
        </div>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain class="container mx-auto max-w-5xl px-4 py-6">
      <NuxtPage />
    </UMain>

    <USeparator icon="i-lucide-book-open" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built for learning Vue + Nuxt + Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://nuxt.com/docs/getting-started/introduction"
          target="_blank"
          icon="i-lucide-graduation-cap"
          label="Nuxt docs"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
