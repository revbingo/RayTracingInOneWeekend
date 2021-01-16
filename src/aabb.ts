import { ray } from './ray.js';
import { vec3 as point3 } from './vec3.js';

export class aabb {
  constructor(public minimum: point3, public maximum: point3) {}

  public hit(r: ray, t_min: number, t_max: number) {
    for (let a = 0; a < 3; a++) {
      const invD = 1.0 / r.direction.get(a);
      let t0 = (this.minimum.arr[a] - r.origin.arr[a]) * invD;
      let t1 = (this.maximum.arr[a] - r.origin.arr[a]) * invD;
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
    const small: point3 = new point3([
      Math.min(this.minimum.x, other.minimum.x),
      Math.min(this.minimum.y, other.minimum.y),
      Math.min(this.minimum.z, other.minimum.z)
    ])

    const big: point3 = new point3([
      Math.max(this.maximum.x, other.maximum.x),
      Math.max(this.maximum.y, other.maximum.y),
      Math.max(this.maximum.z, other.maximum.z)
    ])

    return new aabb(small, big);
  }

  public toString() {
    return `${this.minimum.toString()} -> ${this.maximum.toString()}`
  }
}