import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  STORY_CHIP_SIZE_OPTIONS,
  STORY_CHIP_VARIANT_OPTIONS,
  STORY_COLOR_OPTIONS,
} from '../../../.storybook/constants';
import { Chip as ChipComponent } from './chip';
import { ChipControl } from './chip.directive';

const meta: Meta<ChipComponent> = {
  component: ChipComponent,
  title: 'Chip',
  args: {
    label: 'Chip',
    color: 'primary',
    variant: 'filled',
    size: 'md',
    rounded: false,
    icon: false,
    fluid: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    variant: {
      control: { type: 'select' },
      options: STORY_CHIP_VARIANT_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_CHIP_SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `<tls-chip ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<ChipComponent>;

export const Chip: Story = {
  args: {},
};

export const WithIcons: StoryObj<ChipControl> = {
  decorators: [
    moduleMetadata({
      imports: [ChipComponent, ChipControl],
    }),
  ],
  args: {
    checked: false,
    disabled: false,
  },
  render: args => ({
    props: args,
    template: `
      <tls-chip tlsChipControl ${argsToTemplate(args)} color="primary" variant="outlined" size="md"
        [checked]="checked"
        [disabled]="disabled"
      >
        <ng-template #startIcon let-context>
          <span style="font-size: 12px">{{ context.checked ? '✓' : '○' }}</span>
        </ng-template>
        Chip
      </tls-chip>
    `,
  }),
};

export const Control: StoryObj<ChipControl> = {
  decorators: [
    moduleMetadata({
      imports: [ChipComponent, ChipControl],
    }),
  ],
  args: {
    checked: false,
    disabled: false,
  },
  argTypes: {
    checkedColor: {
      control: { type: 'select' },
      options: [undefined, ...STORY_COLOR_OPTIONS],
    },
    checkedVariant: {
      control: { type: 'select' },
      options: [undefined, ...STORY_CHIP_VARIANT_OPTIONS],
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-chip tlsChipControl ${argsToTemplate(args)} label="Chip" color="primary" variant="outlined" size="md"
        [checked]="checked"
        [disabled]="disabled"
        [checkedColor]="checkedColor"
        [checkedVariant]="checkedVariant"
      />
    `,
  }),
};
