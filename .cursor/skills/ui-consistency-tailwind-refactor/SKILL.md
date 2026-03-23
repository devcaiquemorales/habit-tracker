---
name: ui-consistency-tailwind-refactor
description: Systematically fixes Tailwind classes, layout inconsistencies, and UI patterns for canonical, readable styling without redesigning. Use when lint warns on Tailwind, duplicated or conflicting classes appear, layout feels inconsistent across screens, or JSX class strings are messy.
alwaysApply: false
---

# UI Consistency & Tailwind Refactor

## Goal

Clean and standardize UI code: canonical Tailwind, no duplicate/conflicting utilities, predictable layout, readable JSX. **Refactor only**—not a visual redesign.

## When to Apply

- Repeated Tailwind or style lint warnings
- Suggestions like combining `top-0 bottom-0` → `inset-y-0`
- Inconsistent layout patterns across screens
- Duplicated or noisy `className` strings
- Readability of styling code is degrading

## 1. Canonical Tailwind (critical)

Prefer shorthand utilities; do not mix shorthand with redundant explicit edges.

| Instead of                      | Use         |
| ------------------------------- | ----------- |
| `top-0 bottom-0`                | `inset-y-0` |
| `left-0 right-0`                | `inset-x-0` |
| `top-0 right-0 bottom-0 left-0` | `inset-0`   |

Apply the same idea for other Tailwind shorthands when they are equivalent and unambiguous.

## 2. Remove duplication and conflicts

- Drop repeated classes (`w-full w-full`).
- Resolve conflicts by keeping the **intended** final value (`p-2 p-4` → one padding).
- Remove redundant combinations that Tailwind already covers.

## 3. Class order (readability)

Order `className` roughly:

1. Layout (`flex`, `grid`, `position`, `inset-*`)
2. Sizing (`w-*`, `h-*`, `max-w-*`, …)
3. Spacing (`p-*`, `m-*`, `gap-*`)
4. Typography
5. Colors
6. Effects (`shadow-*`, `opacity-*`, …)
7. Transitions / animations

Keep existing project conventions if a file or component already follows a stable order—do not fight working patterns for marginal gain.

## 4. Normalize layout

- Drop redundant pairs like `w-full max-w-full` when one is enough.
- Remove unnecessary wrappers only when safe and behavior stays identical.
- Prefer minimal, predictable constraints—avoid over-specified flex/grid stacks.

## 5. Height / width

- Prefer standard utilities (`min-h-screen`, `h-screen`, etc.) over arbitrary values when equivalent.
- Avoid mixing `h-full`, `min-h-*`, and fixed `h-*` without a clear reason; simplify when behavior is unchanged.

## 6. Avoid over-specification

Remove redundant combinations, for example:

- `w-full` + `max-w-full` when redundant
- `absolute` + full `inset-*` + duplicate width/height
- Extra flex/grid wrappers that add no layout value

## 7. Extract patterns (sparingly)

If the **same** long class string repeats in multiple places, consider a small shared component or a single utility class—**only** when extraction is clearly simpler than duplication. Do not over-engineer.

## 8. Preserve behavior (mandatory)

- Do **not** change how the UI looks unless something is clearly wrong.
- Do **not** change spacing for “style” reasons.
- Do **not** redesign or introduce new visual decisions.

## 9. Uncertain changes

If equivalence or side effects are ambiguous, **do not guess**—leave the original classes or ask.

## 10. How to edit

- Apply fixes directly in files; keep diffs focused on styling.
- Avoid new comments unless they explain non-obvious constraints the code cannot express.

## Optional (when obvious)

- Align spacing with the design scale; replace magic `px` with Tailwind tokens when equivalent.
- Standardize responsive prefixes (`sm:`, `md:`, `lg:`) to match nearby components.

## Do not

- Refactor business logic or data flow.
- Restructure components unless required for the styling fix.
- Break responsiveness or accessibility.

## Expected outcome

- Canonical Tailwind with less lint noise
- No duplicate or conflicting utilities in touched code
- Clearer, more consistent `className` usage and layout patterns
