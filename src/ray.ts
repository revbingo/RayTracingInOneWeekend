import { vec3, vec3 as point3 } from './vec3.js';

export class ray {
  private orig: point3;
  private dir: vec3;

  constructor(origin: point3, direction: vec3) {
    this.orig = new point3([origin.x, origin.y, origin.z]);
    this.dir = new vec3([direction.x, direction.y, direction.z]);
  }

  get origin() {
    return this.orig;
  }

  get direction() {
    return this.dir;
  }

  public at(t: number): point3 {
    return this.orig.add(this.dir.scaleUp(t));
  }

  public toString() {
    return `Ray from ${this.orig.toString()} in direction ${this.dir.toString()}`;
  }

}