const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(__dirname));

// Store rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`📱 User ${socket.id} joined room: ${roomId}`);
    
    // Notify others in room
    socket.to(roomId).emit('user-joined', { userId: socket.id });
  });

  socket.on('offer', ({ roomId, offer }) => {
    console.log(`📡 Offer sent in room: ${roomId}`);
    socket.to(roomId).emit('offer', { roomId, offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`📡 Answer sent in room: ${roomId}`);
    socket.to(roomId).emit('answer', { roomId, answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { roomId, candidate });
  });

  socket.on('chat-message', ({ roomId, message, sender }) => {
    console.log(`💬 Message in ${roomId}: ${message}`);
    socket.to(roomId).emit('chat-message', { roomId, message, sender });
  });

  socket.on('user-typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user-typing', { roomId, isTyping });
  });

  socket.on('user-left', ({ roomId }) => {
    socket.to(roomId).emit('user-left', { roomId });
    socket.leave(roomId);
    console.log(`👋 User ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 URL: http://localhost:${PORT}
  📱 Share this URL with others on the same network
  `);
});