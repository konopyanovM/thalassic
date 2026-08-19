/**
 * jsdom's `HTMLMediaElement.textTracks` is a plain array, not an `EventTarget`,
 * so `MediaController.attach`'s `addEventListener` call on it throws. Patches
 * the getter for the lifetime of a spec file so every element returns a list
 * augmented with event-listener stubs, standing in for a real browser's
 * `TextTrackList`. Call `patch()` in `beforeAll` and the returned `restore`
 * in `afterAll` to scope the patch to that file.
 */
export const patchTextTracksEventTarget = (): { restore: () => void } => {
  const textTracksDescriptor = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'textTracks',
  );
  if (!textTracksDescriptor || !textTracksDescriptor.get) return { restore: () => undefined };

  const originalGetter = textTracksDescriptor.get;
  Object.defineProperty(HTMLMediaElement.prototype, 'textTracks', {
    ...textTracksDescriptor,
    get(this: HTMLMediaElement) {
      const tracks = originalGetter.call(this) as unknown as Record<string, unknown>;
      if (typeof tracks['addEventListener'] !== 'function') {
        tracks['addEventListener'] = () => undefined;
        tracks['removeEventListener'] = () => undefined;
      }
      return tracks;
    },
  });

  return {
    restore: () =>
      Object.defineProperty(HTMLMediaElement.prototype, 'textTracks', textTracksDescriptor),
  };
};
