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
      buffer += this.writeColor(pixels[i]);

      if (i % (scene.width * 20) == 0 || i == pixels.length - 1) {
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
}