import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResizeObserverDirective } from './resize-observer.directive';

describe('ResizeObserverDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
      ],
    });
    const directive = TestBed.runInInjectionContext(() => new ResizeObserverDirective());
    expect(directive).toBeTruthy();
  });
});
