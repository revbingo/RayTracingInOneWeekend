import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';
import { Hittable, HittableList, Sphere } from './hittable.js';
import { Camera } from './camera.js';

export class Scene {
  private pixels: vec3[];
  private image_height: number;

  constructor(private image_width: number, aspect_ratio: number, camera: Camera) {
    this.image_height = image_width / aspect_ratio;
    
    this.pixels = [];

    for (let j = this.image_height - 1; j >= 0; --j) {
      for (let i = 0; i < image_width; ++i) {
        const u = i / (this.image_width - 1);
        const v = j / (this.image_height - 1);
        const r = camera.getRay(u, v);
        this.pixels.push(this.rayColor(r));
      }
    }
  }

  private readonly SCENE_LIST = new HittableList(
    new Sphere(new point3([0,0,-1]), 0.5),
    new Sphere(new point3([0, -100.5, -1]), 100)
  );

  private rayColor(ray: ray) {
    const hit = this.SCENE_LIST.hit(ray, 0, Number.MAX_SAFE_INTEGER);

    if (hit) {
      return hit.normal.add(new color([1,1,1])).scaleDown(2);
    } else {
      const unit_direction = ray.direction.unit();
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
