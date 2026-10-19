import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_BUTTON_CONFIG } from '../button/button.config';
import { BUTTON_CONFIG } from '../button/button.token';
import { FabMenu } from './fab-menu';
import { FabMenuItemDefinition } from './fab-menu.types';

describe('FabMenu', () => {
  let component: FabMenu;
  let fixture: ComponentFixture<FabMenu>;

  const firstAction = vi.fn();
  const items: FabMenuItemDefinition[] = [
    { label: 'First', action: firstAction },
    { label: 'Second' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(FabMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('ariaLabel', 'Actions');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the stack only while open', () => {
    expect(fixture.nativeElement.querySelector('.tls-fab-menu__items')).toBeNull();

    component.open();
    fixture.detectChanges();

    const stack = fixture.nativeElement.querySelector('.tls-fab-menu__items');
    expect(stack).not.toBeNull();
    expect(stack.querySelectorAll('.tls-fab-menu__item').length).toBe(2);
  });

  it('marks the host and trigger open', () => {
    component.open();
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('tls-fab-menu--open');
    const trigger = fixture.nativeElement.querySelector('.tls-fab-menu__trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('runs the item action and closes on selection', () => {
    component.open();
    fixture.detectChanges();

    const item: HTMLButtonElement = fixture.nativeElement.querySelector('.tls-fab-menu__item');
    item.click();
    fixture.detectChanges();

    expect(firstAction).toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
  });

  it('closes on a click outside the component', () => {
    component.open();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('fills its trigger whatever the app-wide button variant is', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FabMenu],
      providers: [{ provide: BUTTON_CONFIG, useValue: { ...DEFAULT_BUTTON_CONFIG, variant: 'tonal' } }],
    }).compileComponents();
    const tonalFixture = TestBed.createComponent(FabMenu);
    tonalFixture.componentRef.setInput('items', items);
    tonalFixture.componentRef.setInput('ariaLabel', 'Actions');
    await tonalFixture.whenStable();

    const trigger: HTMLElement = tonalFixture.nativeElement.querySelector('.tls-fab-menu__trigger');
    expect(trigger.querySelector('.tls-button--filled') ?? (trigger.classList.contains('tls-button--filled') ? trigger : null)).not.toBeNull();
  });

  it('paints its trigger in the variant it is given', async () => {
    fixture.componentRef.setInput('variant', 'tonal');
    await fixture.whenStable();

    const trigger: HTMLElement = fixture.nativeElement.querySelector('.tls-fab-menu__trigger');
    expect(trigger.querySelector('.tls-button--tonal') ?? (trigger.classList.contains('tls-button--tonal') ? trigger : null)).not.toBeNull();
  });
});
