import { DecimalPipe } from '@angular/common';
import { Component, computed, input, model, Signal } from '@angular/core';
import { themeType } from '@thalassic/core';
import { Button, InputNumber } from '@thalassic/ui';
import {
  DEFAULT_ROLE_TONES,
  ROLE_GROUPS,
  TONE_MAX,
  TONE_MIN,
} from '../../theme-generator.constants';
import { colorRole, RoleGroupView, RoleTones, ThemeRoles } from '../../types';
import { contrastRatio, contrastVerdictOf, isTone, resolveRoleTones } from '../../utils';

/**
 * Color roles of one mode, group by group: the tone each role reads from its
 * palette, editable, followed by foreground-on-background tiles graded for WCAG
 * contrast — so a tone change shows its effect on legibility beside it.
 */
@Component({
  selector: 'app-role-grid',
  imports: [Button, DecimalPipe, InputNumber],
  templateUrl: './role-grid.html',
  styleUrl: './role-grid.scss',
})
export class RoleGrid {
  // Inputs
  /** Resolved roles of the mode shown. */
  public readonly roles = input.required<ThemeRoles>();
  /** Mode the roles belong to, named in the heading and deciding the default tones. */
  public readonly mode = input.required<themeType>();
  /**
   * Tone at which the primary palette comes closest to the seed color, or
   * `null` when no tone does — the palette then has the variant's chroma rather
   * than the seed's.
   */
  public readonly seedTone = input.required<number | null>();
  /** Tones replacing the mode's defaults; a role left out keeps its default. */
  public readonly overrides = model.required<Partial<RoleTones>>();

  // State
  /** Lowest tone a role can read. */
  protected readonly toneMin = TONE_MIN;
  /** Highest tone a role can read. */
  protected readonly toneMax = TONE_MAX;

  // Computed
  /** Name of the mode, for the heading and for telling the two grids' fields apart. */
  protected readonly modeTitle: Signal<string> = computed(() =>
    this.mode() === 'light' ? 'Light' : 'Dark',
  );

  /** Tone every role reads in the mode, overrides applied. */
  protected readonly tones: Signal<RoleTones> = computed(() =>
    resolveRoleTones(this.overrides(), this.mode()),
  );

  /** Role groups with every pair resolved to colors, a ratio, and a verdict. */
  protected readonly groups: Signal<RoleGroupView[]> = computed(() => {
    const roles = this.roles();

    return ROLE_GROUPS.map(group => ({
      title: group.title,
      roles: group.roles,
      pairs: group.pairs.map(pair => {
        const backgroundHex = roles[pair.background];
        const foregroundHex = roles[pair.foreground];
        const ratio = contrastRatio(backgroundHex, foregroundHex);

        return {
          ...pair,
          backgroundHex,
          foregroundHex,
          ratio,
          verdict: contrastVerdictOf(ratio, pair.requirement),
        };
      }),
    }));
  });

  // Protected methods
  /**
   * Applies a tone typed for a role. Anything but a whole tone in range — an
   * emptied field, a fraction — is left pending rather than applied, so editing
   * never snaps the field mid-keystroke; `commitTone` settles it. A tone equal to
   * the default drops the override.
   */
  protected setTone(role: colorRole, tone: number | null): void {
    if (tone === null || !isTone(tone)) return;
    if (tone === DEFAULT_ROLE_TONES[this.mode()][role]) {
      this.resetTone(role);
      return;
    }

    this.overrides.update(overrides => ({ ...overrides, [role]: tone }));
  }

  /**
   * Settles a role's field once editing is committed (blur or Enter): a typed
   * fraction applies rounded, and the field is set back to the tone in effect,
   * so it never shows a value the theme isn't using.
   */
  protected commitTone(role: colorRole, field: InputNumber, event: Event): void {
    const typed = field.value();
    if (typed !== null) this.setTone(role, Math.round(typed));

    // Both the model and the element are set: the field's binding re-renders
    // only when the model differs from what it last rendered, which a commit
    // landing before change detection would leave it unaware of.
    const tone = this.tones()[role];
    field.value.set(tone);
    if (event.target instanceof HTMLInputElement) event.target.value = String(tone);
  }

  /** Returns a role to its default tone. */
  protected resetTone(role: colorRole): void {
    this.overrides.update(overrides => {
      const remaining = { ...overrides };
      delete remaining[role];
      return remaining;
    });
  }
}
