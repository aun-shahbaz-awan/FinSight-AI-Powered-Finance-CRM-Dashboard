import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (userId?: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      auth: {
        userId,
      },
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};