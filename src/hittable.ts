import { GPU } from 'gpu.js';
import { ray } from './ray.js';
import { Material, LambertianDiffuseMaterial } from './scene.js';
import { vec3 as point3, vec3 as color, vec3 } from './vec3.js';
import { add, scale, subtract, dot, negate, scaleDown } from './vec3gpu.js';

export interface HitRecord {
  p: point3;
  normal: vec3;
  t: number;
  front_face: boolean;
  material: Material;
  attenuation?: color;
  emitted?: color;
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
      material
    };
  }
}

export abstract class Hittable {
  public abstract hit(r: ray, t_min: number, t_max: number): HitRecord | null;
}

export class HittableList extends Array<Hittable> {
  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    let hitRecord: HitRecord | null = null; 
    let closest_so_far = t_max;

    // const gpu = new GPU({ mode: 'dev'});
    // const hitKernel = gpu.createKernel(hit);
    // hitKernel.setOutput([1]);
    // hitKernel.addFunction(add);

    for (let i = this.length - 1; i >= 0; i-- ) {
      const sphere = this[i] as Sphere;
      const root = hit(r.origin.arr, r.direction.arr, sphere.centre.arr, sphere.radius, t_min, closest_so_far) as number;
      if (root == Number.MAX_SAFE_INTEGER) continue;
      const p = r.at(root);
      const newHit = HitRecordFactory.generate(r, p, new vec3(scaleDown(subtract(p.arr, sphere.centre.arr), sphere.radius)), root, sphere.material);
      if (newHit) {
        closest_so_far = newHit.t;
        hitRecord = newHit;
      }
    }

    return hitRecord;
  }
}

export class Sphere extends Hittable {
  constructor(public centre: point3, public radius: number, public material: Material) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const orig: number[] = r.origin.arr;
    const dir: number[] = r.direction.arr;

    // ===
    const oc: number[] = subtract(orig, this.centre.arr);
    const a = dot(dir, dir);
    const half_b = dot(oc, dir);
    const c = dot(oc, oc) - (this.radius * this.radius);
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
    // ===
    
    const p = r.at(root);
    return HitRecordFactory.generate(r, p, p.subtract(this.centre).scaleDown(this.radius), root, this.material);
  }
}

function hit(orig: number[], dir: number[], centre: number[], radius: number, t_min: number, t_max: number): number {
  // ===
  const oc: number[] = subtract(orig, centre);
  const a = dot(dir, dir);
  const half_b = dot(oc, dir);
  const c = dot(oc, oc) - (radius * radius);
  const discriminant = (half_b * half_b) - (a * c);
  if (discriminant < 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  const sqrtd = Math.sqrt(discriminant);
  let root = (-half_b - sqrtd) / a;
  if (root < t_min || t_max < root) {
    root = (-half_b + sqrtd) / a;
    if (root < t_min || t_max < root) {
      return Number.MAX_SAFE_INTEGER;
    }
  }
  // ===

  return root;
}