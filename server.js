// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// Enable CORS so the client (Vite dev server) can connect
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// This will hold all the drawing steps
let boardData = [];

io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // Send existing board data to the newly connected client
  socket.emit('init', boardData);

  // Listen for draw events
  socket.on('draw', (data) => {
    boardData.push(data);
    io.emit('draw', data);  // broadcast to everyone
  });

  // Listen for clear events
  socket.on('clear', () => {
    boardData = [];         // reset in-memory array
    io.emit('clear');       // tell all clients to clear
  });

  socket.on('disconnect', () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});
