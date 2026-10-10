import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { TravelPublisher } from './travel-publisher';

const PROPERTY = '--tls-test-travel';

describe('TravelPublisher', () => {
  let host: HTMLElement;
  let setStyle: ReturnType<typeof vi.fn>;
  let publisher: TravelPublisher;

  const travelOf = (element: HTMLElement): string => element.style.getPropertyValue(PROPERTY);

  beforeEach(() => {
    host = document.createElement('div');
    setStyle = vi.fn((element: HTMLElement, name: string, value: string) =>
      element.style.setProperty(name, value),
    );
    publisher = new TravelPublisher({ setStyle } as unknown as Renderer2, host, PROPERTY);
  });

  it('writes the travel to the host as a custom property', () => {
    publisher.write(24);

    expect(travelOf(host)).toBe('24px');
    expect(setStyle).toHaveBeenCalledWith(host, PROPERTY, '24px', RendererStyleFlags2.DashCase);
  });

  it('writes the travel to every follower along with the host', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    publisher.add(first);
    publisher.add(second);

    publisher.write(40);

    expect(travelOf(first)).toBe('40px');
    expect(travelOf(second)).toBe('40px');
  });

  it('brings a follower added mid-gesture up to the travel already published', () => {
    publisher.write(32);

    const follower = document.createElement('div');
    publisher.add(follower);

    expect(travelOf(follower)).toBe('32px');
  });

  it('leaves a follower added before any write untouched', () => {
    const follower = document.createElement('div');
    publisher.add(follower);

    expect(travelOf(follower)).toBe('');
  });

  it('stops writing to a follower once it is removed', () => {
    const follower = document.createElement('div');
    publisher.add(follower);
    publisher.write(16);

    publisher.remove(follower);
    publisher.write(48);

    expect(travelOf(follower)).toBe('16px');
    expect(travelOf(host)).toBe('48px');
  });

  it('skips a write that repeats the travel already published', () => {
    publisher.write(96);
    publisher.write(96);

    expect(setStyle).toHaveBeenCalledTimes(1);
  });
});
