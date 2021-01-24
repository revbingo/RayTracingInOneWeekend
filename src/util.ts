import { vec3 } from './vec3.js';
import { dot, length_squared, negate, unit } from './vec3gpu.js';

export function randomInUnitSphere() {
  while (true) {
    const p = randomVec3(-1, 1);
    if (length_squared(p) >= 1) continue;
    return p;
  }
}

export function randomInHemisphere(normal: vec3) {
  const in_unit_sphere = randomInUnitSphere();
  return dot(in_unit_sphere, normal) > 0.0 ? in_unit_sphere : negate(in_unit_sphere);
}

export function randomInUnitDisk() {
  while (true) {
    const p = [random(-1, 1), random(-1, 1), 0];
    if (length_squared(p) >= 1) continue;
    return p;
  }
}

export function randomVec3(min: number = 0, max: number = 1): vec3 {
  return [random(min, max), random(min, max), random(min, max)]
}

export function randomUnitVector() {
  return unit(randomInUnitSphere());
}

export function random(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number = 0, max: number = 1): number {
  return Math.round(Math.random() * (max - min) + min);
}


export function degrees_to_radians(degrees: number) {
  return degrees * Math.PI / 180;
}

export class SeededRandom {
  constructor(private seed: number) {}

  public next(min: number = 0, max: number = 1) {
    var t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    const rand = ((t ^ t >>> 14) >>> 0) / 4294967296;
    
    return (rand * (max - min)) + min;
  }

  public nextInt(min: number = 0, max: number = 1) {
    return Math.round(this.next(min, max));
  }

  public nextVec3(min: number = 0, max: number = 1) {
    return [this.next(min, max), this.next(min, max), this.next(min, max)];
  }
}