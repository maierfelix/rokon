import WebGLRenderer from "./renderer/";

import Quad from "./renderer/objects/quad";
import Cube from "./renderer/objects/cube";
import Plane from "./renderer/objects/plane";
import Water from "./renderer/objects/water";
import Sprite from "./renderer/objects/sprite";
import Terrain from "./renderer/objects/terrain";
import FreeCamera from "./renderer/cameras/free";

const out = {
  WebGLRenderer,
  Quad,
  Cube,
  Plane,
  Water,
  Terrain,
  Sprite,
  FreeCamera
};

if (typeof window !== "undefined") {
  Object.assign(window, out);
}

export default out;
