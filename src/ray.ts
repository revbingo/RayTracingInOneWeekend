import { vec3, vec3 as point3 } from './vec3.js';
import { add, scale } from './vec3gpu.js';

export class ray {
  private orig: point3;
  private dir: vec3;

  constructor(origin: point3, direction: vec3, public time: number = 0) {
    this.orig = origin;
    this.dir = direction;
  }

  get origin() {
    return this.orig;
  }

  get direction() {
    return this.dir;
  }

  public at(t: number): point3 {
    return add(this.orig, scale(this.dir, t));
  }

  public toString() {
    return `Ray from ${this.orig.toString()} in direction ${this.dir.toString()}`;
  }

}