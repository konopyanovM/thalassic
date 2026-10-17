import { Component, inject, input } from '@angular/core';
import { Button } from '@thalassic/ui';
import { CopyTracker } from '../../services';
import { ScssFile } from '../../types';

/** One generated SCSS file: its name, a copy button, and its contents. */
@Component({
  selector: 'app-scss-file-card',
  imports: [Button],
  templateUrl: './scss-file-card.html',
  styleUrl: './scss-file-card.scss',
  providers: [CopyTracker],
  host: { role: 'group', '[attr.aria-label]': 'file().fileName' },
})
export class ScssFileCard {
  // Injections
  /** Tracks the copy, for the button's "Copied" feedback. */
  protected readonly copyTracker = inject(CopyTracker);

  // Inputs
  /** File shown. */
  public readonly file = input.required<ScssFile>();
}
