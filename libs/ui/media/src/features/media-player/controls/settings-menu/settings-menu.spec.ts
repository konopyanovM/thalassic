import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuActionItem, MenuItemDefinition } from '@thalassic/ui';
import { FakeMediaElement } from '../../fake-media-element';
import { MediaController } from '../../media-controller';
import { DEFAULT_MEDIA_PLAYER_CONFIG, MediaPlayerConfig } from '../../media-player.config';
import { MEDIA_PLAYER_CONFIG } from '../../media-player.token';
import { MediaLevel } from '../../media-player.types';
import { MEDIA_SOURCE_ENGINE, MediaSourceEngine } from '../../media-source-engine';
import { MediaSettingsMenu } from './settings-menu';

/** Signal backing the stub engine's `levels`, mutated per test before the host is created. */
const stubLevels = signal<MediaLevel[]>([]);

const stubEngine: MediaSourceEngine = {
  canPlay: () => false,
  attach: () => undefined,
  detach: () => undefined,
  levels: stubLevels,
};

@Component({
  selector: 'tls-settings-menu-host',
  imports: [MediaSettingsMenu],
  providers: [MediaController],
  template: '<tls-media-settings-menu />',
})
class SettingsMenuHost {}

@Component({
  selector: 'tls-single-rate-settings-menu-host',
  imports: [MediaSettingsMenu],
  providers: [
    MediaController,
    {
      provide: MEDIA_PLAYER_CONFIG,
      useValue: { ...DEFAULT_MEDIA_PLAYER_CONFIG, rateOptions: [1] } satisfies MediaPlayerConfig,
    },
  ],
  template: '<tls-media-settings-menu />',
})
class SingleRateSettingsMenuHost {}

@Component({
  selector: 'tls-levels-settings-menu-host',
  imports: [MediaSettingsMenu],
  providers: [
    MediaController,
    {
      provide: MEDIA_PLAYER_CONFIG,
      useValue: { ...DEFAULT_MEDIA_PLAYER_CONFIG, rateOptions: [1] } satisfies MediaPlayerConfig,
    },
    { provide: MEDIA_SOURCE_ENGINE, useValue: stubEngine },
  ],
  template: '<tls-media-settings-menu />',
})
class LevelsSettingsMenuHost {}

const setup = (): { fixture: ComponentFixture<SettingsMenuHost>; media: FakeMediaElement } => {
  const fixture = TestBed.createComponent(SettingsMenuHost);
  const controller = fixture.debugElement.injector.get(MediaController);
  const media = new FakeMediaElement();
  controller.attach(media as unknown as HTMLMediaElement);
  fixture.detectChanges();
  return { fixture, media };
};

describe('MediaSettingsMenu', () => {
  afterEach(() => {
    stubLevels.set([]);
  });

  it('builds rate items as a checked radio group', () => {
    const { fixture } = setup();
    const menu = fixture.debugElement.query(By.directive(MediaSettingsMenu)).componentInstance;
    const items = menu.items() as MenuItemDefinition[];
    const rateItems = items.filter(
      (item) => item.type === 'item' && item.role === 'menuitemradio',
    ) as MenuActionItem[];

    expect(rateItems.map((item) => item.label)).toContain('1×');
    const checked = rateItems.find((item) => item.checked);
    if (!checked) throw new Error('Expected a checked rate item.');
    expect(checked.label).toBe('1×');
  });

  it('lists caption tracks with an Off item when tracks exist', () => {
    const { fixture, media } = setup();
    media.addTextTrack({
      kind: 'subtitles',
      id: 'en',
      label: 'English',
      language: 'en',
      mode: 'disabled',
    });
    fixture.detectChanges();
    const menu = fixture.debugElement.query(By.directive(MediaSettingsMenu)).componentInstance;
    const items = menu.items() as MenuItemDefinition[];
    const labels = items.filter((item) => item.type === 'item').map((item) => item.label);

    expect(labels).toContain('Off');
    expect(labels).toContain('English');
  });

  it('checks the Off caption item when no track is active', () => {
    const { fixture, media } = setup();
    media.addTextTrack({
      kind: 'subtitles',
      id: 'en',
      label: 'English',
      language: 'en',
      mode: 'disabled',
    });
    fixture.detectChanges();
    const menu = fixture.debugElement.query(By.directive(MediaSettingsMenu)).componentInstance;
    const items = menu.items() as MenuActionItem[];
    const off = items.find((item) => item.type === 'item' && item.label === 'Off');
    if (!off) throw new Error('Expected an "Off" caption item.');

    expect(off.checked).toBe(true);
  });

  it('renders nothing when only the default rate exists and there are no tracks or levels', () => {
    const fixture = TestBed.createComponent(SingleRateSettingsMenuHost);
    const controller = fixture.debugElement.injector.get(MediaController);
    const media = new FakeMediaElement();
    controller.attach(media as unknown as HTMLMediaElement);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('renders a settings button when the default rate options include multiple choices', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('lists engine levels as disabled items and enables settings for levels alone', () => {
    stubLevels.set([{ id: 'hd', height: 1080, bitrate: 5_000_000, label: '1080p' }]);
    const fixture = TestBed.createComponent(LevelsSettingsMenuHost);
    const controller = fixture.debugElement.injector.get(MediaController);
    const media = new FakeMediaElement();
    controller.attach(media as unknown as HTMLMediaElement);
    fixture.detectChanges();

    // Sanity: a single rate option and no tracks, so only the levels make settings meaningful.
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();

    const menu = fixture.debugElement.query(By.directive(MediaSettingsMenu)).componentInstance;
    const items = menu.items() as MenuItemDefinition[];
    const qualityLabel = items.find((item) => item.type === 'label' && item.label === 'Quality');
    expect(qualityLabel).toBeTruthy();

    const levelItem = items.find(
      (item) => item.type === 'item' && item.label === '1080p',
    ) as MenuActionItem | undefined;
    if (!levelItem) throw new Error('Expected a "1080p" quality item.');
    expect(levelItem.disabled).toBe(true);
  });

  it('reflects the menu open state after the trigger is clicked', () => {
    const { fixture } = setup();
    const menu: MediaSettingsMenu = fixture.debugElement.query(
      By.directive(MediaSettingsMenu),
    ).componentInstance;
    expect(menu.open()).toBe(false);

    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(menu.open()).toBe(true);
  });
});
