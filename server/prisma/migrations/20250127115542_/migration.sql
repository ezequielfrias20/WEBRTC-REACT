-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "peerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
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

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metrics" ADD CONSTRAINT "Metrics_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
