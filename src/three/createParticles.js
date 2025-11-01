import * as THREE from "three";
import vertexShader from "../shaders/particles/vertex.glsl";
import fragmentShader from "../shaders/particles/fragment.glsl";

export default function createParticles() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const displacementTexture = new THREE.CanvasTexture(canvas);

  const geometry = new THREE.PlaneGeometry(10, 10, 356, 356);
  geometry.setIndex(null);
  geometry.deleteAttribute("normal");

  const textureLoader = new THREE.TextureLoader();
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    lights: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color("#00897B") },
      uPictureTexture: { value: textureLoader.load("/images/hologram/me.png") },
      uDisplacementTexture: { value: displacementTexture },
      uResolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
    },
  });

  const points = new THREE.Points(geometry, material);

  // Animación del cursor
  const cursor = new THREE.Vector2(9999, 9999);
  window.addEventListener("pointermove", (e) => {
    const x = (e.clientX / window.innerWidth) * canvas.width;
    const y = (1 - e.clientY / window.innerHeight) * canvas.height;
    cursor.set(x, y);
  });

  const update = () => {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2);
    ctx.fill();

    displacementTexture.needsUpdate = true;
  };

  return { points, update };
}
