import { promises as fs } from 'fs';
import { Image } from './image.js';

export class FileWriter {
  public async writeFile(file_name: string, image: Image) {
    await fs.writeFile(file_name, `P3\n${image.width} ${image.height}\n255\n`);
  
    const pixels = image.pixels;

    console.log(`Writing ${pixels.length} pixels`)
    let buffer = '';
    let line_count = 0;
    for (let i = 0; i < pixels.length; i++) {
      buffer += `${pixels[i][0]} ${pixels[i][1]} ${pixels[i][2]}\n`

      if (i % (image.width * 20) == 0 || i == pixels.length - 1) {
        line_count += 20;
        await fs.appendFile(file_name, buffer);
        buffer = '';
      }
    }
  }
}

