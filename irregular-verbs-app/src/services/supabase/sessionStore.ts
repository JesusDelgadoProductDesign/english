/**
 * Plain (non-React) store for the current Supabase user id. `AuthContext` is the
 * only writer (via `supabase.auth.onAuthStateChange`); repositories and other
 * plain services read from here instead of importing a React context, so the
 * storage layer stays framework-agnostic.
 */
type Listener = (userId: string | null) => void;

let currentUserId: string | null = null;
const listeners = new Set<Listener>();

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId;
  listeners.forEach((listener) => listener(userId));
}

export function subscribeToUserId(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function requireCurrentUserId(): string {
  if (!currentUserId) throw new Error("requireCurrentUserId() called with no signed-in user");
  return currentUserId;
}
