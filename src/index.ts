import { Camera } from './camera.js';
import { FileWriter } from './file.js';
import { Hittable, HittableList, Sphere } from './hittable.js';
import { Image } from './image.js';
import { Renderer } from './renderer.js';
import { Dieletric, LambertianDiffuseMaterial, Light, Material, Metal, Scene } from './scene.js';
import { random, randomVec3 } from './util.js';
import { vec3, vec3 as point3, vec3 as color } from './vec3.js';

(async function() {
  const IMG_WIDTH = 400;
  const ASPECT_RATIO = 16/9;
  const SAMPLES_PER_PIXEL = 50;
  const MAX_DEPTH = 10;

  const scene = new Scene(finalScene(), new color([0.1,0.2,0.3]));

  const renderer = new Renderer(SAMPLES_PER_PIXEL, MAX_DEPTH);

  const lookfrom = new point3([13,2,3]);
  const lookat = new point3([0,0,0]);
  const vup = new vec3([0,1,0]);
  const dist_to_focus = 10;
  const aperture = 0.1;
  const fov = 20;

  const image = renderer.render(new Camera(lookfrom, lookat, vup, ASPECT_RATIO, fov, aperture, dist_to_focus), scene, new Image(IMG_WIDTH, ASPECT_RATIO));

  await new FileWriter().writeFile('/Users/markpiper/sandbox/misc/raytrace/img.ppm', image);
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
    new Sphere(new point3([1,0,-1]), 0.5, RIGHT_MATERIAL),
    new Sphere(new point3([-1,0.25,-3]), 0.1, new Light(4, new color([1,1,1]))),
    new Sphere(new point3([0,3,-1.2]), 2, new Light(10, new color([0.4,0.2,1])))
  );

  return SCENE_LIST;
}

function finalScene(): HittableList {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([1, 1, 1]));
  
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
  objects.push(new Sphere(new point3([-1,5,0.1]), 1, new Light(8, new color([0.4,0.2,1]))));
  return objects;
}