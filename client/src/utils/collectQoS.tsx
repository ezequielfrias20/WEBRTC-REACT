import { QoSData } from "../interfaces/QosMetrics";
import { createMetrics } from "../repositories/metrics";

type RTPStats = {
  timestamp?: number;
  jitter?: number;
  packetsLost?: number;
  packetsReceived?: number;
  bytesReceived?: number;
  frameHeight?: number;
  frameWidth?: number;
  framesDecoded?: number;
  framesDropped?: number;
  framesPerSecond?: number;
  jitterBufferDelay?: number;
  jitterBufferTargetDelay?: number;
  totalDecodeTime?: number;
  totalInterFrameDelay?: number;
  kind: string;

  // Puedes agregar más métricas según las que necesites registrar
};

type ReportType = {
  "inbound-rtp": RTPStats;
  "outbound-rtp": RTPStats;
  "remote-inbound-rtp": RTPStats;
};

interface NetworkInformation {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  // Agrega otras propiedades si es necesario
}

type Report = {
  video: ReportType;
  audio: ReportType;
};

export async function collectQoSStats(
  peerConnection: RTCPeerConnection,
  setDataQoS: (value: any[]) => void
) {
  let listQoS = [] as any[];
  let itsOver = false;
  console.log(
    " ===== Recolección de estadísticas iniciada, tardara 5 minutos en completarse. ====="
  );
  const intervalId = setInterval(() => {
    if (itsOver) return;
    peerConnection
      .getStats(null)
      .then((stats) => {
        const currentReport = {
          video: {
            "inbound-rtp": {},
            "outbound-rtp": {},
            "remote-inbound-rtp": {},
          },
          audio: {
            "inbound-rtp": {},
            "outbound-rtp": {},
            "remote-inbound-rtp": {},
          },
        };
        stats.forEach((report: any) => {
          if (report.kind === "video") {
            if (report.type === "inbound-rtp") {
              currentReport["video"]["inbound-rtp"] = {
                timestamp: report?.timestamp,
                jitter: report?.jitter, // *
                packetsLost: report?.packetsLost, // *
                packetsReceived: report?.packetsReceived,
                bytesReceived: report?.bytesReceived, // *
                frameHeight: report?.frameHeight,
                frameWidth: report?.frameWidth,
                framesDecoded: report?.framesDecoded,
                framesDropped: report?.framesDropped,
                framesPerSecond: report?.framesPerSecond,
                jitterBufferDelay: report?.jitterBufferDelay,
                jitterBufferTargetDelay: report?.jitterBufferTargetDelay,
                totalDecodeTime: report?.totalDecodeTime,
                totalInterFrameDelay: report?.totalInterFrameDelay,
              };
            }
            if (report.type === "outbound-rtp") {
              currentReport["video"]["outbound-rtp"] = {
                timestamp: report?.timestamp,
                bytesSent: report?.bytesSent, // *
                packetsSent: report?.packetsSent,
                frameHeight: report?.frameHeight,
                frameWidth: report?.frameWidth,
                framesEncoded: report?.framesEncoded,
                framesPerSecond: report?.framesPerSecond,
                keyFramesEncoded: report?.keyFramesEncoded,
                qpSum: report?.qpSum,
                qualityLimitationDurations: {
                  bandwidth: report?.qualityLimitationDurations?.bandwidth,
                  cpu: report?.qualityLimitationDurations?.cpu,
                },
                qualityLimitationReason: report?.qualityLimitationReason,
                targetBitrate: report?.targetBitrate,
                totalEncodeTime: report?.totalEncodeTime,
                totalPacketSendDelay: report?.totalPacketSendDelay,
              };
            }
            if (report.type === "remote-inbound-rtp") {
              currentReport["video"]["remote-inbound-rtp"] = {
                timestamp: report?.timestamp,
                jitter: report?.jitter, // *
                packetsLost: report?.packetsLost, // *
                roundTripTime: report?.roundTripTime, // *
                totalRoundTripTime: report?.totalRoundTripTime,
              };
            }
          }
          if (report.kind === "audio") {
            if (report.type === "inbound-rtp") {
              currentReport["audio"]["inbound-rtp"] = {
                timestamp: report?.timestamp,
                jitter: report?.jitter,
                packetsLost: report?.packetsLost,
                packetsReceived: report?.packetsReceived,
                bytesReceived: report?.bytesReceived,
                concealedSamples: report?.concealedSamples,
                jitterBufferDelay: report?.jitterBufferDelay,
                jitterBufferTargetDelay: report?.jitterBufferTargetDelay,
                totalSamplesReceived: report?.totalSamplesReceived,
              };
              if (report.type === "outbound-rtp") {
                currentReport["audio"]["outbound-rtp"] = {
                  timestamp: report?.timestamp,
                  bytesSent: report?.bytesSent,
                  packetsSent: report?.packetsSent,
                  targetBitrate: report?.targetBitrate,
                  totalPacketSendDelay: report?.totalPacketSendDelay,
                };
              }
              if (report.type === "remote-inbound-rtp") {
                currentReport["audio"]["remote-inbound-rtp"] = {
                  timestamp: report?.timestamp,
                  jitter: report?.jitter,
                  packetsLost: report?.packetsLost,
                  roundTripTime: report?.roundTripTime,
                  totalRoundTripTime: report?.totalRoundTripTime,
                };
              }
            }
          }
          // if (
          //   (report.type === "outbound-rtp" ||
          //     report.type === "inbound-rtp" ||
          //     report.type === "remote-inbound-rtp") &&
          //   (report.kind === "video" || report.kind === "audio")
          // ) {
          //   currentReport[report.kind][report.type] = report;
          // }
        });
        listQoS.push(currentReport);
      })
      .catch((err) => console.error("Error getting stats:", err));
    // });
  }, 5000); // Recolecta estadísticas cada 5 segundos

  setTimeout(() => {
    itsOver = true;
    clearInterval(intervalId); // Detiene el intervalo al alcanzar los 5 minutos
    console.log(
      "==== Recolección de estadísticas completada después de 5 minutos. ===="
    );
    setDataQoS(listQoS);
  }, 5 * 60 * 1000);
}

export async function metrics(
  peerConnection: RTCPeerConnection,
  handleClose: () => void,
  roomId: string
) {
  console.log(
    " ===== Recolección de estadísticas iniciada, tardara 5 minutos en completarse. ====="
  );
  const collectMetrics = () => {
    peerConnection
      .getStats(null)
      .then((stats) => {
        let currentReport = {
          jitterVideo: 0,
          packetsLostVideo: 0,
          bytesReceivedVideo: 0,
          bytesSentVideo: 0,
          roundTripTimeVideo: 0,
          jitterAudio: 0,
          packetsLostAudio: 0,
          bytesReceivedAudio: 0,
          bytesSentAudio: 0,
          roundTripTimeAudio: 0,
        };
        const datos = [] as any;
        stats.forEach((report: any) => {
          if (report.kind === "video") {
            if (report.type === "inbound-rtp") {
              currentReport = {
                ...currentReport,
                jitterVideo: report?.jitter ?? 0,
                packetsLostVideo: report?.packetsLost ?? 0,
                bytesReceivedVideo: report?.bytesReceived ?? 0,
              };
            }
            if (report.type === "outbound-rtp") {
              currentReport = {
                ...currentReport,
                bytesSentVideo: report?.bytesSent ?? 0,
              };
            }
            if (report.type === "remote-inbound-rtp") {
              currentReport = {
                ...currentReport,
                roundTripTimeVideo: report?.roundTripTime ?? 0,
              };
            }
          }
          if (report.kind === "audio") {
            datos.push(report);
            if (report.type === "inbound-rtp") {
              currentReport = {
                ...currentReport,
                // jitterAudio: report?.jitter ?? 0,
                packetsLostAudio: report?.packetsLost ?? 0,
                bytesReceivedAudio: report?.bytesReceived ?? 0,
              };
            }
            if (report.type === "outbound-rtp") {
              currentReport = {
                ...currentReport,
                bytesSentAudio: report?.bytesSent ?? 0,
              };
            }
            if (report.type === "remote-inbound-rtp") {
              currentReport = {
                ...currentReport,
                roundTripTimeAudio: report?.roundTripTime ?? 0,
                jitterAudio: report?.jitter ?? 0,
              };
            }
          }
        });
        if ("connection" in navigator) {
          const connection = navigator.connection as NetworkInformation;
          console.log("[DATOS]: ", datos);
          // createMetrics({
          //   ...currentReport,
          //   networkType: connection?.effectiveType ?? "N/A",
          //   roomId,
          // });
        } else {
          console.log(
            "La Network Information API no es compatible con este navegador."
          );
        }
      })
      .catch((err) => console.error("Error getting stats:", err));
    // });
  };
  setInterval(collectMetrics, 5000); // Recolecta estadísticas cada 5 segundos

  // setTimeout(() => {
  //   clearInterval(intervalId); // Detiene el intervalo al alcanzar los 5 minutos
  //   console.log(
  //     "==== Recolección de estadísticas completada después de 5 minutos. ===="
  //   );
  //   handleClose();
  // }, 5 * 60 * 1000);
}

export async function getQoSStats(peerConnection: any) {
  if (!peerConnection) {
    console.error("No se proporcionó una conexión RTCPeerConnection.");
    return null;
  }

  const metrics = async () => {
    const statsReport = await peerConnection.getStats();
    let qosData: QoSData = {
      timestamp: Date.now(),
      network: {
        rtt: undefined,
        availableOutgoingBitrate: undefined,
        availableIncomingBitrate: undefined,
        retransmissionRate: undefined,
        packetsLost: undefined,
        transportType: undefined,
        localCandidateType: undefined,
        remoteCandidateType: undefined,
      },
      video: {
        sent: {
          bitrate: undefined,
          frameRate: undefined,
          resolution: undefined,
          packetsLost: undefined,
          framesEncoded: undefined,
          retransmittedPackets: undefined,
          codec: undefined,
        },
        received: {
          bitrate: undefined,
          frameRate: undefined,
          resolution: undefined,
          jitter: undefined,
          packetsLost: undefined,
        },
      },
      audio: {
        sent: {
          bitrate: undefined,
          packetsLost: undefined,
          codec: undefined,
          retransmittedPackets: undefined,
        },
        received: {
          bitrate: undefined,
          jitter: undefined,
          packetsLost: undefined,
        },
      },
    };

    // console.log("[INFORMES]: ",[...statsReport.entries()]);

    statsReport.forEach((report: any) => {
      // 📡 📌 MÉTRICAS DE RED (Candidate Pair)
      if (report.type === "candidate-pair" && report.nominated) {
        qosData.network = {
          rtt: report.currentRoundTripTime * 1000, // ms
          availableOutgoingBitrate: report.availableOutgoingBitrate / 1000, // kbps
          availableIncomingBitrate: report.availableIncomingBitrate / 1000, // kbps (no existe)
          retransmissionRate: report.retransmissions || 0, // Tasa de retransmisión (no existe)
          packetsLost: report.packetsLost || 0, // Paquetes perdidos (no existe)
          transportType: report.protocol, // UDP o TCP (no existe)
          localCandidateType: report.localCandidateType, // Host, Relay, Srflx, Prflx (no existe)
          remoteCandidateType: report.remoteCandidateType, // (no existe)
        };
      }

      // 🎥 📌 MÉTRICAS DE VIDEO (Salida y Entrada)
      if (report.type === "outbound-rtp" && report.kind === "video") {
        qosData.video.sent = {
          bitrate: (report.bytesSent * 8) / (report.timestamp / 1000), // kbps
          frameRate: report.framesPerSecond,
          resolution: `${report.frameWidth}x${report.frameHeight}`,
          packetsLost: report.packetsLost,
          framesEncoded: report.framesEncoded || 0, // Cantidad de frames codificados
          retransmittedPackets: report.retransmittedPacketsSent || 0, // Paquetes retransmitidos
          codec: report.codecId,
        };
      }

      if (report.type === "inbound-rtp" && report.kind === "video") {
        qosData.video.received = {
          bitrate: (report.bytesReceived * 8) / (report.timestamp / 1000), // kbps
          frameRate: report.framesPerSecond,
          resolution: `${report.frameWidth}x${report.frameHeight}`,
          jitter: report.jitter,
          packetsLost: report.packetsLost,
        };
      }

      // 🎙️ 📌 MÉTRICAS DE AUDIO (Salida y Entrada)
      if (report.type === "outbound-rtp" && report.kind === "audio") {
        qosData.audio.sent = {
          bitrate: (report.bytesSent * 8) / (report.timestamp / 1000), // kbps
          packetsLost: report.packetsLost,
          codec: report.codecId,
          retransmittedPackets: report.retransmittedPacketsSent || 0, // Paquetes retransmitidos
        };
      }

      if (report.type === "inbound-rtp" && report.kind === "audio") {
        qosData.audio.received = {
          bitrate: (report.bytesReceived * 8) / (report.timestamp / 1000), // kbps,
          jitter: report.jitter,
          packetsLost: report.packetsLost,
        };
      }
    });

    console.log("[DATA]: ", qosData);
    
    return qosData;
  };
  setInterval(metrics, 1000);
}
