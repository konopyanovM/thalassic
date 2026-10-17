import { DecimalPipe } from '@angular/common';
import { Component, computed, input, Signal } from '@angular/core';
import { themeType } from '@thalassic/core';
import { ROLE_GROUPS } from '../../theme-generator.constants';
import { RoleGroupView, ThemeRoles } from '../../types';
import { contrastRatio, contrastVerdictOf } from '../../utils';

/** Color roles of one mode as foreground-on-background tiles, each graded for WCAG contrast. */
@Component({
  selector: 'app-role-grid',
  imports: [DecimalPipe],
  templateUrl: './role-grid.html',
  styleUrl: './role-grid.scss',
})
export class RoleGrid {
  // Inputs
  /** Resolved roles of the mode shown. */
  public readonly roles = input.required<ThemeRoles>();
  /** Mode the roles belong to, named in the heading. */
  public readonly mode = input.required<themeType>();

  // Computed
  /** Role groups with every pair resolved to colors, a ratio, and a verdict. */
  protected readonly groups: Signal<RoleGroupView[]> = computed(() => {
    const roles = this.roles();

    return ROLE_GROUPS.map(group => ({
      title: group.title,
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
}
