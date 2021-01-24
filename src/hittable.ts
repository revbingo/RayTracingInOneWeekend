import { aabb } from './aabb.js';
import { ray } from './ray.js';
import { Material, LambertianDiffuseMaterial } from './scene.js';
import { vec3 as point3, vec3 as color, vec3 } from './vec3.js';
import { add, scale, subtract, dot, negate, scaleDown } from './vec3gpu.js';
import { randomInt } from './util.js';
import { Texture } from './textures.js';

export interface HitRecord {
  p: point3;
  normal: vec3;
  t: number;
  front_face: boolean;
  material: Material;
  coords?: { u: number, v: number };
  attenuation?: color;
  emitted?: color;
}

export class HitRecordFactory {
  public static generate(r: ray, p: point3, outward_normal: vec3, t: number, material: Material, coords?: {u:number, v:number}) {
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
      const newHit = HitRecordFactory.generate(r, p, rec.normal, rec.t, rec.material);
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