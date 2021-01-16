
import { FileWriter } from './file.js';
import { Image } from './image.js';
import { Renderer } from './renderer.js';

import { scene } from './render_scene.js';
import { SeededRandom } from './util.js';

(async function() {
  const IMG_WIDTH = 400;
  const ASPECT_RATIO = 16/9;
  const SAMPLES_PER_PIXEL = 50;
  const MAX_DEPTH = 5;
  const SEED = 123456;

  const renderer = new Renderer(SAMPLES_PER_PIXEL, MAX_DEPTH, SEED);

  const image = await renderer.render(new Image(IMG_WIDTH, ASPECT_RATIO));

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', image);
})();