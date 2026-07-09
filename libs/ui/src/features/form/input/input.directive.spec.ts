import { TestBed } from '@angular/core/testing';
import { InputDirective } from './input.directive';

describe('InputDirective', () => {
  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new InputDirective());
    expect(directive).toBeTruthy();
  });
});
