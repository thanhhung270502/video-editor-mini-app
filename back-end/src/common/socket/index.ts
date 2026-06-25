import { Server } from 'socket.io';

export const initializeSocket = (io: Server): void => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join_task', (taskId: string) => {
      if (taskId) {
        socket.join(taskId);
        console.log(`[Socket] Client ${socket.id} joined task room: ${taskId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
