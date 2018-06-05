import {
  loadBinaryFile,
  loadImageAsCanvas
} from "./utils";

import WebGLRenderer from "./renderer/";

import Quad from "./renderer/objects/quad";
import Cube from "./renderer/objects/cube";
import Plane from "./renderer/objects/plane";
import Water from "./renderer/objects/water";
import Terrain from "./renderer/objects/terrain";
import FreeCamera from "./renderer/cameras/free";

/**
 * A main stage
 * @class Stage
 */
class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer(this);
    this.renderer.resize();
    window.renderer = this.renderer;
    window.gl = renderer.gl;
    window.camera = renderer.createCamera(FreeCamera);
    renderer.camera = camera;
    camera.position = new Float32Array([15.0, -20.0, 40.0]);
    camera.rotation = new Float32Array([0.5, 0.3, 0.0]);
    window.objects = renderer.objects;
    /*{
      renderer.createColladaFile().fromPath("fennekin2.dae").then(object => {
        let texture1 = renderer.createTexture().fromImagePath("fennekin_body.png");
        object.useTexture(texture1);
        object.translate.x = -10;
        object.translate.y = -20;
        object.scale.set(14, 14, 14);
        objects.push(object);
      });
    }*/
    {
      renderer.createObjectFile().fromPath("abra.obj").then(base => {
        let texture1 = renderer.createTexture().fromImagePath("abra.png");
        base.useTexture(texture1);
        for (let ii = 0; ii < 10; ++ii) {
          let obj = renderer.createObject(Cube, { inherit: base });
          obj.translate.set(100, 0, 150);
          obj.rotate.x = 180;
          obj.scale.set(4);
          obj.specularLighting = true;
          window.abra = obj;
          objects.push(obj);
          setTimeout(() => {
            obj.translate.y = terrain.getHeightAt(
              obj.translate.x, obj.translate.y, obj.translate.z
            );
          });
        };
      });
    }
    // collada file test
    /*{
      renderer.createColladaFile().fromPath("model_blender278.dae").then(object => {
        let texture = renderer.createTexture().fromImagePath("diffuse.png");
        object.useTexture(texture);
        object.translate.y = -10;
        cubes.push(object);
        window.men = object;
      });
    }*/
    /*{
      renderer.createAnimatedColladaFile().fromPath("model_blender278.dae").then(object => {
        let texture = renderer.createTexture().fromImagePath("diffuse.png");
        object.useTexture(texture);
        object.translate.y = -15;
        object.translate.z = 35;
        cubes.push(object);
        window.men = object;
        console.log(object);
      });
    }*/
    /*let sprites = ["fox-1", "fox-2"];
    sprites.map((path, index) => {
      sprites[index] = renderer.createTexture({ pixelated: true }).fromImagePath(path + ".png");
    });
    {
      let sprite = renderer.createSprite();
      sprite.scale.set(6, 6, 6);
      sprite.translate.y = -5.5;
      sprite.useTexture(sprites[0]);
      objects.push(sprite);
      window.sprite = sprite;
    }
    let idx = 0;
    setInterval(() => {
      let index = (idx++) % (sprites.length);
      sprite.useTexture(sprites[index]);
    }, 250);
    {
      let sprite = renderer.createSprite();
      let texture = renderer.createTexture({ pixelated: true }).fromImagePath("Redish Tree.png");
      sprite.useTexture(texture);
      sprite.scale.set(10, 10, 10);
      sprite.translate.x = 10;
      sprite.translate.y = -11;
      objects.push(sprite);
    }*/
    // water
    {
      let water = renderer.createObject(Water);
      let size = water.boundings.local.center;
      water.scale.set(1024);
      water.translate.set(-size[0], size[1], -size[2]);
      water.useColor([0, 0, 255]);
      water.translate.y = 50;
      water.rotate.x = 90;
      water.useDUDVTexture(renderer.createTexture().fromImagePath("dudv.png"));
      water.useNormalMap(renderer.createTexture().fromImagePath("water-normal.png"));
      window.water = water;
    }
    // terrain
    {
      let obj = renderer.createObject(Terrain);
      obj.useColor([255, 191, 111]);
      obj.scale.set(1);
      let size = obj.boundings.world.size;
      obj.translate.set(-1000, 0, -1000);
      obj.useTexture(renderer.createTexture().fromImagePath("md5/pokepark/map1/Fd_nh_tuchi01.png"));
      /*obj.useNormalMap(renderer.createTexture().fromImagePath("mossy-ground1-normal.png"));
      obj.useMetalnessMap(renderer.createTexture().fromImagePath("mossy-ground1-metal.png"));
      obj.useRoughnessMap(renderer.createTexture().fromImagePath("mossy-ground1-roughness.png"));
      obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("mossy-ground1-ao.png"));
      obj.useSpecularMap(renderer.createTexture().fromImagePath("mossy-ground1-specular.png"));*/
      //obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("terrain-1-ao.png"));
      window.terrain = obj;
    }
    // test blender object
    /*{
      renderer.createObjectFile().fromPath("palm.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromColor([255, 247, 191]));
        obj.translate.set(0, -10, 0);
        obj.scale.set(1, 1, 1);
        cubes.push(obj);
      });
    }*/
    /*{
      let cube = renderer.createObject(Cube);
      window.specialCube = cube;
      specialCube.translate.y = -15;
      let texture = renderer.createFrameBuffer({ width: 512, height: 512 });
      specialCube.useTexture(texture);
      specialCube.scale.set(3,3,3);
    }*/
    // intersection test
    /*{
      renderer.createObjectFile().fromPath("sphere.obj").then(sphere => {
        let texture = renderer.createTexture().fromColor([251, 195, 172]);
        let a = renderer.createObject(Cube);
        a.useTexture(texture);
        a.scale.set(7.25, 1.5, 1.5);
        a.translate.set(12, -8, 0);
        cubes.push(a);
        let b = renderer.createObject(Cube);
        b.useTexture(texture);
        b.translate.set(4,-6,0);
        b.scale.set(2, 2, 2);
        cubes.push(b);
        sphere.useTexture(renderer.createTexture().fromColor([251, 195, 172]));
        sphere.translate.y = -28;
        sphere.scale.set(4, 4, 4);
        cubes.push(sphere);
      });
      renderer.createObjectFile().fromPath("box4.obj").then(box => {
        box.useTexture(renderer.createTexture().fromColor([255, 0, 0]));
        box.scale.set(1, 1, 1);
        box.translate.set(-4, -6, 0);
        cubes.push(box);
      });
    }*/
    // cube with shadow
    /*{
      renderer.createObjectFile().fromPath("sphere1.obj").then(obj => {
        obj.useColor([255, 255, 255]);
        obj.translate.set(-30, -80, 10);
        obj.scale.set(18);
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.meow = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("sci-fi-helmet.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-helmet-diffuse.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-helmet-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-helmet-metalness.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-helmet-roughness.jpg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-helmet-ao.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-helmet-emissive.jpg"));
        obj.translate.set(60, -80, 0);
        obj.scale.set(8);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.helmet = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("helmet.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("helmet-diffuse.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("helmet-normal.png"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("helmet-metalness.png"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("helmet-roughness.png"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("helmet-ao.png"));
        obj.translate.set(100, -80, 0);
        obj.scale.set(8);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
      });
    }*/
    {
      renderer.createObjectFile().fromPath("alien.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("alien-diffuse.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("alien-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("alien-metalness.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("alien-roughness.jpg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("alien-ao.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("alien-emissive.jpg"));
        obj.translate.set(0, -80, 0);
        obj.scale.set(16);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          //obj.environmentMapping = true;
        }, 1e3);
        window.alien = obj;
      });
    }
    /*setTimeout(() => {
      renderer.createObjectFile().fromPath("tree_stem.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("tree_stem.jpg"));
        let baseStem = obj;
        renderer.createObjectFile().fromPath("tree_leaves.obj").then(obj => {
          obj.useTexture(renderer.createTexture().fromImagePath("tree_leaves.png"));
          let baseLeaves = obj;
          for (let ii = 0; ii < 0; ++ii) {
            let x = Math.random() * 1e3;
            let z = Math.random() * 1e3;
            let y = terrain.getHeightAt(x, z) + 25.0;
            {
              let stem = renderer.createObject(Cube, { inherit: baseStem });
              stem.translate.set(x, y, z);
              stem.rotate.x = 180;
              stem.scale.set(16);
              objects.push(stem);
            }
            {
              let leaves = renderer.createObject(Cube, { inherit: baseLeaves });
              leaves.translate.set(x + 10, y - 24, z);
              leaves.rotate.set(180, 420, 0);
              leaves.scale.set(16);
              leaves.specularLighting = true;
              leaves.culling = false;
              objects.push(leaves);
            }
          };
        });
      });
    }, 1e3);*/
    /*{
      renderer.createMD5File().fromPath("md5/ROKON_fourleg.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(200, -30, 100);
        obj.scale.set(32);
        obj.rotate.x = 90;
        obj.rotate.z = 90;
        obj.specularLighting = true;
        obj.useAnimation("md5/anim/fourleg_anim_run.md5anim");
        objects.push(obj);
        window.pkmn = obj;
      });
    }*/
    {
      for (let ii = 0; ii < 0; ++ii) {
        let x = Math.random() * 1e3;
        let z = Math.random() * 1e3;
        let y = terrain.getHeightAt(x, terrain.y, z) + 20.0;
        renderer.createMD5File().fromPath("md5/pokepark/Ar99Zn01Bigtree01.md5mesh").then(obj => {
          obj.useColor([255, 0, 0]);
          obj.translate.set(x, y, z);
          obj.scale.set(1.5);
          obj.rotate.x = 90;
          obj.rotate.z = 180;
          objects.push(obj);
        });
      };
    }
    {
      renderer.createMD5File().fromPath("md5/pokepark/Riolu.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(20, -50, 150);
        obj.scale.set(6);
        obj.rotate.x = 90;
        obj.rotate.z = 180;
        obj.specularLighting = true;
        obj.addAnimation("md5/pokepark/RandomAct4.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Win2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.useAnimation("RandomAct4");
        setTimeout(() => {
          let bounds = obj.boundings.world;
          obj.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[1], bounds.center[2]) - 2.5;
        }, 1e3);
        objects.push(obj);
        window.riolu = obj;
      });
    }
    {
      renderer.createMD5File().fromPath("md5/pokepark/Rokon.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(100, -50, 100);
        obj.scale.set(6);
        obj.rotate.x = 90;
        obj.rotate.z = 180;
        obj.specularLighting = true;
        obj.addAnimation("md5/pokepark/RandomAct1.md5anim", {
          playbackSpeed: 0.25
        });
        obj.addAnimation("md5/pokepark/RandomAct2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/RandomAct3.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/At001Dmg.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/StandUp.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Wait.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Walk.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Walk2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/At001Run.md5anim", {
          playbackSpeed: 0.5,
          smoothTransitions: ["AtJump01"]
        });
        obj.addAnimation("md5/pokepark/AtJump01.md5anim", {
          playbackSpeed: 0.5,
          smoothTransitions: ["At001Run"]
        });
        obj.useAnimation("At001Run", {
          onend: () =>{
            console.log("ended!");
          }
        });
        objects.push(obj);
        window.pkmn = obj;
      });
    }
    /*{
      renderer.createObjectFile().fromPath("sci-fi-rifle.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-rifle-albedo.jpeg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-rifle-normal.jpeg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-rifle-metallic.jpeg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-rifle-roughness.jpeg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-rifle-ao.jpeg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-rifle-emissive.jpeg"));
        obj.translate.set(35, -80, 0);
        obj.scale.set(16);
        obj.rotate.x = 180;
        obj.rotate.y = 75;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.rifle = obj;
      });
    }
    {
      renderer.createObjectFile().fromPath("sci-fi-barrel.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-barrel-albedo.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-barrel-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-barrel-metallic.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-barrel-roughness.jpg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-barrel-ao.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-barrel-emissive.jpg"));
        obj.translate.set(-50, -80, 0);
        obj.scale.set(12);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.barrel = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("rose-stone.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("rose-stone-albedo.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("rose-stone-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("rose-stone-metallic.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("rose-stone-roughness.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("rose-stone-emissive.jpg"));
        obj.translate.set(100, -80, 0);
        obj.scale.set(10);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.stone = obj;
      });
    }*/
    // cube with shadow
    /*{
      renderer.createObjectFile().fromPath("sphere1.obj").then(base => {
        base.useColor([255, 255, 255]);
        //base.useTexture(renderer.createTexture().fromImagePath("gold-diffuse.jpg"));
        //base.useNormalMap(renderer.createTexture().fromImagePath("gold-normal.jpg"));
        for (let ii = 0; ii < 15; ++ii) {
          let obj = renderer.createObject(Cube, { inherit: base });
          obj.translate.set(
            Math.random() * 300,
            Math.random() * -100 - 50,
            Math.random() * 300
          );
          obj.scale.set(24);
          obj.specularLighting = true;
          objects.push(obj);
          setTimeout(() => {
            obj.environmentMapping = true;
          }, 1e3);
        };
      });
    }*/
    // sun
    {
      renderer.createObjectFile().fromPath("sphere.obj").then(obj => {
        let radius = 350.0;
        obj.useColor([0, 0, 0, 0]);
        obj.translate.set(0, -75, 100);
        obj.scale.set(1);
        obj.light = renderer.createLight({
          radius: radius,
          color: [255, 255, 255],
          intensity: 8
        });
        objects.push(obj);
        window.light = obj;
      });
    }
    {
      renderer.createObjectFile().fromPath("sphere.obj").then(base => {
        let radius = 250.0;
        for (let ii = 0; ii < 0; ++ii) {
          let obj = renderer.createObject(Cube, { inherit: base });
          obj.useColor([0, 0, 0, 0]);
          obj.translate.set(
            Math.random() * 250 - 100,
            Math.random() * 10 - 75,
            Math.random() * 250 - 100
          );
          obj.light = renderer.createLight({
            radius: radius,
            color: [255, 255, 255],
            intensity: 8
          });
          objects.push(obj);
        };
      });
    }
    /*{
      renderer.createObjectFile().fromPath("barrel.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("barrel.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("barrel-normal.png"));
        //obj.occlusionCulling = true;
        obj.translate.set(35, -30, 10);
        obj.scale.set(1, 1, 1);
        window.barrel = obj;
        objects.push(obj);
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("book.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("book_tex.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("book_normal.png"));
        //obj.useSpecularMap(renderer.createTexture().fromImagePath("book_spec.png"));
        obj.translate.set(0, -20, 60);
        obj.scale.set(128.0);
        obj.rotate.x = 90;
        obj.rotate.y = 180;
        obj.rotate.z = 180;
        window.nanosuit = obj;
        objects.push(obj);
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("vaporeon.obj").then(box => {
        box.useTexture(renderer.createTexture().fromColor([0, 0, 255]));
        box.scale.set(1, 1, 1);
        box.translate.set(25, -9, 32);
        cubes.push(box);
      });
    }*/
    // test batch
    /*{
      let batch = renderer.createBatch({ size: 150 });
      {
        let baseTexture = renderer.createTexture().fromImagePath("tree-nofabe.png");
        renderer.createColladaFile().fromPath("tree-nofabe.dae").then(pkmn => {
          for (let ii = 0; ii < batch.size; ++ii) {
            let cube = renderer.createObject(Cube, { inherit: pkmn });
            cube.useTexture(baseTexture);
            cube.translate.set(
              (Math.random() * 350) - 100,
              -10,
              (Math.random() * 350) - 100
            );
            cube.scale.set(1.0 + (Math.random() * 0.5));
            cube.rotate.x = 90;
            cube.rotate.z = Math.random() * 360;
            objects.push(cube);
            batch.add(cube);
          };
          window.batch = batch;
        });
      }
    }*/
    // skybox
    {
      let obj = renderer.createObject(Cube);
      let cubemap = renderer.createCubeMap().fromImages(
        "skybox-anime2/",
        ["left", "right", "bottom", "top", "back", "front"]
      );
      obj.useEnvironmentMap(cubemap);
      obj.environmentMapping = true;
      window.skyBox = obj;
    }
    /*{
      let batch = renderer.createBatch({ size: 20 });
      {
        renderer.createObjectFile().fromPath("barrel.obj").then(base1 => {
        batch.useTemplate(base1);
        base1.useTexture(renderer.createTexture().fromImagePath("barrel.png"));
        base1.useNormalMap(renderer.createTexture().fromImagePath("barrel-normal.png"));
          for (let ii = 0; ii < batch.size; ++ii) {
            let x = (Math.random() * 450) - 100;
            let y = -20;
            let z = (Math.random() * 450) - 100;
            {
              let cube = renderer.createObject(Cube, { inherit: base1 });
              cube.translate.set(x, y, z);
              cube.scale.set((Math.random() * 0.25) + 1.0);
              objects.push(cube);
              batch.add(cube);
            }
          };
          window.batch = batch;
        });
      }
    }*/
    {
      /*renderer.createObjectFile().fromPath("sphere8.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("rock-diffuse.jpg"));
        obj.translate.set(-30, -80, 10);
        obj.scale.set(36);
        obj.specularLighting = true;
        objects.push(obj);
        window.meow = obj;
      });*/
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.filter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.sceneFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.occlusionFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: 384,
        height: 384
      });
      window.godRayFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 2,
        height: renderer.height / 2
      });
      window.blurFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 4,
        height: renderer.height / 4
      });
      window.blurFilter2 = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 8,
        height: renderer.height / 8
      });
      window.blurFilter3 = filter;
    }
    /*{
      renderer.createColladaFile().fromPath("StanfordDragon.dae").then(object => {
        object.useTexture(renderer.createTexture().fromColor([128, 128, 128]));
        object.translate.x = -20;
        object.translate.y = -20;
        object.scale.set(2);
        objects.push(object);
      });
    }*/
    /*{
      renderer.createColladaFile().fromPath("3d-tree-stem.dae").then(stem => {
        stem.useTexture(renderer.createTexture().fromImagePath("3d-tree-stem.jpg"));
        stem.translate.x = -20;
        stem.translate.y = -30;
        stem.scale.set(12);
        objects.push(stem);
      });
    }
    {
      renderer.createColladaFile().fromPath("3d-tree-leafs.dae").then(object => {
        let texture1 = renderer.createTexture().fromImagePath("3d-tree-leafs.png");
        object.useTexture(texture1);
        object.translate.x = -20;
        object.translate.y = -30;
        object.scale.set(12);
        objects.push(object);
      });
    }*/
    requestAnimationFrame(drawLoop);
  }
};

function applyBlur(input, attachement) {
  blurFilter.enable();
  blurFilter.readFrameBuffer(input.texture, attachement);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter.applyFilter();
    }
    blurFilter.reuse();
    // apply v-blur
    {
      let program = blurFilter.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter.applyFilter();
    }
  }
  blurFilter2.enable();
  blurFilter.writeToFilter(blurFilter2);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter2.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter2.applyFilter();
    }
    blurFilter2.reuse();
    // apply v-blur
    {
      let program = blurFilter2.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter2.applyFilter();
    }
  }
  blurFilter3.enable();
  blurFilter2.writeToFilter(blurFilter3);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter3.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter3.applyFilter();
    }
    blurFilter3.reuse();
    // apply v-blur
    {
      let program = blurFilter3.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter3.applyFilter();
    }
  }
  return blurFilter3;
};

let last = 0;
let delta = 0;
function draw() {
  let now = performance.now();
  let gBuffer = renderer.gBuffer;
  renderer.useCamera(camera);
  renderer.useFrameBuffer(renderer.screen.texture);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  // draw scene
  drawScene();
  drawDirectionalLight();
  drawPointLights();
  drawSkyBox();
  {
    debug_draw_calls.innerHTML = `Draw calls: ${renderer.drawCalls}`;
    debug_fbo_switches.innerHTML = `FBO switches: ${renderer.fboSwitches}`;
    debug_texture_switches.innerHTML = `Texture switches: ${renderer.textureSwitches}`;
    debug_program_switches.innerHTML = `Program switches: ${renderer.programSwitches}`;
    debug_total_vertices.innerHTML = `Total vertices: ${renderer.totalVertices}`;
    // debug modes
    {
      let dbg = renderer.debug;
      let yes = `Enabled`;
      let no = `Disabled`;
      debug_wireframe.innerHTML = `[F1] Wireframe: ${dbg.wireframe ? yes : no}`;
      debug_boundings.innerHTML = `[F2] Boundings: ${dbg.boundings ? yes : no}`;
      debug_FXAA.innerHTML = `[F3] FXAA: ${dbg.FXAA ? yes : no}`;
      debug_normals.innerHTML = `[F4] Normals: ${dbg.normals ? yes : no}`;
    }
    {
      let total = 0;
      objects.map(obj => {
        if (obj.isOccluded()) total++;
      });
      debug_occlusion_culled.innerHTML = `Occlusion culled objects: ${total}`;
    }
  }
  delta = now - last;
  // bloom
  if (window.rofl) {
    filter.enable(true);
    filter.readFrameBuffer(gBuffer, gl.COLOR_ATTACHMENT4);
    let blur = applyBlur(filter.input, gl.COLOR_ATTACHMENT0);
    renderer.useFrameBuffer(renderer.screen.texture);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    blur.flush();
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
  }
  // fxaa
  if (renderer.debug.FXAA) {
    filter.enable(true);
    filter.readFrameBuffer(renderer.screen.texture, gl.COLOR_ATTACHMENT0);
    filter.useProgram("FXAA");
    renderer.useFrameBuffer(renderer.screen.texture);
    filter.apply();
    filter.writeToFrameBuffer(null, gl.COLOR_ATTACHMENT0);
  } else {
    renderer.screen.texture.writeToScreen();
  }
  renderer.flush();
  renderer.nextFrame(delta);
  last = performance.now();
};

function drawSkyBox() {
  if (window.skyBox) {
    renderer.useRendererProgram("skybox");
    gl.cullFace(gl.FRONT);
    gl.depthMask(false);
    renderer.renderSkybox(skyBox);
    gl.cullFace(gl.BACK);
    gl.depthMask(true);
  }
};

function drawPointLights() {
  let gBuffer = renderer.gBuffer;
  // write depth into screen fbo
  gBuffer.writeToFrameBuffer(renderer.screen.texture, null, gl.DEPTH_BUFFER_BIT);
  renderer.useFrameBuffer(renderer.screen.texture);
  // lighting
  {
    let program = renderer.useRendererProgram("deferred/object-point-light");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.cullFace(gl.FRONT);
    gl.depthFunc(gl.GEQUAL);
    gl.depthMask(false);

    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.NOTEQUAL, 255, ~0);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    gBuffer.bind();
    objects.map(object => {
      if (!object.light) return;
      let light = object.light;
      let mModel = object.getModelMatrix();
      object.scale.set(light.radius);
      object.update();
      {
        let buffers = object.buffers;
        let variables = program.locations;
        let vLightPosition = object.translate.toArray();
        let vCameraPosition = camera.position;
        let mModelViewProjection = object.getModelViewProjectionMatrix();
        // how to pull vertices
        {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
          gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(variables.aVertexPosition);
        }
        gl.uniform3fv(variables.uLightColor, light.color);
        gl.uniform1f(variables.uLightRadius, light.radius);
        gl.uniform1f(variables.uLightIntensity, light.intensity);
        gl.uniform3fv(variables.uLightPosition, vLightPosition);
        gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
        gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        renderer.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      object.scale.set(light.radius * 0.075);
      object.update();
    });
  }
  // reset
  {
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
};

function drawDirectionalLight() {
  let gBuffer = renderer.gBuffer;
  renderer.useFrameBuffer(renderer.screen.texture);
  {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthMask(false);
  }
  // lighting
  {
    let program = renderer.useRendererProgram("deferred/directional-light");
    {
      let variables = program.locations;
      gl.uniform1f(variables.uLightIntensity, 0.25);
      gl.uniform3fv(variables.uLightPosition, new Float32Array([0, -100, 1000]));
      gl.uniform3fv(variables.uLightColor, new Float32Array([255, 255, 255]));
      gl.uniform3fv(variables.uCameraPosition, (camera.position));
    }
    gBuffer.bind();
    renderer.renderQuad(renderer.screen);
  }
  // reset
  {
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
  }
};

window.drawScene = function() {
  let gl = renderer.gl;
  let gBuffer = renderer.gBuffer;
  renderer.useFrameBuffer(gBuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  {
    water.bufferReflection(drawWorld);
    water.bufferRefraction(drawWorld);
    terrain.bufferShadows(drawWorld);
  }
  drawWorld(true, null, false);
  gBuffer.writeToFrameBuffer(renderer.screen.texture, null, gl.DEPTH_BUFFER_BIT);
};

function drawWorld(renderWater, shadowMatrix, renderRefraction, forward = false) {
  if (forward && !renderRefraction) drawSkyBox();
  // terrain
  if (terrain) {
    let program = (
      forward ? renderer.useRendererProgram("object") :
      renderer.useRendererProgram("deferred/object")
    );
    let variables = program.locations;
    terrain.update();
    renderer.renderObject(terrain);
  }
  // water
  if (renderWater) {
    renderer.useRendererProgram("deferred/water");
    renderer.renderPlane(water);
  }
  // objects
  renderObjects(renderRefraction, forward);
};

function postProcessing() {
  filter.enable();
  filter.readFrameBuffer(null, gl.COLOR_ATTACHMENT1);
  let blur = applyBlur(filter.input, gl.COLOR_ATTACHMENT0);
  return blur;
};

function renderObjects(renderRefraction, forward) {
  let program = (
    forward ? renderer.useRendererProgram("object") :
    renderer.useRendererProgram("deferred/object")
  );
  objects.map(obj => {
    if (obj.isInstanced || !camera.isObjectInView(obj)) return;
    if (obj.model) renderer.renderMD5(obj);
    else renderer.renderObject(obj);
  });
};

function controlCamera() {
  camera.control(
    camera.delta,
    [
      isKeyPressed("W") | 0,
      isKeyPressed("S") | 0,
      isKeyPressed("A") | 0,
      isKeyPressed("D") | 0,
      isKeyPressed("2") | 0,
      isKeyPressed("1") | 0,
      isKeyPressed("Q") | 0,
      isKeyPressed("E") | 0
    ],
    deltaX, deltaY
  );
};

function drawLoop() {
  let now = performance.now();
  if (renderer.ready) {
    // camera view matrix
    {
      if (locked) {
        controlCamera();
        deltaX *= 0.375;
        deltaY *= 0.375;
      }
      //selectObject(mx, my);
    }
    draw();
  }
  /*if (locked) {
    // test sprite key movement
    let target = pkmn;
    let dir = camera.getWorldRelativePosition(renderer.width / 2, renderer.height / 2);
    let speed = 1.5;
    let translate = target.translate.toArray();
    if (isKeyPressed("ArrowUp")) {
      let n = vec3.add(vec3.create(), translate, vec3.scale(dir, dir, speed));
      target.translate.setArray(n);
    }
    if (isKeyPressed("ArrowDown")) {
      let n = vec3.add(vec3.create(), translate, vec3.scale(dir, dir, -speed));
      target.translate.setArray(n);
    }
    if (isKeyPressed("ArrowLeft")) {
      target.translate.x -= Math.sign(camera.rotation[1]);
    }
    if (isKeyPressed("ArrowRight")) {
      target.translate.x += Math.sign(camera.rotation[1]);
    }
    let bounds = target.boundings.world;
    target.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[2]) - 1.5;
  }*/
  let then = performance.now();
  let delta = then - now;
  if (renderer.ready) animate(delta);
  {
    debug_delta.innerHTML = `Delta: ${delta}`;
  }
  if (locked) {
    let target = pkmn;
    if (!target.speed) target.speed = { x: 0.0, y: 0.0 };
    let bounds = target.boundings.world;
    let max = 1.0;
    let speed = target.speed;
    let isAnyKeyPressed = (
      isKeyPressed("ArrowUp") ||
      isKeyPressed("ArrowDown") ||
      isKeyPressed("ArrowLeft") ||
      isKeyPressed("ArrowRight")
    );
    if (isKeyPressed("ArrowUp")) {
      speed.y = 0.375;
    }
    else if (isKeyPressed("ArrowDown")) {
      speed.y = -0.225;
    }
    else {
      speed.y *= 0.5;
      if (Math.abs(speed.y) <= 0.01) speed.y = 0.0;
    }
    if (isKeyPressed("ArrowLeft")) {
      speed.x = 2.0;
      speed.y = 0.35 * Math.max(1.0, Math.sign(speed.y));
    }
    else if (isKeyPressed("ArrowRight")) {
      speed.x = -2.0;
      speed.y = 0.35 * Math.max(1.0, Math.sign(speed.y));
    }
    else {
      speed.x *= 0.5;
      if (Math.abs(speed.x) <= 0.01) speed.x = 0.0;
    }
    let distanceX = speed.x * delta;
    let distanceY = speed.y * delta;
    let walkDir = Math.sign(speed.y);
    target.rotate.z += distanceX * 0.65;
    let dx = distanceY * Math.sin(target.rotate.z * Math.PI / 180);
    let dz = distanceY * Math.cos(target.rotate.z * Math.PI / 180);
    if (isAnyKeyPressed) {
      if (!target.isAnimationAlreadyQueded("Walk2")) {
        let anim = target.useAnimation("Walk2");
        if (
          isKeyPressed("ArrowLeft") ||
          isKeyPressed("ArrowRight")
        ) anim.playbackSpeed = 1.75;
        else if (
          isKeyPressed("ArrowDown")
        ) anim.playbackSpeed = 0.55;
        else anim.playbackSpeed = 1.575;
      }
    } else {
      if (!target.isAnimationAlreadyQueded("Wait")) {
        target.useAnimation("Wait");
      }
    }
    target.translate.x += dz;
    target.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[1], bounds.center[2]) - 2.5;
    target.translate.z += dx;
  }
  requestAnimationFrame(drawLoop);
  //camera.lookAt(cubes[1]);
};

function animate(delta) {
  objects.map(obj => {
    let anim = obj.currentAnimation;
    if (anim && anim.loaded) obj.animate(1e1 / 10);
  });
};

setInterval(() => {
  if (window.batch) {
    debug_objects.innerHTML = `Objects: ${objects.length - batch.data.objects.length}`;
    debug_instanced_objects.innerHTML = `Instanced Objects: ${batch.size}/${batch.data.objects.length}`;
    debug_batch_updates.innerHTML = `Batch buffer refills: ${batch.updates}`;
  }
}, 250);

window.keys = {};
let isKeyPressed = (key) => keys[key] || keys[key.toLowerCase()] || keys[key.toUpperCase()];
window.onkeydown = (e) => onKeyDown(e);
window.onkeyup = (e) => onKeyUp(e);

let up = 0;
function onKeyDown(e) {
  keys[e.key] = 1;
  if (e.key === "F1") {
    e.preventDefault();
    renderer.debug.wireframe = !renderer.debug.wireframe;
  }
  if (e.key === "F2") {
    e.preventDefault();
    renderer.debug.boundings = !renderer.debug.boundings;
  }
  if (e.key === "F3") {
    e.preventDefault();
    renderer.debug.FXAA = !renderer.debug.FXAA;
  }
  if (e.key === "F4") {
    e.preventDefault();
    renderer.debug.normals = !renderer.debug.normals;
  }
  if (e.key === "Tab") {
    e.preventDefault();
    camera.moveTo(objects[(up++) % (objects.length - 1)]);
  }
};

function onKeyUp(e) {
  keys[e.key] = 0;
};

let mx = 0;
let my = 0;
let deltaX = 0;
let deltaY = 0;
window.onmousemove = (e) => {
  if (locked) {
    mx = my = 0;
    deltaX = e.movementX * 0.75;
    deltaY = e.movementY * 0.75;
    /*if (pressed && selection) {
      let ray = camera.handleMouseDown(
        renderer.width / 2,
        renderer.height / 2
      );
      let x = ray[0];
      let y = ray[1];
      let z = ray[2];
      if (isKeyPressed("Control")) {
        selection.translate.z += deltaY * ray[1];
      }
      else {
        selection.translate.x += deltaX * ray[2];
        selection.translate.y += deltaY;
      }
      //selection.translate.y += y;
      //selection.translate.z += z;
    }*/
  } else {
    mx = e.clientX;
    my = e.clientY;
  }
};

function selectObject(x, y) {
  let ray = camera.getWorldRelativePosition(x, y);
  let hit = camera.getRayHit(ray);
  objects.map(obj => obj.alpha = 1.0);
  if (hit) hit.alpha = 0.25;
  /*{
    let sprite = renderer.createSprite();
    let texture = renderer.createTexture({ pixelated: true }).fromImagePath("pichu.png");
    sprite.useTexture(texture);
    sprite.scale.set(6, 6, 6);
    sprite.translate.set(
      camera.position[0],
      camera.position[1],
      camera.position[2]
    );
    sprite.velocity = {
      x: ray[0],
      y: ray[1],
      z: ray[2]
    };
    objects.push(sprite);
  }*/
};

let locked = false;
let pressed = false;
let selection = null;
canvas.onclick = (e) => {
/*
  let mouseRay = renderer.camera.getWorldRelativePosition(e.clientX, e.clientY);
  let start = 0;
  let end = 100;
  findObject(start, end, mouseRay, 0);
*/
  //camera.handleMouseDown(e);
  //let ray = renderer.camera.getWorldRelativePosition(e.clientX, e.clientY);
  canvas.requestPointerLock();
};
window.onmousedown = (e) => pressed = true;
window.onmouseup = (e) => pressed = false;
/*
function getPointOnRay(ray, distance) {
  let start = vec3.clone(camera.position);
  let scaledRay = vec3.fromValues(ray[0] * distance, ray[1] * distance, ray[2] * distance);
  return vec3.add(vec3.create(), scaledRay, start);
};

function findObject(start, end, ray, count) {
  let half = start + ((end - start) / 2.0);
  console.log(getPointOnRay(ray, half));
  if (count >= 100) {
    let endPoint = getPointOnRay(ray, half);
    console.log(endPoint);
    return null;
  }
  return findObject(start, half, ray, count + 1);
};
*/
setInterval(() => {
  locked = document.pointerLockElement === canvas;
}, 1e3 / 10);

window.stage = new Stage(canvas);
window.onresize = () => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  stage.renderer.resize(width, height);
};
