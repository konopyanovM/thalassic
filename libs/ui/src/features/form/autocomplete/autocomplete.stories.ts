import { signal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Autocomplete as AutocompleteComponent } from './autocomplete';

const meta: Meta<AutocompleteComponent<{ label: string; value: string; disabled?: boolean }>> = {
  component: AutocompleteComponent,
  title: 'Form/Autocomplete',
  args: {
    value: null,
    placeholder: 'Search a fruit',
    size: 'md',
    fluid: false,
    clearable: false,
    filterMode: 'contains',
    emptyMessage: 'No results',
    loadingMessage: 'Loading',
    loading: false,
    minQueryLength: 0,
    tabindex: 0,
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Apricot', value: 'apricot' },
      { label: 'Banana', value: 'banana' },
      { label: 'Blueberry', value: 'blueberry' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Grapefruit (out of season)', value: 'grapefruit', disabled: true },
      { label: 'Mango', value: 'mango' },
    ],
    optionLabel: 'label',
    optionValue: 'value',
    optionDisabled: 'disabled',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    filterMode: {
      control: { type: 'inline-radio' },
      options: ['contains', 'startsWith', 'none'],
    },
    minQueryLength: { control: { type: 'number' } },
    inputId: { control: false },
  },
};
export default meta;

type Story = StoryObj<AutocompleteComponent<unknown>>;

export const Autocomplete: Story = {};

export const VirtualScroll: Story = {
  args: {
    virtualScroll: true,
    options: Array.from({ length: 10000 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option${index + 1}`,
    })),
  },
};

interface RemoteWorkout {
  id: string;
  name: string;
}

const REMOTE_CATALOG: RemoteWorkout[] = [
  'Back squat',
  'Front squat',
  'Bulgarian split squat',
  'Deadlift',
  'Romanian deadlift',
  'Sumo deadlift',
  'Bench press',
  'Incline bench press',
  'Overhead press',
  'Barbell row',
  'Pendlay row',
  'Pull-up',
  'Chin-up',
  'Lat pulldown',
  'Face pull',
  'Hip thrust',
  'Walking lunge',
  'Calf raise',
  'Plank',
  'Farmer carry',
].map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));

const REQUEST_DURATION = 700;
const DEBOUNCE_DURATION = 300;

/** Search endpoint standing in for whatever the consumer queries. */
const createRemoteSource = () => {
  const results = signal<RemoteWorkout[]>([]);
  const loading = signal(false);

  let debounceHandle: ReturnType<typeof setTimeout> | undefined;
  let latestRequest = 0;

  const search = (term: string): void => {
    clearTimeout(debounceHandle);
    // The field is already stale the moment the query changes, so the panel reports itself
    // busy from the keystroke rather than from the request the debounce eventually sends.
    loading.set(true);

    debounceHandle = setTimeout(() => {
      const request = ++latestRequest;

      setTimeout(() => {
        // A response overtaken by a newer request describes a query nobody is typing any more.
        if (request !== latestRequest) return;

        const query = term.trim().toLowerCase();
        results.set(REMOTE_CATALOG.filter(workout => workout.name.toLowerCase().includes(query)));
        loading.set(false);
      }, REQUEST_DURATION);
    }, DEBOUNCE_DURATION);
  };

  return { results, loading, search };
};

/**
 * Options fetched per query instead of held by the control: `filterMode="none"` leaves the
 * server's answer intact, `loading` tells a search in flight apart from one that matched
 * nothing, and `minQueryLength` keeps an empty field from asking for the whole catalogue.
 */
export const RemoteSearch: StoryObj<AutocompleteComponent<RemoteWorkout>> = {
  args: {
    placeholder: 'Search exercises',
    filterMode: 'none',
    minQueryLength: 2,
    clearable: true,
    fluid: true,
    optionLabel: 'name',
    optionValue: 'id',
  },
  argTypes: {
    options: { control: false },
    loading: { control: false },
  },
  render: args => ({
    props: { ...args, ...createRemoteSource() },
    template: `
      <tls-autocomplete
        [options]="results()"
        [loading]="loading()"
        (queryChange)="search($event)"
        ${argsToTemplate(args, { exclude: ['options', 'loading'] })}
      />
    `,
  }),
};
