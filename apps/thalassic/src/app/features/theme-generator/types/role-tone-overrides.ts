import { themeType } from '@thalassic/core';
import { RoleTones } from './role-tones';

/** Tones replacing the default of a role, per mode; a role left out keeps its default. */
export type RoleToneOverrides = Record<themeType, Partial<RoleTones>>;
