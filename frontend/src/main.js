// src/main.js
import { io } from 'socket.io-client';

// Connect to the server (adjust if your server is on a different host/port)
const socket = io("http://localhost:3000");

// Grab references to HTML elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clearBtn");

// Variables to track drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = colorPicker.value;

// Listen for color changes
colorPicker.addEventListener("change", () => {
  currentColor = colorPicker.value;
});

// Mouse events to start/stop drawing and track cursor position
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;  // also stop if the mouse leaves the canvas
});
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  // We do NOT draw directly here; we send an event to the server
  const drawData = {
    start: { x: lastX, y: lastY },
    end: { x, y },
    color: currentColor
  };
  socket.emit("draw", drawData);

  [lastX, lastY] = [x, y];
});

// Clear button
clearBtn.addEventListener("click", () => {
  socket.emit("clear");
});

// -----------------------------
// SOCKET.IO EVENT HANDLERS
// -----------------------------

// On init, the server sends the entire board's drawing history
socket.on("init", (boardData) => {
  clearCanvas();
  boardData.forEach((data) => {
    drawOnCanvas(data);
  });
});

// When the server broadcasts "draw", actually draw it locally
socket.on("draw", (data) => {
  drawOnCanvas(data);
});

// When the server broadcasts "clear", clear your local canvas
socket.on("clear", () => {
  clearCanvas();
});

// -----------------------------
// HELPER FUNCTIONS
// -----------------------------

function drawOnCanvas(data) {
  // data: { start: {x, y}, end: {x, y}, color: '#xxxxxx' }
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 2;  // or make it dynamic if you want
  ctx.beginPath();
  ctx.moveTo(data.start.x, data.start.y);
  ctx.lineTo(data.end.x, data.end.y);
  ctx.stroke();
  ctx.closePath();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
