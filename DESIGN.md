# Design

## Theme

WKU soul-kline uses a restrained product interface: light neutral canvas, white analytical panels, dark ink text, and one teal signal accent. The UI should feel like a social intelligence terminal, not a horoscope, not a poster, and not an enterprise dashboard.

## Color

- Canvas: `#f3f6f8`
- Surface: `#ffffff`
- Raised surface: `#f8fafc`
- Border: `#d8e1e8`
- Ink: `#07111f`
- Muted ink: `#475569`
- Accent: teal/cyan family (`teal-700`, `teal-50`, `cyan-700`)
- Risk: rose family
- Warning or share: amber only for secondary tags

Avoid the legacy mystic purple, gold, cream, and cosmos palettes in WKU surfaces.

## Typography

Use the existing sans-serif/system stack. Product UI labels should use 12-14px, 600-800 weight. Hero display must remain below 6rem and avoid overly tight letter spacing. Form labels are sentence case, not wide-tracked uppercase.

## Components

- Panels: 8-12px radius, 1px border, little or no shadow.
- Buttons: 8px radius, clear hover/focus/active states, no duplicated primary intent.
- Inputs: labels above fields, 40-44px height, visible focus ring, no placeholder-only labels.
- Result cards: compact titles, evidence and suggestion separated by hierarchy.
- Chart: readable light theme, broad hover target, keyboard-focusable points, no hidden dark text.

## Layout

Desktop uses a two-column product workbench: sticky input/sidebar on the left, chart and results on the right. The top hero is a compact product header, not a full landing page. Mobile collapses to a single column with the mode switch near the top.

## Motion

Motion is limited to state feedback and chart reveal. Durations should stay between 150-300ms for product controls. Reduced motion must be respected where animation is added.
