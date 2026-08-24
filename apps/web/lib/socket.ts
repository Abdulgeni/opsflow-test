import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    console.log("Creating socket connection to:", process.env.NEXT_PUBLIC_API_URL);
    socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      autoConnect: true,
    });
  }
  return socket;
}