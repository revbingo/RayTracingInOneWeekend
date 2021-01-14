import { vec3 } from './vec3.js';

export function randomInUnitSphere() {
  while (true) {
    const p = randomVec3(-1, 1);
    if (p.length_squared() >= 1) continue;
    return p;
  }
}

export function randomInHemisphere(normal: vec3) {
  const in_unit_sphere = randomInUnitSphere();
  return in_unit_sphere.dot(normal) > 0.0 ? in_unit_sphere : in_unit_sphere.negate();
}

export function randomInUnitDisk() {
  while (true) {
    const p = new vec3([random(-1, 1), random(-1, 1), 0]);
    if (p.length_squared() >= 1) continue;
    return p;
  }
}

export function randomVec3(min: number = 0, max: number = 1): vec3 {
  return new vec3([random(min, max), random(min, max), random(min, max)])
}

export function randomUnitVector() {
  return randomInUnitSphere().unit();
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