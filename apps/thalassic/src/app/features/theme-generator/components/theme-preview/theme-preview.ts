import { Component, computed, input, Signal } from '@angular/core';
import { DARK_THEME_CLASS, themeType } from '@thalassic/core';
import {
  Button,
  Checkbox,
  Chip,
  FormItem,
  Input,
  Progress,
  Slider,
  Switch,
  Tab,
  Tabs,
  ToggleGroup,
} from '@thalassic/ui';
import {
  PREVIEW_SCOPE_CLASS,
  PREVIEW_SEGMENTS,
  SURFACE_LADDER,
} from '../../theme-generator.constants';

/**
 * A sampler of library components painted in one mode of the generated theme.
 * The host is a theme scope: it carries the mode's scope class, which the
 * generated stylesheet fills with that mode's color roles, so the sampler shows
 * the mode regardless of the mode the page itself is in.
 */
@Component({
  selector: 'app-theme-preview',
  imports: [
    Button,
    Checkbox,
    Chip,
    FormItem,
    Input,
    Progress,
    Slider,
    Switch,
    Tab,
    Tabs,
    ToggleGroup,
  ],
  templateUrl: './theme-preview.html',
  styleUrl: './theme-preview.scss',
  host: {
    role: 'region',
    '[class]': 'hostClasses()',
    '[style.color-scheme]': 'mode()',
    '[attr.aria-label]': 'title()',
  },
})
export class ThemePreview {
  // Inputs
  /** Mode the sampler is painted in. */
  public readonly mode = input.required<themeType>();

  // State
  /** Surface container roles painted as the stacked surface ladder. */
  protected readonly surfaceLadder = SURFACE_LADDER;
  /** Options of the sample toggle group. */
  protected readonly segments = PREVIEW_SEGMENTS;

  // Computed
  /**
   * Scope classes for the mode. A dark scope also carries the dark theme class,
   * so component rules keyed to it apply inside the scope too.
   */
  protected readonly hostClasses: Signal<string> = computed(() => {
    const mode = this.mode();
    const classes = `${PREVIEW_SCOPE_CLASS} ${PREVIEW_SCOPE_CLASS}--${mode}`;
    return mode === 'dark' ? `${classes} ${DARK_THEME_CLASS}` : classes;
  });

  /** Accessible name of the region. */
  protected readonly title: Signal<string> = computed(() =>
    this.mode() === 'light' ? 'Light preview' : 'Dark preview',
  );
}
