import { vec3, vec3 as color } from './vec3.js';

export class Image {

  private pixelArray: color[];

  private readonly gammaFunction = Math.sqrt;
  
  constructor(public width: number, public aspect_ratio: number) {
    this.pixelArray = new Array(this.width * this.height);
  }

  public addPixel(x: number, y: number, c: color) {
    this.pixelArray[((y * this.width)) + x] = this.writeColor(c);
  }

  public addPixels(y: number, pixels: number[][]) {
    const colors = pixels.map(p => new color(p)).map(c => this.writeColor(c));
    const startIndex = (this.height - y) * this.width; 
    this.pixelArray.splice(startIndex, pixels.length, ...colors);
  }

  private writeColor(c: color): color {
    const r = this.toRGB(this.gammaFunction(c.x));
    const g = this.toRGB(this.gammaFunction(c.y));
    const b = this.toRGB(this.gammaFunction(c.z));

    return new color([r,g,b]);
  }

  private toRGB(c: number) {
    return Math.trunc(256 * this.clamp(c, 0.0, 0.999));
  }

  private clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }

  get height() {
    return Math.floor(this.width / this.aspect_ratio);
  }

  get pixels(): color[] {
    return this.pixelArray;
  }
}