import { useRef, useEffect } from "react";
import * as THREE from "three";
import useMouseParallax from "./useMouseParallax";
import { isObjectVisible, createVideoPlane } from "../utils/";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import { baseParams } from "../constants";

export default function useThreeScene(videos, options = {}) {
  const mountRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const planesRef = useRef([]);

  const { mouse, lookAtTarget, updateTarget } = useMouseParallax();
  const params = { ...baseParams, ...options };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // ⚙️ reduce carga GPU
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // --- Environment Map HDRI ---
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "/textures/environmentMap/futuristic_cyberpunk_corridor1.hdr", // ruta a tu HDR
      (environmentMap) => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = environmentMap; // muestra el HDR como fondo
        scene.environment = environmentMap; // aplica iluminación basada en HDR
      },
      undefined,
      (error) => {
        console.error("❌ Error al cargar HDRI:", error);
      }
    );

    // --- Helper functions ---
    const calculateRotations = (x, y) => {
      const a = 1 / (params.depth * params.curvature);
      const slopeY = -2 * a * x;
      const rotationY = Math.atan(slopeY);
      const verticalFactor = params.verticalCurvature;
      const maxYDistance = (params.rows * params.spacing) / 2;
      const normalizedY = y / maxYDistance;
      const rotationX = normalizedY * verticalFactor;
      return { rotationX, rotationY };
    };

    const calculatePosition = (row, col) => {
      let x = (col - params.columns / 2) * params.spacing;
      let y = (row - params.rows / 2) * params.spacing;
      let z = (x * x) / (params.depth * params.curvature);
      const normalizedY = y / ((params.rows * params.spacing) / 2);
      z += Math.abs(normalizedY) * normalizedY * params.verticalCurvature * 5;
      y += params.elevation;
      const { rotationX, rotationY } = calculateRotations(x, y);
      return { x, y, z, rotationX, rotationY };
    };

    // --- Create planes ---
    const planes = [];
    for (let row = 0; row < params.rows; row++) {
      for (let col = 0; col < params.columns; col++) {
        const src = videos[Math.floor(Math.random() * videos.length)];
        const plane = createVideoPlane(
          src,
          params.imageWidth,
          params.imageHeight
        );
        const { x, y, z, rotationX, rotationY } = calculatePosition(row, col);
        plane.position.set(x, y, z);
        plane.rotation.x = rotationX;
        plane.rotation.y = rotationY;

        plane.userData.basePosition = { x, y, z };
        plane.userData.baseRotation = { x: rotationX, y: rotationY, z: 0 };
        plane.userData.lastFrameTime = 0;
        plane.visible = false;

        scene.background = new THREE.Color(0x4d4d4d);
        scene.add(plane);
        planes.push(plane);
      }
    }
    planesRef.current = planes;

    // --- Animation loop ---
    const clock = new THREE.Clock();
    let lastRenderTime = 0;
    const targetFPS = 30; // ⚙️ ajusta si quieres más fluidez
    const frameInterval = 1 / targetFPS;

    // const animate = () => {
    // requestAnimationFrame(animate);
    // if (document.hidden) return; // ⚙️ pausa si pestaña inactiva

    // const delta = clock.getDelta();
    // lastRenderTime += delta;
    // if (lastRenderTime < frameInterval) return;
    // lastRenderTime = 0;

    // updateTarget();

    // for (const mesh of planes) {
    // const visible = isObjectVisible(camera, mesh);
    // mesh.visible = visible;

    // const videoEl = mesh.userData.videoEl;
    // if (!videoEl) continue;

    // if (visible) {
    // if (videoEl.paused) videoEl.play().catch(() => {});
    // } else {
    // if (!videoEl.paused) videoEl.pause();
    // }

    // Solo actualizar textura si el frame cambia
    // if (videoEl.readyState >= 2) {
    // const currentTimeSec = Math.floor(videoEl.currentTime * 10) / 10; // redondea a 0.1s
    // if (currentTimeSec !== mesh.userData.lastFrameTime) {
    // mesh.material.map.needsUpdate = true;
    // mesh.userData.lastFrameTime = currentTimeSec;
    // }
    // }
    // if (
    // videoEl.readyState >= 2 &&
    // videoEl.currentTime !== mesh.userData.lastFrameTime
    // ) {
    // mesh.userData.lastFrameTime = videoEl.currentTime;
    // mesh.material.map.needsUpdate = true;
    // }

    // --- Movimiento parallax ---
    // const {
    // basePosition,
    // baseRotation,
    // parallaxFactor,
    // randomOffset,
    // rotationModifier,
    // phaseOffset,
    // } = mesh.userData;
    // const data = mesh.userData || {};
    // const basePosition = data.basePosition || { x: 0, y: 0, z: 0 };
    // const baseRotation = data.baseRotation || { x: 0, y: 0, z: 0 };
    // const parallaxFactor = data.parallaxFactor ?? 0;
    // const randomOffset = data.randomOffset || { x: 1, y: 1, z: 1 };
    // const rotationModifier = data.rotationModifier || { x: 0, y: 0, z: 0 };
    // const phaseOffset = data.phaseOffset ?? 0;

    // const mouseDistance = Math.sqrt(
    // mouse.current.targetX ** 2 + mouse.current.targetY ** 2
    // );
    // const time = performance.now() * 0.001;

    // mesh.position.x =
    // basePosition.x +
    // mouse.current.targetX * parallaxFactor * 3 * randomOffset.x +
    // Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.x;

    // mesh.position.y =
    // basePosition.y +
    // -mouse.current.targetY * parallaxFactor * 3 * randomOffset.y +
    // Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.y;

    // mesh.rotation.x =
    // baseRotation.x +
    // -mouse.current.targetY * rotationModifier.x * mouseDistance +
    // Math.sin(time + phaseOffset) * rotationModifier.x * 0.2;

    // mesh.rotation.y =
    // baseRotation.y +
    // mouse.current.targetX * rotationModifier.y * mouseDistance +
    // Math.sin(time + phaseOffset) * rotationModifier.y * 0.2;
    // }

    // camera.lookAt(lookAtTarget.current);
    // renderer.render(scene, camera);
    // };
    const animate = () => {
      requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = clock.getDelta();
      lastRenderTime += delta;
      if (lastRenderTime < frameInterval) return;
      lastRenderTime = 0;

      updateTarget();

      const mouseDistance = Math.sqrt(
        mouse.current.targetX ** 2 + mouse.current.targetY ** 2
      );
      const time = performance.now() * 0.001;

      for (const mesh of planes) {
        const visible = isObjectVisible(camera, mesh);
        mesh.visible = visible;

        if (!visible) continue; // ⚡ solo procesar visibles

        const videoEl = mesh.userData.videoEl;
        if (videoEl) {
          if (videoEl.paused) videoEl.play().catch(() => {});

          // solo actualizar textura si avanzó 0.1s
          if (videoEl.readyState >= 2) {
            const currentTimeSec = Math.floor(videoEl.currentTime * 10) / 10;
            if (currentTimeSec !== mesh.userData.lastFrameTime) {
              mesh.material.map.needsUpdate = true;
              mesh.userData.lastFrameTime = currentTimeSec;
            }
          }
        }

        // --- Movimiento parallax ---
        const data = mesh.userData || {};
        const basePosition = data.basePosition || { x: 0, y: 0, z: 0 };
        const baseRotation = data.baseRotation || { x: 0, y: 0, z: 0 };
        const parallaxFactor = data.parallaxFactor ?? 0;
        const randomOffset = data.randomOffset || { x: 1, y: 1, z: 1 };
        const rotationModifier = data.rotationModifier || { x: 0, y: 0, z: 0 };
        const phaseOffset = data.phaseOffset ?? 0;

        mesh.position.x =
          basePosition.x +
          mouse.current.targetX * parallaxFactor * 3 * randomOffset.x +
          Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.x;
        mesh.position.y =
          basePosition.y +
          -mouse.current.targetY * parallaxFactor * 3 * randomOffset.y +
          Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.y;
        mesh.rotation.x =
          baseRotation.x +
          -mouse.current.targetY * rotationModifier.x * mouseDistance +
          Math.sin(time + phaseOffset) * rotationModifier.x * 0.2;
        mesh.rotation.y =
          baseRotation.y +
          mouse.current.targetX * rotationModifier.y * mouseDistance +
          Math.sin(time + phaseOffset) * rotationModifier.y * 0.2;
      }

      camera.lookAt(lookAtTarget.current);
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", handleResize);
      planes.forEach((plane) => {
        const videoEl = plane.userData.videoEl;
        if (videoEl) videoEl.pause();
        plane.geometry.dispose();
        plane.material.dispose();
      });
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [videos]);

  return { mountRef };
}
