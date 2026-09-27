import { ApplicationRef, Injector, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetMotion } from './sheet-motion';

function fakeRenderer(): Renderer2 {
  return {
    setStyle: vi.fn(),
    removeStyle: vi.fn(),
  } as unknown as Renderer2;
}

describe('SheetMotion', () => {
  let renderer: Renderer2;
  let panel: HTMLElement;
  let backdrop: HTMLElement;
  let motion: SheetMotion;

  // The surfaces are empty elements that compare structurally equal, so a
  // write is matched to its element by identity rather than `toHaveBeenCalledWith`.
  const wroteStyle = (element: HTMLElement, ...rest: unknown[]): boolean =>
    vi
      .mocked(renderer.setStyle)
      .mock.calls.some(call => call[0] === element && rest.every((value, index) => call[index + 1] === value));
  const removedStyle = (element: HTMLElement, style: string): boolean =>
    vi.mocked(renderer.removeStyle).mock.calls.some(call => call[0] === element && call[1] === style);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    renderer = fakeRenderer();
    panel = document.createElement('div');
    backdrop = document.createElement('div');
    motion = new SheetMotion({
      property: '--tls-test-drag',
      backdropOpacity: progress => 1 - progress,
      renderer,
      injector: TestBed.inject(Injector),
    });
  });

  it('rests idle until a gesture begins', () => {
    expect(motion.state()).toBe('idle');

    motion.begin({ panel, backdrop, extent: 200 });

    expect(motion.state()).toBe('dragging');
  });

  it('stops the backdrop transitioning while the finger holds the surface', () => {
    motion.begin({ panel, backdrop, extent: 200 });

    expect(wroteStyle(backdrop, 'transition', 'none')).toBe(true);
  });

  it('writes the offset to the custom property as a dashed name', () => {
    motion.begin({ panel, backdrop, extent: 200 });
    motion.follow(50);

    expect(wroteStyle(panel, '--tls-test-drag', '50px', RendererStyleFlags2.DashCase)).toBe(true);
  });

  it('sets the backdrop opacity from the drag progress through the supplied function', () => {
    motion.begin({ panel, backdrop, extent: 200 });
    motion.follow(50);

    expect(wroteStyle(backdrop, 'opacity', '0.75')).toBe(true);
  });

  it('clamps the progress to the extent, leaving the offset as given', () => {
    motion.begin({ panel, backdrop, extent: 200 });
    motion.follow(260);

    expect(wroteStyle(panel, '--tls-test-drag', '260px', RendererStyleFlags2.DashCase)).toBe(true);
    expect(wroteStyle(backdrop, 'opacity', '0')).toBe(true);
  });

  it('reads a zero extent as no progress', () => {
    motion.begin({ panel, backdrop, extent: 0 });
    motion.follow(30);

    expect(wroteStyle(backdrop, 'opacity', '1')).toBe(true);
  });

  it('leaves the backdrop alone where there is none', async () => {
    const done = vi.fn();
    motion.begin({ panel, backdrop: null, extent: 200 });
    motion.follow(50);
    motion.settle(0, done);

    // Drive the render and wait for microtasks
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));

    expect(renderer.setStyle).not.toHaveBeenCalledWith(expect.anything(), 'transition', expect.anything());
    expect(renderer.setStyle).not.toHaveBeenCalledWith(expect.anything(), 'opacity', expect.anything());
    expect(renderer.removeStyle).not.toHaveBeenCalled();
  });

  it('settles by handing the backdrop its transition back and writing the target after render', async () => {
    const done = vi.fn();
    motion.begin({ panel, backdrop, extent: 200 });
    motion.follow(50);

    motion.settle(200, done);

    // Synchronous side effects
    expect(motion.state()).toBe('settling');
    expect(removedStyle(backdrop, 'transition')).toBe(true);
    // Deferred until afterNextRender
    expect(wroteStyle(panel, '--tls-test-drag', '200px', RendererStyleFlags2.DashCase)).toBe(false);
    expect(done).not.toHaveBeenCalled();

    // Drive the render and wait for microtasks
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));

    // The deferred target write has run
    expect(wroteStyle(panel, '--tls-test-drag', '200px', RendererStyleFlags2.DashCase)).toBe(true);
    expect(wroteStyle(backdrop, 'opacity', '0')).toBe(true);
  });

  it('stays settling until told to rest, so a dispose can follow with the class still on', async () => {
    const done = vi.fn();
    motion.begin({ panel, backdrop, extent: 200 });
    motion.settle(200, done);

    expect(motion.state()).toBe('settling');

    // Drive the render and wait for microtasks
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));

    // State is still settling even after done has run, until rest() is called
    expect(motion.state()).toBe('settling');

    motion.rest();

    expect(motion.state()).toBe('idle');
  });

  it('lets a gesture that begins during a settle supersede it: the settle neither moves the surface nor reports', async () => {
    const supersededDone = vi.fn();
    motion.begin({ panel, backdrop, extent: 200 });
    motion.settle(0, supersededDone);

    const next = document.createElement('div');
    motion.begin({ panel: next, backdrop, extent: 300 });
    motion.follow(40);
    expect(wroteStyle(next, '--tls-test-drag', '40px', RendererStyleFlags2.DashCase)).toBe(true);

    // The new gesture settles normally; waiting on its completion also lets
    // the superseded settle's deferred callbacks run.
    const nextDone = vi.fn();
    motion.settle(120, nextDone);
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(nextDone).toHaveBeenCalledTimes(1));

    expect(wroteStyle(next, '--tls-test-drag', '120px', RendererStyleFlags2.DashCase)).toBe(true);
    // The superseded target is written to neither panel.
    expect(wroteStyle(panel, '--tls-test-drag', '0px')).toBe(false);
    expect(wroteStyle(next, '--tls-test-drag', '0px')).toBe(false);
    expect(supersededDone).not.toHaveBeenCalled();
  });

  it('lets a gesture that begins with the same surface object supersede a running settle', async () => {
    const supersededDone = vi.fn();
    const surface = { panel, backdrop, extent: 200 };
    motion.begin(surface);
    motion.settle(0, supersededDone);

    motion.begin(surface);
    motion.follow(40);

    // Waiting on the new gesture's completion also lets the superseded
    // settle's deferred callbacks run.
    const nextDone = vi.fn();
    motion.settle(200, nextDone);
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(nextDone).toHaveBeenCalledTimes(1));

    expect(supersededDone).not.toHaveBeenCalled();
    expect(wroteStyle(panel, '--tls-test-drag', '0px')).toBe(false);
    expect(wroteStyle(panel, '--tls-test-drag', '200px')).toBe(true);
  });

  it('lets rest cancel a running settle', async () => {
    const done = vi.fn();
    motion.begin({ panel, backdrop, extent: 200 });
    motion.settle(0, done);
    motion.rest();

    // A following gesture's settle completing means the cancelled settle's
    // deferred callbacks have had their turn.
    const nextPanel = document.createElement('div');
    const nextDone = vi.fn();
    motion.begin({ panel: nextPanel, backdrop, extent: 200 });
    motion.settle(200, nextDone);
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(nextDone).toHaveBeenCalledTimes(1));
    motion.rest();

    expect(done).not.toHaveBeenCalled();
    expect(wroteStyle(panel, '--tls-test-drag', '0px')).toBe(false);
    expect(motion.state()).toBe('idle');
  });

  it('exposes the extent of the gesture in progress, and 0 outside one', () => {
    expect(motion.extent).toBe(0);
    motion.begin({ panel, backdrop, extent: 200 });
    expect(motion.extent).toBe(200);
    motion.rest();
    expect(motion.extent).toBe(0);
  });

  it('ignores a follow or settle outside a gesture', () => {
    motion.follow(50);
    motion.settle(0, () => undefined);

    expect(renderer.setStyle).not.toHaveBeenCalled();
    expect(motion.state()).toBe('idle');

    // Tick to verify no deferred work was scheduled
    TestBed.inject(ApplicationRef).tick();

    // Still nothing written
    expect(renderer.setStyle).not.toHaveBeenCalled();
  });

  it('moves to a target from rest: takes hold, settles, and reports once', async () => {
    const done = vi.fn();

    motion.moveTo({ panel, backdrop, extent: 200 }, 120, done);

    expect(motion.state()).toBe('settling');
    expect(removedStyle(backdrop, 'transition')).toBe(true);
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(wroteStyle(panel, '--tls-test-drag', '120px')).toBe(true);
    expect(wroteStyle(backdrop, 'opacity', '0.4')).toBe(true);
  });

  it('lets a move supersede a running settle like a new gesture', async () => {
    const supersededDone = vi.fn();
    const done = vi.fn();
    motion.begin({ panel, backdrop, extent: 200 });
    motion.settle(0, supersededDone);

    motion.moveTo({ panel, backdrop, extent: 200 }, 200, done);
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));

    expect(supersededDone).not.toHaveBeenCalled();
    expect(wroteStyle(panel, '--tls-test-drag', '0px')).toBe(false);
    expect(wroteStyle(panel, '--tls-test-drag', '200px')).toBe(true);
  });
});
