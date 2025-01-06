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
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
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
        let currentReport = {};
        stats.forEach((report: any) => {
          if (report.kind === "video") {
            if (report.type === "inbound-rtp") {
              currentReport = {
                ...currentReport,
                jitterVideo: report?.jitter,
                packetsLostVideo: report?.packetsLost,
                bytesReceivedVideo: report?.bytesReceived,
              };
            }
            if (report.type === "outbound-rtp") {
              currentReport = {
                ...currentReport,
                bytesSentVideo: report?.bytesSent,
              };
            }
            if (report.type === "remote-inbound-rtp") {
              currentReport = {
                ...currentReport,
                roundTripTimeVideo: report?.roundTripTime,
              };
            }
          }
          if (report.kind === "audio") {
            if (report.type === "inbound-rtp") {
              currentReport = {
                ...currentReport,
                jitterAudio: report?.jitter,
                packetsLostAudio: report?.packetsLost,
                bytesReceivedAudio: report?.bytesReceived,
              };
              if (report.type === "outbound-rtp") {
                currentReport = {
                  ...currentReport,
                  bytesSentAudio: report?.bytesSent,
                };
              }
              if (report.type === "remote-inbound-rtp") {
                currentReport = {
                  ...currentReport,
                  roundTripTimeAudio: report?.roundTripTime,
                };
              }
            }
          }
        });
        console.log("[METRICAS A ENVIAR]: ", currentReport);
        if ('connection' in navigator) {
          const connection = navigator.connection as NetworkInformation;
          createMetrics({ ...currentReport, networkType: connection?.effectiveType ?? "N/A", callId: roomId });
        } else {
          console.log('La Network Information API no es compatible con este navegador.');
        }
        
      })
      .catch((err) => console.error("Error getting stats:", err));
    // });
  }
  const intervalId = setInterval(collectMetrics, 5000); // Recolecta estadísticas cada 5 segundos

  setTimeout(() => {
    clearInterval(intervalId); // Detiene el intervalo al alcanzar los 5 minutos
    console.log(
      "==== Recolección de estadísticas completada después de 5 minutos. ===="
    );
    handleClose();
  }, 10 * 1000);
}
