import { TestBed } from '@angular/core/testing';
import { Mark } from './mark';

describe('Mark', () => {
  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new Mark());
    expect(directive).toBeTruthy();
  });
});
