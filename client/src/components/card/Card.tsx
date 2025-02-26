import React, { useRef, useEffect, useState } from "react";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import { useRoom } from "../../context/RoomContext";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";

const FloatingVideoCallCard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { cameraOn, micOn, stream, toggleCamera, toggleMic, ws } = useRoom();
  const [name, setName] = useState("");

  const createRoom = () => {
    ws.emit("create-room", {
      name,
    });
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex justify-center items-center h-screen bg-white w-5/6">
      <div className="h-5/6 bg-white rounded-2xl p-6 shadow-xl transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl w-full flex">
        {/* Lado de la Cámara */}
        <div className="w-1/2 flex flex-col items-center ">
          <video
            ref={videoRef}
            autoPlay
            className="w-full h-full rounded-lg bg-black object-cover"
          ></video>
          <div className="flex gap-4 mt-4 ">
            <button
              onClick={toggleCamera}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
            >
              {!cameraOn ? (
                <VideocamOffOutlinedIcon />
              ) : (
                <VideocamOutlinedIcon />
              )}
            </button>
            <button
              onClick={toggleMic}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
            >
              {!micOn ? <MicOffOutlinedIcon /> : <MicNoneOutlinedIcon />}
            </button>
          </div>
        </div>

        {/* Lado de Input para la Videollamada */}
        <div className="w-1/2 flex flex-col justify-center items-center border-gray-200 pl-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Unirse a la Videollamada
          </h2>
          <input
            type="text"
            placeholder="Ingrese el código de la reunión"
            className="p-2 border rounded-lg w-full mb-4"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition w-full"
            onClick={createRoom}
          >
            Unirse
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingVideoCallCard;
