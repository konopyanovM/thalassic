import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTheme } from '@thalassic/core';
import { THEME_STYLESHEET_ID } from './theme-generator.constants';
import { ThemeGenerator } from './theme-generator';

describe('ThemeGenerator', () => {
  let fixture: ComponentFixture<ThemeGenerator>;

  const stylesheet = (): HTMLElement | null => document.getElementById(THEME_STYLESHEET_ID);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeGenerator],
      providers: [
        provideRouter([]),
        provideTheme(),
        // The header icon is fetched over HTTP; the testing backend holds it pending instead of failing.
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeGenerator);
    fixture.detectChanges();
  });

  it('writes the generated roles onto the root and both preview scopes', () => {
    const css = stylesheet()?.textContent ?? '';

    expect(css).toContain('html:root {');
    expect(css).toContain('html:root.tls-dark {');
    expect(css).toContain('.theme-generator-scope--light {');
    expect(css).toContain('.theme-generator-scope--dark {');
    expect(css).toContain('--color-primary: #00658d;');
  });

  it('removes the stylesheet when the page is destroyed', () => {
    fixture.destroy();

    expect(stylesheet()).toBeNull();
  });
});
