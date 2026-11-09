import { flushSync } from "react-dom";

const REVEAL_MS = 700;

/** Applies a theme change as a circle growing from (x, y), when the browser allows it. */
export function revealTheme(apply: () => void, x: number, y: number): void {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    return;
  }

  const transition = document.startViewTransition(() => flushSync(apply));
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  void transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: REVEAL_MS,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}
