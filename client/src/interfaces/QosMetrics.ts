interface NetworkStats {
    rtt?: number; // Tiempo de ida y vuelta (ms)
    availableOutgoingBitrate?: number; // Ancho de banda saliente (kbps)
    availableIncomingBitrate?: number; // Ancho de banda entrante (kbps)
    retransmissionRate?: number; // Tasa de retransmisión
    packetsLost?: number; // Paquetes perdidos
    transportType?: string; // Tipo de transporte (UDP, TCP)
    localCandidateType?: string; // Tipo de candidato local (host, relay, srflx, prflx)
    remoteCandidateType?: string; // Tipo de candidato remoto
  }
  
  interface VideoStats {
    bitrate?: number; // Tasa de bits (kbps)
    frameRate?: number; // Cuadros por segundo (fps)
    resolution?: string; // Resolución (ej: "1280x720")
    packetsLost?: number; // Paquetes perdidos
    framesEncoded?: number; // Frames codificados
    retransmittedPackets?: number; // Paquetes retransmitidos
    codec?: string; // Códec utilizado
  }
  
  interface AudioStats {
    bitrate?: number; // Tasa de bits (kbps)
    packetsLost?: number; // Paquetes perdidos
    codec?: string; // Códec utilizado
    retransmittedPackets?: number; // Paquetes retransmitidos
  }
  
  interface ReceivedVideoStats {
    bitrate?: number; // Tasa de bits recibidos (kbps)
    frameRate?: number; // Cuadros por segundo recibidos (fps)
    resolution?: string; // Resolución recibida (ej: "1280x720")
    jitter?: number; // Jitter (variación en el tiempo de llegada)
    packetsLost?: number; // Paquetes perdidos
  }
  
  interface ReceivedAudioStats {
    bitrate?: number; // Tasa de bits recibidos (kbps)
    jitter?: number; // Jitter (variación en el tiempo de llegada)
    packetsLost?: number; // Paquetes perdidos
  }
  
export interface QoSData {
    timestamp: number; // Marca de tiempo (ms)
    network: NetworkStats; // Métricas de red
    video: {
      sent?: VideoStats; // Métricas de video enviado
      received: ReceivedVideoStats; // Métricas de video recibido
    };
    audio: {
      sent?: AudioStats; // Métricas de audio enviado
      received: ReceivedAudioStats; // Métricas de audio recibido
    };
  }