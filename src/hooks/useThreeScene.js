import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { Text } from "troika-three-text";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import useMouseParallax from "./useMouseParallax";
import createHologram from "../three/createHologram";
import {
  isObjectVisible,
  createVideoPlane,
  loadModel,
  applyHolographicShader,
  updateHolographicTime,
} from "../utils/";

import { baseParams } from "../constants";

export default function useThreeScene(videos, options = {}) {
  const mountRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const planesRef = useRef([]);
  const mixersRef = useRef([]);

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
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // --- LIghts ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 100);
    pointLight1.position.set(0, 10, 10);
    scene.add(pointLight1);

    const spotLight = new THREE.SpotLight(0x00ffff, 3, 50, Math.PI / 6, 0.3, 1);
    spotLight.position.set(15, 2, 0);
    spotLight.target.position.set(15, 0, -5); // 🔹 apunta al modelo
    scene.add(spotLight);
    scene.add(spotLight.target);

    // sombra opcional
    spotLight.castShadow = true;

    // --- Holograma ---
    const { group: hologram, update: updateParticles } = createHologram();
    scene.add(hologram);

    // Asegúrate de que el holograma esté visible
    console.log("Holograma creado:", hologram);
    console.log("Posición del holograma:", hologram.position);
    console.log("Hijos del holograma:", hologram.children.length);

    // --- Cargar Modelo 3D ---

    // let screens3D = null;
    //let holographicMaterials = null;

    async function loadModels() {
      try {
        // Modelo 3D estático
        const screens3D = await loadModel({
          url: "/models/3d-computers-text.glb",
          scene,
          position: [-20, 0, -5],
          scale: [20, 20, 20],
        });

        // Modelo 3D animado
        // const { model: holoEarthModel } = await loadModel({
        // url: "/models/holo-earth2.glb",
        // scene,
        // position: [17, 0, -5],
        // scale: [7, 7, 7],
        // rotation: [0, Math.PI, Math.PI / 2],
        // });

        // holoEarthRef.current = holoEarthModel;

        //      if (mixer) mixersRef.current.push(mixer);
      } catch (error) {
        console.error("Error cargando modelos:", error);
      }
    }

    loadModels();

    // const screens3D = loadModel({
    // url: "/models/3d-computers-text.glb",
    // scene,
    // position: [-20, 0, -5],
    // scale: [20, 20, 20],

    //  shader: applyHolographicShader,
    // });

    // let holographicMaterials = null;

    // let holoEarth = loadModel({
    // url: "/models/holo-earth.glb",
    // scene,
    // position: [20, 0, -5],
    // scale: [10, 10, 10],
    // onLoad: (model) =>
    // (holographicMaterials = applyHolographicShader(
    // model,
    // new THREE.Color(0x00897b)
    // )),
    // }).then(({ mixer }) => {
    // if (mixer) mixersRef.current.push(mixer);
    // });
    // }, []);

    // gltfLoader.load(
    // "/models/3d-computers-text.glb", // 🔴 Cambia esto a la ruta de tu modelo
    // (gltf) => {
    // screens3D = gltf.scene;

    // Ajustar posición y escala
    // screens3D.position.set(-20, 0, -5);
    // screens3D.scale.set(20, 20, 20); // Ajusta si es necesario

    // const helper = new THREE.BoxHelper(model3D, 0xff0000);
    // scene.add(helper);

    //   ⭐ AQUÍ SE APLICA EL SHADER
    // holographicMaterials = applyHolographicShader(
    // model3D, // El modelo cargado
    // new THREE.Color(0xff0000) // Color del holograma
    // );

    // console.log("✅ Shader aplicado al modelo:", model3D);
    // Asegurar que tenga materiales visibles
    //  model3D.traverse((child) => {
    // if (child.isMesh) {
    // child.castShadow = true;
    // child.receiveShadow = true;
    //  Si el material no se ve, descomenta esto:
    // child.material.needsUpdate = true;
    // }
    // });

    // screens3D.traverse((child) => {
    // if (child.isMesh) {
    // child.material.transparent = true; // habilitar transparencia
    // child.material.opacity = 0.35; // ajustar opacidad
    // child.material.depthWrite = false; // opcional para evitar conflictos
    // child.material.needsUpdate = true; // actualizar material
    // }
    // });

    // scene.add(screens3D);

    // console.log("✅ Modelo 3D cargado:", screens3D);
    // },
    // (progress) => {
    // console.log(
    // `Cargando modelo: ${(
    // (progress.loaded / progress.total) *
    // 100
    // ).toFixed(2)}%`
    // );
    // },
    // (error) => {
    // console.error("❌ Error cargando modelo 3D:", error);
    // }
    // );

    //  --- Environment Map HDRI ---
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "/textures/environmentMap/night_environment.hdr",
      (environmentMap) => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = environmentMap;
        scene.environment = environmentMap;
      },
      undefined,
      (error) => {
        console.error("❌ Error al cargar HDRI:", error);
      }
    );

    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load("/textures/matcaps/1.png");
    matcapTexture.colorSpace = THREE.SRGBColorSpace;

    //fonts
    const fontLoader = new FontLoader();

    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      console.log(font);
      const textGeometry = new TextGeometry(
        "delafuente",

        {
          font: font,
          size: 0.7,
          height: 0.2,
          curveSegments: 6,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 3,
        }
      );
      const material = new THREE.MeshMatcapMaterial();
      material.matcap = matcapTexture;
      material.transparent = true;
      material.opacity = 0.8;
      //textMaterial.wireframe = true;
      const text = new THREE.Mesh(textGeometry, material);
      text.position.set(-2, 1, 0);

      scene.add(text);
    });

    const textMesh = new Text();
    textMesh.text = "Creative Developer";
    textMesh.fontSize = 1;
    textMesh.position.set(-5, 3, -4);
    textMesh.color = 0x00ffff;
    textMesh.font = "/fonts/Orbitron-VariableFont_wght.ttf"; // fuente TTF u OTF en tu carpeta public
    textMesh.sync(); // importante: genera la geometría

    scene.add(textMesh);

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
    const targetFPS = 30;
    const frameInterval = 1 / targetFPS;

    const animate = () => {
      requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = clock.getElapsedTime();
      lastRenderTime += delta;
      if (lastRenderTime < frameInterval) return;
      lastRenderTime = 0;

      // if (holographicMaterials && holographicMaterials.length) {
      // holographicMaterials.forEach((mat) =>
      // updateHolographicTime(mat, delta)
      // );
      // }

      updateTarget();

      // ⭐ AQUÍ: Actualiza el holograma en cada frame
      if (updateParticles) {
        updateParticles(delta);
      }

      const mouseDistance = Math.sqrt(
        mouse.current.targetX ** 2 + mouse.current.targetY ** 2
      );
      const time = performance.now() * 0.001;

      for (const mesh of planes) {
        const visible = isObjectVisible(camera, mesh);
        mesh.visible = visible;

        if (!visible) continue;

        const videoEl = mesh.userData.videoEl;
        if (videoEl) {
          if (videoEl.paused) videoEl.play().catch(() => {});

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

      if (mixersRef.current.length > 0)
        mixersRef.current.forEach((mixer) => mixer.update(delta));
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

  return { mountRef, scene: sceneRef.current };
}
