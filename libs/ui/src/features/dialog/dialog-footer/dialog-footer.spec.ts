import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogFooter } from './dialog-footer';

describe('DialogFooter', () => {
  let component: DialogFooter;
  let fixture: ComponentFixture<DialogFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('aligns actions to the end by default', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList.contains('tls-dialog__footer')).toBe(true);
    expect(host.classList.contains('tls-dialog__footer--end')).toBe(true);
  });

  it('applies the requested alignment', async () => {
    fixture.componentRef.setInput('align', 'space-between');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList.contains('tls-dialog__footer--space-between')).toBe(
      true,
    );
    expect(host.classList.contains('tls-dialog__footer--end')).toBe(false);
  });
});
