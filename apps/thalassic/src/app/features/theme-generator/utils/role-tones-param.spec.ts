import { parseRoleTones } from './parse-role-tones';
import { serializeRoleTones } from './serialize-role-tones';

describe('role tone params', () => {
  it('writes overrides in role order and reads them back', () => {
    const param = serializeRoleTones({ 'on-primary': 100, primary: 65, outline: 55 });

    expect(param).toBe('primary:65,on-primary:100,outline:55');
    expect(parseRoleTones(param)).toEqual({ primary: 65, 'on-primary': 100, outline: 55 });
  });

  it('writes no overrides as an empty param', () => {
    expect(serializeRoleTones({})).toBe('');
    expect(parseRoleTones('')).toEqual({});
  });

  it('skips entries naming no role or carrying no whole tone', () => {
    expect(
      parseRoleTones('primry:50,primary:,primary:101,on-primary:-1,surface:4.5,outline:55'),
    ).toEqual({ outline: 55 });
  });
});
