---
name: material-design-3
description: Comprehensive expert instructions and reference specification for Google Material Design 3 (M3 / Material You), covering tokens, HCT color roles, elevation, typography scales, shape systems, components, adaptive layout breakpoints, and motion curves.
version: 3.2.0
schema_version: 1.0.0
---

# Material Design 3 (M3) Engineering & Design Skill

## 1. Foundational Architecture & Token Tiers

M3 structures all visual decisions through a 3-tier Design Token architecture. You must never hardcode raw hex values, raw pixel dimensions, or raw shadow definitions directly into components.

```
+----------------------------------------------------------------+
|  Reference Tokens (md.ref.*)                                   |
|  Atomic palette definitions, raw base values (e.g., md.ref.palette.primary40) |
+-------------------------------+--------------------------------+
                                |
                                v
+----------------------------------------------------------------+
|  System Tokens (md.sys.*)                                      |
|  Semantic context roles (e.g., md.sys.color.primary-container) |
+-------------------------------+--------------------------------+
                                |
                                v
+----------------------------------------------------------------+
|  Component Tokens (md.comp.*)                                  |
|  Element-specific bindings (e.g., md.comp.filled-button.container.color) |
+-------------------------------+--------------------------------+
```

### Token Tier Rules
- **Reference Tokens (`md.ref.*`):** Define atomic palettes and raw values (e.g., `md.ref.palette.primary40: #0061A4`, `md.ref.typeface.brand: Roboto`).
- **System Tokens (`md.sys.*`):** Map semantic purpose to reference tokens across themes (e.g., `md.sys.color.primary`, `md.sys.elevation.level2`, `md.sys.shape.corner.medium`).
- **Component Tokens (`md.comp.*`):** Map individual component parts to system tokens (e.g., `md.comp.elevated-card.container.elevation: md.sys.elevation.level1`).

---

## 2. Dynamic Color & The HCT System

M3 departs from RGB/HSL and uses the **HCT** (Hue, Chroma, Tone) color space based on CAM16, ensuring that perceived contrast remains mathematically predictable regardless of hue.

### Key Palettes Generated from Seed Color
1. **Primary:** Key brand color used for dominant actions, active states, and prominent surfaces.
2. **Secondary:** Supporting accent color for secondary components, filter chips, and badges.
3. **Tertiary:** Contrasting accent color used for balance and dynamic expression.
4. **Neutral:** Backgrounds, surfaces, and high-emphasis canvas areas.
5. **Neutral Variant:** Surface variants, borders, outlines, and inactive states.
6. **Error:** Feedback, destructive actions, and invalid form states.

### Standard Tonal Steps
Every tonal palette is divided into 13 tonal stops: `0` (Black), `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `95`, `99`, `100` (White).

### Semantic Color Role Mapping
| System Token | Light Theme Tonal Mapping | Dark Theme Tonal Mapping | Primary Usage |
| :--- | :--- | :--- | :--- |
| `primary` | Primary 40 | Primary 80 | High-emphasis fill, FABs, primary buttons |
| `on-primary` | Primary 100 | Primary 20 | Text/icons on `primary` |
| `primary-container` | Primary 90 | Primary 30 | Low-to-medium emphasis containers |
| `on-primary-container` | Primary 10 | Primary 90 | Text/icons on `primary-container` |
| `secondary` | Secondary 40 | Secondary 80 | Less prominent components, chips |
| `on-secondary` | Secondary 100 | Secondary 20 | Text/icons on `secondary` |
| `secondary-container` | Secondary 90 | Secondary 30 | Tonal button containers, selected states |
| `on-secondary-container`| Secondary 10 | Secondary 90 | Text/icons on `secondary-container` |
| `tertiary` | Tertiary 40 | Tertiary 80 | Accent highlights, contrasting badges |
| `on-tertiary` | Tertiary 100 | Tertiary 20 | Text/icons on `tertiary` |
| `tertiary-container` | Tertiary 90 | Tertiary 30 | Visual differentiation containers |
| `on-tertiary-container` | Tertiary 10 | Tertiary 90 | Text/icons on `tertiary-container` |
| `error` | Error 40 | Error 80 | Error messages, destructive actions |
| `on-error` | Error 100 | Error 20 | Text/icons on `error` |
| `error-container` | Error 90 | Error 30 | Warning/error notification containers |
| `on-error-container` | Error 10 | Error 90 | Text/icons on `error-container` |
| `outline` | Neutral Variant 50 | Neutral Variant 60 | High-contrast borders, active strokes |
| `outline-variant` | Neutral Variant 80 | Neutral Variant 30 | Low-contrast dividers, inactive borders |

---

## 3. Surface & Elevation System

M3 replaces heavy drop shadows with **Tonal Elevation** (tinting the `surface` color with an alpha overlay of `primary`) and **Surface Container Roles**.

### Surface Container Hierarchy
Prefer using surface container tokens over calculating tint overlays manually:
- `surface-dim`: Lowest emphasis surface tone.
- `surface`: Baseline canvas surface.
- `surface-bright`: Inverted or elevated base background.
- `surface-container-lowest`: Deepest inset container (e.g., card inside dialog).
- `surface-container-low`: Bottom sheets, low-emphasis cards.
- `surface-container`: Default cards, text areas, search bars.
- `surface-container-high`: Dialogs, menus, elevated navigation.
- `surface-container-highest`: Highest contrast containers, unselected inputs.

### Tonal Elevation Levels
| Level | Elevation | Light Mode Primary Tint | Default Use Case |
| :--- | :--- | :--- | :--- |
| `level0` | `0dp` | 0% | Flat page background, uncontained text |
| `level1` | `1dp` | 5% | Elevated cards, search bars |
| `level2` | `3dp` | 8% | Contained dialogs, small menus |
| `level3` | `6dp` | 11% | Floating action buttons (resting), bottom sheets |
| `level4` | `8dp` | 12% | Nav drawers, active drag states |
| `level5` | `12dp` | 14% | Pickers, prominent modal dialogs |

---

## 4. Typography Scale

The M3 type system defines 15 standard styles divided across 5 roles: **Display**, **Headline**, **Title**, **Body**, and **Label**.

| Style | Token Name | Size | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display Large | `md.sys.typescale.display-large` | `57sp` | `64sp` | `-0.25sp` | Regular (400) |
| Display Medium | `md.sys.typescale.display-medium` | `45sp` | `52sp` | `0sp` | Regular (400) |
| Display Small | `md.sys.typescale.display-small` | `36sp` | `44sp` | `0sp` | Regular (400) |
| Headline Large | `md.sys.typescale.headline-large` | `32sp` | `40sp` | `0sp` | Regular (400) |
| Headline Medium| `md.sys.typescale.headline-medium`| `28sp` | `36sp` | `0sp` | Regular (400) |
| Headline Small | `md.sys.typescale.headline-small` | `24sp` | `32sp` | `0sp` | Regular (400) |
| Title Large | `md.sys.typescale.title-large` | `22sp` | `28sp` | `0sp` | Regular (400) |
| Title Medium | `md.sys.typescale.title-medium` | `16sp` | `24sp` | `+0.15sp`| Medium (500) |
| Title Small | `md.sys.typescale.title-small` | `14sp` | `20sp` | `+0.10sp`| Medium (500) |
| Body Large | `md.sys.typescale.body-large` | `16sp` | `24sp` | `+0.50sp`| Regular (400) |
| Body Medium | `md.sys.typescale.body-medium` | `14sp` | `20sp` | `+0.25sp`| Regular (400) |
| Body Small | `md.sys.typescale.body-small` | `12sp` | `16sp` | `+0.40sp`| Regular (400) |
| Label Large | `md.sys.typescale.label-large` | `14sp` | `20sp` | `+0.10sp`| Medium (500) |
| Label Medium | `md.sys.typescale.label-medium` | `12sp` | `16sp` | `+0.50sp`| Medium (500) |
| Label Small | `md.sys.typescale.label-small` | `11sp` | `16sp` | `+0.50sp`| Medium (500) |

---

## 5. Shape System

M3 employs geometric corner radius tokens to convey hierarchy and interactive state changes.

| Shape Token | Radius Value | Canonical Components |
| :--- | :--- | :--- |
| `shape.corner.none` | `0dp` | Full-width banners, rectangular media crops |
| `shape.corner.extra-small`| `4dp` | Text field containers, snackbars, tooltips |
| `shape.corner.small` | `8dp` | Chips, compact menus |
| `shape.corner.medium` | `12dp` | Cards, small dialogs, segmented buttons |
| `shape.corner.large` | `16dp` | Nav drawers, large cards, top app bar expansion |
| `shape.corner.extra-large`| `28dp` | Standard dialogs, search bars, FABs |
| `shape.corner.full` | `9999dp` / `100%` | Filled/tonal/outlined buttons, slider thumbs |

---

## 6. Motion & Easing Curves

Motion communicates state transitions through physical acceleration curves and semantic durations.

### Easing Tokens
- **Emphasized (`cubic-bezier(0.2, 0.0, 0.0, 1.0)`):** Default for standard on-screen expansions and element morphs.
- **Emphasized Decelerate (`cubic-bezier(0.05, 0.7, 0.1, 1.0)`):** Elements entering the viewport.
- **Emphasized Accelerate (`cubic-bezier(0.3, 0.0, 0.8, 0.15)`):** Elements exiting the viewport.
- **Standard (`cubic-bezier(0.2, 0.0, 0.0, 1.0)`):** Simple property transitions (e.g., color, opacity).

### Duration Tokens
- `short1` (`50ms`) to `short4` (`200ms`): Micro-interactions, ripples, switch toggles.
- `medium1` (`250ms`) to `medium4` (`400ms`): Dialog reveals, bottom sheet expansions.
- `long1` (`450ms`) to `long4` (`600ms`): Full-page transitions, complex layout morphs.

---

## 7. Adaptive Layouts & Breakpoints

M3 categorizes device viewports into five standard **Window Size Classes** to control navigation topology.

| Window Class | Breakpoint Range | Navigation Structure | Layout Strategy |
| :--- | :--- | :--- | :--- |
| **Compact** | `< 600dp` | Navigation Bar (Bottom) | Single pane, 4-column grid (16dp margin) |
| **Medium** | `600dp – 839dp` | Navigation Rail (Collapsed) | Single/split pane, 8-column grid (24dp margin) |
| **Expanded** | `840dp – 1199dp` | Navigation Rail / Modal Drawer | Supporting panel, 12-column grid (24dp margin) |
| **Large** | `1200dp – 1599dp`| Permanent Navigation Drawer | Dual pane, 12-column grid |
| **Extra Large** | `≥ 1600dp` | Permanent Drawer + Fixed Rails | Triple pane (list-detail-auxiliary) |

---

## 8. Component Reference Implementation Guidelines

### 8.1 Buttons
- **Filled Button:** `container`: `md.sys.color.primary`, `label`: `md.sys.color.on-primary`, `height`: `40dp`, `shape`: `shape.corner.full`. Use for primary page CTA.
- **Tonal Button:** `container`: `md.sys.color.secondary-container`, `label`: `md.sys.color.on-secondary-container`. Use for medium-priority actions.
- **Elevated Button:** `container`: `md.sys.color.surface-container-low`, `elevation`: `level1`. Use for floating contextual actions on textured surfaces.
- **Outlined Button:** `border`: `1dp solid md.sys.color.outline`, `container`: `transparent`. Use for secondary actions.
- **Text Button:** `container`: `transparent`, `padding`: `horizontal 12dp`. Use for tertiary actions and dialog footers.

### 8.2 Floating Action Buttons (FAB)
- **Standard FAB:** `56x56dp`, `shape.corner.large` (`16dp` or `28dp` for M3 Expressive), resting elevation `level3`.
- **Small FAB:** `40x40dp`, `shape.corner.medium` (`12dp`).
- **Large FAB:** `96x96dp`, `shape.corner.extra-large` (`28dp`).
- **Extended FAB:** Height `56dp`, radius `shape.corner.large`, includes icon + label.

### 8.3 Text Fields
- **Filled Text Field:** `container`: `md.sys.color.surface-container-highest`, bottom active border indicator `2dp md.sys.color.primary`, resting `1dp md.sys.color.on-surface-variant`.
- **Outlined Text Field:** `container`: `transparent`, outline `1dp md.sys.color.outline` resting, `2dp md.sys.color.primary` focused, `shape.corner.extra-small`.

---

## 9. Code Implementation Templates

### Web (CSS Custom Properties)
```css
:root {
    /* Color System */
    --md-sys-color-primary: #0061A4;
    --md-sys-color-on-primary: #FFFFFF;
    --md-sys-color-primary-container: #D1E4FF;
    --md-sys-color-on-primary-container: #001D36;
    
    --md-sys-color-surface: #FDFCFF;
    --md-sys-color-surface-container: #EDE8F2;
    --md-sys-color-on-surface: #1A1C1E;
    --md-sys-color-outline: #73777F;

    /* Shape Scale */
    --md-sys-shape-corner-none: 0px;
    --md-sys-shape-corner-xs: 4px;
    --md-sys-shape-corner-sm: 8px;
    --md-sys-shape-corner-md: 12px;
    --md-sys-shape-corner-lg: 16px;
    --md-sys-shape-corner-xl: 28px;
    --md-sys-shape-corner-full: 9999px;

    /* Typography */
    --md-sys-typescale-body-large-size: 16px;
    --md-sys-typescale-body-large-line-height: 24px;
    --md-sys-typescale-body-large-weight: 400;

    /* Motion */
    --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0.0, 1.0);
    --md-sys-motion-duration-medium2: 300ms;
}

.m3-button-filled {
    height: 40px;
    padding: 0 24px;
    border-radius: var(--md-sys-shape-corner-full);
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
}
```

### Jetpack Compose (Kotlin)
```kotlin
@Composable
fun M3StandardCard(
    title: String,
    body: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer,
            contentColor = MaterialTheme.colorScheme.onSurface
        ),
        shape = MaterialTheme.shapes.medium,
        elevation = CardDefaults.cardElevation(
            defaultElevation = 1.dp
        ),
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = body,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
```

---

## 10. Verification & Linting Checklist

When validating any UI output against M3:
- [ ] No hardcoded `#hex` colors in component styling; only semantic tokens.
- [ ] Light / Dark variants resolve across matching tone ratios (`primary 40` light <-> `primary 80` dark).
- [ ] Container surfaces use `surface-container-*` rather than raw opacity overlays where possible.
- [ ] Touch targets strictly respect minimum `48x48dp` bounding boxes, even when visual containers are smaller.
- [ ] Typography scale mappings use the 15 designated typescales with exact line-height parity.
- [ ] Responsive navigation switches between Bottom Bar, Rail, and Drawer at `600dp` and `840dp` thresholds.
