import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected with id:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });
  }

  return socket;
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user_room', userId);
  }
};

export const joinComplaintRoom = (complaintId) => {
  const s = getSocket();
  if (s && complaintId) {
    s.emit('join_complaint_room', complaintId);
  }
};

export default getSocket;
