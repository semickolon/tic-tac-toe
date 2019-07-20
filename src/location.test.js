const Location = require('./location');

test('constructs successfully given correct args', () => {
  expect(new Location(0, 0)).toMatchObject({ x: 0, y: 0 });
  expect(new Location(2, 5)).toMatchObject({ x: 2, y: 5 });
})

test('throws if any of the coordinates is negative', () => {
  expect(() => new Location(-2, 1)).toThrow();
  expect(() => new Location(3, -7)).toThrow();
  expect(() => new Location(-4, -6)).toThrow();
});

test('constructs from string successfully given correct format', () => {
  expect(Location.from('0,0')).toMatchObject({ x: 0, y: 0 });
  expect(Location.from('5,3')).toMatchObject({ x: 5, y: 3 });
  expect(Location.from(' 2  , 0 ')).toMatchObject({ x: 2, y: 0 });
  expect(Location.from(' 11\t, \n23 ')).toMatchObject({ x: 11, y: 23 });
});

test('throws if string is in invalid format', () => {
  expect(() => Location.from('')).toThrow();
  expect(() => Location.from(',')).toThrow();
  expect(() => Location.from('x,2')).toThrow();
  expect(() => Location.from('  !0190123 , !123812391\t')).toThrow();
  expect(() => Location.from('-1,-3')).toThrow();
  expect(() => Location.from('1,2,3,4')).toThrow();
});