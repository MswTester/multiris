
export interface Users{[key:string]:{
    nickname:string;
    guest:boolean;
    [key:string]:any;
}}

export interface Players{[key:string]:{
    nickname:string; // nickname
    guest:boolean; // is guest
    boardId:number; // using board's id
    team:string; // team name
}}

export interface Board{
    id:number; // index 0
    map:number[][]; // tetris map
}

export interface Rooms{[key:string]:{
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
    boards:Board[]; // tetris map boards
    players:Players; // player object
}}
  