// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS, so the client can connect from a different port (Vite dev server)
const io = new Server(server, {
  cors: {
    origin: "*",        // or replace with your client address
    methods: ["GET", "POST"]
  }
});

// This will hold the drawing steps that have happened so far.
let boardData = [];

/**
 * When a client connects:
 *  - Send the existing board data to the new client.
 *  - Listen for "draw" and "clear" events, and broadcast to all clients.
 */
io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // Send existing board data to the newly connected client
  socket.emit('init', boardData);

  // Listen for draw events from this client
  socket.on('draw', (data) => {
    // Add this draw action to our in-memory array
    boardData.push(data);
    // Broadcast to all clients (including the sender)
    io.emit('draw', data);
  });

  // Listen for clear events
  socket.on('clear', () => {
    // Reset the board data
    boardData = [];
    // Notify all connected clients to clear their boards
    io.emit('clear');
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
