// Polyfills for the unit-test environment. Angular's platform reports as a browser
// (`isPlatformBrowser` is true), but the underlying runtime does not expose `localStorage`
// or `matchMedia`, which browser-only services such as ThemeService rely on during init.

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();

  const localStorageStub: Storage = {
    get length(): number {
      return store.size;
    },
    clear(): void {
      store.clear();
    },
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub });
}

if (typeof globalThis.matchMedia === 'undefined') {
  /** Accepts a listener and drops it: the stub's `matches` never changes, so no change event is ever dispatched. */
  const ignoreListener = (): void => undefined;

  const matchMediaStub = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: ignoreListener,
      removeEventListener: ignoreListener,
      addListener: ignoreListener,
      removeListener: ignoreListener,
      dispatchEvent(): boolean {
        return false;
      },
    }) as MediaQueryList;

  Object.defineProperty(globalThis, 'matchMedia', { value: matchMediaStub });
}
