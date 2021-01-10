import { ray } from './ray.js';
import { vec3 as point3, vec3 } from './vec3.js';

export class Camera {
  private origin: point3 = new point3([0,0,0]);
  private horizontal: vec3;
  private vertical: vec3;
  private lower_left_corner : point3;

  constructor(aspect_ratio: number, viewport_height: number, focal_length: number) {
    const viewport_width = aspect_ratio * viewport_height;
    this.horizontal = new vec3([viewport_width, 0, 0]);
    this.vertical = new vec3([0, viewport_height, 0]);
    this.lower_left_corner = this.origin.subtract(this.horizontal.scaleDown(2)).subtract(this.vertical.scaleDown(2)).subtract(new vec3([0, 0, focal_length]));
  }

  public getRay(u: number, v: number) {
    return new ray(this.origin, this.lower_left_corner.add(this.horizontal.scaleUp(u)).add(this.vertical.scaleUp(v)).subtract(this.origin));
  }
}