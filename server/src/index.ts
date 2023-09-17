import express from 'express';
import http from 'http';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors:{
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*'
  }
});

const port = 3003

let users:{[key:string]:{
  nickname:string;
  guest:boolean;
  [key:string]:any;
}} = {}

app.get('/', (req, res) => {
  res.send('server is running');
});

io.on('connection', (socket) => {
  socket.emit('conn', socket.id)
  console.log(`user connected:${socket.id}`);
  socket.on('sucLogin', (d:string[]) => {
    if(!Object.values(users).map(v => v.nickname).includes(d[1])){
      users[socket.id] = {nickname:d[1], guest:d.length == 2}
      console.log(users)
    }
  })

  socket.on('checkNickExist', e => {
    const nicks = Object.values(users).map(v => v.nickname)
    const ids = Object.keys(users)
    socket.emit('checkNickExist', nicks.includes(e) && socket.id != ids[nicks.indexOf(e)])
  })

  socket.on('disconnect', e => {
    delete users[socket.id]
    console.log(users)
  })
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});