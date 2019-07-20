module.exports = class Location {
  constructor(x, y) {
    if (x < 0 || y < 0) {
      throw Error('Coordinates cannot be negative');
    }

    this.x = x;
    this.y = y;
  }

  static from(str) {
    const rx = /^\s*(\d+)\s*,\s*(\d+)\s*$/g;
    const result = rx.exec(str);

    if (result == null) {
      throw Error('Invalid format');
    } else {
      const [, x, y] = result.map(Number);
      return new Location(x, y);
    }
  }
};