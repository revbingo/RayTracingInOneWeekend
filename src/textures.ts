import { vec3 as color, vec3 as point3 } from './vec3.js';

export abstract class Texture {
  abstract value(u: number, v: number, p: point3): color;
}

export class SolidTexture extends Texture {
  constructor(private c: color) {
    super();
  }

  value(u: number, v: number, p: point3): color {
    return this.c;
  }
  
}

export class CheckerTexture extends Texture {
  constructor(private even: color, private odd: color) {
    super();
  }

  value(u: number, v: number, p: point3): color {
    const sines = Math.sin(10 * p[0]) * Math.sin(10 * p[1]) * Math.sin(10 * p[2])
    if (sines < 0) {
      return this.odd;
    } else {
      return this.even;
    }
  }
}