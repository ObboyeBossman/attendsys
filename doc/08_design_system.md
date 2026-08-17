# Design System — Color & Visual Philosophy

This application follows a **monochromatic-first** design principle with **soft borderless elevation** aesthetics. The default state of every screen, component, and interaction is built entirely in black, white, and gray. Color is never used for decoration — it is used exclusively to communicate meaning.

---

## The Visual Hierarchy & Surface Aesthetics

**Soft Canvas (`#FAFAFA`) & Floating Pure White Cards (`#FFFFFF`)**
Surfaces, cards, and modal sheets float over a soft `#FAFAFA` off-white canvas with generous **`20px` rounded corners**.

**Borderless Elevation Containment**
Cards avoid heavy gray borders in favor of soft, borderless elevation (`box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03)` or subtle alpha hairlines `rgba(0, 0, 0, 0.05)`).

**Black carries all structure.**
Headings, body text, icons, and primary buttons are black (`#0A0A0A`). High-intent action buttons use full **pill radii (`border-radius: 9999px`)**.

**Gray handles everything in between.**
Secondary text, disabled states, placeholders, dividers, and subtle fills draw from the gray ramp (`#F5F5F7` to `#757575`).

---

## Color Appears in Exactly Three Situations

**Blue — `#1A42C2`**
Appears when the user is being invited to take a significant action — connecting a service, confirming a primary brand interaction, key CTAs, or progress indicators.

**Red — `#E53935`**
Appears only when something will be destroyed or cannot be undone — delete buttons, remove icons, critical error states.

**Everything else does not exist.**
No gradients, no decorative accents, no unnecessary visual noise.

---

## Quick Reference

| Element | Specification | Description |
|---|---|---|
| Canvas | `#FAFAFA` | Soft off-white screen background |
| Surface | `#FFFFFF` | Pure white cards, sheets, inputs |
| Card Elevation | `0 2px 12px rgba(0,0,0,0.03)` | Borderless soft elevation |
| Card Radius | `20px` (`--radius-xl`) | Smooth squircle rounded corners |
| Action Buttons | `#0A0A0A` Fill, `9999px` Radius | Pill-shaped high-intent CTA buttons |
| Blue CTA | `#1A42C2` | Primary brand action color |
| Red Danger | `#E53935` | Destructive/delete actions |
| Text | `#0A0A0A` / `#757575` | Black titles, muted gray body text |
