import { vec3 as color, vec3 as point3 } from './vec3.js';
import { ray } from './ray.js';
import { BVHNode, HitRecord, Hittable, HittableList } from './hittable.js';
import * as util from './util.js';
import { add, addMutate, dot, near_zero, negate, reflect, refract, scale, subtract, unit } from './vec3gpu.js';

export class Scene {
  public root: Hittable;

  constructor(public hittableList: HittableList, public background: color) {
    this.root = new BVHNode(hittableList, 0, 0);
  }
}

export abstract class Material {
  abstract scatter(ray_in: ray, rec: HitRecord): ray | null;
}

export class SimpleDiffuseMaterial extends Material {
  constructor(private c: color) {
    super();
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = add(add(rec.p, rec.normal), util.randomInUnitSphere());
    rec.attenuation = this.c;
    return new ray(rec.p, subtract(target, rec.p), ray_in.time);
  }
}

export class LambertianDiffuseMaterial extends Material {
  constructor(private c: color) {
    super();
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = unit(add(rec.normal, util.randomInUnitSphere()));
    if (near_zero(target)) {
      return new ray(rec.p, rec.normal, ray_in.time);
    }
    
    rec.attenuation = this.c;
    return new ray(rec.p, target, ray_in.time);
  }
}

export class NaiveDiffuseMaterial extends Material {
  constructor(private c: color) {
    super();
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = add(rec.p, util.randomInHemisphere(rec.normal));
    rec.attenuation = this.c;
    return new ray(rec.p, subtract(target, rec.p), ray_in.time);
  }
}

export class Metal extends Material {
  private fuzziness: number;
  constructor(private c: color, fuzziness: number) {
    super();
    this.fuzziness = Math.min(fuzziness, 1);
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = reflect(unit(ray_in.direction), rec.normal);
    const scattered = new ray(rec.p, add(target, scale(util.randomInUnitSphere(), this.fuzziness)), ray_in.time);
    if (dot(scattered.direction, rec.normal) > 0) {
      rec.attenuation = this.c;
      return scattered;
    } else {
      return null;
    }
  }
}

export class Dieletric extends Material {
  constructor(private refraction: number) {
    super();
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    rec.attenuation = [1,1,1];
    
    const refraction_ratio = rec.front_face ? 1/this.refraction : this.refraction;

    const unit_direction = unit(ray_in.direction);

    const cos_theta = Math.min(dot(negate(unit_direction), rec.normal), 1.0);
    const sin_theta = Math.sqrt(1 - (cos_theta * cos_theta));

    const cannot_refract = (refraction_ratio * sin_theta) > 1;

    const direction = (cannot_refract || this.reflectance(cos_theta, refraction_ratio) > Math.random()) ? 
        reflect(unit_direction, rec.normal)
      : refract(unit_direction, rec.normal, refraction_ratio);

    // const direction = unit_direction.refract(rec.normal, refraction_ratio);
    const scattered = new ray(rec.p, direction, ray_in.time);
    return scattered;
  }

  public reflectance(cosine: number, ref_idx: number) {
    const r0 = ((1 - ref_idx) / (1 + ref_idx)) * ((1 - ref_idx) / (1 + ref_idx));
    return r0 + ((1 - r0) * Math.pow((1 - cosine), 5));
  }
}

export class Light extends Material {
  private light: color;
  constructor(private brightness: number, private color: color) {
    super();
    this.light = scale(color, brightness);
  }

  scatter(ray_in: ray, rec: HitRecord): ray | null {
    rec.emitted = this.light;

    return null;
  }

}