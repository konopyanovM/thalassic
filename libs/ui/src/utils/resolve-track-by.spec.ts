import { resolveTrackBy } from './resolve-track-by';

interface Row {
  id: number;
  name: string;
}

const ROW: Row = { id: 7, name: 'Alice' };

describe('resolveTrackBy', () => {
  it('tracks by item identity when no key is given', () => {
    expect(resolveTrackBy<Row>(undefined)(0, ROW)).toBe(ROW);
  });

  it('reads the named property when given a key', () => {
    expect(resolveTrackBy<Row>('id')(0, ROW)).toBe(7);
    expect(resolveTrackBy<Row>('name')(0, ROW)).toBe('Alice');
  });

  it('passes an explicit function through', () => {
    const custom = (index: number, row: Row) => `${index}-${row.id}`;
    expect(resolveTrackBy<Row>(custom)(3, ROW)).toBe('3-7');
  });
});
