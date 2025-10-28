export const projectsVideos = Array.from(
  { length: 21 },
  (_, i) => `/hls/vd${i + 1}.m3u8`
);

export const baseParams = {
  rows: 7,
  columns: 7,
  curvature: 5,
  spacing: 10,
  imageWidth: 7,
  imageHeight: 4.5,
  depth: 7.5,
  elevation: 0,
  lookAtRange: 20,
  verticalCurvature: 0.5,
};
