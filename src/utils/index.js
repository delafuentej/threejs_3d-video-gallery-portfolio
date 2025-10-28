// createVideoPlane.js
import Hls from "hls.js";
import {
  VideoTexture,
  LinearFilter,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
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
  const video = document.createElement("video");
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  if (Hls.isSupported()) {
    const hls = new Hls({ maxBufferLength: 30 });
    hls.loadSource(src);
    hls.attachMedia(video);
    // opcional: reproducir cuando se cargue manifest
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // intentar play (algunos navegadores requieren interacción; aquí queda como intento)
      video.play().catch(() => {});
    });
  } else {
    video.src = src;
    video.play().catch(() => {});
  }

  const texture = new VideoTexture(video);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const geometry = new PlaneGeometry(width, height);
  const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
  const mesh = new Mesh(geometry, material);

  // metadatos / userdata que usa el hook para parallax/animación
  mesh.userData = {
    video,
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

export default createVideoPlane;
