import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from './toast.service';
import { DEFAULT_TOAST_CONFIG } from './toast.config';
import { TOAST_CONFIG } from './toast.token';

// Minimal Overlay stand-in: the service only needs `create().attach()` to exist,
// so the outlet is never rendered and no real DOM/overlay is involved.
function overlayStub() {
  const positionStrategy = { global: () => ({ top: () => ({ left: () => ({}) }) }) };
  return {
    create: vi.fn(() => ({ attach: vi.fn() })),
    position: () => positionStrategy,
    scrollStrategies: { noop: () => ({}) },
  };
}

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Overlay, useValue: overlayStub() }],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => service.clear());

  it('shows a toast and returns a handle for it', () => {
    const ref = service.show({ message: 'Saved', duration: 0 });
    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Saved');
    expect(ref.id).toBe(toasts[0].id);
  });

  it('places the newest toast in front', () => {
    service.show({ message: 'first', duration: 0 });
    service.show({ message: 'second', duration: 0 });

    expect(service.toasts().map(toast => toast.message)).toEqual(['second', 'first']);
  });

  it('caps the stack at the configured max, dropping the oldest', () => {
    for (let index = 0; index < 7; index++) service.show({ message: `${index}`, duration: 0 });

    expect(service.toasts().map(toast => toast.message)).toEqual(['6', '5', '4', '3', '2']);
  });

  it('applies semantic colors via the convenience methods', () => {
    service.danger('bad', { duration: 0 });
    service.success('ok', { duration: 0 });

    const [success, danger] = service.toasts();
    expect(success.color).toBe('success');
    expect(danger.color).toBe('danger');
  });

  it('resolves convenience-method colors through the configured severity map', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Overlay, useValue: overlayStub() },
        {
          provide: TOAST_CONFIG,
          useValue: {
            ...DEFAULT_TOAST_CONFIG,
            severityColors: { ...DEFAULT_TOAST_CONFIG.severityColors, success: 'primary' },
          },
        },
      ],
    });
    const configured = TestBed.inject(ToastService);

    configured.warning('careful', { duration: 0 });
    configured.success('ok', { duration: 0 });

    const [success, warning] = configured.toasts();
    expect(success.color).toBe('primary');
    expect(warning.color).toBe('warning');
  });

  it('dismisses a specific toast', () => {
    const ref = service.show({ message: 'a', duration: 0 });
    service.show({ message: 'b', duration: 0 });

    ref.dismiss();

    expect(service.toasts().map(toast => toast.message)).toEqual(['b']);
  });

  it('clears every toast', () => {
    service.show({ message: 'a', duration: 0 });
    service.show({ message: 'b', duration: 0 });

    service.clear();

    expect(service.toasts()).toEqual([]);
  });

  describe('auto-dismiss', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('dismisses after the duration elapses', () => {
      service.show({ message: 'a', duration: 1000 });
      expect(service.toasts().length).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(service.toasts().length).toBe(0);
    });

    it('keeps a sticky toast (duration 0) until dismissed explicitly', () => {
      service.show({ message: 'a', duration: 0 });

      vi.advanceTimersByTime(100_000);
      expect(service.toasts().length).toBe(1);
    });

    it('pauses and resumes the timer from its remaining time', () => {
      service.show({ message: 'a', duration: 1000 });

      vi.advanceTimersByTime(400);
      service.pause();

      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(1);

      service.resume();
      vi.advanceTimersByTime(599);
      expect(service.toasts().length).toBe(1);

      vi.advanceTimersByTime(1);
      expect(service.toasts().length).toBe(0);
    });
  });
});
