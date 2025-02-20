// src/main.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); 
// If you run the server in a different host/port, adjust accordingly.

// Get references to HTML elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clearBtn");

// To track drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = colorPicker.value;

// Listen for color changes
colorPicker.addEventListener("change", () => {
  currentColor = colorPicker.value;
});

// Mouse events to start/stop drawing and track cursor location
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  // When user moves the mouse while drawing,
  // we send a "draw" event to the server instead of drawing immediately.
  const x = e.offsetX;
  const y = e.offsetY;

  // Prepare the drawing data
  const drawData = {
    start: { x: lastX, y: lastY },
    end: { x, y },
    color: currentColor
  };

  // Emit the draw data to the server
  socket.emit("draw", drawData);

  // Update last mouse position
  [lastX, lastY] = [x, y];
});

// Clear board button
clearBtn.addEventListener("click", () => {
  socket.emit("clear");
});

// -----------------------------
// SOCKET.IO EVENT HANDLERS
// -----------------------------

// 1. On initial connection, server sends the existing board data
socket.on("init", (boardData) => {
  // Clear the canvas before replaying
  clearCanvas();
  // Replay all existing draw actions
  boardData.forEach((data) => {
    drawOnCanvas(data);
  });
});

// 2. Server says "draw" => actually draw on our canvas
socket.on("draw", (data) => {
  drawOnCanvas(data);
});

// 3. Server says "clear" => clear our canvas
socket.on("clear", () => {
  clearCanvas();
});

function drawOnCanvas(data) {
  // data: { start: {x,y}, end: {x,y}, color: '#xxxxxx' }
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 2; // Set line width or make it dynamic as an enhancement
  ctx.beginPath();
  ctx.moveTo(data.start.x, data.start.y);
  ctx.lineTo(data.end.x, data.end.y);
  ctx.stroke();
  ctx.closePath();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
