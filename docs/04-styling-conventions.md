# Styling Conventions

## Approach

Use vanilla CSS with a small, explicit design system. Consistency comes from
shared design tokens, semantic CSS custom properties, reusable UI primitives,
and predictable component-state conventions rather than a styling framework.

Do not add Tailwind CSS, Sass, Less, CSS-in-JS, runtime style injection, or a
third-party component library. Vite processes ordinary `.css` files directly.

## Visual direction

The interface should feel simple, clean, professional, and modern. Use a boxy
visual language with square corners and no border radius.

- Create hierarchy through typography, spacing, color, borders, and alignment.
- Prefer structured grids, clear sections, and deliberate whitespace.
- Use square controls, cards, dialogs, menus, badges, and status indicators.
- Prefer thin borders and subtle surface contrast over floating card stacks.
- Use shadows sparingly and only when they communicate elevation or layering.
- Keep the palette restrained, with one clear accent and semantic feedback
  colors.
- Avoid decorative gradients, glass effects, oversized shadows, pill-shaped
  controls, playful ornament, and excessive animation.
- Keep icons simple and use them to support labels rather than replace clear
  language unnecessarily.
- Use compact but comfortable information density suitable for a daily tracking
  application.
- Keep transitions short and functional, especially for feedback, disclosure,
  and route changes.

The boxy direction must remain polished rather than harsh: consistent spacing,
precise alignment, readable typography, clear interaction states, and balanced
contrast provide the visual refinement that rounded surfaces would otherwise
suggest.

## Structure

```text
apps/web/src/
├── components/
│   └── ui/
│       ├── button/
│       │   ├── index.test.tsx
│       │   ├── index.tsx
│       │   └── styles.css
│       ├── card/
│       │   ├── index.test.tsx
│       │   ├── index.tsx
│       │   └── styles.css
│       └── input/
│           ├── index.test.tsx
│           ├── index.tsx
│           └── styles.css
├── features/
│   └── habits/
│       └── components/
│           └── habit-card/
│               ├── index.test.tsx
│               ├── index.tsx
│               └── styles.css
├── pages/
│   └── dashboard/
│       ├── index.test.tsx
│       ├── index.tsx
│       └── styles.css
├── styles/
│   ├── base.css
│   ├── reset.css
│   ├── themes.css
│   └── tokens.css
└── index.css
```

- `index.css` is the single global stylesheet entrypoint and imports the global
  style files in their defined order.
- `tokens.css` contains primitive values that do not change between themes:
  spacing, typography, radii, shadows, layout sizes, and raw palette values.
- `themes.css` maps primitive values to semantic color variables and overrides
  them per theme.
- `reset.css` normalizes browser defaults without styling product components.
- `base.css` applies document typography, background, foreground, focus, links,
  and other element-level foundations.
- Every reusable component, feature component, and page has its own directory.
- `index.tsx` is the unit's public component entrypoint.
- `styles.css` contains styles owned only by that component or page.
- `index.test.tsx` is colocated when the unit has component tests.
- Additional unit-owned files stay inside the same directory.

This directory is the lifecycle boundary: removing a component or page means
removing its directory, including its styles and tests. Shared styles must be
promoted deliberately to the global design system or a shared component rather
than left in a deleted unit's former parent directory.

## Token model

Use two token levels.

### Primitive tokens

Primitive tokens define the available design scale:

```css
:root {
  --palette-neutral-0: #ffffff;
  --palette-neutral-50: #f8fafc;
  --palette-neutral-900: #0f172a;
  --palette-green-500: #22c55e;
  --palette-red-500: #ef4444;

  --font-family-sans: Inter, system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  --radius-control: 0;
  --radius-surface: 0;

  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.08);
  --duration-fast: 120ms;
  --duration-normal: 200ms;
}
```

The exact palette and scale are selected during visual design. Components must
not introduce a parallel spacing, typography, or shadow scale. Radius tokens
stay at zero to enforce the boxy visual language consistently.

### Semantic theme tokens

Components consume semantic variables rather than raw palette values:

```css
:root,
[data-theme="light"] {
  color-scheme: light;
  --color-background: var(--palette-neutral-50);
  --color-surface: var(--palette-neutral-0);
  --color-text: var(--palette-neutral-900);
  --color-text-muted: #475569;
  --color-border: #cbd5e1;
  --color-accent: #15803d;
  --color-accent-contrast: var(--palette-neutral-0);
  --color-danger: #b91c1c;
  --color-focus-ring: #2563eb;
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-background: #020617;
  --color-surface: var(--palette-neutral-900);
  --color-text: var(--palette-neutral-50);
  --color-text-muted: #94a3b8;
  --color-border: #334155;
  --color-accent: #4ade80;
  --color-accent-contrast: #052e16;
  --color-danger: #f87171;
  --color-focus-ring: #60a5fa;
}
```

The theme is selected with `data-theme` on the root HTML element. Adding or
changing a theme should only remap semantic variables; it should not duplicate
component styles.

Dark theme support may be deferred until required, but components must use
semantic variables from the beginning so an additional theme does not require a
rewrite.

## Component styling

Reusable UI primitives establish the visual contract for controls such as
buttons, inputs, text areas, selects, cards, badges, dialogs, and feedback
states. Feature components compose these primitives and add only domain-specific
layout or presentation.

Use stable class names with a component prefix and `data-*` attributes for
variants and state:

```tsx
<button className="button" data-size="medium" data-variant="primary" />
```

```css
@layer components {
  .button {
    align-items: center;
    background: var(--button-background, var(--color-accent));
    border: 1px solid var(--button-border, transparent);
    border-radius: var(--radius-control);
    color: var(--button-foreground, var(--color-accent-contrast));
    display: inline-flex;
    gap: var(--space-2);
    justify-content: center;
  }

  .button[data-variant="secondary"] {
    --button-background: var(--color-surface);
    --button-border: var(--color-border);
    --button-foreground: var(--color-text);
  }
}
```

Rules:

- Do not use inline style objects for static presentation.
- Inline styles may set a documented CSS custom property when a value is truly
  calculated at runtime.
- Do not use raw hex, spacing, radius, or shadow values in feature/component CSS
  when an appropriate token exists.
- Do not introduce rounded exceptions for badges, pills, cards, dialogs, or
  controls; the square geometry is part of the design system.
- Do not use `!important` except for a documented third-party integration edge.
- Keep selectors shallow and avoid styling through a component's DOM ancestry.
- Prefer classes and `data-*` state selectors over brittle element-position
  selectors.
- Do not import feature styles into another feature.
- Do not place component or page styles in a parent-level catch-all stylesheet.
- Remove unused component styles with the component rather than accumulating a
  global stylesheet.

## Cascade and ordering

Declare a stable cascade order in `index.css`:

```css
@layer reset, tokens, base, components, utilities;

@import "./styles/reset.css" layer(reset);
@import "./styles/tokens.css" layer(tokens);
@import "./styles/themes.css" layer(tokens);
@import "./styles/base.css" layer(base);
```

Component styles use the `components` layer. Add a utility only when it is a
small, broadly reusable layout or accessibility helper; do not recreate a
utility-class framework.

## Accessibility and responsive behavior

- Provide visible `:focus-visible` treatment using the semantic focus-ring
  token.
- Preserve native disabled behavior and expose clear hover, active, invalid,
  selected, and pending states.
- Verify text and interactive-state contrast in every implemented theme.
- Use `prefers-reduced-motion` to disable non-essential transitions.
- Use responsive layouts driven by content and a small shared breakpoint set.
- Prefer fluid sizing with `min()`, `max()`, `clamp()`, Grid, and Flexbox over
  device-specific fixed widths.
- Maintain usable pointer targets and keyboard navigation at narrow widths.

## Testing and review

- Component tests assert accessible roles, names, state, and behavior rather than
  CSS implementation details.
- Playwright verifies critical layouts at a narrow mobile viewport and a standard
  desktop viewport.
- Theme switching, when implemented, must preserve behavior and accessible
  states.
- Review new CSS values against existing tokens before adding another token.
- Oxfmt formats all CSS files using the repository configuration.
