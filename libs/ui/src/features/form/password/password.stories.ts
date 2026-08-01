import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Password as PasswordComponent } from './password';

const meta: Meta<PasswordComponent> = {
  component: PasswordComponent,
  title: 'Form/Password',
  args: {
    value: '',
    visible: false,
    placeholder: 'Some text',
    size: 'md',
    fluid: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<PasswordComponent>;

export const Password: Story = {
  args: {},
};

export const CustomIcons: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-password ${argsToTemplate(args)}>
        <ng-template #showIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </ng-template>
        <ng-template #hideIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </ng-template>
      </tls-password>
    `,
  }),
};

export const WithStartIcon: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-password ${argsToTemplate(args)}>
        <ng-template #startIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </ng-template>
      </tls-password>
    `,
  }),
};
