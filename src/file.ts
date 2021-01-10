import { promises as fs } from 'fs';
import { Scene } from './scene.js';
import { vec3 as color } from './vec3.js';

export class FileWriter {
  public async writeFile(file_name: string, scene: Scene) {
    await fs.writeFile(file_name, `P3\n${scene.width} ${scene.height}\n255\n`);
  
    const pixels = scene.getPixels();

    let buffer = '';
    let line_count = 0;
    for (let i = 0; i < pixels.length; i++) {
      buffer += this.writeColor(pixels[i], scene.samples_per_pixel);

      if (i % (scene.width * 20) == 0 || i == pixels.length - 1) {
        line_count += 20;
        console.log(`Written ${line_count} lines`);
        await fs.appendFile(file_name, buffer);
        buffer = '';
      }
    }
  }

  private writeColor(color: color, samples_per_pixel: number): string {
    const scale = 1 / samples_per_pixel;
    const r = color.x * scale;
    const g = color.y * scale;
    const b = color.z * scale;

    return `${Math.trunc(255.999 * this.clamp(r, 0.0, 0.999))} ${Math.trunc(255.999 * this.clamp(g, 0.0, 0.999))} ${Math.trunc(255.999 * this.clamp(b, 0.0, 0.999))}\n`;
  }

  private clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }
}

