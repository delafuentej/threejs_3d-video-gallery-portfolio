import { useRef, useEffect } from "react";
import { Vector3 } from "three";

export default function useMouseParallax(lookRange = 20) {
  const lookAtTarget = useRef(new Vector3(0, 0, 0));
  const mouse = useRef({ mouseX: 0, mouseY: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouse.current.mouseX =
        (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.current.mouseY =
        (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };
    document.addEventListener("mousemove", handleMouse);
    return () => document.removeEventListener("mousemove", handleMouse);
  }, []);

  const updateTarget = () => {
    mouse.current.targetX +=
      (mouse.current.mouseX - mouse.current.targetX) * 0.05;
    mouse.current.targetY +=
      (mouse.current.mouseY - mouse.current.targetY) * 0.05;

    lookAtTarget.current.x = mouse.current.targetX * lookRange;
    lookAtTarget.current.y = -mouse.current.targetY * lookRange;
    lookAtTarget.current.z = 0;
  };

  return { mouse, lookAtTarget, updateTarget };
}
