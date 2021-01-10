import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';
import { HitRecord, HittableList, Sphere } from './hittable.js';
import { Camera } from './camera.js';
import * as util from './util.js';

export class Scene {
  private readonly R = Math.cos(Math.PI/4);
  private readonly SCENE_LIST = new HittableList(
    new Sphere(new point3([0, -100.5, -1]), 100, GROUND_MATERIAL),
    new Sphere(new point3([0,0,-1]), 0.5, CENTRE_MATERIAL),
    new Sphere(new point3([-1,0,-1]), 0.5, LEFT_MATERIAL),
    new Sphere(new point3([-1,0,-1]), -0.4, LEFT_MATERIAL),
    new Sphere(new point3([1,0,-1]), 0.5, RIGHT_MATERIAL),
    // new Sphere(new point3([-this.R, 0, -1]), this.R, LEFT_MATERIAL),
    // new Sphere(new point3([this.R, 0, -1]), this.R, RIGHT_MATERIAL)
  );

  get hittableList() {
    return this.SCENE_LIST;
  }
}

export interface Material {
  scatter(ray_in: ray, rec: HitRecord): ray | null;
  // attenuate(c: color): color;
}

export class SimpleDiffuseMaterial implements Material {
  constructor(private c: color) {}

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = rec.p.add(rec.normal).add(util.randomInUnitSphere());
    rec.attenuation = this.c;
    return new ray(rec.p, target.subtract(rec.p));
  }
}

export class LambertianDiffuseMaterial implements Material {
  constructor(private c: color) {}

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = rec.normal.add(util.randomInUnitSphere().unit());
    if (target.near_zero()) {
      return new ray(rec.p, rec.normal);
    }
    
    rec.attenuation = this.c;
    return new ray(rec.p, target);
  }
}

export class NaiveDiffuseMaterial implements Material {
  constructor(private c: color) {}

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = rec.p.add(util.randomInHemisphere(rec.normal));
    rec.attenuation = this.c;
    return new ray(rec.p, target.subtract(rec.p));
  }
}

export class Metal implements Material {
  private fuzziness: number;
  constructor(private c: color, fuzziness: number) {
    this.fuzziness = Math.min(fuzziness, 1);
  }

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = ray_in.direction.unit().reflect(rec.normal);
    const scattered = new ray(rec.p, target.add(util.randomInUnitSphere().scale(this.fuzziness)));
    if (scattered.direction.dot(rec.normal) > 0) {
      rec.attenuation = this.c;
      return scattered;
    } else {
      return null;
    }
  }
}

export class Dieletric implements Material {
  constructor(private refraction: number) {}

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    rec.attenuation = new color([1,1,1]);
    
    const refraction_ratio = rec.front_face ? 1/this.refraction : this.refraction;

    const unit_direction = ray_in.direction.unit();

    const cos_theta = Math.min(unit_direction.negate().dot(rec.normal), 1.0);
    const sin_theta = Math.sqrt(1 - (cos_theta * cos_theta));

    const cannot_refract = (refraction_ratio * sin_theta) > 1;

    const direction = (cannot_refract || this.reflectance(cos_theta, refraction_ratio) > Math.random()) ? 
        unit_direction.reflect(rec.normal)
      : unit_direction.refract(rec.normal, refraction_ratio);

    // const direction = unit_direction.refract(rec.normal, refraction_ratio);
    const scattered = new ray(rec.p, direction);
    return scattered;
  }

  public reflectance(cosine: number, ref_idx: number) {
    const r0 = ((1 - ref_idx) / (1 + ref_idx)) * ((1 - ref_idx) / (1 + ref_idx));
    return r0 + ((1 - r0) * Math.pow((1 - cosine), 5));
  }
}

const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([0.8, 0.8, 0.0]));
const CENTRE_MATERIAL = new LambertianDiffuseMaterial(new color([0.1, 0.2, 0.5]));
const LEFT_MATERIAL = new Dieletric(1.5);
// const LEFT_MATERIAL = new Metal(new color([1, 1, 1]), 0);
const RIGHT_MATERIAL = new Metal(new color([0.8, 0.6, 0.2]), 0);

// const LEFT_MATERIAL = new LambertianDiffuseMaterial(new color([0,0,1]))
// const RIGHT_MATERIAL = new LambertianDiffuseMaterial(new color([1,0,0]))