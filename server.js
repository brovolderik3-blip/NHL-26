'use strict';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: false }, maxHttpBufferSize: 1e6 });
const PORT = process.env.PORT || 3000;
const rooms = new Map();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size }));
function makeCode(){ let c; do { c = Math.random().toString(36).slice(2,8).toUpperCase(); } while (rooms.has(c)); return c; }
function cleanRoom(code){ const r=rooms.get(code); if(r && !r.host && !r.guest) rooms.delete(code); }
io.on('connection', socket => {
  socket.on('create-room', () => {
    if(socket.data.room) return;
    const code=makeCode(); rooms.set(code,{host:socket.id,guest:null,started:false});
    socket.data.room=code; socket.data.role='host'; socket.join(code);
    socket.emit('room-created',{code});
  });
  socket.on('join-room', payload => {
    const code=String(payload?.code||'').trim().toUpperCase(); const room=rooms.get(code);
    if(!room){socket.emit('room-error',{message:'Room not found. Check the code and try again.'});return;}
    if(room.guest && room.guest!==socket.id){socket.emit('room-error',{message:'That room already has two players.'});return;}
    if(room.host===socket.id){socket.emit('room-error',{message:'You are already the host of this room.'});return;}
    room.guest=socket.id; socket.data.room=code; socket.data.role='guest'; socket.join(code);
    socket.emit('room-joined',{code}); io.to(room.host).emit('peer-joined');
  });
  socket.on('start-game', data => {
    const room=rooms.get(socket.data.room); if(!room || room.host!==socket.id || !room.guest) return;
    room.started=true; io.to(room.guest).emit('game-start',data);
  });
  socket.on('player-input', data => {
    const room=rooms.get(socket.data.room); if(!room || !room.started || room.guest!==socket.id) return;
    io.to(room.host).emit('player-input',data);
  });
  socket.on('player-action', data => {
    const room=rooms.get(socket.data.room); if(!room || !room.started || room.guest!==socket.id) return;
    const allowed=['shoot','pass','hit','switch']; if(!allowed.includes(data?.action)) return;
    io.to(room.host).emit('player-action',{action:data.action,yaw:Number(data.yaw)||0});
  });
  socket.on('state', data => {
    const room=rooms.get(socket.data.room); if(!room || room.host!==socket.id || !room.started) return;
    io.to(room.guest).emit('state',data);
  });
  socket.on('disconnect', () => {
    const code=socket.data.room; if(!code) return; const room=rooms.get(code); if(!room)return;
    if(room.host===socket.id){if(room.guest)io.to(room.guest).emit('peer-left');rooms.delete(code);}
    else if(room.guest===socket.id){room.guest=null;room.started=false;if(room.host)io.to(room.host).emit('peer-left');cleanRoom(code);}
  });
});
server.listen(PORT,'0.0.0.0',()=>console.log(`NHL 26 online server running on port ${PORT}`));
