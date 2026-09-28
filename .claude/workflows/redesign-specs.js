export const meta = {
  name: 'redesign-specs',
  description: 'Produce per-page redesign specs from the user-approved style brief, adversarially critique each, then unify',
  whenToUse: 'Step 2 of /redesign — run ONLY after the user has answered the style questions from redesign-discover.',
  phases: [
    { title: 'Design', detail: 'one spec agent per page' },
    { title: 'Critique', detail: 'adversarial review of each spec, then fixes' },
    { title: 'Unify', detail: 'cross-page consistency pass' },
  ],
}

// args = {
//   site: 'https://...',
//   styleBrief: { direction: '...', answers: { palette: '...', typography: '...', ... } },  // the user's ANSWERS — the contract
//   pages: [{ url, pageType }],            // from redesign-discover
//   screenshots: [{ pageType, url, path }],// from redesign-discover
//   original: {...},                       // current design system, from redesign-discover
//   reference: {...} | null,               // reference design system, from redesign-discover
// }

const SPEC_SCHEMA = {
  type: 'object', required: ['pageType', 'tokens', 'sections'],
  properties: {
    pageType: { type: 'string' },
    tokens: { type: 'string' }, // exact colors/fonts/spacing/radii this page uses
    layout: { type: 'string' }, // grid, max-width, rhythm
    sections: {
      type: 'array', minItems: 3,
      items: {
        type: 'object', required: ['name', 'description'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' }, // layout, styling, and real content/copy to show
        },
      },
    },
    notes: { type: 'string' },
  },
}

const CRIT_SCHEMA = {
  type: 'object', required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['severity', 'issue', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

const UNIFIED_SCHEMA = {
  type: 'object', required: ['sharedTokens', 'specs'],
  properties: {
    sharedTokens: { type: 'string' }, // the single token set every artboard must use
    specs: { type: 'array', items: SPEC_SCHEMA },
    changesMade: { type: 'array', items: { type: 'string' } },
  },
}

const CRITIQUE_LENSES = [
  'fidelity to the user-approved style brief — flag ANY choice that substitutes the designer\'s taste for the user\'s answers',
  'visual hierarchy, accessibility and contrast — flag weak hierarchy, unreadable combinations, WCAG contrast failures',
  'content preservation — flag any real content, navigation, or functionality from the original page that the spec dropped or invented',
]

const brief = JSON.stringify(args.styleBrief)
const shotFor = (p) => (args.screenshots.find(s => s.pageType === p.pageType) || {}).path

// Pipeline: page A can be in Critique while page B is still in Design.
const specs = await pipeline(
  args.pages,
  (p) => agent(
    `Write a complete redesign spec for the ${p.pageType} page (${p.url}) of ${args.site}.

     THE USER-APPROVED STYLE BRIEF IS THE CONTRACT — follow it exactly, do not substitute
     your own taste for anything it decides: ${brief}

     Current design system (what we are moving away from): ${JSON.stringify(args.original)}
     ${args.reference ? `Reference design system (borrow per the brief): ${JSON.stringify(args.reference)}` : ''}
     Read the current page screenshot at ${shotFor(p)} — preserve its real content,
     information architecture, and functionality; only the design changes.

     Spec every section top-to-bottom: layout, styling with exact token values, and the
     actual content/copy to display (taken from the screenshot, not invented). The spec
     must be detailed enough that a designer who never saw the site can build the artboard.`,
    { phase: 'Design', label: `spec:${p.pageType}`, schema: SPEC_SCHEMA }
  ),
  (spec, p) => {
    if (!spec) return null
    return parallel(CRITIQUE_LENSES.map(lens => () => agent(
      `Adversarially critique this redesign spec for the ${p.pageType} page through one lens:
       ${lens}.
       Style brief: ${brief}
       Original screenshot: ${shotFor(p)} (Read it).
       Spec: ${JSON.stringify(spec)}
       Assume the spec is flawed until proven otherwise. Return every issue you find; an
       empty list means you genuinely could not find one.`,
      { phase: 'Critique', label: `crit:${p.pageType}`, schema: CRIT_SCHEMA }
    ))).then(crits => ({ spec, issues: crits.filter(Boolean).flatMap(c => c.issues) }))
  },
  (r, p) => {
    if (!r) return null
    const serious = r.issues.filter(i => i.severity !== 'minor')
    if (!serious.length) return r.spec
    log(`spec:${p.pageType} — fixing ${serious.length} issue(s)`)
    return agent(
      `Revise this redesign spec to resolve every issue below. Keep everything else intact.
       Style brief (still the contract): ${brief}
       Spec: ${JSON.stringify(r.spec)}
       Issues: ${JSON.stringify(serious)}
       Return the full corrected spec.`,
      { phase: 'Critique', label: `fix:${p.pageType}`, schema: SPEC_SCHEMA }
    )
  }
)

phase('Unify')
const done = specs.filter(Boolean)
if (!done.length) return { error: 'All page specs failed — nothing to unify.' }
// Barrier is correct here: consistency can only be judged across ALL specs at once.
const unified = await agent(
  `These per-page redesign specs were written independently. Make them one coherent design:
   extract the single shared token set (colors, type scale, spacing, radii, buttons) they
   must all use, resolve any disagreements in favor of the style brief (${brief}), and
   return the corrected specs plus a list of what you changed. Do not redesign anything —
   only reconcile inconsistencies.
   Specs: ${JSON.stringify(done)}`,
  { schema: UNIFIED_SCHEMA, effort: 'high' }
)

return { styleBrief: args.styleBrief, sharedTokens: unified.sharedTokens, specs: unified.specs, changesMade: unified.changesMade, screenshots: args.screenshots }
