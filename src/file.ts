import { promises as fs } from 'fs';
import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';

export class FileWriter {
  public async writeFile(file_name: string) {
    
    const IMG_WIDTH = 400;

    const scene = new Scene(IMG_WIDTH, 16 / 9);

    await fs.writeFile(file_name, `P3\n${scene.width} ${scene.height}\n255\n`);
  
    const pixels = scene.getPixels();

    let buffer = '';
    let line_count = 0;
    for (let i = 0; i < pixels.length; i++) {
      if (i == 1) {
        console.log(`pix 1 = ${pixels[i].toString()}`);
      }
      buffer += this.writeColor(this.rayColor(pixels[i]));

      if (i % (IMG_WIDTH * 20) == 0 || i == pixels.length - 1) {
        line_count += 20;
        console.log(`Written ${line_count} lines`);
        await fs.appendFile(file_name, buffer);
        buffer = '';
      }
    }
  }

  private writeColor(color: color): string {
    return `${Math.trunc(255.999 * color.x)} ${Math.trunc(255.999 * color.y)} ${Math.trunc(255.999 * color.z)}\n`;
  }

  private rayColor(ray: ray) {
    const unit_direction = ray.direction.unit();
    const t = 0.5 * (unit_direction.y + 1);
    return new color([1, 1, 1]).scaleUp(1-t).add(new color([0.5, 0.7, 1.0]).scaleUp(t));
  }
}

export class Scene {
  private pixels: ray[];
  private image_height: number;

  constructor(private image_width: number, aspect_ratio: number) {
    this.image_height = image_width / aspect_ratio;
    
    this.pixels = [];
    const viewport_height = 2.0;
    const viewport_width = aspect_ratio * viewport_height;
    const focal_length = 1.0;

    const origin = new point3([0, 0, 0]);
    const horizontal = new vec3([viewport_width, 0, 0]);
    const vertical = new vec3([0, viewport_height, 0]);
    const lower_left_corner = origin.subtract(horizontal.scaleDown(2)).subtract(vertical.scaleDown(2)).subtract(new vec3([0, 0, focal_length]));
  
    for (let j = this.image_height - 1; j >= 0; --j) {
      for (let i = 0; i < this.image_width; ++i) {
        const u = i / this.image_width - 1;
        const v = j / this.image_height - 1;
        const r = new ray(origin, lower_left_corner.add(horizontal.scaleUp(u).add(vertical.scaleUp(v)).subtract(origin)))
        this.pixels.push(r);
      }
    }
  }

  get width() {
    return this.image_width;
  }

  get height() {
    return this.image_height;
  }

  public getPixels(): ray[] {
    return this.pixels;
  }
}