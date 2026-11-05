import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let component: Badge;
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the indicator in the flow of the content when inline', async () => {
    fixture.componentRef.setInput('inline', true);
    fixture.componentRef.setInput('value', 2);
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const indicator = host.querySelector('.tls-badge__indicator');
    if (!indicator) throw new Error('No indicator rendered');

    expect(host.classList).toContain('tls-badge--inline');
    expect(indicator.textContent.trim()).toBe('2');
  });
});
