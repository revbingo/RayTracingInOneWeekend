import { random, randomInt, SeededRandom } from './util.js';
import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { dot, multiply, scale } from './vec3gpu.js';

export abstract class Texture {
  abstract value(u: number, v: number, p: point3): color;
}

export class SolidTexture extends Texture {
  constructor(private c: color) {
    super();
  }

  value(u: number, v: number, p: point3): color {
    return this.c;
  }
  
}

export class CheckerTexture extends Texture {
  constructor(private even: color, private odd: color) {
    super();
  }

  value(u: number, v: number, p: point3): color {
    const sines = Math.sin(10 * p[0]) * Math.sin(10 * p[1]) * Math.sin(10 * p[2])
    if (sines < 0) {
      return this.odd;
    } else {
      return this.even;
    }
  }
}

export class NoiseTexture extends Texture {
  private perlin: PerlinGenerator;

  constructor(seed: number, private scale: number) {
    super();
    this.perlin = new PerlinGenerator(seed);
  }

  value(u: number, v: number, p: point3): color {
    return scale(scale([1,1,1], 0.5), 1 + Math.sin(this.scale * p[2] + 10 * this.perlin.turbulence(p)));
  }
  
}

export class PerlinGenerator {
  private readonly POINT_COUNT = 256;

  private sr: SeededRandom;
  private ranvec: vec3[] = [];
  private perm_x: number[];
  private perm_y: number[];
  private perm_z: number[];

  constructor(seed: number) {
    this.sr = new SeededRandom(seed);
    for (let i = 0; i < this.POINT_COUNT; i++) {
      this.ranvec.push(this.sr.nextVec3(-1, 1));
    }

    this.perm_x = this.generatePerm();
    this.perm_y = this.generatePerm();
    this.perm_z = this.generatePerm();
  }

  public noise(p: point3): number {
    const p0i = Math.floor(p[0]);
    const p1i = Math.floor(p[1]);
    const p2i = Math.floor(p[2]);

    let u = p[0] - p0i;
    let v = p[1] - p1i;
    let w = p[2] - p2i;

    const c: vec3[][][] = [[[[0,0,0],[0,0,0]],[[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0]],[[0,0,0],[0,0,0]]]];

    for (let di = 0; di < 2; di++) {
      for (let dj = 0; dj < 2; dj++) {
        for (let dk = 0; dk < 2; dk++) {
          c[di][dj][dk] = this.ranvec[
            this.perm_x[p0i+di & 255] ^
            this.perm_y[p1i+dj & 255] ^
            this.perm_z[p2i+dk & 255]]
        }
      }
    }
    // console.log(c);
    return this.trilinearInterpolate(c, u, v, w);
  }

  public turbulence(p: point3, depth: number = 7) {
    let accum = 0;
    let temp_p = p;
    let weight = 1;

    for (let i = 0; i < depth; i++) {
      accum += weight * this.noise(temp_p)
      weight *= 0.5;
      temp_p = scale(temp_p, 2)
    }

    return Math.abs(accum);
  }

  private trilinearInterpolate(c: vec3[][][], u: number, v: number, w: number) {
    const uu = u*u*(3-2*u);
    const vv = v*v*(3-2*v);
    const ww = w*w*(3-2*w);

    let accum = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          const weight_v: vec3 = [u-i, v-j, w-k];
          accum += (i*uu + (1-i)*(1-uu)) * (j*vv + (1-j)*(1-vv)) * (k*ww + (1-k)*(1-ww)) * dot(c[i][j][k], weight_v);
        }
      }
    }

    return accum;
  }
  private generatePerm(): number[] {
    const p: number[] = [];
    for (let i = 0; i < this.POINT_COUNT; i++) {
      p.push(i);
    }
    this.shuffle(p);
    return p;
  }

  private shuffle(p: number[]): void {
    for (let i = this.POINT_COUNT - 1; i > 0; i--) {
      const target = this.sr.nextInt(0, i);
      const tmp = p[i];
      p[i] = p[target];
      p[target] = tmp;
    }
  }

}