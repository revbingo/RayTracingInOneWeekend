import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';
import { Sphere } from './hittable.js';

export class Scene {
  private pixels: vec3[];
  private image_height: number;

  constructor(private image_width: number, aspect_ratio: number) {
    this.image_height = image_width / aspect_ratio;
    
    this.pixels = [];
    const viewport_height = 2.0;
    const viewport_width = aspect_ratio * viewport_height;
    const focal_length = 1.0;

    const origin = new point3([0, 0, 0]);
    const horizontal = new vec3([viewport_width, 0, 0]);
    const vertical = new vec3([0, viewport_height, 0]);
    const lower_left_corner = origin.subtract(horizontal.scaleDown(2)).subtract(vertical.scaleDown(2)).subtract(new vec3([0, 0, focal_length]));

    for (let j = this.image_height - 1; j >= 0; --j) {
      for (let i = 0; i < this.image_width; ++i) {
        const u = i / (this.image_width - 1);
        const v = j / (this.image_height - 1);
        const r = new ray(origin, lower_left_corner.add(horizontal.scaleUp(u)).add(vertical.scaleUp(v)).subtract(origin));
        this.pixels.push(this.rayColor(r));
      }
    }
  }

  private readonly THE_SPHERE = new Sphere(new point3([0,0,-1]), 0.5);

  private rayColor(ray: ray) {
    const hit = this.THE_SPHERE.hit(ray, 0, 1000);

    if (hit) {
      return new color([hit.normal.x + 1, hit.normal.y + 1, hit.normal.z + 1]).scaleDown(2);
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
