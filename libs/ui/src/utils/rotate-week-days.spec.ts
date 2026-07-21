import { rotateWeekDays } from './rotate-week-days';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

describe('rotateWeekDays', () => {
  it('leaves Sunday-first labels untouched when weekStartsOn is 0', () => {
    expect(rotateWeekDays(WEEK_DAYS, 0)).toEqual(WEEK_DAYS);
  });

  it('rotates so the start day comes first', () => {
    expect(rotateWeekDays(WEEK_DAYS, 1)).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  });
});
