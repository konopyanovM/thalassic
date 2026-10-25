import { collectOptionGroups, groupOptions } from './group-options';
import { Option } from './option';

const option = (label: string, group: string | null): Option<string> => ({
  value: label,
  label,
  disabled: false,
  group,
  source: label,
});

describe('groupOptions', () => {
  it('gathers each group next to its first option, keeping the order within it', () => {
    const grouped = groupOptions([
      option('Barbell', 'Free weights'),
      option('Treadmill', 'Cardio'),
      option('Dumbbell', 'Free weights'),
      option('Bike', 'Cardio'),
    ]);

    expect(grouped.map(entry => entry.label)).toEqual(['Barbell', 'Dumbbell', 'Treadmill', 'Bike']);
  });

  it('gathers the options that name no group as one more run', () => {
    const grouped = groupOptions([
      option('Towel', null),
      option('Barbell', 'Free weights'),
      option('Chalk', null),
    ]);

    expect(grouped.map(entry => entry.label)).toEqual(['Towel', 'Chalk', 'Barbell']);
  });

  it('leaves an ungrouped list as it is', () => {
    const options = [option('One', null), option('Two', null)];

    expect(groupOptions(options)).toEqual(options);
  });
});

describe('collectOptionGroups', () => {
  it('splits the list into its runs, each option keeping its flat position', () => {
    const groups = collectOptionGroups([
      option('Barbell', 'Free weights'),
      option('Dumbbell', 'Free weights'),
      option('Treadmill', 'Cardio'),
    ]);

    expect(
      groups.map(group => ({
        label: group.label,
        entries: group.options.map(entry => [entry.option.label, entry.index]),
      })),
    ).toEqual([
      { label: 'Free weights', entries: [['Barbell', 0], ['Dumbbell', 1]] },
      { label: 'Cardio', entries: [['Treadmill', 2]] },
    ]);
  });

  it('answers no groups for no options', () => {
    expect(collectOptionGroups([])).toEqual([]);
  });
});
