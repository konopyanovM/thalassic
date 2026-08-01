import { TestBed } from '@angular/core/testing';
import { Kbd } from './kbd';

describe('Kbd', () => {
  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new Kbd());
    expect(directive).toBeTruthy();
  });
});
