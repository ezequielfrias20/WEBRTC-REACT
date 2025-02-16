import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import VideoPlayer from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";

const Room = () => {
  const { id } = useParams();
  const {
    ws,
    me,
    stream,
    peers,
    shareScreen,
    isCollectingData,
    toggleCamera,
    toggleMic,
    cameraOn,
    micOn,
  } = useRoom();

  const [totalPeers, setTotalPeers] = useState<any[]>([]);

  //nuevo nuevo nuevowwww

  useEffect(() => {
    if (me) ws.emit("join-room", { roomId: id, peerId: me._id });
  }, [id, ws, me]);

  useEffect(() => {
    setTotalPeers(Object.values(peers as PeerState));
  }, [peers]);

  // Calcular el número total de streams (incluye el propio)
  const totalStreams = totalPeers.length + 1;

  // Determinar las clases de columnas y filas basadas en el número total de streams
  const getGridClasses = () => {
    if (totalStreams === 1) return "grid-cols-1 grid-rows-1";
    if (totalStreams === 2) return "grid-cols-2 grid-rows-1";
    if (totalStreams <= 4) return "grid-cols-2 grid-rows-2";
    if (totalStreams <= 6) return "grid-cols-3 grid-rows-2";
    if (totalStreams <= 9) return "grid-cols-3 grid-rows-3 rounded-lg";
    return "grid-cols-4 grid-rows-3";
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* {isCollectingData && (
        <div className="w-full h-20 bg-rose-400 flex items-center justify-center gap-4 text-lg font-semibold text-white font-sans">
          <MdOutlineFeed size={40} />
          Recopilando Datos de Red
        </div>
      )} */}
      <div
        // className={`grid ${getGridClasses()} gap-1 flex-grow overflow-hidden p-6`}
        className= "flex justify-center items-center gap-10 w-full h-full flex-row flex-grow flex-wrap"
      >
        <VideoPlayer stream={stream} />
        {totalPeers.map((peer) => (
          <VideoPlayer key={peer._id} stream={peer.stream} />
        ))}
      </div>
      <div className="flex justify-center w-full flex-row gap-4 pb-6">
        <button
          onClick={toggleCamera}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
        >
          {!cameraOn ? <VideocamOffOutlinedIcon /> : <VideocamOutlinedIcon />}
        </button>
        <button
          onClick={toggleMic}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
        >
          {!micOn ? <MicOffOutlinedIcon /> : <MicNoneOutlinedIcon />}
        </button>
      </div>
    </div>
  );
};

export default Room;
