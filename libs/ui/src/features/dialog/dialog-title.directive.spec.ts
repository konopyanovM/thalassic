import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogTitleDirective } from './dialog-title.directive';

@Component({
  imports: [DialogTitleDirective],
  template: '<h2 tlsDialogTitle>Plan a session</h2>',
})
class DialogTitleHost {}

describe('DialogTitleDirective', () => {
  let fixture: ComponentFixture<DialogTitleHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTitleHost],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogTitleHost);
    await fixture.whenStable();
  });

  it('styles the heading it is placed on, keeping its element', () => {
    const heading = (fixture.nativeElement as HTMLElement).querySelector('h2');

    expect(heading).toBeTruthy();
    expect(heading?.classList.contains('tls-dialog__title')).toBe(true);
  });
});
