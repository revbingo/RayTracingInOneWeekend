import { ray } from './ray.js';
import { Material, LambertianDiffuseMaterial } from './scene.js';
import { vec3 as point3, vec3 as color, vec3 } from './vec3.js';

export interface HitRecord {
  p: point3;
  normal: vec3;
  t: number;
  front_face: boolean;
  material: Material;
  attenuation: color;
}

export class HitRecordFactory {
  public static generate(r: ray, p: point3, outward_normal: vec3, t: number, material: Material) {
    const front_face = r.direction.dot(outward_normal) < 0;
    const normal = front_face ? outward_normal : outward_normal.negate();
    return {
      t, 
      p,
      normal,
      front_face,
      material,
      attenuation: new color([1,1,1])
    };
  }
}

export abstract class Hittable {
  public abstract hit(r: ray, t_min: number, t_max: number): HitRecord | null;
}

export class HittableList extends Array<Hittable> {
  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    let hitRecord: HitRecord | null = null; 
    let hit_anything = false;
    let closest_so_far = t_max;

    this.forEach((object) => {
      const newHit = object.hit(r, t_min, closest_so_far);
      if (newHit) {
        hit_anything = true;
        closest_so_far = newHit.t;
        hitRecord = newHit;
      }
    })

    return hitRecord;
  }
}

export class Sphere extends Hittable {
  constructor(private centre: point3, private radius: number, public material: Material) {
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
    return HitRecordFactory.generate(r, p, p.subtract(this.centre).scaleDown(this.radius), root, this.material);
  }
}