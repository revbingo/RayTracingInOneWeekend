import { aabb } from './aabb.js';
import { ray } from './ray.js';
import { Material, LambertianDiffuseMaterial } from './scene.js';
import { vec3 as point3, vec3 as color, vec3 } from './vec3.js';
import { add, scale, subtract, dot, negate, scaleDown } from './vec3gpu.js';
import { degrees_to_radians, randomInt } from './util.js';
import { Texture } from './textures.js';

export interface HitRecord {
  p: point3;
  normal: vec3;
  t: number;
  front_face: boolean;
  material: Material;
  coords: { u: number, v: number };
  attenuation?: color;
  emitted?: color;
}

export class HitRecordFactory {
  public static generate(r: ray, p: point3, outward_normal: vec3, t: number, material: Material, coords: {u:number, v:number}) {
    const front_face = dot(r.direction, outward_normal) < 0;
    const normal = front_face ? outward_normal : negate(outward_normal);
    return {
      t, 
      p,
      normal,
      front_face,
      material,
      coords
    };
  }
}

export abstract class Hittable {
  public abstract hit(r: ray, t_min: number, t_max: number): HitRecord | null;
  public abstract bounding_box(t0: number, t1: number): aabb | null;
}

export class HittableList extends Hittable {

  public list: Hittable[] = [];
  constructor(hittables?: Hittable[]) {
    super();
    if (hittables) {
      this.list.push(...hittables);
    }
  }

  public push(obj: Hittable) {
    this.list.push(obj);
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    let hitRecord: HitRecord | null = null; 
    let closest_so_far = t_max;

    for (let i = this.list.length - 1; i >= 0; i-- ) {
      const hittable = this.list[i];
      const rec = hittable.hit(r, t_min, closest_so_far);

      if (!rec) continue;
      const p = r.at(rec.t);
      const newHit = HitRecordFactory.generate(r, p, rec.normal, rec.t, rec.material, { u: 0, v: 0});
      if (newHit) {
        closest_so_far = newHit.t;
        hitRecord = newHit;
      }
    }

    return hitRecord;
  }

  public bounding_box(t0: number, t1: number): aabb | null {
    if (this.list.length == 0) return null;
    
    let temp_box: aabb | null = null;
    let boundary: aabb | null = null;
    
    for(let i = 0; i < this.list.length; i++) {
      const object = this.list[i];
      temp_box = object.bounding_box(t0, t1);
      if (!temp_box) return null;
      boundary = boundary ? boundary.combine(temp_box) : temp_box;
    }

    return boundary;
  }
}

export class BVHNode extends Hittable {
  private box: aabb;
  private left: Hittable;
  private right: Hittable;

  constructor(hittables: HittableList, t0: number, t1: number) {
    super();
    const axis = randomInt(0, 2);
    const comparator = (axis == 0) ? box_x_compare
                      : (axis == 1) ? box_y_compare
                                    : box_z_compare 

    const list = hittables.list;
    let start = 0;
    let end = list.length;
    const span = end - start;

    if (span === 0) throw new Error('No objects');

    if (span === 1) {
      this.left = this.right = list[start]
    } else if (span === 2) {
      if (comparator(list[start], list[start + 1])) {
        this.left = list[start];
        this.right = list[start + 1];
      } else {
        this.right = list[start];
        this.left = list[start + 1];
      }
    } else {
      list.sort((a, b) => comparator(a,b) ? 1 : -1);

      const mid = span / 2;
      this.left = new BVHNode(new HittableList(list.slice(0, mid)), t0, t1);
      this.right = new BVHNode(new HittableList(list.slice(mid)), t0, t1);
    }

    const box_left = this.left.bounding_box(t0, t1);
    const box_right = this.right.bounding_box(t0, t1);

    if (!box_left || !box_right) {
      throw new Error('No bounding box');
    }
    
    this.box = box_left.combine(box_right);
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    if(!this.box?.hit(r, t_min, t_max)) return null;

    const left_rec = this.left!.hit(r, t_min, t_max);
    const right_rec = this.right!.hit(r, t_min, left_rec ? left_rec.t : t_max);

    return right_rec || left_rec;
  }

  public bounding_box(t0: number, t1: number): aabb | null {
    return this.box;
  }
}

function box_compare(a: Hittable, b: Hittable, axis: number): boolean {
  const box_a = a.bounding_box(0, 0);
  const box_b = b.bounding_box(0, 0);

  if (!box_a || !box_b) {
    throw new Error('No bounding box');
  }

  return box_a.minimum[axis] < box_b.minimum[axis];
}
function box_x_compare(a: Hittable, b: Hittable) {
  return box_compare(a, b, 0);
}
function box_y_compare(a: Hittable, b: Hittable) {
  return box_compare(a, b, 1);
}
function box_z_compare(a: Hittable, b: Hittable) {
  return box_compare(a, b, 2);
}

export interface Moveable {
  cen1: point3,
  time1: number
}

export class Sphere extends Hittable {
  constructor(public centre: point3, public radius: number, public material: Material, private movable?: Moveable) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const oc: number[] = subtract(r.origin, this.centreAt(r.time));
    const a = dot(r.direction, r.direction);
    const half_b = dot(oc, r.direction);
    const c = dot(oc, oc) - (this.radius * this.radius);
    const discriminant = (half_b * half_b) - (a * c);
    if (discriminant < 0) {
      return null;
    }

    const sqrtd = Math.sqrt(discriminant);
    let root = (-half_b - sqrtd) / a;
    if (root < t_min || t_max < root) {
      root = (-half_b + sqrtd) / a;
      if (root < t_min || t_max < root) {
        return null;
      }
    }

    const p = r.at(root);

    const outward_normal = scaleDown(subtract(p, this.centreAt(r.time)), this.radius);
    const uv = this.getUV(outward_normal);
    return HitRecordFactory.generate(r, p, outward_normal, root, this.material, uv);
  }

  public bounding_box(t0: number, t1: number): aabb {
    const box0 = new aabb(
      subtract(this.centre, [this.radius, this.radius, this.radius]),
      add(this.centre, [this.radius, this.radius, this.radius]),
    )
    if (!this.movable) {
      return box0;
    }

    const box1 = new aabb(
      subtract(this.centreAt(t1), [this.radius, this.radius, this.radius]),
      add(this.centreAt(t1), [this.radius, this.radius, this.radius]),
    )

    return box0.combine(box1);
  }

  private centreAt(time: number): point3 {
    return this.movable ? 
        add(this.centre, scale(subtract(this.movable.cen1, this.centre), time))
      : this.centre;
  }

  private getUV(p: point3): {u: number, v: number } {
    const theta = Math.acos(-p[1]);
    const phi = Math.atan2(-p[2], p[0]) + Math.PI;

    return { u: phi / (2 * Math.PI), v: theta / phi };
  }
}

export class XYRectangle extends Hittable {
  constructor(private x0: number, private x1: number, private y0: number, private y1: number, private k: number, private material: Material) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const t = (this.k - r.origin[2]) / r.direction[2];
    if (t < t_min || t > t_max) {
      return null;
    }

    const x = r.origin[0] + (t*r.direction[0]);
    const y = r.origin[1] + (t*r.direction[1]);

    if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1) {
      return null;
    }

    const outward_normal = [0,0,1];
    const uv = { u: (x-this.x0)/(this.x1-this.x0), v: (y-this.y0)/(this.y1-this.y0)}
    const p = r.at(t);
    return HitRecordFactory.generate(r, p, outward_normal, t, this.material, uv);

  }
  public bounding_box(t0: number, t1: number): aabb | null {
    return new aabb([this.x0, this.y0, this.k-0.0001], [this.x1, this.y1, this.k+0.0001]);
  }

}

export class XZRectangle extends Hittable {
  constructor(private x0: number, private x1: number, private z0: number, private z1: number, private k: number, private material: Material) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const t = (this.k - r.origin[1]) / r.direction[1];
    if (t < t_min || t > t_max) {
      return null;
    }

    const x = r.origin[0] + (t*r.direction[0]);
    const z = r.origin[2] + (t*r.direction[2]);

    if (x < this.x0 || x > this.x1 || z < this.z0 || z > this.z1) {
      return null;
    }

    const outward_normal = [0,1,0];
    const uv = { u: (x-this.x0)/(this.x1-this.x0), v: (z-this.z0)/(this.z1-this.z0)}
    const p = r.at(t);
    return HitRecordFactory.generate(r, p, outward_normal, t, this.material, uv);

  }
  public bounding_box(t0: number, t1: number): aabb | null {
    return new aabb([this.x0, this.k-0.0001, this.z0], [this.x1, this.k+0.0001, this.z1]);
  }

}

export class YZRectangle extends Hittable {
  constructor(private y0: number, private y1: number, private z0: number, private z1: number, private k: number, private material: Material) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const t = (this.k - r.origin[0]) / r.direction[0];
    if (t < t_min || t > t_max) {
      return null;
    }

    const y = r.origin[1] + (t*r.direction[1]);
    const z = r.origin[2] + (t*r.direction[2]);

    if (y < this.y0 || y > this.y1 || z < this.z0 || z > this.z1) {
      return null;
    }

    const outward_normal = [1,0,0];
    const uv = { u: (y-this.y0)/(this.y1-this.y0), v: (z-this.z0)/(this.z1-this.z0)}
    const p = r.at(t);
    return HitRecordFactory.generate(r, p, outward_normal, t, this.material, uv);

  }
  public bounding_box(t0: number, t1: number): aabb | null {
    return new aabb([this.k-0.0001, this.y0, this.z0], [this.k+0.0001, this.y1, this.z1]);
  }
}

export class Box extends Hittable {
  private sides: HittableList = new HittableList();

  constructor(private p0: point3, private p1: point3, private material: Material) {
    super(); 

    this.sides.push(new XYRectangle(p0[0], p1[0], p0[1], p1[1], p1[2], this.material));
    this.sides.push(new XYRectangle(p0[0], p1[0], p0[1], p1[1], p0[2], this.material));

    this.sides.push(new XZRectangle(p0[0], p1[0], p0[2], p1[2], p1[1], this.material));
    this.sides.push(new XZRectangle(p0[0], p1[0], p0[2], p1[2], p0[1], this.material));

    this.sides.push(new YZRectangle(p0[1], p1[1], p0[2], p1[2], p1[0], this.material));
    this.sides.push(new YZRectangle(p0[1], p1[1], p0[2], p1[2], p0[0], this.material));
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    return this.sides.hit(r, t_min, t_max);
  }

  public bounding_box(t0: number, t1: number): aabb | null {
    return new aabb(this.p0, this.p1);
  }

}

export class Translate extends Hittable {

  constructor(private p: Hittable, private offset: vec3) {
    super();
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const moved_r = new ray(subtract(r.origin, this.offset), r.direction, r.time);

    const rec = this.p.hit(moved_r, t_min, t_max);
    if (!rec) {
      return null;
    }

    return HitRecordFactory.generate(moved_r, add(rec.p, this.offset), rec.normal, rec.t, rec.material, rec.coords);
  }

  public bounding_box(t0: number, t1: number): aabb | null {
    const output_box = this.p.bounding_box(t0, t1);

    if (!output_box) return null;

    return new aabb(add(output_box.minimum, this.offset), add(output_box.maximum, this.offset))
  }
}

export class Rotate extends Hittable {
  private sin_theta: number;
  private cos_theta: number;
  private bbox: aabb | null;
  private axis1: number;
  private axis2: number;

  constructor(private p: Hittable, angle: number, private axis: number) {
    super();
    if (axis === 0) {
      this.axis1 = 1;
      this.axis2 = 2;
    } else if (axis === 1) {
      this.axis1 = 0;
      this.axis2 = 2;
    } else {
      this.axis1 = 0;
      this.axis2 = 1;
    }
    const radians = degrees_to_radians(angle);
    this.sin_theta = Math.sin(radians);
    this.cos_theta = Math.cos(radians);
    
    this.bbox = this.p.bounding_box(0, 1)

    if (!this.bbox) return;

    const min = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
    const max = [-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER];

    for (let i = 0; i < 2 ; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          const xyz = [
            i*this.bbox.maximum[0] + (1-i)*this.bbox.minimum[0],
            j*this.bbox.maximum[1] + (1-j)*this.bbox.minimum[1],
            k*this.bbox.maximum[2] + (1-k)*this.bbox.minimum[2]
          ];

          const new1 = this.cos_theta * xyz[this.axis1] + this.sin_theta * xyz[this.axis2];
          const new2 = -this.sin_theta * xyz[this.axis1] + this.cos_theta * xyz[this.axis2];

          const tester = [];
          tester[this.axis] = xyz[this.axis];
          tester[this.axis1] = new1;
          tester[this.axis2] = new2;

          for (let c = 0; c < 3; c++) {
            min[c] = Math.min(min[c], tester[c]);
            max[c] = Math.max(max[c], tester[c]);
          }
        }
      }
    }

    this.bbox = new aabb(min, max);
  }

  public hit(r: ray, t_min: number, t_max: number): HitRecord | null {
    const origin = [r.origin[0], r.origin[1], r.origin[2]];
    const direction = [r.direction[0], r.direction[1], r.direction[2]];

    origin[this.axis1] = this.cos_theta * r.origin[this.axis1] - this.sin_theta * r.origin[this.axis2];
    origin[this.axis2] = this.sin_theta * r.origin[this.axis1] + this.cos_theta * r.origin[this.axis2];

    direction[this.axis1] = this.cos_theta * r.direction[this.axis1] - this.sin_theta * r.direction[this.axis2];
    direction[this.axis2] = this.sin_theta * r.direction[this.axis1] + this.cos_theta * r.direction[this.axis2];

    const rotated_r = new ray(origin, direction, r.time);

    const rec = this.p.hit(rotated_r, t_min, t_max);

    if (!rec) return null;

    const p = [rec.p[0], rec.p[1], rec.p[2]];
    const normal = [rec.normal[0], rec.normal[1], rec.normal[2]];

    p[this.axis1] = this.cos_theta * rec.p[this.axis1] + this.sin_theta * rec.p[this.axis2];
    p[this.axis2] = -this.sin_theta * rec.p[this.axis1] + this.cos_theta * rec.p[this.axis2];

    normal[this.axis1] = this.cos_theta * rec.normal[this.axis1] + this.sin_theta * rec.normal[this.axis2];
    normal[this.axis2] = -this.sin_theta * rec.normal[this.axis1] + this.cos_theta * rec.normal[this.axis2];

    return HitRecordFactory.generate(rotated_r, p, normal, rec.t, rec.material, rec.coords);
  }

  public bounding_box(t0: number, t1: number): aabb | null {
    return this.bbox;
  }
}
// function hit(orig: number[], dir: number[], centre: number[], radius: number, t_min: number, t_max: number): number {
//   // ===
//   const oc: number[] = subtract(orig, centre);
//   const a = dot(dir, dir);
//   const half_b = dot(oc, dir);
//   const c = dot(oc, oc) - (radius * radius);
//   const discriminant = (half_b * half_b) - (a * c);
//   if (discriminant < 0) {
//     return Number.MAX_SAFE_INTEGER;
//   }

//   const sqrtd = Math.sqrt(discriminant);
//   let root = (-half_b - sqrtd) / a;
//   if (root < t_min || t_max < root) {
//     root = (-half_b + sqrtd) / a;
//     if (root < t_min || t_max < root) {
//       return Number.MAX_SAFE_INTEGER;
//     }
//   }
//   // ===

  // return root;
// }