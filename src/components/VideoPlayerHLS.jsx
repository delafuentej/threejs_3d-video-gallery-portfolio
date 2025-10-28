import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayerHLS = ({ src }) => {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      preload="none"
      className="w-full h-full rounded-2xl shadow-lg object-cover hover:scale-[1.02] transition-transform duration-300"
    />
  );
};

export default VideoPlayerHLS;
