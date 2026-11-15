import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Input } from '../../features/form/input/input';
import { FORM_CONTROL_CONFIG } from './form-control.config.token';

@Component({
  imports: [FormRoot, FormField, Input],
  template: `
    <form [formRoot]="account">
      <tls-input [formField]="account.username" />
      <button type="submit">Save</button>
    </form>
  `,
})
class TouchedDirtyHostComponent {
  readonly control = viewChild.required(Input);
  readonly model = signal({ username: '' });
  // A submission action, as every real form has: without one, submitting marks nothing touched.
  readonly account = form(
    this.model,
    (path) => {
      required(path.username);
    },
    { submission: { action: async () => undefined } },
  );
}

describe('FormControl', () => {
  describe('showError with the touched-dirty trigger', () => {
    let fixture: ComponentFixture<TouchedDirtyHostComponent>;
    let host: TouchedDirtyHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TouchedDirtyHostComponent],
        providers: [{ provide: FORM_CONTROL_CONFIG, useValue: { errorTrigger: 'touched-dirty' } }],
      }).compileComponents();

      fixture = TestBed.createComponent(TouchedDirtyHostComponent);
      host = fixture.componentInstance;
      await fixture.whenStable();
    });

    const nativeInput = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
    const showsError = (): boolean => host.control().showError();

    /** Moves focus into the field and out of it again, as tabbing past it does. */
    const passThrough = async (): Promise<void> => {
      nativeInput().focus();
      nativeInput().blur();
      await fixture.whenStable();
    };

    const submit = async (): Promise<void> => {
      fixture.nativeElement.querySelector('button').click();
      await fixture.whenStable();
    };

    it('stays silent when an untouched, empty field is left', async () => {
      await passThrough();

      expect(showsError()).toBe(false);
    });

    it('marks the bound field touched as the user leaves the control', async () => {
      await passThrough();

      expect(host.account.username().touched()).toBe(true);
    });

    it('forgets the submission when a field the user left is reset', async () => {
      await passThrough();
      await submit();
      host.account().reset();
      await fixture.whenStable();

      expect(host.control().touched()).toBe(false);
      await passThrough();
      expect(showsError()).toBe(false);
    });

    it('surfaces an error once a changed field is left invalid', async () => {
      nativeInput().value = 'a';
      nativeInput().dispatchEvent(new Event('input'));
      nativeInput().value = '';
      nativeInput().dispatchEvent(new Event('input'));
      await passThrough();

      expect(showsError()).toBe(true);
    });

    it('surfaces an error on every untouched field once the form is submitted', async () => {
      await submit();

      expect(showsError()).toBe(true);
    });

    it('forgets the submission when the field is reset, until the form is submitted again', async () => {
      await submit();
      host.account().reset();
      await fixture.whenStable();

      expect(showsError()).toBe(false);

      await passThrough();
      expect(showsError()).toBe(false);

      await submit();
      expect(showsError()).toBe(true);
    });
  });
});
