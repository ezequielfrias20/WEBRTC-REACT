import React, { useEffect, useRef } from "react";

interface IParams {
  stream: MediaStream;
}

const VideoPlayer = ({ stream }: IParams) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return <video className="w-100 h-1000 object-contain rounded-lg" ref={videoRef} autoPlay />;
};

export default VideoPlayer;
