/**
 * nuxt.config.ts — Central Nuxt configuration file
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LEARNING NOTE: Nuxt configuration
 *
 * This file controls almost everything about how your Nuxt app behaves:
 *   - Which modules to load (modules array)
 *   - CSS files to include globally (css array)
 *   - Build optimizations, server-side rendering, routing rules, etc.
 *
 * defineNuxtConfig() is auto-imported — you don't need to import it.
 * TypeScript gives you auto-complete here, so try typing inside the object!
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default defineNuxtConfig({
  /**
   * modules — Nuxt modules extend your app with extra capabilities.
   *
   * @nuxt/ui       Adds all Nuxt UI components + Tailwind CSS (auto-configured)
   * @nuxt/eslint   Adds ESLint with sensible defaults for Vue/Nuxt
   */
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  /**
   * devtools — Enables the Nuxt DevTools browser panel in development.
   * Press Shift+Alt+D (or the floating icon) to open it.
   * It shows component trees, state, routes, and more.
   */
  devtools: {
    enabled: true
  },

  /**
   * css — Global CSS files loaded on every page.
   * main.css sets up Tailwind CSS's base styles.
   * The ~ alias resolves to the project root (same as @/).
   */
  css: ['~/assets/css/main.css'],

  /**
   * compatibilityDate — Tells Nuxt which set of defaults to use.
   * Setting a specific date makes behavior consistent across Nuxt upgrades.
   */
  compatibilityDate: '2025-01-15',

  /**
   * eslint — Configuration for the @nuxt/eslint module.
   * stylistic options control code formatting rules.
   */
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
