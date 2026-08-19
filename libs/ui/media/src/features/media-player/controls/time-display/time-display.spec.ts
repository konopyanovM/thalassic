import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeMediaElement } from '../../fake-media-element';
import { MediaController } from '../../media-controller';
import { MediaTimeDisplay } from './time-display';

@Component({
  imports: [MediaTimeDisplay],
  providers: [MediaController],
  template: '<tls-media-time-display />',
})
class TimeDisplayHost {}

const setup = (): { fixture: ComponentFixture<TimeDisplayHost> } => {
  const fixture = TestBed.createComponent(TimeDisplayHost);
  const controller = fixture.debugElement.injector.get(MediaController);
  const media = new FakeMediaElement();
  controller.attach(media as unknown as HTMLMediaElement);
  media.duration = 245; // 4:05
  media.fire('durationchange');
  media.currentTime = 83; // 1:23
  media.fire('timeupdate');
  fixture.detectChanges();
  return { fixture };
};

describe('MediaTimeDisplay', () => {
  it('renders current and total time', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim()).toBe('1:23 / 4:05');
  });
});
