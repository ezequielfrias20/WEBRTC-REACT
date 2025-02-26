// import { Socket } from "socket.io";
// // @ts-ignore
// import prisma from "../config/db.config";

// interface IRoomParams {
//     roomId: string;
//     peerId:string
// }

// export const roomHandler = (socket: Socket) => {
//     const createroom = async () => {
//         // const roomId = uuidV4();
//         // rooms[roomId] = [];
//         const response = await prisma.room.create({
//             data: {}
//         });
//         console.log("room c: ", response)
//         socket.emit('room-created', {
//             roomId: response?.id
//         })
//         console.log('user created the room');
//     };
//     const joinroom = async ({ roomId, peerId }: IRoomParams) => {
//         const room = await prisma.room.findUnique({
//             where: {
//               id: roomId, // Aquí se pasa el ID que quieres buscar
//             },
//             include: {
//                 participants: true, // Incluir la relación con los participantes
//             },
//           });
//         if (room) {
//             console.log('user joined the room: ', roomId, peerId);
//             if (!(room.participants.some((i: any) => i?.peerId === peerId))) {
//                 const participant = await prisma.participant.create({
//                     data: {
//                         peerId,
//                         roomId,
//                     }
//                 });
//                 room.participants = [...room.participants, participant]
//             }

//             socket.join(roomId);
//             socket.emit('get-users', {
//                 roomId,
//                 participants: room.participants
//             })

//             socket.to(roomId).emit("user-joined", { peerId, roomId });
//         }

//         socket.on('disconnect', () => {
//             console.log(`user left the room`, peerId);
//             leaveRoom({roomId, peerId})
//         })

//     };

//     const leaveRoom = async ({roomId, peerId}: IRoomParams) => {
//         try {
//             const participant = await prisma.participant.findFirst({
//                 where: {
//                     peerId,
//                     roomId,
//                 },
//               });
//             if (participant) {
//                 await prisma.participant.delete({
//                     where: {
//                         id: participant.id,
//                     },
//                 });
//                 socket.to(roomId).emit('user-disconnected', peerId)
//             } else (
//                 console.log('[room no existe]', roomId)
//             )
//         } catch (error) {
//             console.log(error)
//         }


//     }
//     socket.on("create-room", createroom);
//     socket.on("join-room", joinroom);
// }

import { Socket } from "socket.io";
import {v4 as uuidV4} from 'uuid';

const rooms: Record<string, string[]> = {}

interface IRoomParams {
    roomId: string;
    peerId:string
}

export const roomHandler = (socket: Socket) => {
    const createroom = () => {
        const roomId = uuidV4();
        rooms[roomId] = [];
        socket.emit('room-created', {
            roomId
        })
        console.log('user created the room');
    };
    const joinroom = ({ roomId, peerId }: IRoomParams) => {
        if (rooms[roomId]) {
            console.log('user joined the room: ', roomId, peerId);
            if (!(rooms[roomId].includes(peerId))) {
                rooms[roomId].push(peerId)
            }
            socket.join(roomId);
            socket.emit('get-users', {
                roomId,
                participants: rooms[roomId]
            })

            socket.to(roomId).emit("user-joined", { peerId, roomId });
        }

        socket.on('disconnect', () => {
            console.log(`user left the room`, peerId);
            leaveRoom({roomId, peerId})
        })

    };

    const leaveRoom = ({roomId, peerId}: IRoomParams) => {
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
            socket.to(roomId).emit('user-disconnected', peerId)
        } else (
            console.log('[room no existe]', roomId)
        )

    }
    socket.on("create-room", createroom);
    socket.on("join-room", joinroom);
}