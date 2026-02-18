/**
 * ================================================================================
 *
 * @project:    nuxt4-holistic-therapy-clinic
 * @file:       ~/nuxt.config.ts
 * @version:    1.0.0
 * @createDate: 2025 Dec 13
 * @createTime: 17:27
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * This is the main application "Integrator" config. It is responsible for
 * assembling all the application's features by extending the primary layers
 * (@monorepo/{layerName}). It also provides global, singleton modules
 * (like @pinia/nuxt and @nuxt/icon) to be shared across all layers
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251213-17:27
 * Initial creation and release of nuxt.config.ts
 *
 * ================================================================================
 */

import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-10-08',
  devtools: { enabled: true },

  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  /**
   * ------------------------------------------------------------------------------
   * @EXTENDS:
   * ------------------------------------------------------------------------------
   */
  extends: [
    "@monorepo/ui-library",
    "@monorepo/game-asteroids"
  ],

  /**
   * ------------------------------------------------------------------------------
   * @NUXT-MODULES:
   * ------------------------------------------------------------------------------
   */
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/seo'
  ],

  /**
   * ------------------------------------------------------------------------------
   * @ROUTERULES
   * ------------------------------------------------------------------------------
   */
  routeRules: {
    // Homepage & Static Pages: Pre-render content at build time (Instant Load)
    '/': { prerender: true },
    '/about': { prerender: true },
    '/therapies': { prerender: true },
    '/contact': { prerender: true },
    '/blog': { prerender: true },

    '/sitemap.xml': { prerender: true },
    '/robots.txt': { prerender: true },

    // Blog & Treatments: Use ISR (Incremental Static Regeneration)
    // Rebuilds in the background once per hour if data changes.
    '/blog/**': { isr: 3600 },
    '/treatments/**': { isr: 3600 },

    // Admin/Account Area: Disable prerendering (Client-side or SSR only)
    // This prevents build failures due to missing DB access during crawler phase.
    '/account/**': { prerender: false }
  },

  /**
   * ------------------------------------------------------------------------------
   * @NUXT/IMAGE
   * ------------------------------------------------------------------------------
   */
  image: {
    domains: ['images.unsplash.com'],
    format: ['webp'],
    quality: 80,      // Good balance of size/quality
    // If using local images in /public, no provider needed.
    // If using external images (like from a CMS), add domains here.
  },

  /**
   * ------------------------------------------------------------------------------
   * @NUXT/FONTS
   * ------------------------------------------------------------------------------
   */
  // [NEW] Font Optimization (Fixes Layout Shift)
  fonts: {
    families: [
      { name: 'Playfair Display', provider: 'google' },
      { name: 'Lato', provider: 'google' }
    ]
  },

  /**
   * ------------------------------------------------------------------------------
   * @SEO-CONFIGURATION: [NEW]
   * Replaces the manual runtimeConfig.public.siteUrl
   * ------------------------------------------------------------------------------
   */
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://holistictherapyclinic.co.uk',
    name: 'Steve Lewis',
    description: 'Games for geeek\'s (old ones)',
    defaultLocale: 'en-GB',
  },

  /**
   * ------------------------------------------------------------------------------
   * ROBOTS.TXT
   * ------------------------------------------------------------------------------
   */
  robots: {
    // 1. Explicitly point to the manual file we created
    // The module will automatically prepend your site.url (https://holistictherapyclinic.co.uk)
    sitemap: '/sitemap.xml',

    // 2. Define Rules
    // We allow Google to crawl everything.
    // Note: We do NOT disallow /_nuxt/ because Google needs to load JS to render your page correctly.
    allow: '/',

    // Optional: If you had private pages, you would list them here.
    // disallow: ['/api/', '/admin/'],
  },

  /**
   * ------------------------------------------------------------------------------
   * @SITEMAP-CONFIGURATION: [NEW]
   * Connects to the server API to find your SQL content pages
   * ------------------------------------------------------------------------------
   */
  sitemap: {// Force the module to look at the exact IPv4 address
    // sources: [
    //   '/api/sitemap'
    // ],
    enabled: false,
    debug: true // This will log sitemap errors to your terminal
  },

  /**
   * ------------------------------------------------------------------------------
   * @NUXT-PLUGINS:
   * ------------------------------------------------------------------------------
   */
  plugins: [
  ],

  /**
   * ------------------------------------------------------------------------------
   * @AUTO-IMPORT-DIRECTORIES:
   * ------------------------------------------------------------------------------
   */
  imports: {
  },

  /**
   * ------------------------------------------------------------------------------
   * @NUXT-CONTENT-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  content: {
    // Content module configuration
    database: {
      type: 'sqlite' // Nuxt 4 recommended database
    }
  },

  /**
   * ------------------------------------------------------------------------------
   * @NUXT-ICONS-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  icon: {
    size: '24',
    class: 'inline-block',
    serverBundle: 'remote',
    provider: 'iconify',
    collections: [] // explicitly prevent auto-discovery
  },

  /**
   * ------------------------------------------------------------------------------
   * @OPTIONAL: alias for Layer
   * ------------------------------------------------------------------------------
   */
  alias: {
  },

  // Disable sourcemaps for server and client
  sourcemap: {
    server: false,
    client: false
  },

  /**
   * ------------------------------------------------------------------------------
   * @VITE-PLUGINS:
   * ------------------------------------------------------------------------------
   */
  vite: {
    plugins: [
      // tsconfigPaths(), // Keep if needed for root
      tailwindcss()
    ],

    server: {
      hmr: {
        port: 3000,        // Pin to main port (avoids random ports like 24678 that fail intermittently)
        host: '127.0.0.1', // Force IPv4 (macOS/Windows often defaults to IPv6, causing mismatches)
        protocol: 'ws',    // Explicit WebSocket protocol for stability
        timeout: 30000,    // Bump from default 10s to prevent idle disconnects
        overlay: true,     // Enable error overlay for debugging HMR fails
      },
    },

    css: {
      devSourcemap: true // Debug CSS issues
    },

    build: {
      cssMinify: true // Minify CSS in production
    }
  },

  /**
   * ------------------------------------------------------------------------------
   * @NITRO-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  nitro: {
    //dev: true,  // Ensure Nitro HMR is active

    preset: 'netlify',

    output: {
      // ensure Nitro writes public files into "public" so Netlify can find .output/public
      // Also ensure Netlify build and deploy settings are correct.
      publicDir: '.output/public'
    },

    prerender: {
      crawlLinks: true,
      failOnError: false,
    }
  },

  /**
   * ------------------------------------------------------------------------------
   * @APP-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  // app: {
  //   head: {
  // link: [
  //   {
  //     rel: 'preload',
  //     href: '/_nuxt/assets/css/main.css.old',
  //     as: 'style'
  //   },
  //   {
  //     rel: 'stylesheet',
  //     href: '/_nuxt/assets/css/main.css.old'
  //   }
  // ]
  //   }
  // },

  /**
   * ------------------------------------------------------------------------------
   * @RUNTIME-CONFIGURATION: global defaults
   * ------------------------------------------------------------------------------
   */
  runtimeConfig: {
    // Private keys (Server-side only)
    zohoSmtpHost: process.env.ZOHO_SMTP_SERVER_NAME,
    zohoSmtpPort: process.env.ZOHO_SMTP_SERVER_PORT,
    zohoSmtpSecure: process.env.ZOHO_SMTP_SERVER_SECURITY,
    zohoUser: process.env.ZOHO_EMAIL,
    zohoPassword: process.env.ZOHO_PASSWORD,

    // Public keys (Client-side)
    public: {
      contactEmail: process.env.ZOHO_EMAIL || 'susan.chinnery@holistictherapyclinic.co.uk'
    }
  },

  /**
   * ------------------------------------------------------------------------------
   * @DEVELOPMENT-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  development: {
    runtimeConfig: {
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * @PRODUCTION-CONFIGURATION:
   * ------------------------------------------------------------------------------
   */
  production: {
    runtimeConfig: {
    },
  }
});
