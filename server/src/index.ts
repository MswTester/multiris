import express from 'express';
import http from 'http';
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('server is running');
});

io.on('connection', (socket) => {
  console.log(`user connected:${socket.id}`);
});

server.listen(3001, () => {
  console.log('listening on *:3000');
});