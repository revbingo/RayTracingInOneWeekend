import { ray } from './ray.js';
import { degrees_to_radians } from './util.js';
import { vec3 as point3, vec3 } from './vec3.js';

export class Camera {
  private origin: point3 = new point3([0,0,0]);
  private horizontal: vec3;
  private vertical: vec3;
  private lower_left_corner : point3;

  constructor(aspect_ratio: number, focal_length: number, vfov: number) {
    const theta = degrees_to_radians(vfov);
    const h = Math.tan(theta/2);
    const viewport_height = 2 * h;
    const viewport_width = aspect_ratio * viewport_height;
    this.horizontal = new vec3([viewport_width, 0, 0]);
    this.vertical = new vec3([0, viewport_height, 0]);
    this.lower_left_corner = this.origin.subtract(this.horizontal.scaleDown(2)).subtract(this.vertical.scaleDown(2)).subtract(new vec3([0, 0, focal_length]));
  }

  public getRay(u: number, v: number) {
    return new ray(this.origin, this.lower_left_corner.add(this.horizontal.scale(u)).add(this.vertical.scale(v)).subtract(this.origin));
  }
}