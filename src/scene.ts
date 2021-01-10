import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';
import { HitRecord, HittableList, Sphere } from './hittable.js';
import { Camera } from './camera.js';
import * as util from './util.js';

export class Scene {
  private readonly MAX_DEPTH = 10;
  private readonly SCENE_LIST = new HittableList(
    new Sphere(new point3([0,0,-1]), 0.5),
    new Sphere(new point3([0, -100.5, -1]), 100)
  );

  private diffuse: Diffuse = new NaiveDiffuse();

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
      const new_ray = this.diffuse.nextRay(rec);
      return this.rayColor(new_ray, depth - 1).scaleDown(2);
      // return rec.normal.add(new color([1,1,1])).scaleDown(2);
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

export interface Diffuse {
  nextRay(rec: HitRecord): ray;
}

export class SimpleDiffuse implements Diffuse {
  public nextRay(rec: HitRecord): ray {
    const target: point3 = rec.p.add(rec.normal).add(util.randomInUnitSphere());
    return new ray(rec.p, target.subtract(rec.p));
  }
}

export class LambertianDiffuse implements Diffuse {
  public nextRay(rec: HitRecord): ray {
    const target: point3 = rec.p.add(rec.normal).add(util.randomInUnitSphere().unit());
    return new ray(rec.p, target.subtract(rec.p));
  }
}

export class NaiveDiffuse implements Diffuse {
  public nextRay(rec: HitRecord): ray {
    const target: point3 = rec.p.add(util.randomInHemisphere(rec.normal));
    return new ray(rec.p, target.subtract(rec.p));
  }
}