import React from "react";
import useThreeScene from "../hooks/useThreeScene";

import { projectsVideos } from "../constants";

export default function ThreeSceneWrapper() {
  const { mountRef } = useThreeScene(projectsVideos, {
    rows: 7,
    columns: 7,
    spacing: 10,
    imageWidth: 7,
    imageHeight: 4.5,
    depth: 20,
    elevation: 0,
    lookAtRange: 20,
    curvature: 5,
    verticalCurvature: 0.5,
  });

  return <div ref={mountRef} />;
}
