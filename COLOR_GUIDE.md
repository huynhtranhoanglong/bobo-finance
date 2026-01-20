# Color System Guide - Bobo Finance

> This document records the complete color system used in the Bobo Finance application.
> Purpose: Serve as a reference for consistency, detecting hardcoded values, and maintaining unified UI.

---

## 1. Brand Palette - v1.5.0

Defined centrally in `utils/colors.ts`. This is the Single Source of Truth (SSOT) for color logic in TypeScript code.

### 1.1. Brand Colors
| Variable | Hex Code | Description | Usage |
|---|---|---|---|
| `brand` | `#598c58` | 🟢 Sage Green | Primary brand color, buttons, accents |
| `brandHover` | `#4a7a49` | 🟢 Dark Sage | Hover state for brand buttons |
| `neutral` | `#64748b` | 🔘 Slate 500 | Secondary text, borders, placeholders |

### 1.2. Transaction Type Colors (NEW v1.5.0)
| Variable | Hex Code | Description | Usage |
|---|---|---|---|
| `income` | `#10b981` | 🟢 Emerald 500 | Income, positive balances |
| `expense` | `#f43f5e` | 🔴 Rose 500 | Expenses, negative balances |
| `transfer` | `#3b82f6` | 🔵 Blue 500 | Transfers between wallets |

### 1.3. Spending Category Colors (NEW v1.5.0)
| Variable | Hex Code | Description | Usage |
|---|---|---|---|
| `mustHave` | `#598c58` | 🟢 Brand | Essential/Must-have spending |
| `niceToHave` | `#f59e0b` | 🟡 Amber 500 | Non-essential spending |
| `waste` | `#e11d48` | 🔴 Rose 600 | Wasteful spending |

---

## 2. Theme System (Tailwind CSS Variables)

Defined in `app/globals.css` and used via Tailwind classes. Supports Dark Mode.

### 2.1. Background & Base Colors

| CSS Variable | Light Mode (oklch) | Dark Mode (oklch) | Description |
|---|---|---|---|
| `--background` | `1 0 0` (White) | `0.145 0 0` (Black) | Main page background |
| `--foreground` | `0.145 0 0` (Black) | `0.985 0 0` (White) | Main text color |
| `--card` | `1 0 0` | `0.205 0 0` | Card backgrounds |
| `--popover` | `1 0 0` | `0.205 0 0` | Popup/dialog backgrounds |
| `--primary` | `0.205 0 0` (Black) | `0.922 0 0` (White) | Primary UI elements |
| `--muted` | `0.97 0 0` | `0.269 0 0` | Muted/secondary backgrounds |
| `--border` | `0.922 0 0` | `1 0 0 / 10%` | Component borders |

### 2.2. Chart Colors

| Variable | Value (Light) | Description |
|---|---|---|
| `--chart-1` | `0.646 0.222 41.116` | 🟠 Dark Orange |
| `--chart-2` | `0.6 0.118 184.704` | 🔵 Ocean Blue |
| `--chart-3` | `0.398 0.07 227.392` | 🔵 Deep Blue |
| `--chart-4` | `0.828 0.189 84.429` | 🟡 Yellow |
| `--chart-5` | `0.769 0.188 70.08` | 🟠 Orange |

---

## 3. Hardcoded Values to Refactor

Below is a list of files using direct hex codes instead of variables from `utils/colors.ts` or Tailwind classes.

### 3.1. File `app/actions/send-feedback.ts`
This is an HTML email template sent via Resend, requiring inline styles. However, these colors don't match the brand palette.

| Location | Hex Code | Suggested Replacement | Notes |
|---|---|---|---|
| h2 style | `#1e293b` | `COLORS.brand` (`#598c58`) | Email title should use brand |
| hr style | `#e2e8f0` | `COLORS.neutral` (lighter) | Separator line |
| td style | `#64748b` | `COLORS.neutral` | Label text color |
| div style | `#f8fafc` | Light brand background | Content container |
| p style | `#94a3b8` | `COLORS.neutral` | Footer text |

### 3.2. File `components/ui/switch.tsx` ✅ REFACTORED (v1.4.12)
Switch component now uses variables from `utils/colors.ts`.

| Before | After |
|---|---|
| `data-[state=checked]:bg-[#598c58]` | `style={{ "--switch-checked": COLORS.brand }}` + `bg-[var(--switch-checked)]` |

---

## 4. AI Recommendations for Color Changes

### Design Philosophy
🎨 Sage Green (#598c58) as the primary color creates a calm, safe, and professional feel for financial management.

### 4.1. Primary Color Scale (Sage Green)

Developed from base color #598c58. Used for brand identity elements.

| Level | Hex | Tailwind | Application |
|---|---|---|---|
| Primary 50 | #f4f7f4 | bg-primary-50 | Light Card backgrounds, hover states |
| Primary 100 | #e6ede6 | bg-primary-100 | Icon backgrounds, light badges |
| Primary 500 | #6da16c | bg-primary-500 | Button hover states |
| Primary 600 | #598c58 | bg-primary-600 | Main color (buttons, active tabs) |
| Primary 900 | #324d31 | text-primary-900 | Dark heading text |

### 4.2. Financial Semantic Colors

Used for quick classification of cash flows.

**Transaction Classification:**
- Income: #10b981 (emerald-500) - Represents growth
- Expense: #f43f5e (rose-500) - Represents outflow
- Transfer: #3b82f6 (blue-500) - Represents movement (neutral)

**Spending Categories:**
- Must-have: primary-600 - Essential, stable
- Nice-to-have: #f59e0b (amber-500) - Consider carefully
- Waste: #e11d48 (rose-600) - Negative warning

### 4.3. Neutral Colors

Using Slate (blue-gray) palette for a modern, eye-friendly interface.

| Element | Hex | Tailwind | Notes |
|---|---|---|---|
| Background | #f8fafc | bg-slate-50 | App background |
| Surface | #ffffff | bg-white | Cards, modals |
| Border | #e2e8f0 | border-slate-200 | Separators, input borders |
| Text Main | #1e293b | text-slate-800 | Primary content |
| Text Muted | #64748b | text-slate-500 | Secondary notes, dates |

---

## 5. UI Display Guidelines

### 5.1. Privacy Mode
When Privacy Mode is enabled:
- Keep `text-income` or `text-expense` colors
- Replace amount text with `******` to hide balances while maintaining the financial vibe

### 5.2. Debt Status Display

| Progress | Color | Meaning |
|---|---|---|
| < 30% | Red | High remaining debt |
| 30% - 70% | Gray | Making progress |
| > 70% | Green | Almost paid off |

### 5.3. Financial Progress Bar
Progress bar uses gradient from primary-100 to primary-600 to represent net worth accumulation.

---

Last updated: 2026-01-20