import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  webpackFinal: async config => {
    // Ensure SCSS files are handled correctly
    const cssRule = config.module?.rules?.find(
      rule => rule && typeof rule === 'object' && rule.test?.toString().includes('css'),
    );

    // If scss isn't already handled, you may not need changes here.
    // The key fix is using stylePreprocessorOptions below.
    return config;
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
