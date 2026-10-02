const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user room for targeted notifications
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    // Join complaint room for live ticket tracking
    socket.on('join_complaint_room', (complaintId) => {
      if (complaintId) {
        socket.join(`complaint:${complaintId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined complaint room: complaint:${complaintId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('[Socket.IO] Socket has not been initialized yet!');
  }
  return io;
};

module.exports = { initSocket, getIO };
