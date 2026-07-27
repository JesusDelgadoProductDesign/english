/**
 * Storage abstraction. Every repository talks to this interface, never to
 * `localStorage` directly — swapping in a real backend later means writing one
 * new adapter (e.g. `HttpStorageAdapter`) and nothing else in the app changes.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly namespace: string = "verbly") {}

  private namespaced(key: string): string {
    return `${this.namespace}:${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(this.namespaced(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    window.localStorage.setItem(this.namespaced(key), JSON.stringify(value));
  }

  remove(key: string): void {
    window.localStorage.removeItem(this.namespaced(key));
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
