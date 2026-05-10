import { loaderSize } from './loader.types';

export interface LoaderConfig {
  size: loaderSize;
  width: number | null;
  widthRatio: number;
  ariaLabel: string;
}

export const DEFAULT_LOADER_CONFIG: LoaderConfig = {
  size: 'md',
  width: null,
  widthRatio: 5,
  ariaLabel: 'Loading',
};
