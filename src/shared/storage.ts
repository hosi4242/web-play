import { STORAGE_PREFIX } from './site';

export function safeRead<T>(key: string, validate: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return validate(value) ? value : null;
  } catch { return null; }
}

export function safeWrite(key: string, value: unknown): boolean {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function safeRemove(key: string): void {
  try { localStorage.removeItem(STORAGE_PREFIX + key); } catch { /* private mode / disabled storage */ }
}
