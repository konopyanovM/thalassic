import type { Preview } from '@storybook/angular';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
    motion: {
      description: 'Motion level',
      toolbar: {
        title: 'Motion',
        icon: 'lightning',
        items: [
          { value: 'none', title: 'None' },
          { value: 'essential', title: 'Essential' },
          { value: 'full', title: 'Full' },
        ],
      },
    },
    direction: {
      description: 'Layout direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    motion: 'full',
    direction: 'ltr',
  },
  decorators: [
    (story, context) => {
      const theme = context.globals['theme'] ?? 'light';
      document.documentElement.classList.toggle('tls-dark', theme === 'dark');
      document.documentElement.classList.toggle('tls-light', theme === 'light');

      const motion = context.globals['motion'] ?? 'full';
      document.documentElement.setAttribute('data-motion', motion);

      const direction = context.globals['direction'] ?? 'ltr';
      document.documentElement.setAttribute('dir', direction);
      return story();
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    storySort: {
      method: 'alphabetical',
    },
  },
};

export default preview;
