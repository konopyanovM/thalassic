import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_ROLE_TONES, ROLE_PALETTES } from './theme-generator.constants';

/** The `'key': value,` entries of one Sass map body, as written in the theme's `_roles.scss`. */
function entriesOf(body: string): Record<string, string> {
  const entry = /^\s*'([a-z-]+)': '?([a-z0-9-]+)'?,$/gm;
  return Object.fromEntries([...body.matchAll(entry)].map(([, key, value]) => [key, value]));
}

/** Body of the Sass map that opens right after `opening` and closes at `closing`. */
function mapBody(source: string, opening: string, closing: string): string {
  const start = source.indexOf(opening) + opening.length;
  return source.slice(start, source.indexOf(closing, start));
}

/** A mode's role → tone entries as numbers. */
function tonesOf(body: string): Record<string, number> {
  return Object.fromEntries(
    Object.entries(entriesOf(body)).map(([role, tone]) => [role, Number(tone)]),
  );
}

describe("role mapping mirrors the theme's _roles.scss", () => {
  const roles = readFileSync(
    resolve(process.cwd(), 'libs/themes/src/themes/thalassic/_roles.scss'),
    'utf8',
  );
  const defaultTones = roles.slice(roles.indexOf('$-default-tones: ('));

  it('reads every role from the same palette', () => {
    expect(entriesOf(mapBody(roles, '$-role-palettes: (', ');'))).toEqual(ROLE_PALETTES);
  });

  it('defaults every light role to the same tone', () => {
    expect(tonesOf(mapBody(defaultTones, "'light': (", '),'))).toEqual(DEFAULT_ROLE_TONES.light);
  });

  it('defaults every dark role to the same tone', () => {
    expect(tonesOf(mapBody(defaultTones, "'dark': (", '),'))).toEqual(DEFAULT_ROLE_TONES.dark);
  });

  it("has _colors.scss set every role from its own entry, once per mode", () => {
    const colors = readFileSync(
      resolve(process.cwd(), 'libs/themes/src/themes/thalassic/_colors.scss'),
      'utf8',
    );
    const [lightBlock, darkBlock] = colors.split('&.tls-dark');
    const declaration = /--color-([a-z-]+): #\{roles\.color\('([a-z]+)', '([a-z-]+)'\)\};/g;
    const declarationsOf = (block: string): string[][] =>
      [...block.matchAll(declaration)].map(([, property, mode, role]) => [property, mode, role]);
    const expected = (mode: string): string[][] =>
      Object.keys(ROLE_PALETTES).map(role => [role, mode, role]);

    expect(declarationsOf(lightBlock)).toEqual(expected('light'));
    expect(declarationsOf(darkBlock)).toEqual(expected('dark'));
  });
});
