import { FileWriter, Scene } from './file.js';

(async function() {
  const IMG_WIDTH = 400;

  const scene = new Scene(IMG_WIDTH, 16 / 9);

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', scene);
})();
