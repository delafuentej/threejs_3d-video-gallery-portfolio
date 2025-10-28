import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayerHLS = ({ src }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full rounded-xl shadow-lg"
      preload="none"
    />
  );
};

export default VideoPlayerHLS;
