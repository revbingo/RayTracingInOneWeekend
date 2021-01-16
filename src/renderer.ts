import { Worker } from 'worker_threads';
import { Hittable } from './hittable.js';
import { Image } from './image.js';
import { ray } from './ray.js';
import { vec3 as color } from './vec3.js';
import colors from 'colors';

export class Renderer {

  private rootHittable?: Hittable;

  constructor(public samples_per_pixel: number = 100, private max_depth: number, private seed: number) {
    const initColorsForSomeReason = colors.green;
  }

  public async render(img: Image): Promise<Image> {
    const MAX_WORKERS = 4;
    const linesPerWorker = Math.floor(img.height / MAX_WORKERS);
    const chunkStatus: any = {};

    let latch = 0;   
    for (let j = img.height; j >= 1; j = j - linesPerWorker) {      
      const lineMin = Math.max(0, j - (linesPerWorker - 1));
      const lineMax = j;
      const chunkId = `${lineMin} - ${lineMax}`;
      const workerData = { lineMin: Math.max(0, j - (linesPerWorker - 1)), lineMax: j, imgWidth: img.width, imgHeight: img.height, samples: this.samples_per_pixel, max_depth: this.max_depth, seed: this.seed }
      
      chunkStatus[chunkId] = 'Starting...'
      latch++;
      const workerPort = new Worker('/Users/markpiper/sandbox/misc/raytrace/dist/worker.js', { workerData })

      workerPort.on('message', (m) => {
        if (m.type === 'complete') {
          img.addPixels(j, m.data);
          latch--;
          chunkStatus[m.id] = 'Done';
        } else if (m.type === 'update') {
          chunkStatus[m.id] = `${m.data}%`
        }
      });
    }

    while(latch > 0) {
      await sleep(1000);
      process.stdout.write(`Waiting for ${latch} chunks to complete ${this.formatStatus(chunkStatus)}\r`);
    }
    return img;
  }

  private formatStatus(chunks: any) {
    let output = '';
    for (const key of Object.keys(chunks)) {
      colors.green;
      const status = chunks[key] === 'Done' ? ' Done '.bgGreen : ` ${chunks[key]} `.red;
      output += `|${status}| ` 
    }
    return output;
  }
  private readonly BLACK = new color([0,0,0]);
  private readonly WHITE = new color([1,1,1]);

  private rayColor(r: ray, depth: number, background: color): color {
    if (depth <= 0) {
      // console.log(`Ray terminated (max depth) after ${depth} bounces`)
      return this.BLACK;
    }
    const rec = this.rootHittable!.hit(r, 0.001, Number.MAX_SAFE_INTEGER);

    if (rec) {
      const new_ray = rec.material.scatter(r, rec);
      if (new_ray) {
        return this.rayColor(new_ray, depth - 1, background).multiply(rec.attenuation || this.WHITE).add(rec.emitted || this.BLACK);
      } else {
        // console.log(`Ray terminated (emitted) after ${this.max_depth - depth} bounces`)
        return rec.emitted || this.BLACK;
      } 
    } else {
      // console.log(`Ray terminated (background) after ${this.max_depth - depth} bounces`)
      return background;
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}