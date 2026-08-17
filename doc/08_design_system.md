# Design System — Color & Visual Philosophy

This application follows a **monochromatic-first** design principle. The default state of every screen, component, and interaction is built entirely in black, white, and gray. Color is never used for decoration — it is used exclusively to communicate meaning.

---

## The Hierarchy

**White and light gray form the canvas.**
Surfaces, cards, backgrounds, and input fields live here (`#F4F4F4` app canvas, `#FFFFFF` surfaces). The screen should feel open, clean, and uncluttered by default.

**Black carries all structure.**
Headings, body text, icons, borders, and primary buttons are black (`#0A0A0A`). If something needs to be seen and understood, it is black on white — no color needed.

**Gray handles everything in between.**
Secondary text, disabled states, placeholders, dividers, and subtle fills draw from the gray ramp (`#F5F5F5` to `#616161`). Gray communicates "this is here but not the focus right now."

---

## Color Appears in Exactly Three Situations

**Blue — `#1A42C2`**
Appears when the user is being invited to take a significant action — connecting a service, upgrading, confirming a primary brand interaction, or key CTAs. It signals opportunity and forward motion. It should never appear as a background fill, a decorative element, or more than once on a screen at a time.

**Red — `#E53935`**
Appears only when something will be destroyed or cannot be undone — delete buttons, remove icons, critical error states. Its presence is a warning. It should never be used for anything that is reversible or neutral.

**Everything else does not exist.**
No gradients, no additional accents, no illustrative tones — unless explicitly introduced for a specific, justified purpose that has been approved.

---

## The Underlying Rule

If you find yourself reaching for color to make something look better, stop.

Make it work in black and white first. Color is the last thing added, not the first. Every use of color must answer the question: *what does this color tell the user about what they should do or what is happening?* If it has no answer, the color does not belong.

---

## Quick Reference

| Color | Hex | When to use |
|---|---|---|
| Blue | `#1A42C2` | Primary CTA, connect, upgrade, active state |
| Red | `#E53935` | Delete, remove, irreversible actions, errors |
| Black | `#0A0A0A` | Text, icons, primary buttons, structure |
| Gray | `#F5F5F5` → `#616161` | Backgrounds, borders, secondary text, disabled |
| White | `#FFFFFF` | Surfaces, cards, inputs |
