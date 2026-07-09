import { TestBed } from '@angular/core/testing';
import { ButtonDirective } from './button.directive';

describe('ButtonDirective', () => {
  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new ButtonDirective());
    expect(directive).toBeTruthy();
  });
});
