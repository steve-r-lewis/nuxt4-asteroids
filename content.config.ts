/**
 * ================================================================================
 *
 * @project:    nuxt4-holistic-therapy-clinic
 * @file:       ~//content.config.ts
 * @version:    1.0.0
 * @createDate: 2026 Feb 01
 * @createTime: 22:15
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * TODO: Create description here
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20260201-22:15
 * Initial creation and release of content.config.ts
 *
 * ================================================================================
 */

// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: 'blog/*.md',
      type: 'page',
      // [NEW] Define schema to include optional image
      schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string(),
        image: z.string().optional()
      })
    }),

    // [EXISTING] Your JSON Price List
    therapies: defineCollection({
      source: 'datastore/therapies/*.json',
      type: 'data',
      schema: z.object({
        name: z.string(),
        duration: z.string(),
        price: z.string(),
        desc: z.string(),
        // [NEW] Optional link to the detail page (e.g., 'swedish-massage')
        relatedPost: z.string().optional()
      })
    }),

    // [NEW] The Detailed Pages
    treatments: defineCollection({
      source: 'treatments/*.md', // Looks for files in content/treatments/
      type: 'page',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        // [NEW] Optional image for the detail page
        image: z.string().optional()
      })
    }),

    // [NEW] Add this Landing collection
    landing: defineCollection({
      type: 'data', // 'data' type is perfect for JSON singleton files
      source: 'landing/*.json',
      schema: z.object({
        badge: z.string(),
        title: z.string(),
        description: z.string(),
        image: z.string(),
        imageAlt: z.string(),
        promo: z.object({
          badge: z.string(),
          text: z.string(),
          link: z.string(),
          linkText: z.string()
        }),
        features: z.array(z.object({
          title: z.string(),
          text: z.string(),
          icon: z.string()
        }))
      })
    }),

    // [NEW] FAQ Collection
    faq: defineCollection({
      type: 'data',
      source: 'landing/faq.json',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        items: z.array(z.object({
          question: z.string(),
          answer: z.string()
        }))
      })
    }),

    layout: defineCollection({
      type: 'data',
      source: 'layout/*.json',
      schema: z.object({
        logo: z.object({
          text: z.string(),
          image: z.string(),
          alt: z.string(),
          link: z.string()
        }).optional(),
        navigation: z.array(z.object({
          label: z.string(),
          to: z.string()
        })),
        // [NEW] Additions for Footer
        socials: z.array(z.object({
          icon: z.string(),
          link: z.string(),
          label: z.string()
        })).optional(),
        copyrightText: z.string().optional(),
        // [Existing]
        cta: z.object({
          label: z.string(),
          to: z.string(),
          style: z.string().optional()
        }).optional()
      })
    })
  }
})
