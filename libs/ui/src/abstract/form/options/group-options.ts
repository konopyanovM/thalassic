import { Option } from './option';
import { OptionGroup } from './option-group';

/**
 * Gathers every option of a group next to the first one listed, so a group is
 * never split however the options arrive. Groups keep the order in which they
 * first appear and options keep their order within a group; the options that
 * belong to no group are gathered the same way, as one more run.
 */
export function groupOptions<V>(options: Option<V>[]): Option<V>[] {
  const byGroup = new Map<string | null, Option<V>[]>();

  for (const option of options) {
    const members = byGroup.get(option.group);
    if (members) {
      members.push(option);
    } else {
      byGroup.set(option.group, [option]);
    }
  }

  return [...byGroup.values()].flat();
}

/**
 * Splits an already-grouped option list into its runs, each option paired with
 * the position it holds in the flat list.
 */
export function collectOptionGroups<V>(options: Option<V>[]): OptionGroup<V>[] {
  const groups: OptionGroup<V>[] = [];

  options.forEach((option, index) => {
    const last = groups[groups.length - 1];
    if (last && last.label === option.group) {
      last.options.push({ option, index });
      return;
    }
    groups.push({ label: option.group, options: [{ option, index }] });
  });

  return groups;
}
