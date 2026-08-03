import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { subDays } from 'date-fns';
import { STORY_COLOR_OPTIONS, STORY_SIZE_OPTIONS } from '../../../.storybook/constants';
import { ActivityHeatmap as ActivityHeatmapComponent } from './activity-heatmap';
import { ActivityHeatmapEntry } from './activity-heatmap.types';

const today = new Date();

/** A year of pseudo-random daily activity, quiet on weekends and empty on most days. */
const buildEntries = (days: number): ActivityHeatmapEntry[] => {
  const entries: ActivityHeatmapEntry[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = subDays(today, offset);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const chance = weekend ? 0.25 : 0.7;
    if (Math.random() > chance) continue;

    entries.push({ date, count: Math.ceil(Math.random() * (weekend ? 4 : 12)) });
  }

  return entries;
};

const meta: Meta<ActivityHeatmapComponent> = {
  component: ActivityHeatmapComponent,
  title: 'Activity heatmap',
  args: {
    entries: buildEntries(370),
    levels: 5,
    color: 'primary',
    size: 'md',
    weekStartsOn: 0,
    weekdayLabelInterval: 2,
    showMonthLabels: true,
    showWeekdayLabels: true,
    showLegend: true,
    showTooltip: true,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    weekStartsOn: {
      control: { type: 'select' },
      options: [0, 1, 6],
    },
    weekdayLabelInterval: {
      control: { type: 'select' },
      options: [1, 2, 3],
    },
  },
  render: args => ({
    props: args,
    template: `<tls-activity-heatmap ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<ActivityHeatmapComponent>;

export const Year: Story = {
  args: {},
};

export const Quarter: Story = {
  args: {
    startDate: subDays(today, 90),
    endDate: today,
    size: 'lg',
  },
};

export const FixedThresholds: Story = {
  args: {
    thresholds: [1, 3, 6, 10],
    color: 'success',
  },
};

export const EveryWeekday: Story = {
  args: {
    startDate: subDays(today, 120),
    endDate: today,
    weekStartsOn: 1,
    weekdayLabelInterval: 1,
    size: 'lg',
  },
};

export const Bare: Story = {
  args: {
    showMonthLabels: false,
    showWeekdayLabels: false,
    showLegend: false,
  },
};
