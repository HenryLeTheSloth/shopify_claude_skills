export const meta = {
  name: 'redesign-discover',
  description: 'Extract the current (and optional reference) site design system + screenshots, and produce style questions for the user',
  whenToUse: 'Step 1 of /redesign — run BEFORE asking the user for a style direction. Never runs any design work.',
  phases: [
    { title: 'Map', detail: 'pick the key pages that represent the site' },
    { title: 'Extract', detail: 'design systems + screenshots via Firecrawl' },
    { title: 'Synthesize', detail: 'merge findings into a brief with open style questions' },
  ],
}

// args = {
//   site: 'https://original-site.com',        // required — the site to redesign
//   referenceSite: 'https://other-site.com',  // optional — borrow this site's style
//   pages: ['https://...', ...],              // optional — explicit pages; otherwise auto-mapped
// }

const PAGES_SCHEMA = {
  type: 'object', required: ['pages'],
  properties: {
    pages: {
      type: 'array',
      items: {
        type: 'object', required: ['url', 'pageType'],
        properties: { url: { type: 'string' }, pageType: { type: 'string' } },
      },
    },
  },
}

const DESIGN_SCHEMA = {
  type: 'object', required: ['colors', 'typography', 'spacing', 'components', 'layout'],
  properties: {
    colors: { type: 'string' },      // palette with hex values, which is the CTA color
    typography: { type: 'string' },  // families, scale, weights
    spacing: { type: 'string' },     // observed spacing scale, radii, shadows
    components: { type: 'array', items: { type: 'string' } },
    layout: { type: 'string' },      // grid, max-width, section rhythm
    evidenceDir: { type: 'string' }, // where raw Firecrawl output was saved
    notes: { type: 'string' },
  },
}

const SHOTS_SCHEMA = {
  type: 'object', required: ['shots'],
  properties: {
    shots: {
      type: 'array',
      items: {
        type: 'object', required: ['pageType', 'url', 'path'],
        properties: {
          pageType: { type: 'string' },
          url: { type: 'string' },
          path: { type: 'string' }, // local PNG path
        },
      },
    },
  },
}

const BRIEF_SCHEMA = {
  type: 'object', required: ['currentDesignSummary', 'weaknesses', 'questions'],
  properties: {
    currentDesignSummary: { type: 'string' },
    referenceDesignSummary: { type: 'string' },
    weaknesses: { type: 'array', items: { type: 'string' } },
    questions: {
      type: 'array', minItems: 3, maxItems: 6,
      items: {
        type: 'object', required: ['topic', 'question', 'options', 'recommended'],
        properties: {
          topic: { type: 'string' }, // e.g. palette, typography, density, imagery, tone
          question: { type: 'string' },
          options: {
            type: 'array', minItems: 2, maxItems: 4,
            items: {
              type: 'object', required: ['label', 'description'],
              properties: { label: { type: 'string' }, description: { type: 'string' } },
            },
          },
          recommended: { type: 'string' }, // label of the recommended option
        },
      },
    },
  },
}

phase('Map')
let pages
if (args.pages && args.pages.length) {
  pages = args.pages.map((u, i) => ({ url: u, pageType: `page-${i + 1}` }))
  log(`Using ${pages.length} user-provided pages`)
} else {
  const mapped = await agent(
    `Map the website ${args.site} (use \`firecrawl map\` or scrape the homepage nav).
     Pick the 3-5 pages that represent its distinct templates — typically home, a
     listing/collection page, a detail/product page, and about or contact.
     Return their absolute URLs with a short pageType slug for each (home, collection, product, about...).`,
    { schema: PAGES_SCHEMA }
  )
  pages = mapped.pages
  log(`Mapped ${pages.length} key pages: ${pages.map(p => p.pageType).join(', ')}`)
}

phase('Extract')
const tasks = [
  () => agent(
    `Extract the complete design system of ${args.site}.
     Use the Firecrawl CLI (e.g. \`firecrawl scrape "${args.site}" --format branding,images\`)
     and save raw output under .firecrawl/redesign/original/.
     Report: colors (hex, identify the primary CTA color), typography (families, scale, weights),
     spacing/radius/shadows, component inventory (buttons, cards, forms, nav...), and layout
     (grid, max-width, section rhythm). Mark anything you could not measure as "inferred".`,
    { label: 'design:original', phase: 'Extract', schema: DESIGN_SCHEMA }
  ),
  () => agent(
    `Take full-page screenshots of these pages using the Firecrawl CLI
     (\`firecrawl scrape <url> --full-page-screenshot\`), download each PNG to
     .firecrawl/redesign/shots/<pageType>.png, and return the local paths:
     ${JSON.stringify(pages)}`,
    { label: 'screenshots', phase: 'Extract', schema: SHOTS_SCHEMA }
  ),
]
if (args.referenceSite) {
  tasks.push(() => agent(
    `Extract the complete design system of the REFERENCE site ${args.referenceSite}
     (the user may want to borrow its style). Same method: Firecrawl CLI, save raw output
     under .firecrawl/redesign/reference/. Report colors, typography, spacing, components, layout.
     Also take one full-page screenshot of its homepage and save it to
     .firecrawl/redesign/reference/home.png (mention the path in notes).`,
    { label: 'design:reference', phase: 'Extract', schema: DESIGN_SCHEMA }
  ))
}
// Barrier is correct here: the synthesizer needs ALL extraction results together.
const [original, shots, reference] = await parallel(tasks)
if (!original || !shots) {
  return { error: 'Extraction failed — original design or screenshots missing. Check Firecrawl CLI auth and retry.', original, shots }
}

phase('Synthesize')
const brief = await agent(
  `You are preparing a redesign brief. Do NOT decide the new style — your job is to
   surface the decisions the USER must make.

   Current site: ${args.site}
   Current design system: ${JSON.stringify(original)}
   Screenshots (Read each one): ${JSON.stringify(shots.shots)}
   ${reference ? `Reference site the user may want to borrow from: ${args.referenceSite}
   Reference design system: ${JSON.stringify(reference)}` : 'No reference site was given.'}

   Produce:
   1. A short summary of the current design (and the reference design if present).
   2. Concrete weaknesses of the current design (specific: contrast, hierarchy, density,
      dated patterns — cite what you saw in the screenshots).
   3. 3-6 clarifying style questions with 2-4 options each and a recommended option —
      covering direction (refresh current brand vs adopt reference style vs hybrid),
      palette, typography, density/whitespace, imagery/tone. Options must be concrete
      enough that the answers fully determine the redesign.`,
  { schema: BRIEF_SCHEMA, effort: 'high' }
)

return { site: args.site, referenceSite: args.referenceSite ?? null, pages, original, reference: reference ?? null, screenshots: shots.shots, brief }
