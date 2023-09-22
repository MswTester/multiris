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

interface players{[key:string]:{
  nickname:string; // nickname
  guest:boolean; // is guest
  boardId:number; // using board's id
  team:string; // team name
}}

interface board{
  id:number; // index 0
  map:number[][]; // tetris map
}

interface rooms{[key:string]:{
  name:string; // room name
  password:string; // room password
  usePassword:boolean; // is room us password
  code:string; // room code
  isPublic:boolean; // is room public
  rows:number; // tetris map rows
  cols:number; // tetris map cols
  max:number; // max player
  mode:string; // game mode
  status:number; // 0 = waiting, 1 = playing
  boards:board[]; // tetris map boards
  players:players; // player object
}}

const port = 3003

let users:users = {}

let rooms:rooms = {}
//
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
    socket.emit('getMyId', socket.id)
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
        pass:v.password,
        ispass:v.usePassword,
        code:v.code,
        max:v.max,
        public:v.isPublic,
        player:Object.keys(v.players).length,
        owner:users[Object.keys(rooms)[i]].nickname,
        ownerguest:users[Object.keys(rooms)[i]].guest,
        ownerid:Object.keys(rooms)[i],
      }
    })
    socket.emit('updateRoom', rssend)
    socket.broadcast.emit('updateRoom', rssend)
  }

  const updateInRoom = () => {
    socket.emit('updateInRoom', rooms)
    socket.broadcast.emit('updateInRoom', rooms)
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
      mode:'ffa',
      status:0,
      boards:[],
      players:{}
    };
    (rooms[socket.id].players)[socket.id] = {
      nickname:users[socket.id].nickname,
      guest:users[socket.id].guest,
      boardId:-1,
      team:''
    }
    updateGlobalRoom()
    updateInRoom()
  })
  socket.on('updateRoom', () => {
    updateGlobalRoom()
  })

  socket.on('joinRoom', (d:string) => {
    rooms[d].players[socket.id] = {
      nickname:users[socket.id].nickname,
      guest:users[socket.id].guest,
      boardId:-1,
      team:''
    }
    updateGlobalRoom()
    updateInRoom()
  })

  socket.on('updateRoomSetting', (d) => {
    let thisRoom = rooms[socket.id]
    thisRoom.isPublic = d['roompublic'] == 'public'
    thisRoom.rows = d['rows']
    thisRoom.cols = d['cols']
    thisRoom.mode = d['gamemode']
    thisRoom.max = d['maxplayer']
    updateGlobalRoom()
    updateInRoom()
  })

  socket.on('updatePersonalRoomSetting', (d) => {
    let thisRoom = rooms[d['targetRoom']]
    thisRoom.players[socket.id].team = d['team']
    updateInRoom()
  })
  
  socket.on('startGame', (d) => {
    let thisRoom = rooms[socket.id]
    thisRoom.status = 1
    let map:number[][] = []
    for(let j = 0; j < thisRoom.cols; j++){
      let ar:number[] = []
      for(let k = 0; k < thisRoom.rows; k++){
        ar.push(0)
      }
      map.push(ar)
    }
    if(thisRoom.mode == 'com'){
      let teams:string[] = []
      Object.values(thisRoom.players).forEach((v,i) => {
        teams.includes(v.team) || teams.push(v.team)
      })
      teams.forEach((v:string, i:number) => {
        thisRoom.boards.push({id:i, map:[...map]})
        Object.keys(thisRoom.players).forEach((v2, i2) => {
          thisRoom.players[v2].team == v && (thisRoom.players[v2].boardId = i)
        })
      })
    } else {
      Object.keys(thisRoom.players).forEach((v,i) => {
        thisRoom.boards.push({id:i, map:[...map]})
        thisRoom.players[v].boardId = i
      })
    }

    socket.emit('startGame', rooms)
    socket.broadcast.emit('startGame', rooms)
  })

  socket.on('disconnect', e => {
    Object.values(rooms).forEach((v,i) => {
      if(Object.keys(v.players).includes(socket.id)){
        delete v.players[socket.id]
      }
    })
    delete users[socket.id]
    delete rooms[socket.id]
    updateGlobalRoom()
    updateInRoom()
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