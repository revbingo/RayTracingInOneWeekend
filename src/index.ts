import { Camera } from './camera.js';
import { FileWriter } from './file.js';
import { Hittable, HittableList, Sphere } from './hittable.js';
import { Renderer } from './renderer.js';
import { Dieletric, LambertianDiffuseMaterial, Material, Metal, Scene } from './scene.js';
import { random, randomVec3 } from './util.js';
import { vec3, vec3 as point3, vec3 as color } from './vec3.js';

(async function() {
  const IMG_WIDTH = 1200;
  const ASPECT_RATIO = 3/2;
  const SAMPLES_PER_PIXEL = 100;

  const scene = new Scene(finalScene());

  const renderer = new Renderer(IMG_WIDTH, ASPECT_RATIO, SAMPLES_PER_PIXEL);

  const lookfrom = new point3([13,2,3]);
  const lookat = new point3([0,0,0]);
  const vup = new vec3([0,1,0]);
  const dist_to_focus = 10;
  const aperture = 0.1;

  renderer.render(new Camera(lookfrom, lookat, vup, ASPECT_RATIO, 20, aperture, dist_to_focus), scene);

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', renderer);
})();

function normalScene(): HittableList {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([0.8, 0.8, 0.0]));
  const CENTRE_MATERIAL = new LambertianDiffuseMaterial(new color([0.1, 0.2, 0.5]));
  const LEFT_MATERIAL = new Dieletric(1.5);
  const RIGHT_MATERIAL = new Metal(new color([0.8, 0.6, 0.2]), 0);

  const SCENE_LIST = new HittableList(
    new Sphere(new point3([0, -100.5, -1]), 100, GROUND_MATERIAL),
    new Sphere(new point3([0,0,-1]), 0.5, CENTRE_MATERIAL),
    new Sphere(new point3([-1,0,-1]), 0.5, LEFT_MATERIAL),
    new Sphere(new point3([-1,0,-1]), -0.4, LEFT_MATERIAL),
    new Sphere(new point3([1,0,-1]), 0.5, RIGHT_MATERIAL)
  );

  return SCENE_LIST;
}

function finalScene(): HittableList {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([0.5, 0.5, 0.5]));
  
  const objects: HittableList = new HittableList();
  objects.push(new Sphere(new point3([0, -1000, 0]), 1000, GROUND_MATERIAL));

  const p = new point3([4, 0.2, 0]);
  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const choose_mat = Math.random();
      const centre = new point3([a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random()])

      if (centre.subtract(p).length() > 0.9) {
        let material: Material | null;
        
        if (choose_mat < 0.8) {
          const albedo: color = randomVec3().multiply(randomVec3());
          material = new LambertianDiffuseMaterial(albedo);
        } else if (choose_mat < 0.95) {
          const albedo = randomVec3(0.5, 1);
          const fuzz = random(0, 0.5);
          material = new Metal(albedo, fuzz);
        } else {
          material = new Dieletric(1.5);
        }
        objects.push(new Sphere(centre, 0.2, material!));
      }
    }
  }

  objects.push(new Sphere(new point3([0,1,0]), 1, new Dieletric(1.5)));
  objects.push(new Sphere(new point3([-4,1,0]), 1, new LambertianDiffuseMaterial(new color([0.4, 0.2, 0.1]))));
  objects.push(new Sphere(new point3([4,1,0]), 1, new Metal(new color([0.7, 0.6, 0.5]), 0)));
  return objects;
}