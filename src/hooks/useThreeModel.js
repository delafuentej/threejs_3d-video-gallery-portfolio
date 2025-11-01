import { useEffect } from "react";
import {
  ShaderMaterial,
  Uniform,
  Color,
  Clock,
  MeshBasicMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import holographicVertexShader from "../shaders/holographic/vertex.glsl";
import holographicFragmentShader from "../shaders/holographic/fragment.glsl";

export default function useThreeModel(scene, url, options = {}) {
  useEffect(() => {
    if (!scene || !url) return;

    const materialParameters = {};
    materialParameters.color = "#70c1ff"; //#70c1ff

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        console.log("✅ Modelo cargado:", gltf.scene);
        const model = gltf.scene;

        // Ejemplo: aplicar shader personalizado

        const shaderMaterial = new ShaderMaterial({
          uniforms: {
            uTime: new Uniform(0.0),
            uColor: new Uniform(new Color(materialParameters.color)),
          },
          vertexShader: holographicVertexShader,
          fragmentShader: holographicFragmentShader,
        });

        // Asigna el material shader a todas las mallas del modelo
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = shaderMaterial;
          }
          //   if (child.isMesh) {
          // child.material = new MeshBasicMaterial({
          //   color: 0x00ffff, // cian brillante
          //   wireframe: true, // modo alambre visible desde cualquier ángulo
          // });
          //   }
        });

        // Ajustes de posición o escala opcionales
        model.scale.set(
          options.scale ?? 1,
          options.scale ?? 1,
          options.scale ?? 1
        );
        model.position.set(...(options.position ?? [0, 0, 0]));

        scene.add(model);
        console.log("✅ Modelo cargado y añadido a la escena:", model);

        // 🔲 Crea un helper para visualizar el bounding box
        import("three").then(({ Box3, Box3Helper, Color, Vector3 }) => {
          const box = new Box3().setFromObject(model);

          const helper = new Box3Helper(box, new Color(0x00ff00));
          scene.add(helper);

          const center = new Vector3(0, 0, 50);
          box.getCenter(center);
          model.position.sub(center);

          // 📸 Centra la cámara mirando al modelo
          const camera =
            scene.children.find((obj) => obj.isCamera) || scene.userData.camera;
          if (camera) {
            camera.position.set(
              center.x,
              center.y,
              center.z + box.getSize(new Vector3()).length()
            );
            camera.lookAt(model.position);
            console.log("📷 Cámara apuntando a:", center);
          }

          console.log("📦 Bounding Box:", box);
        });

        // --- Loop para uniforms animadas ---
        const clock = new Clock();
        const update = () => {
          const elapsedTime = clock.getElapsedTime();
          //Update material
          shaderMaterial.uniforms.uTime.value = elapsedTime;
          //  shaderMaterial.uniforms.uTime.value += clock.getDelta();
          if (model) {
            model.rotation.x = -elapsedTime * 0.1;
            model.rotation.y = elapsedTime * 0.2;
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
