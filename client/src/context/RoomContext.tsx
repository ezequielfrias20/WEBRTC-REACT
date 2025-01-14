import Peer from "peerjs";
import { createContext, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { v4 as uuidV4 } from "uuid";
import { peersReducer } from "./PeerReducer";
import { addPeerAction, removePeerAction } from "./PeerActions";
import { collectQoSStats, metrics } from "../utils/collectQoS";

const WS = "http://localhost:8080";

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

export const RoomProvider = ({ children }: any) => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [screenSharingId, setScreenSharingId] = useState("");
  const [dataQoS, setDataQoS] = useState<any[]>([]);
  const [isCollectingData, setIsCollectingData] = useState(false);

  const enterRoom = ({ roomId }: any) => {
    navigate(`/room/${roomId}`);
  };

  const getUsers = ({ participants }: { participants: string[] }) => {
    console.log("[participants] ", { participants });
  };
  const removePeer = (peerId: string) => {
    dispatch(removePeerAction(peerId));
  };
  const switchScreen = (stream: MediaStream) => {
    setStream(stream);
    setScreenSharingId(me?.id ?? "");
  };
  const shareScreen = () => {
    if (screenSharingId) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(switchScreen);
    } else {
      navigator.mediaDevices.getDisplayMedia({}).then(switchScreen);
    }
  };

  // function collectQoSStats(peerConnection: RTCPeerConnection) {
  //   let listQoS = [] as any[];
  //   let itsOver = false;
  //   console.log(
  //     " ===== Recolección de estadísticas iniciada, tardara 5 minutos en completarse. ====="
  //   );
  //   const intervalId = setInterval(() => {
  //     if (itsOver) return;
  //     // setDataQoS((prevDataQoS: any) => {
  //     // Solo seguir agregando si aún no alcanzamos 5 entradas
  //     // console.log('listQoS: ', listQoS);
  //     // if (listQoS.length === 5) {
  //     //   itsOver = true ;
  //     //   return setDataQoS(listQoS);
  //     // }
  //     peerConnection
  //       .getStats(null)
  //       .then((stats) => {
  //         const currentReport = {
  //           video: {
  //             "inbound-rtp": {},
  //             "outbound-rtp": {},
  //             "remote-inbound-rtp": {},
  //           },
  //           audio: {
  //             "inbound-rtp": {},
  //             "outbound-rtp": {},
  //             "remote-inbound-rtp": {},
  //           },
  //         };
  //         stats.forEach((report: { kind: string; type: string }) => {
  //           if (
  //             (report.type === "outbound-rtp" ||
  //               report.type === "inbound-rtp" ||
  //               report.type === "remote-inbound-rtp") &&
  //             (report.kind === "video" || report.kind === "audio")
  //           ) {
  //             currentReport[report.kind][report.type] = report;
  //           }
  //         });
  //         listQoS.push(currentReport);
  //       })
  //       .catch((err) => console.error("Error getting stats:", err));
  //     // });
  //   }, 5000); // Recolecta estadísticas cada 5 segundos

  //   setTimeout(() => {
  //     itsOver = true;
  //     clearInterval(intervalId); // Detiene el intervalo al alcanzar los 5 minutos
  //     console.log(
  //       "==== Recolección de estadísticas completada después de 5 minutos. ===="
  //     );
  //     setDataQoS(listQoS);
  //   }, 5 * 60 * 1000);
  // }

  // console.log(dataQoS);
  useEffect(() => {
    const meId = uuidV4();
    // Id que Peer le asigna a cada usuario
    const peer = new Peer(meId);
    // const peer = new Peer(meId, {
    //   host: 'localhost',
    //   port: 8080,
    //   path: '/peerjs',
    // });
    console.log(peer)
    setMe(peer);
    try {
      // Funcion para acceder a la camara y microfono
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream);
        });
    } catch (error) {
      console.error(error);
    }
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);

    return () => {
      ws.off("room-created");
      ws.off("get-users");
      ws.off("user-disconnected");
      ws.off("user-joined");
      me?.disconnect();
    };
  }, [ws]);

  useEffect(() => {
    if (!me) return;
    if (!stream) return;

    ws.on("user-joined", ({ peerId, roomId }) => {
      console.log("[user-joined]: ", { peerId });
      let newMetrics = false;
      const call = me.call(peerId, stream);
      call.on("stream", (peerStream) => {
        dispatch(addPeerAction(peerId, peerStream));
        // Llamar a la función para recolectar estadísticas de QoS
        if (isCollectingData || newMetrics) return;
        setIsCollectingData(true);
        newMetrics = true;
        metrics(call.peerConnection, () => {
          setIsCollectingData(false);
          newMetrics = false;
        }, roomId);
      });
    });

    me.on("call", (call) => {
      call.answer(stream);
      console.log("[call]: ", call);
      call.on("stream", (peerStream: MediaStream) => {
        dispatch(addPeerAction(call.peer, peerStream));
        // metrics(call.peerConnection, setDataQoS);
      });
    });

    return () => {
      ws.off("user-joined");
    };
  }, [ws, me, stream]);

  const values = useMemo(
    () => ({ ws, me, stream, peers, shareScreen, isCollectingData }),
    [ws, me, stream, peers, shareScreen, isCollectingData]
  );

  return (
    <RoomContext.Provider
      value={{ ws, me, stream, peers, shareScreen, isCollectingData }}
    >
      {children}
    </RoomContext.Provider>
  );
};
