import React, { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

function CreateRoomButton() {
  const { ws } = useContext(RoomContext);

  const createRoom = () => {
    ws.emit("create-room", {
      name: "hola",
    });
  };
  return (
    <button
      onClick={createRoom}
      className="bg-rose-400 px-6 py-4 rounded-lg text-xl hover:bg-rose-600 text-white"
    >
      Nueva llamada
    </button>
  );
}

export default CreateRoomButton;
