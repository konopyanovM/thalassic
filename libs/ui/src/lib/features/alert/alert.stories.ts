import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../../.storybook/constants';
import { Alert as AlertComponent } from './alert';

const meta: Meta<AlertComponent> = {
  component: AlertComponent,
  title: 'Alert',
  args: {
    color: 'primary',
    label: '',
    hideLabel: false,
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
