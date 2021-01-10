import { Camera } from './camera.js';
import { FileWriter } from './file.js';
import { Renderer } from './renderer.js';
import { Scene } from './scene.js';

(async function() {
  const IMG_WIDTH = 400;
  const ASPECT_RATIO = 16/9;
  const scene = new Scene();

  const renderer = new Renderer(IMG_WIDTH, ASPECT_RATIO, 50);

  renderer.render(new Camera(ASPECT_RATIO, 1.0, 90), scene);

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', renderer);
})();
