import { Camera } from './camera.js';
import { HittableList, Sphere, Moveable } from './hittable.js';
import { LambertianDiffuseMaterial, Dieletric, Metal, Light, Material, Scene } from './scene.js';
import { SeededRandom } from './util.js';
import { vec3, vec3 as color, vec3 as point3 } from './vec3.js';

function normalScene(seed: number): { scene: Scene, camera: Camera } {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([0.8, 0.8, 0.0]));
  const CENTRE_MATERIAL = new LambertianDiffuseMaterial(new color([0.1, 0.2, 0.5]));
  const LEFT_MATERIAL = new Dieletric(1.5);
  const RIGHT_MATERIAL = new Metal(new color([0.8, 0.6, 0.2]), 0);

  const SCENE_LIST = new HittableList([
    new Sphere(new point3([0, -100.5, -1]), 100, GROUND_MATERIAL),
    new Sphere(new point3([0,0,-1]), 0.5, CENTRE_MATERIAL),
    new Sphere(new point3([-1,0,-1]), 0.5, LEFT_MATERIAL),
    new Sphere(new point3([-1,0,-1]), -0.4, LEFT_MATERIAL),
    new Sphere(new point3([1,0,-1]), 0.5, RIGHT_MATERIAL),
    new Sphere(new point3([2,0,-1]), 0.5, RIGHT_MATERIAL),
    new Sphere(new point3([3,0,-0.5]), 0.25, RIGHT_MATERIAL),
    new Sphere(new point3([3,0.25,0]), 0.25, RIGHT_MATERIAL),
    new Sphere(new point3([5,0.25,0]), 0.5, LEFT_MATERIAL),
    new Sphere(new point3([-1,0.25,-3]), 0.1, new Light(4, new color([1,1,1]))),
    new Sphere(new point3([0,3,-1.2]), 2, new Light(10, new color([0.4,0.2,1])))
  ]);

  const lookfrom = new point3([13,2,3]);
  const lookat = new point3([0,0,0]);
  const vup = new vec3([0,1,0]);
  const dist_to_focus = 10;
  const aperture = 0.1;
  const fov = 20;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);

  return {
    scene: new Scene(SCENE_LIST, new color([0.6,0.7,1])),
    camera
  };
}

function finalScene(seed: number): { scene: Scene, camera: Camera } {
  const rand = new SeededRandom(seed);
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new color([1, 1, 1]));
  
  const objects: HittableList = new HittableList();
  objects.push(new Sphere(new point3([0, -1000, 0]), 1000, GROUND_MATERIAL));

  const p = new point3([4, 0.2, 0]);
  const BALLS = 11;
  for (let a = -BALLS; a < BALLS; a++) {
    for (let b = -BALLS; b < BALLS; b++) {
      const choose_mat = rand.next();
      const centre = new point3([a + 0.9 * rand.next(), 0.2, b + 0.9 * rand.next()])

      if (centre.subtract(p).length() > 0.9) {
        let material: Material | null;
        let movable: Moveable | undefined = undefined;
        
        if (choose_mat < 0.8) {
          const albedo: color = rand.nextVec3().multiply(rand.nextVec3());
          material = new Metal(albedo, rand.next());
          const movedCenter = centre.add(new vec3([0, rand.next(0, 0.5), 0]))
          movable = {
            cen1: movedCenter,
            time1: 1
          }
        } else if (choose_mat < 0.95) {
          const albedo = rand.nextVec3(0.5, 1);
          const fuzz = rand.next(0, 0.5);
          material = new Metal(albedo, fuzz);
        } else {
          material = new Dieletric(1.5);
        }
        objects.push(new Sphere(centre, 0.2, material!, movable));
      }
    }
  }

  objects.push(new Sphere(new point3([0,1,0]), 1, new Dieletric(1.5)));
  objects.push(new Sphere(new point3([-4,1,0]), 1, new LambertianDiffuseMaterial(new color([0.4, 0.2, 0.1]))));
  objects.push(new Sphere(new point3([4,1,0]), 1, new Metal(new color([0.7, 0.6, 0.5]), 0)));
  objects.push(new Sphere(new point3([-1,5,0.1]), 1, new Light(8, new color([0.4,0.2,1]))));

  const lookfrom = new point3([13,2,3]);
  const lookat = new point3([0,0,0]);
  const vup = new vec3([0,1,0]);
  const dist_to_focus = 10;
  const aperture = 0.1;
  const fov = 20;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);

  return {
    scene: new Scene(objects, new color([0.6,0.7,1])),
    camera
  };
}

export const scene = finalScene(12345);