import { Camera } from './camera.js';
import { HittableList, Sphere, Moveable, XYRectangle, Hittable, YZRectangle, XZRectangle, Box } from './hittable.js';
import { LambertianDiffuseMaterial, Dieletric, Metal, Light, Material, Scene } from './scene.js';
import { CheckerTexture, NoiseTexture, SolidTexture } from './textures.js';
import { SeededRandom } from './util.js';
import { vec3, vec3 as color, vec3 as point3 } from './vec3.js';
import { add, length, multiply, subtract } from './vec3gpu.js';

function normalScene(): { scene: Scene, camera: Camera } {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new SolidTexture([0.8, 0.8, 0.0]));
  const CENTRE_MATERIAL = new LambertianDiffuseMaterial(new SolidTexture([0.1, 0.2, 0.5]));
  const LEFT_MATERIAL = new Dieletric(1.5);
  const RIGHT_MATERIAL = new Metal([0.8, 0.6, 0.2], 0);

  const SCENE_LIST = new HittableList([
    new Sphere([0, -100.5, -1], 100, GROUND_MATERIAL),
    new Sphere([0,0,-1], 0.5, CENTRE_MATERIAL),
    new Sphere([-1,0,-1], 0.5, LEFT_MATERIAL),
    new Sphere([-1,0,-1], -0.4, LEFT_MATERIAL),
    new Sphere([1,0,-1], 0.5, RIGHT_MATERIAL),
    new Sphere([2,0,-1], 0.5, RIGHT_MATERIAL),
    new Sphere([3,0,-0.5], 0.25, RIGHT_MATERIAL),
    new Sphere([3,0.25,0], 0.25, RIGHT_MATERIAL),
    new Sphere([5,0.25,0], 0.5, LEFT_MATERIAL),
    // new Sphere([-1,0.25,-3], 0.1, new Light(4, [1,1,1])),
    new Sphere([0,3,-1.2], 0.5, new Light(50, [0.4,0,1]))
  ]);

  const lookfrom = [0,2,3];
  const lookat = [0,0,-1];
  const vup = [0,1,0];
  const dist_to_focus = 4;
  const aperture = 0.1;
  const fov = 40;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);

  return {
    scene: new Scene(SCENE_LIST, [0.005, 0.005, 0.005]),
    camera
  };
}

function finalScene(seed: number): { scene: Scene, camera: Camera } {
  const rand = new SeededRandom(seed);
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new CheckerTexture([0.2, 0.3, 0.1], [0.9, 0.9, 0.9]));
  
  const objects: HittableList = new HittableList();
  objects.push(new Sphere([0, -1000, 0], 1000, GROUND_MATERIAL));

  const p = [4, 0.2, 0];
  const BALLS = 11;
  for (let a = -BALLS; a < BALLS; a++) {
    for (let b = -BALLS; b < BALLS; b++) {
      const choose_mat = rand.next();
      const centre = [a + 0.9 * rand.next(), 0.2, b + 0.9 * rand.next()]

      if (length(subtract(centre, p)) > 0.9) {
        let material: Material | null;
        let movable: Moveable | undefined = undefined;
        
        if (choose_mat < 0.8) {
          const albedo: color = multiply(rand.nextVec3(), rand.nextVec3());
          material = new Metal(albedo, rand.next());
          const movedCenter = add(centre, [0, rand.next(0, 0.5), 0])
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

  objects.push(new Sphere([4,1,0], 1, new Dieletric(1.5)));
  objects.push(new Sphere([-4,1,0], 1, new LambertianDiffuseMaterial(new SolidTexture([0.4, 0.2, 0.1]))));
  objects.push(new Sphere([0,1,0], 1, new Metal([0.7, 0.6, 0.5], 0)));
  objects.push(new Sphere([0,3.5,-5], 1, new Light(10, [0.8,0.6,1])));

  const lookfrom = [13,2,3];
  const lookat = [0,0,0];
  const vup = [0,1,0];
  const dist_to_focus = 10;
  const aperture = 0.1;
  const fov = 20;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);

  return {
    scene: new Scene(objects, [0.4,0.4,0.4]),
    camera
  };
}

export function olaf() {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new SolidTexture([0.8, 0.8, 0.8]));
  
  const objects: HittableList = new HittableList();

  objects.push(new Sphere([0, -1000, -1], 1000, GROUND_MATERIAL));
  objects.push(new Sphere([-0.25, 0.25, -1], 0.5, new LambertianDiffuseMaterial(new SolidTexture([1,1,1]))));  //fee)t
  objects.push(new Sphere([0.25, 0.25, -1], 0.5, new LambertianDiffuseMaterial(new SolidTexture([1,1,1]))));  //fee)t
  objects.push(new Sphere([0, 1.25, -1], 1, new LambertianDiffuseMaterial(new SolidTexture([1,1,1]))));  //bod)y
  objects.push(new Sphere([0, 2.75, -1], 0.75, new LambertianDiffuseMaterial(new SolidTexture([1,1,1])))); //fac)e

  objects.push(new Sphere([0, 2.5, -0.25], 0.2, new Metal([1,0.6,0],1)));//nose
  objects.push(new Sphere([0, 2.4, 0.1], 0.125, new Metal([1,0.6,0], 1)));//nose
  
  objects.push(new Sphere([0, 1.4, -0.1], 0.125, new LambertianDiffuseMaterial(new SolidTexture([0,0,0]))));//butto)n
  objects.push(new Sphere([0, 1.1, -0.1], 0.125, new LambertianDiffuseMaterial(new SolidTexture([0,0,0]))));//butto)n

  objects.push(new Sphere([-0.25, 2.8, -0.3], 0.125, new LambertianDiffuseMaterial(new SolidTexture([0,0,0]))));//butto)n
  objects.push(new Sphere([0.25, 2.8, -0.3], 0.125, new LambertianDiffuseMaterial(new SolidTexture([0,0,0]))));//butto)n

  objects.push(new Sphere([-20, 20, 4], 8, new Light(5, [1,1,1])));//button
  objects.push(new Sphere([20, 20, 4], 8, new Light(5, [1,1,1])));//button

  const lookfrom = [2.5,2,2.2];
  const lookat = [0,1,-1];
  const vup = [0,1,0];
  const dist_to_focus = 4;
  const aperture = 0.1;
  const fov = 90;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);


  return {
    scene: new Scene(objects, [0.3, 0.8, 1]),
    camera
  }
}

export function two_spheres() {
  const objects = [];

  objects.push(new Sphere([0,-1000,0], 1000, new LambertianDiffuseMaterial(new NoiseTexture(1233, 4))));
  objects.push(new Sphere([0,2,0], 2, new LambertianDiffuseMaterial(new NoiseTexture(551, 4))));
  objects.push(new XYRectangle(3,5,1,3,-2, new Light(4, [1, 1, 1])));
  objects.push(new Sphere([0, 15, 3], 1, new Light(10, [1,0.8,0.7])));
  return {
    scene: new Scene(new HittableList(objects), [0,0,0]),
    camera: new Camera([26,3,6], [0,2,0], [0,1,0], 16/9, 20, 0.1, 15, 0)
  }
}

export function cornell_box() {
  const objects: Hittable[] = [];

  const red = new LambertianDiffuseMaterial(new SolidTexture([0.65, 0.05, 0.05]));
  const white = new LambertianDiffuseMaterial(new SolidTexture([0.73, 0.73, 0.73]));
  const green = new LambertianDiffuseMaterial(new SolidTexture([0.12, 0.45, 0.15]));
  const light = new Light(15, [1,1,1]);

  objects.push(new YZRectangle(0,555, 0, 555, 555, green));
  objects.push(new YZRectangle(0,555, 0, 555, 0, red));
  objects.push(new XZRectangle(213, 343, 227, 332, 554, light));
  objects.push(new XZRectangle(0,555, 0, 555, 0, white));
  objects.push(new XZRectangle(0,555, 0, 555, 555, white));
  objects.push(new XYRectangle(0,555, 0, 555, 555, white));

  // objects.push(new Box([130, 0, 65], [295, 165, 230], white));
  // objects.push(new Box([265, 0, 295], [430, 330, 460], white));

  return {
    scene: new Scene(new HittableList(objects), [0,0,0]),
    camera: new Camera([278, 278, -800], [278, 278, 0], [0,1,0], 16/9, 40, 0.1, 1000, 0)
  }
}

export function background() {
  const GROUND_MATERIAL = new LambertianDiffuseMaterial(new SolidTexture([0.8, 0.8, 0.8]));
  
  const objects: HittableList = new HittableList();

  objects.push(new Sphere([-2, 0, -1], 1, new LambertianDiffuseMaterial(new SolidTexture([0,0,1]))))
  objects.push(new Sphere([2, 0, -1], 1, new LambertianDiffuseMaterial(new SolidTexture([1,0,0]))))

  const lookfrom = [2,3,2.2];
  const lookat = [0,1,-1];
  const vup = [0,1,0];
  const dist_to_focus = 4;
  const aperture = 0.1;
  const fov = 90;
  const camera = new Camera(lookfrom, lookat, vup, 16 / 9, fov, aperture, dist_to_focus, 0);


  return {
    scene: new Scene(objects, [0.3, 0.8, 1]),
    camera
  }
}

export const scene = cornell_box();