import { Camera } from './camera.js';
import { HittableList } from './hittable.js';
import { ray } from './ray.js';
import { Scene } from './scene.js';
import { vec3, vec3 as color } from './vec3.js';

export class Renderer {
  private readonly MAX_DEPTH = 50;

  private pixels: vec3[];
  private image_height: number;

  private hittableList?: HittableList;

  constructor(private image_width: number, aspect_ratio: number, public samples_per_pixel: number = 100) {
    this.image_height = image_width / aspect_ratio;
    this.pixels = [];
  }

  public render(camera: Camera, scene: Scene) {
    this.hittableList = scene.hittableList;
    for (let j = this.image_height - 1; j >= 0; --j) {
      for (let i = 0; i < this.image_width; ++i) {
        let current_color: color = new color([0,0,0]);
        for (let s = 0; s < this.samples_per_pixel; s++) {
          const u = (i + Math.random()) / (this.image_width - 1);
          const v = (j + Math.random()) / (this.image_height - 1);
          const r = camera.getRay(u, v);
          current_color.addMutate(this.rayColor(r, this.MAX_DEPTH));
        }
        this.pixels.push(current_color);
      }
      if (j % 20 == 0) {
        console.log(`Calculated ${this.image_height - j} lines`);
      }
    }
  }

  private rayColor(r: ray, depth: number): color {
    if (depth <= 0) {
      return new color([0,0,0]);
    }
    const rec = this.hittableList!.hit(r, 0.001, Number.MAX_SAFE_INTEGER);

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
      return new color([1, 1, 1]).scale(1-t).add(new color([0.5, 0.7, 1.0]).scale(t));
    }
  }

  get width() {
    return this.image_width;
  }

  get height() {
    return this.image_height;
  }

  public getPixels() {
    return this.pixels;
  }
}