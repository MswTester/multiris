import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Rooms, Users } from 'src/types';
import { Server, Socket } from 'socket.io'

@WebSocketGateway(80, {
  namespace: 'index',
  cors: {origin:'*'},
})

export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  users:Users = {}
  rooms:Rooms = {}

  constructor() {}

  generateRandomUpperCaseString(length: number): string{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters.charAt(randomIndex);
      result += randomCharacter;
    }
  
    return result;
  }

  updateGlobalRoom(client:Socket){
    let rssend = Object.values(this.rooms).map((v,i) => {
      return {
        name:v.name,
        pass:v.password,
        ispass:v.usePassword,
        code:v.code,
        max:v.max,
        public:v.isPublic,
        player:Object.keys(v.players).length,
        owner:this.users[Object.keys(this.rooms)[i]].nickname,
        ownerguest:this.users[Object.keys(this.rooms)[i]].guest,
        ownerid:Object.keys(this.rooms)[i],
      }
    })
    client.emit('updateRoom', rssend)
    client.broadcast.emit('updateRoom', rssend)
  }

  updateInRoom = (client:Socket) => {
    client.emit('updateInRoom', this.rooms)
    client.broadcast.emit('updateInRoom', this.rooms)
  }
  
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket
    ): string {
    return data;
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Server Initiallation ✅');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    Object.values(this.rooms).forEach((v,i) => {
      if(Object.keys(v.players).includes(client.id)){
        delete v.players[client.id]
      }
    })
    delete this.users[client.id]
    delete this.rooms[client.id]
    this.updateGlobalRoom(client)
    this.updateInRoom(client)
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
    client.emit('conn', client.id)
    client.on('sucLogin', (d:string[]) => {
    if(!Object.values(this.users).map(v => v.nickname).includes(d[1])){
      this.users[client.id] = {nickname:d[1], guest:d.length == 2}
      console.log(this.users)
    }
    client.emit('getMyId', client.id)
  })

  client.on('checkNickExist', e => {
    const nicks = Object.values(this.users).map(v => v.nickname)
    const ids = Object.keys(this.users)
    client.emit('checkNickExist', nicks.includes(e) && client.id != ids[nicks.indexOf(e)])
  })

  client.on('createRoom', (d:{[key:string]:any}) => {
    this.rooms[client.id] = {
      name:d.name,
      password:d.pass,
      usePassword:d.ispass,
      code:this.generateRandomUpperCaseString(4),
      isPublic:true,
      rows:10,
      cols:20,
      max:10,
      mode:'ffa',
      status:0,
      boards:[],
      players:{}
    };
    (this.rooms[client.id].players)[client.id] = {
      nickname:this.users[client.id].nickname,
      guest:this.users[client.id].guest,
      boardId:-1,
      team:''
    }
    this.updateGlobalRoom(client)
    this.updateInRoom(client)
  })
  client.on('updateRoom', () => {
    this.updateGlobalRoom(client)
  })

  client.on('joinRoom', (d:string) => {
    this.rooms[d].players[client.id] = {
      nickname:this.users[client.id].nickname,
      guest:this.users[client.id].guest,
      boardId:-1,
      team:''
    }
    this.updateGlobalRoom(client)
    this.updateInRoom(client)
  })

  client.on('updateRoomSetting', (d) => {
    let thisRoom = this.rooms[client.id]
    thisRoom.isPublic = d['roompublic'] == 'public'
    thisRoom.rows = d['rows']
    thisRoom.cols = d['cols']
    thisRoom.mode = d['gamemode']
    thisRoom.max = d['maxplayer']
    this.updateGlobalRoom(client)
    this.updateInRoom(client)
  })

  client.on('updatePersonalRoomSetting', (d) => {
    let thisRoom = this.rooms[d['targetRoom']]
    thisRoom.players[client.id].team = d['team']
    this.updateInRoom(client)
  })

  client.on('startGame', (d) => {
    let thisRoom = this.rooms[client.id]
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

    client.emit('startGame', this.rooms)
    client.broadcast.emit('startGame', this.rooms)
  })
  }
}