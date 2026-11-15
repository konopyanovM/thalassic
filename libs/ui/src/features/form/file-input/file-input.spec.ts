import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileInput } from './file-input';

@Component({
  imports: [FileInput],
  template: `
    <tls-file-input variant="button" accept="image/*">
      <ng-template #trigger let-open let-disabled="disabled">
        <button type="button" class="custom" [disabled]="disabled" (click)="open()">Pick</button>
      </ng-template>
    </tls-file-input>
  `,
})
class CustomTriggerHost {}

describe('FileInput', () => {
  let component: FileInput;
  let fixture: ComponentFixture<FileInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileInput],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('draws its own button and accept hint when no trigger is projected', async () => {
    fixture.componentRef.setInput('variant', 'button');
    fixture.componentRef.setInput('accept', 'image/*');
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('button[tlsButton]')).not.toBeNull();
    expect(element.querySelector('.tls-file-input__hint')).not.toBeNull();
  });

  it('renders a projected trigger in place of the built-in button and opens the picker through it', async () => {
    const hostFixture = TestBed.createComponent(CustomTriggerHost);
    await hostFixture.whenStable();

    const element: HTMLElement = hostFixture.nativeElement;
    const nativeInput = element.querySelector<HTMLInputElement>('input[type="file"]');
    const customTrigger = element.querySelector<HTMLButtonElement>('.custom');
    if (!nativeInput || !customTrigger) throw new Error('The file input did not render its parts');
    const pickerOpened = vi.spyOn(nativeInput, 'click').mockImplementation(() => undefined);

    expect(element.querySelector('button[tlsButton]')).toBeNull();
    expect(element.querySelector('.tls-file-input__hint')).toBeNull();

    customTrigger.click();

    expect(pickerOpened).toHaveBeenCalledTimes(1);
  });

  it('marks itself as carrying a custom trigger, so it can be sized by that trigger', async () => {
    const hostFixture = TestBed.createComponent(CustomTriggerHost);
    await hostFixture.whenStable();
    const fileInput: HTMLElement = hostFixture.nativeElement.querySelector('tls-file-input');

    expect(fileInput.classList.contains('tls-file-input--custom-trigger')).toBe(true);
    expect(fixture.nativeElement.classList.contains('tls-file-input--custom-trigger')).toBe(false);
  });
});
