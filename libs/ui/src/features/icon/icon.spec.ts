import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { IconRegistry } from './icon-registry.service';
import { systemIcon } from './system-icon';

describe('Icon', () => {
  let component: Icon;
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icon],
    }).compileComponents();

    fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('iconSrc', 'test-icon');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves every media icon to a renderer', () => {
    const registry = TestBed.inject(IconRegistry);
    const mediaIcons: systemIcon[] = [
      'play', 'pause', 'replay', 'volume', 'volume-muted',
      'fullscreen', 'fullscreen-exit', 'picture-in-picture', 'captions', 'settings',
    ];

    for (const name of mediaIcons) expect(registry.resolve(name)).toBeTruthy();
  });
});
