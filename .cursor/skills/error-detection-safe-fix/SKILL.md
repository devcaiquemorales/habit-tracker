---
name: error-detection-safe-fix
description: Scans files for TypeScript, React, hooks, lint, and runtime-risk issues and applies the safest possible fix without changing product behavior. Use when the editor shows errors or warnings, React reports anti-patterns, TypeScript fails, hooks or effects misbehave, local state feels unstable, or files feel technically fragile.
alwaysApply: false
---

# Error Detection & Safe Fix

## Goal

Systematically inspect code for technical issues and apply **safe** fixes. This is a **stability pass**, not a feature pass.

Focus on:

- Real errors
- Unstable patterns
- Hook misuse
- State/effect mistakes
- Type issues
- Lint warnings that indicate actual code problems

---

## When to Apply

- Editor shows warnings or errors
- React reports anti-patterns
- TypeScript complains
- Hooks behave unexpectedly
- Effects cause bugs
- Local state becomes unstable
- Files feel technically fragile

---

## 1. What to Check

### TypeScript

- Invalid or missing types
- Overly loose `any`
- Nullable handling
- Incorrect unions
- Invalid prop typing
- Stale inferred types

### React

- `setState` inside effects when avoidable
- Derived state stored unnecessarily
- State sync anti-patterns
- Unstable renders
- Remount from `key` misuse
- State reset from effect misuse
- Prop drilling that causes instability

### Hooks

- Incorrect, missing, or excessive dependency arrays
- `useEffect` doing work that should be derived
- `useMemo` / `useCallback` misuse
- Refs that should replace state (or vice versa, when clear)
- Effects that cascade renders

### Runtime-risk patterns

- Optional values used without guards
- Unguarded array access
- Date logic on missing values
- Invalid assumptions about selected items
- Stale closures in handlers/effects
- Event handlers tied to outdated state

### Lint / static analysis

- Warnings that signal real bugs (React, hooks, etc.)
- Unused code from refactors
- Dead branches that obscure logic

---

## 2. Fix Philosophy (critical)

Prefer the **safest** fix:

- Preserve current product behavior
- Avoid redesigning logic unless necessary
- Prefer local fixes over broad rewrites
- Do **not** silence warnings without fixing root cause

---

## 3. Effect and State Rules

### A. Avoid synchronous `setState` in effects for derivation

If state is only derived from props or other state, **derive it** (render-time computation, memoized selector) instead of syncing in an effect.

### B. Use effects for external side effects only

- Subscriptions
- DOM APIs
- Timers
- Storage / browser APIs
- Network

### C. Initializing UI state from props

- Prefer lazy initial state (`useState(() => …)`)
- Or controlled reset tied to a **clear** transition (e.g. dialog open/id change)
- Avoid unconditional effect-driven sync of props → local state

---

## 4. Safe Refactor Patterns

Prefer:

- Derive state instead of duplicating it
- Compute with functions/selectors
- Refs for one-time init flags when appropriate
- Split broad effects into focused ones
- Narrow types instead of casting
- Guards before unsafe access
- Simpler condition trees

---

## 5. Output Workflow (per file)

**Step 1** — Identify: real errors, risky warnings, probable bug sources.

**Step 2** — Briefly explain: what is wrong, why, what the safe fix is.

**Step 3** — Apply the fix with **minimal** behavioral change.

---

## 6. Do Not

- Redesign the product
- Refactor unrelated code
- Use lint ignores unless unavoidable and justified
- Replace precise fixes with large rewrites
- Change UX unless fixing the bug requires it
- Add more state when duplication is the problem

---

## 7. Priority Order

1. Runtime bugs
2. React / hooks instability
3. TypeScript correctness
4. Lint with real technical value
5. Minor cleanup

---

## 8. Special Attention (this codebase)

Be extra careful with:

- Dialogs and form state reset
- Selected item state derived from lists
- Effects syncing props into local form state
- Date-based UI
- Scroll state
- Heatmap selection logic
- Update-activity selection / button state
- Edit/create modal initialization

---

## 9. Expected Result

After the pass, the file should be:

- Safer and clearer
- Less fragile
- Free of avoidable React/type errors
- **Behaviorally equivalent** unless correcting an actual bug
