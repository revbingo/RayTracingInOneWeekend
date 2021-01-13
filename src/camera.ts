import { ray } from './ray.js';
import { degrees_to_radians, random, randomInUnitDisk } from './util.js';
import { vec3 as point3, vec3 } from './vec3.js';

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

    this.w = lookfrom.subtract(lookat).unit();
    this.u = vup.cross(this.w).unit();
    this.v = this.w.cross(this.u);

    this.origin = lookfrom;
    this.horizontal = this.u.scale(viewport_width).scale(focus_dist);
    this.vertical = this.v.scale(viewport_height).scale(focus_dist);
    this.lower_left_corner = this.origin.subtract(this.horizontal.scaleDown(2)).subtract(this.vertical.scaleDown(2)).subtract(this.w.scale(focus_dist));

    this.lens_radius = aperture / 2;
  }

  public getRay(u: number, v: number) {
    const rd = randomInUnitDisk().scale(this.lens_radius);
    const offset = this.u.scale(rd.x).add(this.v.scale(rd.y));
    return new ray(this.origin.add(offset), this.lower_left_corner.add(this.horizontal.scale(u)).add(this.vertical.scale(v)).subtract(this.origin).subtract(offset), random(0, this.shutterTime));
  }
}