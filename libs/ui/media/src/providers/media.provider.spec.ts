import { TestBed } from '@angular/core/testing';
import { MEDIA_PLAYER_CONFIG } from '../features/media-player/media-player.token';
import { DEFAULT_MEDIA_PLAYER_CONFIG } from '../features/media-player/media-player.config';
import { provideThalassicMediaConfig } from './media.provider';

describe('provideThalassicMediaConfig', () => {
  it('deep-merges a partial config over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideThalassicMediaConfig({ seekStep: 10, labels: { play: 'Go' } })],
    });

    const config = TestBed.inject(MEDIA_PLAYER_CONFIG);

    expect(config.seekStep).toBe(10);
    expect(config.labels.play).toBe('Go');
    expect(config.labels.pause).toBe(DEFAULT_MEDIA_PLAYER_CONFIG.labels.pause);
    expect(config.rateOptions).toEqual(DEFAULT_MEDIA_PLAYER_CONFIG.rateOptions);
  });
});
