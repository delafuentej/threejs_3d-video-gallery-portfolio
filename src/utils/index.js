// createVideoPlane.js
import Hls from "hls.js";
import {
  VideoTexture,
  LinearFilter,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  Frustum,
  Matrix4,
  //RGBFormat,
} from "three";

/**
 * Crea y devuelve un THREE.Mesh que usa un <video> (HLS si procede) como textura.
 * src  URL al .m3u8 o a un vídeo
 *  width ancho del plane en unidades Three.js
 *  height alto del plane en unidades Three.js
 * return  mesh
 */
function createVideoPlane(src, width = 7, height = 4.5) {
  // elemento video HTML
  const videoEl = document.createElement("video");
  videoEl.loop = true;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.preload = "auto";
  videoEl.crossOrigin = "anonymous";
  //videoEl.play();

  if (Hls.isSupported()) {
    const hls = new Hls({ maxBufferLength: 30 });
    hls.loadSource(src);
    hls.attachMedia(videoEl);
    // opcional: reproducir cuando se cargue manifest
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // intentar play (algunos navegadores requieren interacción; aquí queda como intento)
      videoEl.play().catch(() => {});
    });
  } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = src;
    videoEl.play().catch(() => {});
  }

  const texture = new VideoTexture(videoEl);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  //texture.format = RGBFormat;

  const geometry = new PlaneGeometry(width, height);
  const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
  const mesh = new Mesh(geometry, material);

  // metadatos / userdata que usa el hook para parallax/animación
  mesh.userData = {
    videoEl,
    basePosition: { x: 0, y: 0, z: 0 },
    baseRotation: { x: 0, y: 0, z: 0 },
    parallaxFactor: Math.random() * 0.5 + 0.5,
    randomOffset: {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
    },
    rotationModifier: {
      x: Math.random() * 0.15 - 0.075,
      y: Math.random() * 0.15 - 0.075,
      z: Math.random() * 0.2 - 0.1,
    },
    phaseOffset: Math.random() * Math.PI * 2,
  };

  return mesh;
}

let frustum = new Frustum();
let matrix = new Matrix4();

function isObjectVisible(camera, object) {
  matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

  frustum.setFromProjectionMatrix(matrix);
  return frustum.intersectsObject(object);

  // ✅ Compatibilidad entre versiones de Three.js
  // if (typeof frustum.setFromProjectionMatrix === "function") {
  // frustum.setFromProjectionMatrix(matrix);
  // } else if (typeof frustum.setFromMatrix === "function") {
  // frustum.setFromMatrix(matrix);
  // } else {
  // console.warn(
  // "⚠️ No se pudo configurar el frustum: verifica tu versión de Three.js"
  // );
  //}
}

export { createVideoPlane, isObjectVisible };
