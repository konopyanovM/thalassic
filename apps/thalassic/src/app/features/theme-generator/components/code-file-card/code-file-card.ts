import { Component, inject, input } from '@angular/core';
import { Button } from '@thalassic/ui';
import { CopyTracker } from '../../services';
import { CodeFile } from '../../types';

/** One generated file: its name, a copy button, and its contents. */
@Component({
  selector: 'app-code-file-card',
  imports: [Button],
  templateUrl: './code-file-card.html',
  styleUrl: './code-file-card.scss',
  providers: [CopyTracker],
  host: { role: 'group', '[attr.aria-label]': 'file().fileName' },
})
export class CodeFileCard {
  // Injections
  /** Tracks the copy, for the button's "Copied" feedback. */
  protected readonly copyTracker = inject(CopyTracker);

  // Inputs
  /** File shown. */
  public readonly file = input.required<CodeFile>();
}
