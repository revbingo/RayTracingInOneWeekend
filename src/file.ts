import { promises as fs } from 'fs';
import { vec3 as color, vec3 as point3, vec3 } from './vec3.js';
import { ray } from './ray.js';

export class FileWriter {
  public async writeFile(file_name: string) {
    const aspect_ratio = 16 / 9;
    const image_width = 400;
    const image_height = image_width / aspect_ratio;

    const viewport_height = 2.0;
    const viewport_width = aspect_ratio * viewport_height;
    const focal_length = 1.0;

    const origin = new point3([0, 0, 0]);
    const horizontal = new vec3([viewport_width, 0, 0]);
    const vertical = new vec3([0, viewport_height, 0]);
    const lower_left_corner = origin.subtract(horizontal.scaleDown(2)).subtract(vertical.scaleDown(2)).subtract(new vec3([0, 0, focal_length]));
  
    await fs.writeFile(file_name, `P3\n${image_width} ${image_height}\n255\n`);
  
    let buffer = '';
    for (let j = image_height - 1; j >= 0; --j) {
      console.log(`Scanlines remaining: ${j}`)
      for (let i = 0; i < image_width; ++i) {
        const u = i / image_width - 1;
        const v = j / image_height - 1;
        const r = new ray(origin, lower_left_corner.add(horizontal.scaleUp(u).add(vertical.scaleUp(v)).subtract(origin)))
        buffer += this.writeColor(this.rayColor(r));
      }
  
      if (j % 20 == 0) {
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
