import { Component, computed, DestroyRef, effect, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { DARK_THEME_CLASS } from '@thalassic/core';
import {
  Button,
  ColorInput,
  FormItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TabsQuerySyncDirective,
} from '@thalassic/ui';
import { Layout } from '../../components/layout/layout';
import { PaletteStrip } from './components/palette-strip/palette-strip';
import { RoleGrid } from './components/role-grid/role-grid';
import { ScssFileCard } from './components/scss-file-card/scss-file-card';
import { ThemePreview } from './components/theme-preview/theme-preview';
import { ThemeStylesheet } from './services';
import {
  COLOR_SPEC_OPTIONS,
  DEFAULT_THEME_SOURCE,
  PALETTE_NAMES,
  PREVIEW_SCOPE_CLASS,
  SCHEME_VARIANT_OPTIONS,
  SCOPE_DERIVED_DECLARATIONS,
  THEME_SOURCE_PARAMS,
  THEME_SOURCE_SYNC_DELAY,
} from './theme-generator.constants';
import { colorSpec, schemeVariant, ScssFile, ThemeRoles, ThemeSource, TonalPalettes } from './types';
import {
  generatePalettes,
  isHexColor,
  paletteToScss,
  resolveRoles,
  rolesToDeclarations,
} from './utils';

/**
 * Material 3 theme generator: derives the five tonal palettes of a theme from a
 * seed color, previews them on library components in both modes, grades the
 * color roles for contrast, and exports the palettes as the theme's SCSS
 * partials. The source lives in the URL, so a theme survives a reload and can
 * be shared as a link.
 */
@Component({
  selector: 'app-theme-generator',
  imports: [
    Button,
    ColorInput,
    FormItem,
    Layout,
    PaletteStrip,
    RoleGrid,
    ScssFileCard,
    Select,
    Switch,
    Tab,
    Tabs,
    TabsQuerySyncDirective,
    ThemePreview,
  ],
  templateUrl: './theme-generator.html',
  styleUrl: './theme-generator.scss',
  providers: [ThemeStylesheet],
})
export class ThemeGenerator {
  // Injections
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _stylesheet = inject(ThemeStylesheet);

  // State
  /** Scheme variants offered by the variant select. */
  protected readonly variantOptions = SCHEME_VARIANT_OPTIONS;
  /** Color spec revisions offered by the spec select. */
  protected readonly specOptions = COLOR_SPEC_OPTIONS;
  /** Palettes in display order. */
  protected readonly paletteNames = PALETTE_NAMES;

  /** Source restored from the URL, falling back to the shipped theme for anything missing or malformed. */
  private readonly _initialSource: ThemeSource = this._readSource(
    this._route.snapshot.queryParamMap,
  );

  /** Seed color as typed or picked; anything but `#rrggbb` falls back to the default seed. */
  protected readonly primary = signal<string>(this._initialSource.primary);
  /** Secondary override; empty derives the palette from the seed. */
  protected readonly secondary = signal<string>(this._initialSource.secondary ?? '');
  /** Tertiary override; empty derives the palette from the seed. */
  protected readonly tertiary = signal<string>(this._initialSource.tertiary ?? '');
  /** Neutral override; empty derives both neutral palettes from the seed. */
  protected readonly neutral = signal<string>(this._initialSource.neutral ?? '');
  /** Scheme variant deriving the palettes without an override. */
  protected readonly variant = signal<schemeVariant>(this._initialSource.variant);
  /** Color spec revision the variant follows. */
  protected readonly spec = signal<colorSpec>(this._initialSource.spec);
  /** Whether input colors keep their own chroma. */
  protected readonly colorMatch = signal<boolean>(this._initialSource.colorMatch);
  /** Whether the generated roles replace the app's own while the page is open. */
  protected readonly applyToApp = signal<boolean>(true);

  /** Pending timer that mirrors the source into the URL. */
  private _syncTimer: ReturnType<typeof setTimeout> | undefined;
  /**
   * Theme params the URL and the page last agreed on — written by the page or
   * read from the URL — so neither side echoes the other's change back.
   */
  private _syncedParams: string = JSON.stringify(this._sourceToParams(this._initialSource));

  // Computed
  /** The validated source every palette is derived from. */
  protected readonly source: Signal<ThemeSource> = computed(() => ({
    primary: isHexColor(this.primary()) ? this.primary() : DEFAULT_THEME_SOURCE.primary,
    secondary: this._override(this.secondary()),
    tertiary: this._override(this.tertiary()),
    neutral: this._override(this.neutral()),
    variant: this.variant(),
    spec: this.spec(),
    colorMatch: this.colorMatch(),
  }));

  /** The five generated palettes. */
  protected readonly palettes: Signal<TonalPalettes> = computed(() =>
    generatePalettes(this.source()),
  );

  /** Color roles of the light mode. */
  protected readonly lightRoles: Signal<ThemeRoles> = computed(() =>
    resolveRoles(this.palettes(), 'light'),
  );

  /** Color roles of the dark mode. */
  protected readonly darkRoles: Signal<ThemeRoles> = computed(() =>
    resolveRoles(this.palettes(), 'dark'),
  );

  /** The palettes as the theme's SCSS partials. */
  protected readonly scssFiles: Signal<ScssFile[]> = computed(() => {
    const palettes = this.palettes();
    return PALETTE_NAMES.map(name => paletteToScss(name, palettes[name]));
  });

  /**
   * Rules carrying the generated roles: always onto the preview scopes, and —
   * while `applyToApp` is on — onto the document root for both modes. The root
   * selectors outrank the theme's own `:root` rules by one type selector, so
   * they win wherever the stylesheet lands in the cascade.
   */
  private readonly _stylesheetRules: Signal<string> = computed(() => {
    const light = rolesToDeclarations(this.lightRoles());
    const dark = rolesToDeclarations(this.darkRoles());
    const scopes = [
      `.${PREVIEW_SCOPE_CLASS}--light {\n${light}\n${SCOPE_DERIVED_DECLARATIONS}\n}`,
      `.${PREVIEW_SCOPE_CLASS}--dark {\n${dark}\n${SCOPE_DERIVED_DECLARATIONS}\n}`,
    ];
    if (!this.applyToApp()) return scopes.join('\n');

    return [`html:root {\n${light}\n}`, `html:root.${DARK_THEME_CLASS} {\n${dark}\n}`, ...scopes].join(
      '\n',
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this._syncTimer));

    effect(() => this._stylesheet.write(this._stylesheetRules()));
    effect(() => this._scheduleUrlSync(this._sourceToParams(this.source())));

    // A navigation that changes the theme params while the page stays mounted
    // (a link to the bare page, a pasted theme link) makes the URL the source again.
    this._route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => this._followUrl(params));
  }

  // Protected methods
  /** Applies a variant picked in the select, ignoring anything that isn't an offered variant. */
  protected selectVariant(value: unknown): void {
    const option = SCHEME_VARIANT_OPTIONS.find(candidate => candidate.value === value);
    if (option) this.variant.set(option.value);
  }

  /** Applies a spec picked in the select, ignoring anything that isn't an offered spec. */
  protected selectSpec(value: unknown): void {
    const option = COLOR_SPEC_OPTIONS.find(candidate => candidate.value === value);
    if (option) this.spec.set(option.value);
  }

  /** Restores the shipped theme's source. */
  protected reset(): void {
    this._applySource(DEFAULT_THEME_SOURCE);
  }

  // Private methods
  /** Loads a source into the editable fields. */
  private _applySource(source: ThemeSource): void {
    this.primary.set(source.primary);
    this.secondary.set(source.secondary ?? '');
    this.tertiary.set(source.tertiary ?? '');
    this.neutral.set(source.neutral ?? '');
    this.variant.set(source.variant);
    this.spec.set(source.spec);
    this.colorMatch.set(source.colorMatch);
  }

  /**
   * Adopts the URL's theme when it differs from the one last agreed on. The
   * page's own writes and changes to unrelated params (the selected view)
   * match it and are ignored; a pending write is dropped in favor of the URL.
   */
  private _followUrl(params: ParamMap): void {
    const source = this._readSource(params);
    const serialized = JSON.stringify(this._sourceToParams(source));
    if (serialized === this._syncedParams) return;

    clearTimeout(this._syncTimer);
    this._syncedParams = serialized;
    this._applySource(source);
  }
  /** An override field's value as a source override: `#rrggbb`, or `null` to derive from the seed. */
  private _override(value: string): string | null {
    return isHexColor(value) ? value : null;
  }

  /** Reads a source from query params; a missing or malformed param takes the default. */
  private _readSource(params: ParamMap): ThemeSource {
    const color = (key: keyof ThemeSource): string | null | undefined => {
      const value = params.get(THEME_SOURCE_PARAMS[key]);
      if (value === null) return undefined;
      if (value === '') return null;
      return isHexColor(`#${value}`) ? `#${value.toLowerCase()}` : undefined;
    };
    const variant = SCHEME_VARIANT_OPTIONS.find(
      option => option.value === params.get(THEME_SOURCE_PARAMS.variant),
    );
    const spec = COLOR_SPEC_OPTIONS.find(
      option => option.value === params.get(THEME_SOURCE_PARAMS.spec),
    );
    const colorMatch = params.get(THEME_SOURCE_PARAMS.colorMatch);
    const primary = color('primary');
    const secondary = color('secondary');
    const tertiary = color('tertiary');
    const neutral = color('neutral');

    return {
      primary: primary ?? DEFAULT_THEME_SOURCE.primary,
      secondary: secondary === undefined ? DEFAULT_THEME_SOURCE.secondary : secondary,
      tertiary: tertiary === undefined ? DEFAULT_THEME_SOURCE.tertiary : tertiary,
      neutral: neutral === undefined ? DEFAULT_THEME_SOURCE.neutral : neutral,
      variant: variant ? variant.value : DEFAULT_THEME_SOURCE.variant,
      spec: spec ? spec.value : DEFAULT_THEME_SOURCE.spec,
      colorMatch: colorMatch === null ? DEFAULT_THEME_SOURCE.colorMatch : colorMatch !== '0',
    };
  }

  /**
   * Query params for a source. Colors drop their `#`, which a URL would
   * otherwise have to escape; a derived override is written empty, so a link
   * keeps it derived even if the defaults change.
   */
  private _sourceToParams(source: ThemeSource): Params {
    const color = (value: string | null): string => (value ? value.slice(1) : '');

    return {
      [THEME_SOURCE_PARAMS.primary]: color(source.primary),
      [THEME_SOURCE_PARAMS.secondary]: color(source.secondary),
      [THEME_SOURCE_PARAMS.tertiary]: color(source.tertiary),
      [THEME_SOURCE_PARAMS.neutral]: color(source.neutral),
      [THEME_SOURCE_PARAMS.variant]: source.variant,
      [THEME_SOURCE_PARAMS.spec]: source.spec,
      [THEME_SOURCE_PARAMS.colorMatch]: source.colorMatch ? '1' : '0',
    };
  }

  /** Mirrors params into the URL once the source has been still for a moment. */
  private _scheduleUrlSync(params: Params): void {
    const serialized = JSON.stringify(params);
    clearTimeout(this._syncTimer);
    if (serialized === this._syncedParams) return;

    this._syncTimer = setTimeout(() => {
      this._syncedParams = serialized;
      void this._router.navigate([], {
        relativeTo: this._route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, THEME_SOURCE_SYNC_DELAY);
  }
}
