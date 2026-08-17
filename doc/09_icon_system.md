# AttendSys Icon System Guidelines

**Library:** Lucide React (`lucide-react`)  
**Design Context:** Professional university attendance system (TTU)  
**Theme:** Monochromatic-first Light Mode  
**Typography Pairing:** Plus Jakarta Sans + Inter  

These guidelines ensure icons remain clear, consistent, and purposeful across Admin, Lecturer, Rep, and Student portals.

---

## 1. Core Principles

1. **Clarity first**  
   Icons must be instantly recognizable, especially on mobile and in dense data tables.

2. **Consistency**  
   Use only Lucide icons. Do not mix icon libraries.

3. **Restraint**  
   AttendSys is a serious academic tool. Avoid decorative, playful, or excessive animation.

4. **Monochromatic by default**  
   Icons inherit the slate structural color (`#111827`). Brand Blue (`#1A42C2`) and Danger Red (`#E53935`) are used sparingly and intentionally.

5. **Performance**  
   Prefer tree-shaken individual imports. Avoid loading the entire Lucide set.

---

## 2. Technical Implementation

### Installation
```bash
npm install lucide-react
```

### Default Usage Pattern
```tsx
import { QrCode } from "lucide-react";

<QrCode 
  className="h-5 w-5 text-[#111827]" 
  strokeWidth={1.75} 
/>
```

### Recommended Defaults

| Property       | Value                  | Notes |
|----------------|------------------------|-------|
| Library        | `lucide-react`         | Only |
| Stroke Width   | `1.75` or `2`          | Balanced clarity |
| Default Size   | `h-5 w-5` (20px)       | Primary UI |
| Table Size     | `h-4 w-4` (16px)       | Dense data |
| Color          | `text-[#111827]`       | Primary Slate-900 |
| Active Color   | `text-[#1A42C2]`       | Brand Blue (CTAs only) |
| Destructive    | `text-[#E53935]`       | Danger actions only |

---

## 3. Sizing Scale

| Context                        | Size     | Tailwind / Inline Size | Use Case |
|--------------------------------|----------|----------------|----------|
| Navigation (Sidebar / Bottom)  | 20–22px  | 20px (`size={20}`) | Main navigation |
| Primary Action Buttons         | 18–20px  | 18px–20px | "Open Session", "Mark Attendance" |
| Table / List Actions           | 16px     | 16px (`size={16}`) | Row-level actions |
| Status Indicators              | 14–16px  | 14px–16px | Present / Absent / Late |
| Inline with text               | 16px     | 16px (`size={16}`) | Form labels, metadata |

---

## 4. Color Rules

| State / Type               | Color          | Hex        | When to Use |
|----------------------------|----------------|------------|-------------|
| Default                    | Primary Slate  | `#111827`  | Almost everything |
| Interactive / Hover        | Brand Blue     | `#1A42C2`  | Hover or active interactive icons |
| Active / Selected          | Brand Blue     | `#1A42C2`  | Current page or selected state |
| Success / Present          | Success Green  | `#16A34A`  | Active status |
| Destructive                | Danger Red     | `#E53935`  | Delete, remove, critical actions |
| Disabled                   | Medium Gray    | `#9CA3AF`  | Disabled controls |

---

## 5. Hover Animation Guidelines

### Philosophy
Hover animations must be **subtle, purposeful, and limited**.  
Over-animation reduces professionalism and creates visual noise in data-heavy screens.

### When to Animate on Hover

| Situation                              | Animate? | Recommended Effect                  | Intensity |
|----------------------------------------|----------|-------------------------------------|-----------|
| Sidebar / Bottom navigation icons      | Yes      | Scale `1.05–1.08` + color to Brand Blue | Very subtle |
| Primary action buttons                 | Yes      | Scale `1.05` + color change         | Low |
| Icon-only buttons (desktop)            | Yes      | Scale or soft color change          | Low |
| Table row action icons                 | No       | Color change only (optional)        | Minimal |
| Mobile                                 | No       | Use `:active` / pressed states      | — |

---

## 6. Summary Checklist

- [x] Using **Lucide React** only
- [x] Consistent `strokeWidth` (1.75 or 2)
- [x] Correct sizing per context
- [x] Monochromatic slate by default (`#111827`)
- [x] Brand Blue and Red used only intentionally
- [x] Hover animations limited to navigation and primary actions
- [x] Mobile uses pressed states instead of hover
- [x] Accessible names provided for icon-only buttons
