import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROLE_TONES } from './theme-generator.constants';
import { colorRole, RoleTone } from './types';

/** Role → palette tone declarations of one block of the theme's `_colors.scss`. */
function roleTonesOf(block: string): Partial<Record<colorRole, RoleTone>> {
  const declaration = /--color-([a-z-]+): #\{-tone\('([a-z-]+)', (\d+)\)\};/g;
  const tones: Partial<Record<colorRole, RoleTone>> = {};

  for (const [, role, palette, tone] of block.matchAll(declaration)) {
    tones[role as colorRole] = { palette, tone: Number(tone) } as RoleTone;
  }

  return tones;
}

describe('ROLE_TONES', () => {
  const colors = readFileSync(
    resolve(process.cwd(), 'libs/themes/src/themes/thalassic/_colors.scss'),
    'utf8',
  );
  const [lightBlock, darkBlock] = colors.split('&.tls-dark');

  it("mirrors the light roles of the theme's _colors.scss", () => {
    expect(roleTonesOf(lightBlock)).toEqual(ROLE_TONES.light);
  });

  it("mirrors the dark roles of the theme's _colors.scss", () => {
    expect(roleTonesOf(darkBlock)).toEqual(ROLE_TONES.dark);
  });
});
