import Peer from "peerjs";
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { v4 as uuidV4 } from "uuid";
import { peersReducer } from "./PeerReducer";
import { addPeerAction } from "./PeerActions";

const WS = "http://localhost:8080";

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

export const RoomProvider = ({ children }: any) => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();

  const [peers, dispatch] = useReducer(peersReducer, {});

  const enterRoom = ({ roomId }: any) => {
    console.log({ roomId });
    navigate(`/room/${roomId}`);
  };

  const getUseres = ({ participants }: { participants: string[] }) => {
    console.log({ participants });
  };
  useEffect(() => {
    const meId = uuidV4();
    const peer = new Peer(meId);
    setMe(peer);

    try {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream);
        });
    } catch (error) {
      console.error(error);
    }
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUseres);
  }, [ws]);

  useEffect(() => {
    if (!me) return;
    if (!stream) return;

    ws.on('user-joined', ({peerId}) => {
      const call = me.call(peerId, stream);
      call.on("stream", (peerStream) => {
         dispatch(addPeerAction(peerId, peerStream))
      })
    })

    ws.on('call', (call) => {
      call.answer(stream);
      call.on("stream", (peerStream: MediaStream) => {
         dispatch(addPeerAction(call.peer, peerStream))
      })
    })
  }, [me, stream])

  console.log(peers);
  

  return (
    <RoomContext.Provider value={{ ws, me, stream }}>{children}</RoomContext.Provider>
  );
};
