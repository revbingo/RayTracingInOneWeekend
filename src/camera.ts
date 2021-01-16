import { ray } from './ray.js';
import { degrees_to_radians, random, randomInUnitDisk } from './util.js';
import { vec3 as point3, vec3 } from './vec3.js';
import { add, cross, scale, scaleDown, subtract, unit } from './vec3gpu.js';

export class Camera {
  private origin: point3;
  private horizontal: vec3;
  private vertical: vec3;
  private lower_left_corner : point3;
  private lens_radius: number;
  private w: vec3;
  private u: vec3;
  private v: vec3;

  constructor(lookfrom: point3, lookat: point3, vup: vec3, aspect_ratio: number, vfov: number, aperture: number, focus_dist: number, private shutterTime: number) {
    const theta = degrees_to_radians(vfov);
    const h = Math.tan(theta/2);
    const viewport_height = 2 * h;
    const viewport_width = aspect_ratio * viewport_height;

    this.w = unit(subtract(lookfrom, lookat));
    this.u = unit(cross(vup, this.w));
    this.v = cross(this.w, this.u);

    this.origin = lookfrom;
    this.horizontal = scale(scale(this.u, viewport_width), focus_dist);
    this.vertical = scale(scale(this.v, viewport_height), focus_dist);
    this.lower_left_corner = subtract(subtract(subtract(this.origin, scaleDown(this.horizontal, 2)), scaleDown(this.vertical, 2)), scale(this.w, focus_dist));

    this.lens_radius = aperture / 2;
  }

  public getRay(u: number, v: number) {
    const rd = scale(randomInUnitDisk(), this.lens_radius);
    const offset = add(scale(this.u, rd[0]), scale(this.v, rd[1]));
    return new ray(add(this.origin, offset), subtract(subtract(add(add(this.lower_left_corner, scale(this.horizontal, u)), scale(this.vertical, v)), this.origin), offset), random(0, this.shutterTime));
  }
}