import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../.storybook/constants';
import { Icon } from '../icon';
import { AlertIcon } from './alert-icon';
import { Alert as AlertComponent } from './alert';

const meta: Meta<AlertComponent> = {
  component: AlertComponent,
  title: 'Alert',
  args: {
    color: 'primary',
    label: '',
    hideLabel: false,
    hideIcon: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-alert ${argsToTemplate(args)}>This is alert's content</tls-alert>
    `,
  }),
};
export default meta;

type Story = StoryObj<AlertComponent>;

export const Alert: Story = {
  args: {},
};

export const IconOverride: Story = {
  args: { color: 'info', icon: 'star' },
};

export const ProjectedIcon: Story = {
  render: args => ({
    props: args,
    moduleMetadata: { imports: [AlertIcon, Icon] },
    template: `
      <tls-alert ${argsToTemplate(args)}>
        <tls-icon tlsAlertIcon name="link" />
        A projected icon replaces the built-in glyph
      </tls-alert>
    `,
  }),
};

export const WithoutIcon: Story = {
  args: { color: 'warning', hideIcon: true },
};
