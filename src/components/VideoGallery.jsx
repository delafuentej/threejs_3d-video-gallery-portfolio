import React from "react";
import VideoPlayerHLS from "./VideoPlayerHLS";
import { projectsVideos } from "../constants";

const VideoGallery = () => {
  //const videos = Array.from({ length: 21 }, (_, i) => `/hls/vd${i + 1}.m3u8`);

  return (
    <section className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-10 text-center">
        🎬 Video Gallery (HLS Optimized)
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {projectsVideos.map((src, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-blue-500 transition-all duration-300"
          >
            <VideoPlayerHLS src={src} />
            <div className="absolute bottom-2 right-3 text-sm text-neutral-400 group-hover:text-white">
              Video {index + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoGallery;
