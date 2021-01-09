import { FileWriter } from './file.js';

(async function() {
  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm');
  await new FileWriter().writeFileOld('/Users/markpiper/sandbox/misc/raytrace/img_old.ppm');
})();
