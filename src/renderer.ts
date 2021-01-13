import { GPU } from 'gpu.js';
import { Camera } from './camera.js';
import { HittableList } from './hittable.js';
import { Image } from './image.js';
import { ray } from './ray.js';
import { Scene } from './scene.js';
import { random } from './util.js';
import { vec3, vec3 as color } from './vec3.js';

export class Renderer {

  private hittableList?: HittableList;

  constructor(public samples_per_pixel: number = 100, private max_depth: number) {}

  public render(camera: Camera, scene: Scene, img: Image): Image {    
    this.hittableList = scene.hittableList;
    for (let j = img.height - 1; j >= 0; --j) {
      console.log(`Calculating line ${j}`);
      for (let i = 0; i < img.width; ++i) {
        let current_color: color = new color([0,0,0]);
        for (let s = 0; s < this.samples_per_pixel; s++) {
          const u = (i + Math.random()) / (img.width - 1);
          const v = (j + Math.random()) / (img.height - 1);
          const r = camera.getRay(u, v);
          current_color.addMutate(this.rayColor(r, this.max_depth, scene.background));
        }
        img.addPixel(i, img.height - 1 - j, current_color.divideMutate(this.samples_per_pixel));
      }
    }

    return img;
  }

  private readonly BLACK = new color([0,0,0]);
  private readonly WHITE = new color([1,1,1]);

  private rayColor(r: ray, depth: number, background: color): color {
    if (depth <= 0) {
      // console.log(`Ray terminated (max depth) after ${depth} bounces`)
      return this.BLACK;
    }
    const rec = this.hittableList!.hit(r, 0.001, Number.MAX_SAFE_INTEGER);

    if (rec) {
      const new_ray = rec.material.scatter(r, rec);
      if (new_ray) {
        return this.rayColor(new_ray, depth - 1, background).multiply(rec.attenuation || this.WHITE).add(rec.emitted || this.BLACK);
      } else {
        // console.log(`Ray terminated (emitted) after ${this.max_depth - depth} bounces`)
        return rec.emitted || this.BLACK;
      } 
    } else {
      // const unit_direction = r.direction.unit();
      // const t = 0.5 * (unit_direction.y + 1);
      // return new color([1, 1, 1]).scale(1-t).add(new color([0.5, 0.7, 1.0]).scale(t));
      // console.log(`Ray terminated (background) after ${this.max_depth - depth} bounces`)
      return background;
    }
  }
}