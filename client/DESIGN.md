---
name: ArtefactAI
description: Data and AI interface in the visual world of artefact.com, where light is refracted into data.
colors:
  navy-ink: "#0d1634"
  indigo-depth: "#273275"
  spectrum-blue: "#001994"
  cobalt: "#0046e1"
  electric-blue: "#1f65ff"
  magenta: "#ff0066"
  magenta-deep: "#d6004f"
  magenta-ink: "#b30047"
  mist: "#cbcbcb"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "IBM Plex Sans, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.25rem, 4vw + 1rem, 4.375rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "IBM Plex Sans, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.8rem, 2.5vw + 1rem, 3.125rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "IBM Plex Sans, Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "IBM Plex Sans, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "5px"
  card: "8px"
  md: "10px"
  pill: "40px"
spacing:
  2xs: "0.44rem"
  xs: "0.67rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.25rem"
  xl: "3.38rem"
  2xl: "5.06rem"
components:
  button-primary:
    backgroundColor: "{colors.magenta-deep}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 20px"
  button-primary-hover:
    backgroundColor: "{colors.magenta-ink}"
    textColor: "{colors.paper}"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.magenta-deep}"
    rounded: "{rounded.pill}"
    padding: "9px 20px"
  nav-link:
    textColor: "{colors.paper}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.card}"
---

# Design System: ArtefactAI

## Overview

**Creative North Star: "The Prism Lab"**

Data enters as white light and leaves as a spectrum. The system is a calm, white laboratory bench (paper and deep navy ink) where the spectrum appears only at the moments that matter. It shows up as the diagonal navy-to-magenta field behind hero and statement sections, as the magenta signal on the one action that counts, and as iridescent imagery that refracts the brand palette. Everything else stays still, flat and precise, so the refraction reads as an event rather than as wallpaper.

Density is editorial rather than dashboard-tight. Headlines are large and light (IBM Plex Sans at weight 400), body copy is plain and readable, and sections are separated by generous vertical rhythm. Depth never comes from shadows; it comes from the contrast between paper surfaces and saturated gradient fields. The identity derives from artefact.com: the palette, type family, pill controls and flat surfaces are sampled from its rendered pages.

**Key Characteristics:**
- Paper and navy ink at rest; the spectrum gradient only on hero and statement fields.
- One magenta signal per view: the primary action.
- Light-weight display type with tight leading, semibold titles.
- Pill-shaped controls, gently rounded cards, zero shadows.
- Iridescent 3D imagery as the brand's prism, never flat illustration.

## Colors

A two-pole palette: deep navy ink for structure, magenta for the human signal, with a blue spectrum that only appears inside gradients.

### Primary
- **Signal Magenta** (magenta): The brand's single accent. Use it for gradient endpoints, large display emphasis and fills behind large text. On white it measures about 3.9:1, so it never carries small text.
- **Legible Magenta** (magenta-deep): Magenta tuned for text-bearing controls and links on paper (about 5.3:1 against white, and white on it about 5.3:1). This is the fill of the primary button.
- **Magenta Ink** (magenta-ink): Pressed and hover state of magenta controls.

### Secondary
- **Spectrum Blue** (spectrum-blue): Start of the signature 142° field gradient (`linear-gradient(142deg, spectrum-blue 17%, magenta 83%)`).
- **Cobalt** (cobalt): Start of the outline-button border gradient and of the horizontal spectrum rule.
- **Electric Blue** (electric-blue): End of the headline spectrum (`linear-gradient(90deg, magenta, electric-blue)`).

### Neutral
- **Navy Ink** (navy-ink): All body text, icons and dark solid surfaces. It replaces black everywhere.
- **Indigo Depth** (indigo-depth): Secondary dark surface and hover on navy areas.
- **Mist** (mist): Dividers, disabled strokes and muted text on navy (never on paper).
- **Paper** (paper): Page background and card surface.

### Named Rules
**The One Signal Rule.** Magenta marks the single most important action or emphasis in a view. Two magenta buttons side by side means one of them is wrong.

**The Legible Magenta Rule.** Signal Magenta never sits under text smaller than 24px; text-bearing controls use Legible Magenta.

**The Spectrum Is a Field Rule.** Gradients fill large areas (hero, statement band, stat band) at 142°, or a single headline. They never fill buttons, cards or icons.

## Typography

**Display Font:** IBM Plex Sans (with Arial, Helvetica, sans-serif)
**Body Font:** IBM Plex Sans (with Arial, Helvetica, sans-serif)
**Label/Mono Font:** IBM Plex Mono, for data values and measurements only

**Character:** One humanist-grotesque family across every role, with a technical rigour that never turns cold. Hierarchy comes from size and weight steps, not from mixing families.

### Hierarchy
- **Display** (400, clamp up to 70px, line-height 1): Hero statements only, white on the spectrum field.
- **Headline** (400, clamp up to 50px, line-height 1.2): Section statements. One per section may take the magenta-to-electric-blue spectrum.
- **Title** (600, 20px, line-height 1.2): Card titles, pillar names and lead sentences.
- **Body** (400, 16px, line-height 1.5): Running text, capped at 70ch.
- **Label** (500, 14px): Navigation, buttons and metadata. Sentence case, no tracking changes.
- **Data** (IBM Plex Mono 400, 16px): Figures, metrics and code, with tabular numerals.

### Named Rules
**The Light Voice Rule.** Display and headline stay at weight 400. Emphasis comes from scale or the single spectrum headline, never from bolding a headline.

**The Spectrum Headline Rule.** At most one headline per view may carry the magenta-to-electric-blue gradient. It is the brand's sanctioned exception to plain-colored type; body, labels and titles never take it.

## Layout

The container is 1440px wide with 80px side padding on desktop, collapsing to about 19px on phones. Sections alternate between paper bands and full-bleed spectrum fields, and they stack vertically with generous separation (2xl, 5.06rem, between sections; lg, 2.25rem, inside them). The spacing scale grows by roughly ×1.5 (0.44 → 0.67 → 1 → 1.5 → 2.25 → 3.38 → 5.06rem). Content grids run three columns on desktop for pillars and cards, then collapse to one column below 768px. The header is a 76px transparent bar that sits over the hero field.

## Elevation & Depth

Fully flat. No surface has a box-shadow at rest or on hover. Depth comes from tonal contrast instead: paper against navy, and paper against the 142° spectrum field. Imagery supplies dimensionality through iridescent 3D objects. Interaction depth is expressed with transform and filter (cards ease in 0.3s), not with lift shadows.

### Named Rules
**The No-Shadow Rule.** If a component seems to need a shadow to separate it, place it on a contrasting tonal surface instead.

## Shapes

Two radii carry the system. Controls are full pills (40px), so buttons read as soft capsules of light. Cards and media are gently rounded (8px; 10px for larger media frames). Small chips use 5px, and avatars are circles. There are no hard-cornered interactive elements and no decorative borders; the only border in the system is the 1px cobalt-to-magenta gradient stroke of the outline button.

## Components

### Buttons
- **Shape:** Full pill (40px).
- **Primary:** Legible Magenta fill, white label 14px/500, padding 9px 20px. Hover and press move to Magenta Ink over 0.2s.
- **Light:** White pill with a navy 20px/600 label, used on spectrum fields where magenta would vanish into the gradient.
- **Outline:** White fill with a 1px cobalt-to-magenta gradient border and a Legible Magenta label at 12–14px/500. It is the "Read more" action on cards.
- **Focus:** A 2px Legible Magenta ring offset by 2px, on every control.

### Cards / Containers
- **Corner Style:** Gently rounded (8px).
- **Background:** Paper, with the image flush to the top edge.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Border:** None.
- **Internal Padding:** md (1.5rem).
- **Interaction:** The image scales slightly and the filter brightens over 0.3s on hover.

### Navigation
- White 14px/500 links over the hero field, with a magenta pill "Contact" button at the right edge. On phones the links collapse into a menu icon. Colors transition over 0.688s on `cubic-bezier(0.42, 0.01, 0.58, 1)`.

### Spectrum Field (signature)
- A full-bleed section filled with `linear-gradient(142deg, spectrum-blue 17%, magenta 83%)`, optionally over iridescent imagery. It carries white display type, white or light buttons, and stat figures in Plex 700.

## Do's and Don'ts

### Do:
- **Do** use Navy Ink for all text on paper; pure black does not appear.
- **Do** keep Signal Magenta for one action or emphasis per view (The One Signal Rule).
- **Do** run the spectrum at 142° from Spectrum Blue (17%) to Magenta (83%) on full-bleed fields.
- **Do** keep display and headline type at weight 400 and step hierarchy with size.
- **Do** theme browser surfaces from the palette: Legible Magenta selection, caret and focus rings.

### Don't:
- **Don't** put text under 24px on Signal Magenta; use Legible Magenta.
- **Don't** add box-shadows to cards, buttons or the header.
- **Don't** fill buttons, cards or icons with the gradient.
- **Don't** apply gradient text to more than one headline per view, or to any body, label or title text.
- **Don't** introduce a second type family beyond IBM Plex Sans and IBM Plex Mono.
- **Don't** use square-cornered buttons.
