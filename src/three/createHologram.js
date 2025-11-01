import * as THREE from "three";
import createParticles from "./createParticles";

export default function createHologram() {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);
  group.scale.set(1, 1, 1);
  group.rotation.set(0, 0, 0);

  const { points, update } = createParticles();
  group.add(points);

  return { group, update };
}
