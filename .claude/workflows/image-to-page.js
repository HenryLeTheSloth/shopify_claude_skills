export const meta = {
  name: 'image-to-template',
  description: 'Build a Shopify template matching a reference image, with visual verification',
  phases: [
    { title: 'Plan', detail: 'map image sections to theme components using answered questions' },
    { title: 'Build', detail: 'one agent per section, wired into the template' },
    { title: 'Simplify', detail: 'ponytail-review the diff, apply cuts' },
    { title: 'Test', detail: 'theme-check + local dev screenshots' },
    { title: 'Confirm', detail: 'adversarial image-vs-screenshot comparison, fix loop' },
  ],
}

// args = { image: 'docs/collection_v5.png', pageType: 'collection', answers: {...} }

const PLAN_SCHEMA = {
  type: 'object', required: ['sections'],
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object', required: ['name', 'file', 'approach'],
        properties: {
          name: { type: 'string' },
          file: { type: 'string' },
          approach: { type: 'string', enum: ['reuse', 'reuse+settings', 'reuse+css', 'new'] },
          reuse: { type: 'array', items: { type: 'string' } }, // existing sections/snippets/blocks
          whyNew: { type: 'string' },                          // required in spirit when approach = 'new'
          spec: { type: 'string' },
        },
      },
    },
  },
}

const TEST_SCHEMA = {
  type: 'object', required: ['screenshot', 'errors'],
  properties: { screenshot: { type: 'string' }, errors: { type: 'array', items: { type: 'string' } } },
}

const MISMATCH_SCHEMA = {
  type: 'object', required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['where', 'expected', 'actual'],
        properties: { where: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' } },
      },
    },
  },
}

// Ponytail ladder, applied to theme work. Stop at the first rung that holds.
const PONYTAIL = `Apply the ponytail skill (full): existing section/snippet/block → theme setting →
CSS in assets/custom.css → Liquid hunk → only then new code. Native HTML/CSS over JS
(<details>, <dialog>, scroll-snap, aspect-ratio); no new dependencies. Never cut
accessibility, merchant-facing schema settings, or anything the design visibly needs.`

phase('Plan')
const plan = await agent(
  `Read the reference image at ${args.image}. Page type: ${args.pageType}.
   User's answers to the clarifying questions: ${JSON.stringify(args.answers)}.
   Produce a build plan: one entry per visual section, top to bottom, with the
   theme file to create/modify and which existing snippets to reuse.
   ${PONYTAIL}
   Pick the lowest-effort approach per section; approach "new" needs a concrete whyNew.`,
  { schema: PLAN_SCHEMA }
)

phase('Build')
const built = await pipeline(
  plan.sections,
  s => agent(`Implement section "${s.name}" in ${s.file} per this spec: ${JSON.stringify(s)}.
              Follow the shopify-liquid skill conventions. ${PONYTAIL}`, { phase: 'Build', label: s.name }),
)

// One agent wires the template JSON so sections don't fight over the same file
await agent(`Assemble templates/${args.pageType}.json using sections: ${JSON.stringify(plan.sections.map(s => s.file))}`)

phase('Simplify')
// Runs before Test/Confirm so the visual check catches any cut that broke the design
await agent(
  `Run the ponytail-review skill on the uncommitted git diff (git diff + untracked theme files).
   Apply every cut that does not change the rendered output. Skip cuts to accessibility,
   schema settings, or <BRAND> HUNK markers. Report net lines removed.`,
  { phase: 'Simplify' }
)

phase('Test')
const test = await agent(
  `Run theme-check, start shopify theme dev, screenshot the ${args.pageType} page
   full-height, and report errors + the screenshot path.`,
  { schema: TEST_SCHEMA }
)

phase('Confirm')
// Three independent skeptics compare the screenshot against the original image
const verdicts = await parallel(['layout & spacing', 'typography & color', 'content & components'].map(lens => () =>
  agent(`Compare ${test.screenshot} against ${args.image} through the "${lens}" lens.
         List every visible mismatch. Be adversarial — assume it does NOT match.`,
        { schema: MISMATCH_SCHEMA })
))
const mismatches = verdicts.filter(Boolean).flatMap(v => v.issues)
if (mismatches.length) {
  await pipeline(mismatches, m => agent(`Fix this visual mismatch with the smallest diff: ${JSON.stringify(m)}`, { phase: 'Confirm' }))
}
return { sectionsBuilt: plan.sections.length, remainingIssues: mismatches }
