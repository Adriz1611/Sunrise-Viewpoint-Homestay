/**
 * Tiny handshake between the Preloader and anything waiting to animate
 * (the Hero intro). Module state is shared within the client bundle, so no
 * globals on window are needed.
 */
type Listener = () => void;

let revealed = false;
const listeners = new Set<Listener>();

/** Preloader calls this once its exit transition starts. Idempotent. */
export function markRevealed() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

/**
 * Runs `fn` when the site is revealed (immediately if it already happened).
 * Returns an unsubscribe function.
 */
export function onRevealed(fn: Listener) {
  if (revealed) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
