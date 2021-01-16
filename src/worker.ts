import { parentPort, workerData } from 'worker_threads';
import { ray } from './ray.js';
import { Scene } from './scene.js';
import { vec3 as color } from './vec3.js';
import { scene } from './render_scene.js';

const BLACK = new color([0,0,0]);
const WHITE = new color([1,1,1]);

(async function() {
  const { lineMin, lineMax, imgWidth, imgHeight, samples, max_depth } = workerData;

  const chunkId = `${lineMin} - ${lineMax}`;
  const camera = scene.camera;
  const objects = scene.scene;

  const returnArray = [];
  for (let j = lineMax; j >= lineMin; j--) {
   for (let i = 0; i < imgWidth; ++i) {
      let current_color: color = new color([0,0,0]);
      for (let s = 0; s < samples; s++) {
        const u = (i + Math.random()) / (imgWidth - 1);
        const v = (j + Math.random()) / (imgHeight - 1);
        const r = camera.getRay(u, v);
        current_color.addMutate(rayColor(r, max_depth, objects));
      }
      // img.addPixel(i, img.height - 1 - j, current_color.divideMutate(samples));
      returnArray.push(current_color.divideMutate(samples).arr);
    }
    parentPort?.postMessage({ type: 'update', id: chunkId, data: Math.round((lineMax - j) * 100/(lineMax - lineMin)) })
  }

  parentPort?.postMessage({ type: 'complete', id: chunkId, data: returnArray });
})();

function rayColor(r: ray, depth: number, scene: Scene): color {
  if (depth <= 0) {
    // console.log(`Ray terminated (max depth) after ${depth} bounces`)
    return BLACK;
  }
  const rec = scene.root!.hit(r, 0.001, Number.MAX_SAFE_INTEGER);

  if (rec) {
    const new_ray = rec.material.scatter(r, rec);
    if (new_ray) {
      return rayColor(new_ray, depth - 1, scene).multiply(rec.attenuation || WHITE).add(rec.emitted || BLACK);
    } else {
      // console.log(`Ray terminated (emitted) after ${this.max_depth - depth} bounces`)
      return rec.emitted || BLACK;
    } 
  } else {
    // console.log(`Ray terminated (background) after ${this.max_depth - depth} bounces`)
    return scene.background;
  }
}