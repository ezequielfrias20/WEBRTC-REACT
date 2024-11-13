import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import VideoPlayer from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";
import ShareScreenButton from "../components/ShareScreenButton";

const Room = () => {
  const { id } = useParams();
  const { ws, me, stream, peers, shareScreen } = useContext(RoomContext);

  const [totalPeers, setTotalPeers] = useState<any[]>([]);

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
    if (totalStreams <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-3";
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className={`grid ${getGridClasses()} gap-1 flex-grow rounded-lg overflow-hidden`}>
        <VideoPlayer stream={stream}/>
        {totalPeers.map((peer) => (
          <VideoPlayer key={peer._id} stream={peer.stream} />
        ))}
      </div>
      <div className="fixed bottom-6 flex justify-center w-full flex-row gap-4">
        <ShareScreenButton onClick={shareScreen} />
        <ShareScreenButton onClick={shareScreen} />
        <ShareScreenButton onClick={shareScreen} />
      </div>
    </div>
  );
};

export default Room;