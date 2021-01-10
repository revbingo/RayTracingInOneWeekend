import { Camera } from './camera.js';
import { FileWriter } from './file.js';
import { Renderer } from './renderer.js';
import { Scene } from './scene.js';
import { vec3, vec3 as point3 } from './vec3.js';

(async function() {
  const IMG_WIDTH = 800;
  const ASPECT_RATIO = 16/9;
  const scene = new Scene();

  const renderer = new Renderer(IMG_WIDTH, ASPECT_RATIO, 50);

  const lookfrom = new point3([3,3,2]);
  const lookat = new point3([0,0,-1]);
  const vup = new vec3([0,1,0]);
  const dist_to_focus = lookfrom.subtract(lookat).length();
  const aperture = 0.1;

  renderer.render(new Camera(lookfrom, lookat, vup, ASPECT_RATIO, 20, aperture, dist_to_focus), scene);

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', renderer);
})();
