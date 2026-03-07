import type { Preview } from '@storybook/angular';

// Import global styles
// import '../src/styles.scss'; // Your global styles
// import '@angular/material/prebuilt-themes/indigo-pink.css'; // Material theme
// import '../../core/src/lib/styles/index.scss';
// import '../../themes/src/lib/styles/index.scss';
// import '../../themes/src/lib/themes/thalassic/index.scss';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
