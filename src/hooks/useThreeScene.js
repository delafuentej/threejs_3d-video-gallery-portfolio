import { useRef, useEffect } from "react";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import useMouseParallax from "./useMouseParallax";
import createVideoPlane from "../utils";
import { baseParams } from "../constants";

export default function useThreeScene(videos, options = {}) {
  const mountRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const { mouse, lookAtTarget, updateTarget } = useMouseParallax();
  const params = { ...baseParams, ...options };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup Scene ---
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 40);

    //renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // --- helper functions ---
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
        planes.push(plane);
        scene.add(plane);
      }
    }

    // --- Animation loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      updateTarget();
      const time = performance.now() * 0.001;

      planes.forEach((plane) => {
        const {
          basePosition,
          baseRotation,
          parallaxFactor,
          randomOffset,
          rotationModifier,
          phaseOffset,
        } = plane.userData;
        const mouseDistance = Math.sqrt(
          mouse.current.targetX ** 2 + mouse.current.targetY ** 2
        );

        // position
        plane.position.x =
          basePosition.x +
          mouse.current.targetX * parallaxFactor * 3 * randomOffset.x +
          Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.x;
        plane.position.y =
          basePosition.y +
          -mouse.current.targetY * parallaxFactor * 3 * randomOffset.y +
          Math.sin(time + phaseOffset) * mouseDistance * 0.1 * randomOffset.y;
        plane.position.z =
          basePosition.z +
          Math.sin(time + phaseOffset) *
            mouseDistance *
            0.1 *
            randomOffset.z *
            parallaxFactor;

        // rotation
        plane.rotation.x =
          baseRotation.x +
          -mouse.current.targetY * rotationModifier.x * mouseDistance +
          Math.sin(time + phaseOffset) * rotationModifier.x * 0.2;
        plane.rotation.y =
          baseRotation.y +
          mouse.current.targetX * rotationModifier.y * mouseDistance +
          Math.sin(time + phaseOffset) * rotationModifier.y * 0.2;
        plane.rotation.z =
          baseRotation.z +
          mouse.current.targetX *
            -mouse.current.targetY *
            rotationModifier.z *
            2 +
          Math.sin(time + phaseOffset) * rotationModifier.z * 0.3;

        if (plane.userData.video.readyState >= 2)
          plane.material.map.needsUpdate = true;
      });

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
      planes.forEach((plane) => plane.userData.video.pause());
      renderer.dispose();
    };
  }, [videos]);

  return { mountRef };
}
