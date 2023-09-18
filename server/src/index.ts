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

interface users{[key:string]:{
  nickname:string;
  guest:boolean;
  [key:string]:any;
}}

interface player{[key:string]:{

}}

interface board{

}

interface rooms{[key:string]:{
  name:string;
  password:string;
  usePassword:boolean;
  code:string;
  isPublic:boolean;
  rows:number;
  cols:number;
  max:number;
  mode:number;
  status:number;
  boards:board[];
  players:player[];
}}


const port = 3003

let users:users = {}

let rooms:rooms = {}

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

  const updateGlobalRoom = () => {
    let rssend = Object.values(rooms).map((v,i) => {
      return {
        name:v.name,
        code:v.code,
        max:v.max,
        player:v.players.length,
        owner:users[Object.keys(rooms)[i]].nickname
      }
    })
    socket.emit('updateRoom', rssend)
    socket.broadcast.emit('updateRoom', rssend)
  }

  socket.on('createRoom', (d:{[key:string]:any}) => {
    rooms[socket.id] = {
      name:d.name,
      password:d.pass,
      usePassword:d.ispass,
      code:generateRandomUpperCaseString(4),
      isPublic:true,
      rows:10,
      cols:20,
      max:10,
      mode:0,
      status:0,
      boards:[],
      players:[]
    }
    updateGlobalRoom()
  })
  socket.on('updateRoom', () => {
    updateGlobalRoom()
  })

  socket.on('disconnect', e => {
    delete users[socket.id]
    delete rooms[socket.id]
    updateGlobalRoom()
    console.log(users)
  })
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

function generateRandomUpperCaseString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters.charAt(randomIndex);
    result += randomCharacter;
  }

  return result;
}