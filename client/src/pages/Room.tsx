import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import VideoPlayer from "../components/VideoPlayer";

const Room = () => {
  const { id } = useParams();
  const { ws, me, stream } = useContext(RoomContext);

  useEffect(() => {
    if (me) ws.emit("join-room", { roomId: id, peerId: me._id });
  }, [ws, me, id]);

  return (
    <>
      <div>{`Roomid: ${id}`}</div>
      <div>
        <VideoPlayer stream={stream} />
      </div>
    </>
  );
};

export default Room;
