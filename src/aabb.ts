import { ray } from './ray.js';
import { vec3 as point3 } from './vec3.js';

export class aabb {
  constructor(public minimum: point3, public maximum: point3) {}

  public hit(r: ray, t_min: number, t_max: number) {
    for (let a = 0; a < 3; a++) {
      const invD = 1.0 / r.direction[a];
      let t0 = (this.minimum[a] - r.origin[a]) * invD;
      let t1 = (this.maximum[a] - r.origin[a]) * invD;
      if (invD < 0) {
        const tt = t0;
        t0 = t1;
        t1 = tt;
      }
      t_min = t0 > t_min ? t0 : t_min;
      t_max = t1 < t_max ? t1 : t_max;
      if (t_max <= t_min) return false;
    }
    return true;
  }

  public combine(other: aabb): aabb {
    const small: point3 = [
      Math.min(this.minimum[0], other.minimum[0]),
      Math.min(this.minimum[1], other.minimum[1]),
      Math.min(this.minimum[2], other.minimum[2])
    ]

    const big: point3 = [
      Math.max(this.maximum[0], other.maximum[0]),
      Math.max(this.maximum[1], other.maximum[1]),
      Math.max(this.maximum[2], other.maximum[2])
    ]

    return new aabb(small, big);
  }

  public toString() {
    return `${this.minimum.toString()} -> ${this.maximum.toString()}`
  }
}