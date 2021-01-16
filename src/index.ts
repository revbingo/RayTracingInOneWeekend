
import { FileWriter } from './file.js';
import { Image } from './image.js';
import { Renderer } from './renderer.js';

import { scene } from './render_scene.js';
import { SeededRandom } from './util.js';

(async function() {
  const IMG_WIDTH = 1200;
  const ASPECT_RATIO = 16/9;
  const SAMPLES_PER_PIXEL = 100;
  const MAX_DEPTH = 10;
  const SEED = 1;

  const renderer = new Renderer(SAMPLES_PER_PIXEL, MAX_DEPTH, SEED);

  const image = await renderer.render(new Image(IMG_WIDTH, ASPECT_RATIO));

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', image);
})();