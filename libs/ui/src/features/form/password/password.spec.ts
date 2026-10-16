import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Password } from './password';

describe('Password', () => {
  let component: Password;
  let fixture: ComponentFixture<Password>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Password]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Password);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hands an autofill hint to the native field, and none when unset', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputElement.hasAttribute('autocomplete')).toBe(false);

    fixture.componentRef.setInput('autocomplete', 'new-password');
    await fixture.whenStable();

    expect(inputElement.getAttribute('autocomplete')).toBe('new-password');
  });
});
