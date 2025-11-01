import { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ShaderMaterial, Uniform, Color, Clock, Box3, Box3Helper } from "three";
import holographicVertexShader from "../shaders/holographic/vertex.glsl";
import holographicFragmentShader from "../shaders/holographic/fragment.glsl";

export default function useThreeModelSync(scene, url, options = {}) {
  useEffect(() => {
    if (!scene || !url) return;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        // --- Shader personalizado ---
        const shaderMaterial = new ShaderMaterial({
          uniforms: {
            uTime: new Uniform(0.0),
            uColor: new Uniform(new Color(options.color || "#70c1ff")),
          },
          vertexShader: holographicVertexShader,
          fragmentShader: holographicFragmentShader,
        });

        model.traverse((child) => {
          if (child.isMesh) child.material = shaderMaterial;
        });

        // --- Posición y rotación según fila/columna (igual que los videos) ---
        if (
          options.row != null &&
          options.column != null &&
          scene.userData.calculatePosition
        ) {
          const { x, y, z, rotationX, rotationY } =
            scene.userData.calculatePosition(options.row, options.column);

          model.position.set(x, y, z);
          model.rotation.x = rotationX;
          model.rotation.y = rotationY;

          // Guardamos basePosition y baseRotation para parallax
          model.userData.basePosition = { x, y, z };
          model.userData.baseRotation = { x: rotationX, y: rotationY, z: 0 };
          model.userData.parallaxFactor = options.parallaxFactor ?? 1;
        } else {
          // fallback
          model.position.set(...(options.position ?? [0, 0, 0]));
          model.rotation.set(...(options.rotation ?? [0, 0, 0]));
        }

        // --- Escala ---
        const scale = options.scale ?? 1;
        model.scale.set(scale, scale, scale);

        scene.add(model);

        // --- Bounding box helper (opcional) ---
        if (options.showBoundingBox) {
          const box = new Box3().setFromObject(model);
          const helper = new Box3Helper(box, new Color(0x00ff00));
          scene.add(helper);
        }

        // --- Animación de shader y parallax ---
        const clock = new Clock();
        const update = () => {
          const elapsedTime = clock.getElapsedTime();

          // Actualizamos uniform del shader
          shaderMaterial.uniforms.uTime.value = elapsedTime;

          // Rotación automática opcional
          if (options.autoRotate) {
            model.rotation.y += 0.01;
            model.rotation.x += 0.005;
          }

          // --- Movimiento parallax ---
          const mouse = scene.userData.mouse;
          if (mouse && model.userData.basePosition) {
            const base = model.userData.basePosition;
            const baseRot = model.userData.baseRotation;
            const factor = model.userData.parallaxFactor;

            model.position.x = base.x + mouse.targetX * factor * 3;
            model.position.y = base.y - mouse.targetY * factor * 3;
            model.rotation.x = baseRot.x - mouse.targetY * 0.05;
            model.rotation.y = baseRot.y + mouse.targetX * 0.05;
          }

          requestAnimationFrame(update);
        };
        update();
      },
      undefined,
      (err) => console.error("❌ Error cargando modelo:", err)
    );
  }, [scene, url]);
}
