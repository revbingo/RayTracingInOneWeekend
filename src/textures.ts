import { vec3 as color, vec3 as point3 } from './vec3.js';

export abstract class Texture {
  abstract value(u: number, v: number, p: point3): color;
}

export class SolidTexture extends Texture {
  constructor(private c: color) {
    super();
  }

  value(u: number, v: number, p: color): color {
    return this.c;
  }
}