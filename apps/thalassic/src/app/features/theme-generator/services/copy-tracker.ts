import { Clipboard } from '@angular/cdk/clipboard';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { COPY_FEEDBACK_DURATION } from '../theme-generator.constants';

/**
 * Copies text to the clipboard and remembers, for a short while, which item
 * was copied — enough for a button to read "Copied" before reverting.
 */
@Injectable()
export class CopyTracker {
  // Injections
  private readonly _clipboard = inject(Clipboard);

  // State
  /** Key of the item copied most recently, `null` once its feedback has elapsed. */
  public readonly copiedKey = signal<string | null>(null);

  /** Pending timer that clears `copiedKey`. */
  private _resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this._resetTimer));
  }

  // Public methods
  /** Copies `text`, flagging `key` as copied only when the copy succeeded. */
  public copy(key: string, text: string): void {
    if (!this._clipboard.copy(text)) return;

    clearTimeout(this._resetTimer);
    this.copiedKey.set(key);
    this._resetTimer = setTimeout(() => this.copiedKey.set(null), COPY_FEEDBACK_DURATION);
  }
}
