import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_ORIENTATION_OPTIONS } from '../../../.storybook/constants';
import { Step as StepComponent } from './step';
import { Stepper as StepperComponent } from './stepper';

const meta: Meta<StepperComponent> = {
  component: StepperComponent,
  subcomponents: { StepComponent },
  decorators: [
    moduleMetadata({
      imports: [StepComponent],
    }),
  ],
  title: 'Stepper',
  args: {
    active: 'step1',
    orientation: 'horizontal',
    completed: false,
    linear: false,
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-stepper ${argsToTemplate(args)}>
        <tls-step value="step1" label="Account" description="Create your account">Step 1 content</tls-step>
        <tls-step value="step2" label="Profile" description="Personal details">Step 2 content</tls-step>
        <tls-step value="step3" label="Payment" description="Billing information">Step 3 content</tls-step>
        <tls-step value="step4" label="Review" description="Confirm & submit">Step 4 content</tls-step>
        <ng-template #completedTemplate>All steps completed!</ng-template>
      </tls-stepper>
    `,
  }),
};
export default meta;

type Story = StoryObj<StepperComponent>;

export const Stepper: Story = {};
