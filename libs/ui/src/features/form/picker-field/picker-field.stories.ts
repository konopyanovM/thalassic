import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { PickerField as PickerFieldComponent } from './picker-field';

const meta: Meta<PickerFieldComponent> = {
  component: PickerFieldComponent,
  title: 'Form/Picker Field',
  args: {
    open: false,
    size: 'md',
    fluid: false,
    disabled: false,
    ariaLabel: 'Visibility',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
    <tls-picker-field ${argsToTemplate(args)}>
      👥 Friends
    </tls-picker-field>
    `,
  }),
};
export default meta;

type Story = StoryObj<PickerFieldComponent>;

export const PickerField: Story = {
  args: {},
};
