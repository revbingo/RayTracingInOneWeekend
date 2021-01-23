import { parentPort, workerData } from 'worker_threads';
import { ray } from './ray.js';
import { Scene } from './scene.js';
import { vec3 as color } from './vec3.js';
import { scene } from './render_scene.js';
import { add, addMutate, divideMutate, multiply, near_zero, subtract } from './vec3gpu.js';

const BLACK = [0,0,0];
const WHITE = [1,1,1];

(async function() {
  const { lineMin, lineMax, imgWidth, imgHeight, samples, max_depth } = workerData;

  const chunkId = `${lineMin} - ${lineMax}`;
  const camera = scene.camera;
  const objects = scene.scene;

  let total_samples = 0;
  const returnArray = [];
  for (let j = lineMax; j >= lineMin; j--) {
   for (let i = 0; i < imgWidth; ++i) {
      let current_color: color = [0,0,0];
      let samples_taken = 1;
      for (let s = 0; s < samples; s++, ++samples_taken, ++total_samples) {
        const u = (i + Math.random()) / (imgWidth - 1);
        const v = (j + Math.random()) / (imgHeight - 1);
        const r = camera.getRay(u, v);
        const color = rayColor(r, max_depth, objects);
      
        addMutate(current_color, color);
      }
      returnArray.push(divideMutate(current_color, samples_taken));
    }
    parentPort?.postMessage({ type: 'update', id: chunkId, data: Math.round((lineMax - j) * 100/(lineMax - lineMin)) })
  }

  parentPort?.postMessage({ type: 'complete', id: chunkId, data: returnArray, samples: total_samples });
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
      const recast = rayColor(new_ray, depth - 1, scene);
      return add(multiply(recast, rec.attenuation || WHITE), rec.emitted || BLACK);
    } else {
      // console.log(`Ray terminated (emitted) after ${this.max_depth - depth} bounces`)
      return BLACK;
    } 
  } else {
    // console.log(`Ray terminated (background) after ${depth} bounces`)
    return scene.background;
  }
}