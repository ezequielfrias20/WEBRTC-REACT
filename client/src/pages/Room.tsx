import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import VideoPlayer from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";
import ShareScreenButton from "../components/ShareScreenButton";
import CustomButtomRoom from "../components/buttons/CustomButtomRoom";
import { MdAssignmentReturned, MdOutlineFeed } from "react-icons/md";
import { collectQoSStats } from "../utils/collectQoS";
import { isEmpty } from "lodash";
import CsvDownloadButton from "react-json-to-csv";

const Room = () => {
  const { id } = useParams();
  const { ws, me, stream, peers, shareScreen, isCollectingData } = useContext(RoomContext);
  const [isCollectedData, setIsCollectedData] = useState(false);
  const [mockData, setMockData] = useState<null | any[]>(null);

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
    if (totalStreams <= 9) return "grid-cols-3 grid-rows-3 rounded-lg";
    return "grid-cols-4 grid-rows-3";
  };

  const handleCollectData = () => {
    if (isEmpty(Object.keys(peers))) return;
    setIsCollectedData(true);
    // collectQoSStats(me.call(peers, stream)?.peerConnection, setMockData)
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-300">
      {isCollectingData && (
        <div className="w-full h-20 bg-rose-400 flex items-center justify-center gap-4 text-lg font-semibold text-white font-sans">
          <MdOutlineFeed size={40} />
          Recopilando Datos de Red
        </div>
      )}
      <div
        className={`grid ${getGridClasses()} gap-1 flex-grow overflow-hidden p-6`}
      >
        <VideoPlayer stream={stream} />
        {totalPeers.map((peer) => (
          <VideoPlayer key={peer._id} stream={peer.stream} />
        ))}
      </div>
      <div className="flex justify-center w-full flex-row gap-4 pb-6">
        <ShareScreenButton onClick={shareScreen} />
        <CustomButtomRoom
          onClick={handleCollectData}
          icon={<MdAssignmentReturned />}
          info="Recolectar data"
        />
        <CsvDownloadButton
          data={mockData as object | object[]}
          className="bg-rose-400 p-4 rounded-lg text-xl hover:bg-rose-600 text-white"
        />
      </div>
    </div>
  );
};

export default Room;
