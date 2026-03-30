# AJV Website Design System

## Concept
Clean, bright, institutional + sporty. Derived from the AJV logo's royal blue and the Aargau cantonal colors.
Light backgrounds with blue hero sections for key pages. Warm neutral grays keep the site welcoming.
Sans-serif typography throughout for clarity and German language readability.

## Colors

### Brand Blue (from AJV logo — softened royal blue)
| Token | Hex | Use |
|-------|-----|-----|
| `brand-50` | `#EEF4FF` | Light hero backgrounds, tag backgrounds |
| `brand-100` | `#DBEAFF` | Light section backgrounds, hover tints |
| `brand-200` | `#BFDAFF` | Subtitle text on blue bg, selection highlight, accent borders |
| `brand-300` | `#93BFFF` | Decorative accents, footer text |
| `brand-400` | `#5B93FF` | Active nav, accent divider lines, secondary buttons |
| `brand-500` | `#3B6FE8` | **Primary — buttons, links, heading underlines** |
| `brand-600` | `#2A57C5` | Button hover, text links on white, overline labels on light bg |
| `brand-700` | `#1E4299` | **Blue hero backgrounds, header accents** |
| `brand-800` | `#153070` | Deep hero variant |
| `brand-900` | `#0E2050` | **Footer background** |

### Stone (Warm neutrals)
| Token | Hex | Use |
|-------|-----|-----|
| `stone-50` | `#FAFAF8` | **Page background** |
| `stone-100` | `#F4F4F1` | Alt section backgrounds, card bg on colored sections |
| `stone-200` | `#E2E2DC` | **Card borders, input borders, dividers** |
| `stone-300` | `#CCCCC4` | Disabled states |
| `stone-400` | `#A3A39A` | Placeholder text, muted icons (NOT for readable text) |
| `stone-500` | `#7A7A72` | **Secondary/muted text, timestamps** |
| `stone-600` | `#5C5C55` | Body text secondary, nav text |
| `stone-700` | `#434340` | Form labels |
| `stone-800` | `#2B2B28` | **Body text primary** |
| `stone-900` | `#1A1A18` | **Heading text** |

### Surfaces
| Surface | Value |
|---------|-------|
| Page background | `stone-50` (#FAFAF8) |
| Card background | `white` (#FFFFFF) |
| Alt section | `stone-100` (#F4F4F1) |
| Light hero | `brand-50` (#EEF4FF) |
| Blue hero | `brand-700` (#1E4299) |
| Footer | `brand-900` (#0E2050) |

## Typography

### Fonts
- **Headings**: **Plus Jakarta Sans** — geometric, sporty, handles long German words well
- **Body**: **DM Sans** — clean, excellent readability, optical size axis

### Type Scale
| Role | Classes |
|------|---------|
| Hero H1 | `font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight` |
| Section H2 | `font-display text-3xl lg:text-4xl font-bold` |
| Card H3 | `font-display text-xl lg:text-2xl font-semibold` |
| Body | `text-base lg:text-lg text-stone-600 leading-relaxed` |
| Label/overline | `text-xs font-semibold uppercase tracking-[0.3em]` |
| Caption | `text-xs text-stone-500 tracking-wider` |

## Hero Patterns

### Blue Hero (Verband, Veranstaltungen, Blog detail)
```html
<section class="relative bg-brand-700 text-white hero-overlay py-20 lg:py-28 overflow-hidden">
  <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-brand-300/10 to-transparent pointer-events-none"></div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p class="text-brand-200 text-xs font-semibold uppercase tracking-[0.3em] mb-6">Label</p>
    <h1 class="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tight">Title</h1>
    <p class="mt-6 text-lg text-brand-200 max-w-2xl leading-relaxed">Description</p>
  </div>
</section>
```

### Light Hero (Aktuelles, Vereine, Vorstand, Kontakt, Mitglied werden)
```html
<section class="relative bg-brand-50 text-stone-900 py-20 lg:py-28 overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p class="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-6">Label</p>
    <h1 class="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tight text-stone-900">Title</h1>
    <p class="mt-6 text-lg text-stone-600 max-w-2xl leading-relaxed">Description</p>
  </div>
</section>
```

## Component Patterns

### Buttons
- **Primary**: `px-6 py-3 bg-brand-500 text-white text-sm font-semibold tracking-wide rounded-md hover:bg-brand-600`
- **Secondary**: `px-6 py-3 bg-white text-brand-600 border border-brand-200 text-sm font-semibold rounded-md hover:bg-brand-50`
- **White** (on blue bg): `px-6 py-3 bg-white text-brand-700 text-sm font-semibold rounded-md hover:bg-stone-100`
- **Dark**: `px-6 py-3 bg-stone-900 text-white text-sm font-semibold tracking-wide rounded-md hover:bg-stone-800`

### Cards
```html
<div class="bg-white border border-stone-200 rounded-lg p-6 card-hover">
```

### Section Header
```html
<p class="text-xs font-semibold text-brand-600 uppercase tracking-[0.3em] mb-3">Label</p>
<h2 class="font-display text-3xl lg:text-4xl font-bold text-stone-900 heading-accent">Heading</h2>
```

### Arrow Link
```html
<a href="..." class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 tracking-wide hover:text-brand-700 transition-colors group">
  Text
  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

### Form Inputs
```html
<input class="w-full px-4 py-3 rounded-md bg-white border border-stone-200 text-stone-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-colors" />
```

### Blue Accent Block (CTA, FAQ)
```html
<div class="relative bg-brand-700 text-white hero-overlay rounded-lg p-10 overflow-hidden">
  <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-brand-300/10 to-transparent pointer-events-none"></div>
  <!-- content -->
</div>
```

### Accent Divider Line
```html
<div class="w-8 h-0.5 bg-brand-500 rounded-full mb-4"></div>
```

## Special CSS Classes
- `hero-overlay` — subtle blue gradient overlay for depth on blue sections
- `clip-diagonal` — angled bottom edge (homepage hero only)
- `card-hover` — lift + brand-tinted shadow on hover
- `heading-accent` — blue underline bar below heading
- `animate-fade-up` + `stagger-N` — entrance animations (1-4)

## Key Principles
1. **Bright and welcoming** — warm off-white base, not dark or cold
2. **Blue heroes alternate with light** — variety across pages
3. **Logo colors are the palette** — royal blue + black/white
4. **Rounded corners on cards and buttons** — `rounded-lg` / `rounded-md`
5. **Sans-serif everywhere** — Plus Jakarta Sans headings, DM Sans body
6. **German-first** — type choices handle long compound words
7. **WCAG AA contrast** — all text/background combinations pass 4.5:1
