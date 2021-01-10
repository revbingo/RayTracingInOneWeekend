import { vec3 } from './vec3.js';

export function randomInUnitSphere() {
  while (true) {
    const p = randomVec3(-1, 1);
    if (p.length_squared() >= 1) continue;
    return p;
  }
}

export function randomVec3(min: number = 0, max: number = 1): vec3 {
  return new vec3([random(min, max), random(min, max), random(min, max)])
}

export function random(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}