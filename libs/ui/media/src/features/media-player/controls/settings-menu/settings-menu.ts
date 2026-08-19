import { Component, computed, inject, Signal, viewChild } from '@angular/core';
import { Icon, Menu, MenuActionItem, MenuItemDefinition, MenuTriggerDirective, systemIcon } from '@thalassic/ui';
import { MediaController } from '../../media-controller';
import { MEDIA_PLAYER_CONFIG } from '../../media-player.token';
import { MEDIA_SOURCE_ENGINE } from '../../media-source-engine';

/**
 * Gear-triggered popup assembling the player's configurable choices —
 * playback rate, caption track and, when the attached source engine reports
 * renditions, quality — as radio groups inside one `tls-menu`. Renders
 * nothing when there is only the default rate and no tracks or levels to
 * choose between, since a settings affordance with a single, fixed choice
 * offers nothing to configure.
 */
@Component({
  selector: 'tls-media-settings-menu',
  imports: [Icon, Menu, MenuTriggerDirective],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
  host: {
    class: 'tls-media-settings-menu',
  },
})
export class MediaSettingsMenu {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);
  private readonly _engine = inject(MEDIA_SOURCE_ENGINE, { optional: true });

  protected readonly labels = this._config.labels;
  protected readonly iconName: systemIcon = 'settings';

  // State
  protected readonly menu = viewChild<Menu>('menu');

  // Computed
  private readonly _rateItems: Signal<MenuActionItem[]> = computed<MenuActionItem[]>(() =>
    this._config.rateOptions.map(rate => ({
      type: 'item',
      role: 'menuitemradio',
      label: rate === 1 ? '1×' : `${rate}×`,
      checked: this._controller.rate() === rate,
      closeOnSelect: false,
      action: () => this._controller.setRate(rate),
    })),
  );

  private readonly _captionItems: Signal<MenuItemDefinition[]> = computed(() => {
    const tracks = this._controller.textTracks();
    if (tracks.length === 0) return [];

    const items: MenuItemDefinition[] = [
      { type: 'divider' },
      { type: 'label', label: this.labels.captions },
      {
        type: 'item',
        role: 'menuitemradio',
        label: this.labels.captionsOff,
        checked: !tracks.some(track => track.active),
        closeOnSelect: false,
        action: () => this._controller.selectTextTrack(null),
      },
    ];
    for (const track of tracks) {
      items.push({
        type: 'item',
        role: 'menuitemradio',
        label: track.label,
        checked: track.active,
        closeOnSelect: false,
        action: () => this._controller.selectTextTrack(track.id),
      });
    }
    return items;
  });

  private readonly _levelItems: Signal<MenuItemDefinition[]> = computed(() => {
    if (!this._engine) return [];
    if (!this._engine.levels) return [];
    const levels = this._engine.levels();
    if (levels.length === 0) return [];

    const items: MenuItemDefinition[] = [
      { type: 'divider' },
      { type: 'label', label: this.labels.quality },
    ];
    // MediaSourceEngine reports available renditions but neither which one is
    // active nor a way to select one, so these items stay disabled until the
    // engine contract exposes a selection surface.
    for (const level of levels) {
      items.push({
        type: 'item',
        role: 'menuitemradio',
        label: level.label,
        closeOnSelect: false,
        disabled: true,
      });
    }
    return items;
  });

  protected readonly items: Signal<MenuItemDefinition[]> = computed(() => [
    { type: 'label', label: this.labels.playbackRate },
    ...this._rateItems(),
    ...this._captionItems(),
    ...this._levelItems(),
  ]);

  protected readonly hasSettings: Signal<boolean> = computed(() => {
    if (this._config.rateOptions.length > 1) return true;
    if (this._controller.textTracks().length > 0) return true;
    if (this._engine && this._engine.levels && this._engine.levels().length > 0) return true;
    return false;
  });

  /** Whether the popup is currently open, reflecting the underlying menu's overlay state. */
  public readonly open: Signal<boolean> = computed(() => {
    const menu = this.menu();
    if (!menu) return false;
    return menu.isOpen();
  });
}
