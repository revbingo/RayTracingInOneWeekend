import { Worker } from 'worker_threads';
import { Hittable } from './hittable.js';
import { Image } from './image.js';
import { ray } from './ray.js';
import { vec3 as color } from './vec3.js';
import colors from 'colors';

export class Renderer {

  constructor(public samples_per_pixel: number = 100, private max_depth: number, private seed: number) {}

  public async render(img: Image): Promise<Image> {
    const MAX_WORKERS = 12;
    const linesPerWorker = Math.ceil(img.height / MAX_WORKERS);

    const chunkStatus = new ChunkStatus();

    let latch = 0;   
    for (let j = img.height; j >= 1; j = j - linesPerWorker) {      
      const lineMin = Math.max(0, j - (linesPerWorker - 1));
      const lineMax = j;
      const chunkId = `${lineMin} - ${lineMax}`;
      const workerData = { lineMin: Math.max(0, j - (linesPerWorker - 1)), lineMax: j, imgWidth: img.width, imgHeight: img.height, samples: this.samples_per_pixel, max_depth: this.max_depth, seed: this.seed }
      
      chunkStatus.startChunk(chunkId);
      latch++;
      const workerPort = new Worker('/Users/markpiper/sandbox/misc/raytrace/dist/worker.js', { workerData })

      workerPort.on('message', (m) => {
        if (m.type === 'complete') {
          img.addPixels(j, m.data);
          latch--;
          chunkStatus.completeChunk(m.id);
        } else if (m.type === 'update') {
          chunkStatus.updateChunk(m.id, m.data);
        }
      });
    }

    while(latch > 0) {
      await sleep(1000);
      process.stdout.write(`Waiting for ${latch} chunks to complete ${chunkStatus}\r`);
    }
    return img;
  }
}

export class ChunkStatus {
  private chunkStatus: any = {};

  constructor() {
    const initColorsForSomeReason = colors.green;
  }

  public startChunk(id: string) {
    this.chunkStatus[id] = '---';
  }

  public updateChunk(id: string, pct: number) {
    this.chunkStatus[id] = `${pct.toString().padStart(2, '0')}%`;
  }

  public completeChunk(id: string) {
    this.chunkStatus[id] = ' ✅ ';
  }

  public toString() {
    let output = '';
    for (const key of Object.keys(this.chunkStatus)) {
      colors.green;
      const status = this.chunkStatus[key] === 'Done' ? 'Done'.bgGreen : `${this.chunkStatus[key]}`.red;
      output += `|${status}|` 
    }
    return output;
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}