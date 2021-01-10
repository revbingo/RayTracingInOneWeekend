import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';
import { HitRecord, HittableList, Sphere } from './hittable.js';
import { Camera } from './camera.js';
import * as util from './util.js';

export class Scene {
  private readonly MAX_DEPTH = 10;
  private readonly SCENE_LIST = new HittableList(
    new Sphere(new point3([0, -100.5, -1]), 100, GROUND_MATERIAL),
    new Sphere(new point3([0,0,-1]), 0.5, CENTRE_MATERIAL),
    new Sphere(new point3([-1,0,-1]), 0.5, LEFT_MATERIAL),
    new Sphere(new point3([1,0,-1]), 0.5, RIGHT_MATERIAL),
    
  );

  private pixels: vec3[];
  private image_height: number;

  constructor(private image_width: number, aspect_ratio: number, camera: Camera, public samples_per_pixel: number = 100) {
    this.image_height = image_width / aspect_ratio;
    
    this.pixels = [];

    for (let j = this.image_height - 1; j >= 0; --j) {
      for (let i = 0; i < image_width; ++i) {
        let current_color: color = new color([0,0,0]);
        for (let s = 0; s < samples_per_pixel; s++) {
          const u = (i + Math.random()) / (this.image_width - 1);
          const v = (j + Math.random()) / (this.image_height - 1);
          const r = camera.getRay(u, v);
          current_color.addMutate(this.rayColor(r, this.MAX_DEPTH));
        }
        this.pixels.push(current_color);
      }
    }
  }

  private rayColor(r: ray, depth: number): color {
    if (depth <= 0) {
      return new color([0,0,0]);
    }
    const rec = this.SCENE_LIST.hit(r, 0.001, Number.MAX_SAFE_INTEGER);

    if (rec) {
      const new_ray = rec.material.scatter(r, rec);
      if (new_ray) {
        return this.rayColor(new_ray, depth - 1).multiply(rec.attenuation);
      } else {
        return new color([0,0,0]);
      }
      
    } else {
      const unit_direction = r.direction.unit();
      const t = 0.5 * (unit_direction.y + 1);
      return new color([1, 1, 1]).scaleUp(1-t).add(new color([0.5, 0.7, 1.0]).scaleUp(t));
    }
  }

  get width() {
    return this.image_width;
  }

  get height() {
    return this.image_height;
  }
  
  public getPixels(): vec3[] {
    return this.pixels;
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

export class MetalMaterial implements Material {
  constructor(private c: color) {}

  public scatter(ray_in: ray, rec: HitRecord): ray | null {
    const target: point3 = ray_in.direction.unit().reflect(rec.normal);
    const scattered = new ray(rec.p, target.subtract(rec.p))
    if (scattered.direction.dot(rec.normal) > 0) {
      rec.attenuation = this.c;
      return scattered;
    } else {
      return null;
    }
    
  }
}

const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([0.8, 0.8, 0.0]));
const CENTRE_MATERIAL = new LambertianDiffuseMaterial(new color([0.7, 0.3, 0.3]));
const LEFT_MATERIAL = new MetalMaterial(new color([0.8, 0.8, 0.8]));
const RIGHT_MATERIAL = new MetalMaterial(new color([0.8, 0.6, 0.2]));