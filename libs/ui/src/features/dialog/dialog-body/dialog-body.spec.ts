import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogBody } from './dialog-body';

describe('DialogBody', () => {
  let component: DialogBody;
  let fixture: ComponentFixture<DialogBody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBody],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogBody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carries the dialog body class', () => {
    expect(
      (fixture.nativeElement as HTMLElement).classList.contains(
        'tls-dialog__body',
      ),
    ).toBe(true);
  });
});
