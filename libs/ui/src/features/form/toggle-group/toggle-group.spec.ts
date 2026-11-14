import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleGroup } from './toggle-group';

describe('ToggleGroup', () => {
  let component: ToggleGroup<string, string>;
  let fixture: ComponentFixture<ToggleGroup<string, string>>;

  const host = (): HTMLElement => fixture.nativeElement;

  const optionFor = (label: string): HTMLButtonElement => {
    const option = Array.from(host().querySelectorAll('button')).find(
      candidate => candidate.textContent.trim() === label,
    );
    if (!option) throw new Error(`No ${label} option`);
    return option;
  };

  /** Lays an option out where a browser would, which jsdom never does. */
  const layOut = (
    option: HTMLButtonElement,
    box: { left: number; top: number; width: number; height: number },
  ): void => {
    Object.defineProperties(option, {
      offsetLeft: { configurable: true, value: box.left },
      offsetTop: { configurable: true, value: box.top },
      offsetWidth: { configurable: true, value: box.width },
      offsetHeight: { configurable: true, value: box.height },
    });
  };

  /** The size reports the group asked for, to deliver as a browser would. */
  let reportResize: (() => void)[];

  const pillState = (): string | null => host().getAttribute('data-sliding-indicator');

  const pillBox = (): string[] =>
    ['x', 'y', 'width', 'height'].map(side =>
      host().style.getPropertyValue(`--tls-sliding-indicator-${side}`),
    );

  beforeEach(async () => {
    reportResize = [];
    // jsdom has no ResizeObserver; each one made here is kept so a test can
    // report a size change through it.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public readonly observe = vi.fn();
        public readonly disconnect = vi.fn();

        constructor(callback: () => void) {
          reportResize.push(callback);
        }
      },
    );

    await TestBed.configureTestingModule({
      imports: [ToggleGroup],
    }).compileComponents();

    fixture = TestBed.createComponent<ToggleGroup<string, string>>(ToggleGroup);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ['Day', 'Week', 'Month']);
    fixture.componentRef.setInput('value', ['Week']);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('draws the joined, filled treatment unless told otherwise', () => {
    expect(host().classList).toContain('tls-toggle-group--filled');
    expect(host().classList).not.toContain('tls-toggle-group--segmented');
  });

  it('keeps no travelling pill in a joined treatment', () => {
    expect(pillState()).toBeNull();
  });

  describe('segmented', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('variant', 'segmented');
      await fixture.whenStable();
    });

    it('carries the treatment in place of the one it replaces', () => {
      expect(host().classList).toContain('tls-toggle-group--segmented');
      expect(host().classList).not.toContain('tls-toggle-group--filled');
    });

    it('still reports each option as pressed or not, whatever marks it on screen', () => {
      expect(optionFor('Week').getAttribute('aria-pressed')).toBe('true');
      expect(optionFor('Day').getAttribute('aria-pressed')).toBe('false');
    });

    it('moves the selection to the option pressed', async () => {
      optionFor('Month').click();
      await fixture.whenStable();

      expect(component.value()).toEqual(['Month']);
      expect(optionFor('Month').classList).toContain('tls-toggle-group__option--selected');
      expect(optionFor('Week').classList).not.toContain('tls-toggle-group__option--selected');
    });

    it('keeps a travelling pill on the chosen option', async () => {
      layOut(optionFor('Week'), { left: 60, top: 3, width: 52, height: 28 });
      reportResize.forEach(report => report());
      await fixture.whenStable();

      expect(pillState()).toBe('placed');
      expect(pillBox()).toEqual(['60px', '3px', '52px', '28px']);
    });

    it('sends the pill travelling to an option newly chosen', async () => {
      layOut(optionFor('Week'), { left: 60, top: 3, width: 52, height: 28 });
      layOut(optionFor('Month'), { left: 115, top: 3, width: 60, height: 28 });
      reportResize.forEach(report => report());
      await fixture.whenStable();

      optionFor('Month').click();
      await fixture.whenStable();

      expect(pillState()).toBe('travelling');
      expect(pillBox()).toEqual(['115px', '3px', '60px', '28px']);
    });

    it('keeps no travelling pill for a group of several choices', async () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.componentRef.setInput('value', ['Day', 'Week']);
      await fixture.whenStable();

      expect(pillState()).toBeNull();
    });

    it('keeps no travelling pill while nothing is chosen', async () => {
      fixture.componentRef.setInput('value', []);
      await fixture.whenStable();

      expect(pillState()).toBeNull();
    });

    it('keeps no travelling pill on a column of options', async () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      await fixture.whenStable();

      expect(pillState()).toBeNull();
    });

    it('keeps its treatment alongside an orientation and a width', async () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.componentRef.setInput('fluid', true);
      await fixture.whenStable();

      expect(host().classList).toContain('tls-toggle-group--segmented');
      expect(host().classList).toContain('tls-toggle-group--vertical');
      expect(host().classList).toContain('tls-toggle-group--fluid');
    });
  });
});
