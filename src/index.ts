import { Camera } from './camera.js';
import { FileWriter } from './file.js';
import { Scene } from './scene.js';

(async function() {
  const IMG_WIDTH = 400;
  const ASPECT_RATIO = 16/9;
  const scene = new Scene(IMG_WIDTH, ASPECT_RATIO, new Camera(ASPECT_RATIO, 2.0, 1.0));

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', scene);
})();
