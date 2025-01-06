-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "callId" TEXT NOT NULL,
    "jitterVideo" DOUBLE PRECISION NOT NULL,
    "packetsLostVideo" DOUBLE PRECISION NOT NULL,
    "bytesReceivedVideo" DOUBLE PRECISION NOT NULL,
    "bytesSentVideo" DOUBLE PRECISION NOT NULL,
    "roundTripTimeVideo" DOUBLE PRECISION NOT NULL,
    "jitterAudio" DOUBLE PRECISION NOT NULL,
    "packetsLostAudio" DOUBLE PRECISION NOT NULL,
    "bytesReceivedAudio" DOUBLE PRECISION NOT NULL,
    "bytesSentAudio" DOUBLE PRECISION NOT NULL,
    "roundTripTimeAudio" DOUBLE PRECISION NOT NULL,
    "networkType" TEXT,

    CONSTRAINT "Metrics_pkey" PRIMARY KEY ("id")
);
