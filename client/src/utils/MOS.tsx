export function calculateMOS(latency: number, packetLoss: number, jitter: number) {
    const maxR = 93.2;
    const R = maxR - (latency / 100 + packetLoss + jitter);
  
    const MOS = 1 + 0.035 * R + 7.10 * Math.pow(10, -3) * R * (R - 60) * (100 - R);
  
    // Limitar el MOS entre 1 y 5
    return Math.max(1, Math.min(5, MOS));
  }
  