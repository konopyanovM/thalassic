import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileString } from 'sass';
import { DEFAULT_THEME_SOURCE, THEME_MODULE } from '../theme-generator.constants';
import { ThemeSource } from '../types';
import { generatePalettes } from './generate-palettes';
import { palettesToThemeConfig } from './palettes-to-theme-config';
import { resolveRoles } from './resolve-roles';
import { rolesToCss } from './roles-to-css';

describe('theme exports', () => {
  const source: ThemeSource = { ...DEFAULT_THEME_SOURCE, primary: '#a3300c', tertiary: null };
  const palettes = generatePalettes(source);
  const light = resolveRoles(palettes, 'light');
  const dark = resolveRoles(palettes, 'dark');

  /** Compiles a consumer stylesheet, resolving the theme package to its sources in this repo. */
  const compileAsConsumer = (stylesheet: string): string => {
    const root = process.cwd();
    const themeSources = resolve(root, 'libs/themes/src/themes/thalassic');

    return compileString(stylesheet, {
      loadPaths: [resolve(root, 'libs'), resolve(root, 'sass-paths'), resolve(root, 'node_modules')],
      importers: [
        {
          findFileUrl: (url: string) => (url === THEME_MODULE ? pathToFileURL(`${themeSources}/`) : null),
        },
      ],
      silenceDeprecations: ['import'],
    }).css;
  };

  it('configures the theme into the same roles the generator previews', () => {
    const css = compileAsConsumer(palettesToThemeConfig(palettes).content);

    expect(css).toContain(`--color-primary: ${light.primary};`);
    expect(css).toContain(`--color-primary: ${dark.primary};`);
    expect(css).toContain(`--color-surface-container-highest: ${dark['surface-container-highest']};`);
  }, 30000);

  it('overrides every role at the theme selectors of both modes', () => {
    const content = rolesToCss(light, dark).content;
    const [lightBlock, darkBlock] = content.split(':root.tls-dark {');

    expect(lightBlock.startsWith(':root {\n  --color-primary: ')).toBe(true);
    expect(lightBlock).toContain(`  --color-outline-variant: ${light['outline-variant']};`);
    expect(darkBlock).toContain(`  --color-primary: ${dark.primary};`);
    expect(content.match(/--color-/g)).toHaveLength(46);
  });
});
