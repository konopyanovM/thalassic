import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { patchTextTracksEventTarget } from '../text-tracks-event-target.spec-helper';
import { AudioPlayer } from './audio-player';

@Component({
  imports: [AudioPlayer],
  template: '<tls-audio-player [source]="source" [ariaLabel]="ariaLabel" />',
})
class AudioPlayerHost {
  protected readonly source = 'song.mp3';
  protected readonly ariaLabel = 'Episode 4';
}

let restoreTextTracks: () => void;

beforeAll(() => {
  restoreTextTracks = patchTextTracksEventTarget().restore;
});

afterAll(() => {
  restoreTextTracks();
});

const setup = async (): Promise<ComponentFixture<AudioPlayerHost>> => {
  const fixture = TestBed.createComponent(AudioPlayerHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
};

describe('AudioPlayer', () => {
  it('renders an audio element wired to the source', async () => {
    const fixture = await setup();
    const audio = fixture.nativeElement.querySelector('audio') as HTMLAudioElement;

    expect(audio.src).toContain('song.mp3');
  });

  it('exposes a labelled group role', async () => {
    const fixture = await setup();
    const host = fixture.nativeElement.querySelector('tls-audio-player');

    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Episode 4');
  });
});
