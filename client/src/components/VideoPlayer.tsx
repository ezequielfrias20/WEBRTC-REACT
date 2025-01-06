import React, { useEffect, useRef } from "react";

interface IParams {
  stream: MediaStream;
}

const VideoPlayer = ({ stream }: IParams) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return <video className="w-full h-full object-cover rounded-lg" ref={videoRef} autoPlay muted />;
};

export default VideoPlayer;
