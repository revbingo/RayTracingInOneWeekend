import { ray } from './ray.js';
import { vec3 as point3, vec3 } from './vec3.js';

export interface HitRecord {
  p: point3;
  normal: vec3;
  t: number;
}

export abstract class Hittable {
  public abstract hit(r: ray, t_min: number, t_max: number): HitRecord | null;
}

export class Sphere extends Hittable {
  constructor(private centre: point3, private radius: number) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const oc: vec3 = r.origin.subtract(this.centre);
    const a = r.direction.dot(r.direction);
    const half_b = oc.dot(r.direction);
    const c = oc.dot(oc) - (this.radius * this.radius);
    const discriminant = (half_b * half_b) - (a * c);
    if (discriminant < 0) {
      return null;
    }

    const sqrtd = Math.sqrt(discriminant);
    let root = (-half_b - sqrtd) / a;
    if (root < t_min || t_max < root) {
      root = (-half_b + sqrtd) / a;
      if (root < t_min || t_max < root) {
        return null;
      }
    }
    
    const p = r.at(root);
    return {
      p,
      t: root,
      normal: p.subtract(this.centre).scaleDown(this.radius)
    };
  
  }
}