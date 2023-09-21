import { redirect, type LoaderFunction, type MetaFunction, json, ActionFunction } from "@remix-run/node";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { FC, MouseEventHandler, createContext, useContext, useEffect, useState } from "react";
import {io} from 'socket.io-client'
import { checkNick, checkPass, isTeamMode, sha256, strToColor } from "~/data/utils";
import { connectToMongoDB, getMongoDB }  from '../models/mongodb';
import { toLang } from "~/data/lang";
import { getroom, players } from "~/data/types";

const debugMode = true

export const meta: MetaFunction = () => {
  return [
    { title: "MULTIRIS" },
    { name: "description", content: "Multi Modern Tetris (by MswTester)" },
  ];
};

const socket = io('localhost:3003')

const GlobalContext = createContext<any>({})

let base:boolean = false

export const action:ActionFunction = async ({request}) => {
  const form = await request.formData();
  const res = Array.from(form.entries())
  const isGuest = res.length == 1
  const isRegister = res[0][0] == 'rid'
  const tr = res.map(v => v[0] == 'password' || v[0] == 'rpassword' ? sha256(v[1] as string) : v[1])
  connectToMongoDB();
  
  // 데이터베이스 객체 얻기
  const db = getMongoDB();
  
  // 컬렉션 선택 및 데이터 작업 수행
  const collection = db.collection('users');
  console.log(isGuest, isRegister)
  if(isGuest){
    if(!checkNick(tr[0].toString())) return redirect('/login?res=condition')
    const data = await collection.findOne({nickname:tr[0]});
    if(data !== null){
      return redirect('/login?res=already')
    } else {
      base = true
      return json({ ok:true })
    }
  }
  if(!(checkNick(tr[0].toString()) && checkPass(res[1][1].toString()))) return redirect('/login?res=condition')


  // 데이터 조회 예시
  if(isRegister){
    const al = await collection.findOne({nickname:tr[0]});
    if(al){
      return redirect('/login?res=already')
    }
    const data = await collection.insertOne({nickname:tr[0], password:tr[1]});
    return redirect('/login?res=success')
  } else {
    const data = await collection.findOne({nickname:tr[0], password:tr[1]});
    // 데이터를 JSON 형식으로 반환합니다.
    if(data === null){
      return redirect('/login?res=null')
    }
    base = true
    return json({ data });
  }
}

export const loader:LoaderFunction = async () => {
  if(debugMode) return base = false
  if(!base) return redirect('/login')
  base = false
return json({ ok :true })
}


export default function Index() {
  const [lang, setLang] = useState<string>('en-US')
  const [myId, setMyId] = useState<string>('') // my socket id
  const [nickname, setNickname] = useState<string>('') // my nickname
  const [isGuest, setIsGuest] = useState<boolean>(true) // am i guest
  const [isLogined, setIsLogined] = useState<boolean>(false); // is logined
  const [isInRoom, setIsInRoom] = useState<boolean>(false) // is in room
  const [targetRoom, setTargetRoom] = useState<string>('') // room owner id
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search)
  useEffect(() => {
    const res = Array.from(queryParams.entries())
    if(res.length == 0){
      if(debugMode) return
      navigate('/login')
    } else {
      socket.on('checkNickExist', (d:boolean) => {
        if(debugMode) return
        if(d) navigate('/login?res=already')
      })
      res.length == 3 ? setIsGuest(false) : false
      socket.on('getMyId', (d:string) => {
        setMyId(d)
      })
      socket.emit('checkNickExist', res[1][1])
      socket.emit('sucLogin', res.map(v => v[1]))
      setNickname(res[1][1])
      setIsLogined(true)
    }
    setLang(navigator.language)
  }, [location.search])

  return <GlobalContext.Provider value={{
    isInRoom, setIsInRoom,
    nickname, setNickname,
    isGuest, setIsGuest,
    lang, setLang,
    myId, setMyId,
    targetRoom, setTargetRoom,
  }}>
    {isLogined ? <Lobby /> :
    <div className="b-main main">
      <div className="loading">Loading</div>
    </div>}
  </GlobalContext.Provider>
}

const lobbyMenu = ['online', 'offline', 'settings', 'credits']
const Lobby:FC = () => {
  const {lang, setLang} = useContext(GlobalContext);
  const [mainMenu, setMainMenu] = useState<number>(-1)
  const [rc_isPass, setRc_isPass] = useState<boolean>(false)
  const [rc_name, setRc_name] = useState<string>('')
  const [rc_pass, setRc_pass] = useState<string>('')
  const [rooms, setRooms] = useState<getroom[]>([])
  const [error, setError] = useState<string>('')
  const [msgbox, setMsgbox] = useState<number>(0)
  const [inputPass, setInputPass] = useState<string>('')
  const [errorPass, setErrorPass] = useState<boolean>(false)
  const {isInRoom, setIsInRoom} = useContext(GlobalContext);
  const {nickname, setNickname} = useContext(GlobalContext);
  const {isGuest, setIsGuest} = useContext(GlobalContext);
  const {targetRoom, setTargetRoom} = useContext(GlobalContext);
  const {myId, setMyId} = useContext(GlobalContext);

  useEffect(() => {
    setLang(navigator.language)
    socket.on('updateRoom', (d:getroom[]) => {
      setRooms(d)
    })

    window.addEventListener('keydown', e => {
      if(e.code == 'Escape' && !isInRoom) setMainMenu(-1)
    })
  })

  const createRoom = (e:any) => {
    if(!rc_name) return setError('enter room name')
    if(rc_name.length > 16) return setError('enter room name 16')
    if(rc_isPass && !rc_pass) return setError('enter password')
    socket.emit('createRoom', {
      name:rc_name,
      pass:rc_pass,
      ispass:rc_isPass
    })
    setTargetRoom(myId)
    setRc_isPass(false)
    setRc_pass('')
    setRc_name('')
    setIsInRoom(true)
    setMainMenu(-1)
    setMsgbox(0)
  }

  const updateRoom = ():void => {
    socket.emit('updateRoom', '')
  }

  const joinRoom = (id:string, ispass:boolean, pass:string, max:number, player:number) => {
    setTargetRoom(id)
    if(max <= player) return setMsgbox(1)
    if(ispass) return setMsgbox(2)
    socket.emit('joinRoom', id)
    setRc_isPass(false)
    setRc_pass('')
    setRc_name('')
    setIsInRoom(true)
    setMainMenu(-1)
    setMsgbox(0)
  }

  const joinRoomWithPass = () => {
    console.log(rooms,targetRoom, inputPass)
    let prrom:{[key:string]:getroom} = {}
    rooms.forEach(v => {
      prrom[v.ownerid] = v
    })
    if(prrom[targetRoom].pass == inputPass){
      socket.emit('joinRoom', prrom[targetRoom].ownerid)
      setRc_isPass(false)
      setRc_pass('')
      setRc_name('')
      setIsInRoom(true)
      setMainMenu(-1)
      setMsgbox(0)
      setInputPass('')
    } else {
      setErrorPass(true)
    }
  }

  useEffect(() => {
    setErrorPass(false)
  }, [inputPass, msgbox])
  return <div className="y-main main">
    <div className="title">MULTIRIS</div>
    <div className="container">
      {
      isInRoom ? <Room /> :
      mainMenu == -1 ? lobbyMenu.map((v,i) => (
        <div key={i} onClick={e => {setMainMenu(i);updateRoom();}}>{toLang(lang, v)}</div>
      )) : 
      mainMenu == 0 ? <div className="form">
          <div className="submenu">
            <div><input type="text" name="" id="" value={rc_name}
            onChange={e => {setRc_name(e.target.value);setError('')}} placeholder={toLang(lang, 'enter room name')} /></div>
            <div><input type="checkbox" name="" id="" checked={rc_isPass} onChange={e => {setRc_isPass(e.target.checked);setError('')}} />
            <input placeholder={toLang(lang, 'enter password')} type="password" name="" id="" value={rc_pass}
            onChange={e => {setRc_pass(e.target.value);setError('')}} disabled={!rc_isPass} /></div>
            <div><button onClick={createRoom}>{toLang(lang, 'create room')}</button></div>
            <div className="errorline">{error ? toLang(lang, error) : ''}</div>
          </div>
          <div className="contents">
            <input type="text" name="" id="" placeholder={toLang(lang, 'enter room code')} />
            <div className="rooms">
              {
                rooms.map((v, i) => (
                  v.public &&
                  <div className="room" key={i}>
                    <div className="name">{v.name}</div>
                    <div className="code">#{v.code}</div>
                    <div className="player">{v.ownerguest ? `(${toLang(lang, 'guest')})` : ''}{v.owner} - {v.player}/{v.max}</div>
                    <button onClick={e => {joinRoom(v.ownerid, v.ispass, v.pass, v.max, v.player)}}>{toLang(lang, 'join')}</button>
                  </div>
                ))
              }
            </div>
          </div>
          {
            msgbox &&
            (<><div className="back" onMouseDown={e => setMsgbox(0)}></div>
            <div className="msgbox">
              <div>{msgbox == 1 ? toLang(lang, 'room is full') : msgbox == 2 ? toLang(lang, 'enter password') : ''}</div>
              {msgbox == 2 && <div>
                <input onChange={e => setInputPass(e.target.value)} value={inputPass} type="password" name="" id="" />
                <button onClick={e => joinRoomWithPass()}>{toLang(lang, 'join')}</button>
              </div>}
              {errorPass && <div className="errorline">{toLang(lang, 'incorrect password')}</div>}
            </div></>)
          }
      </div>:
      mainMenu == 1 ? <div className="form">
          
      </div>:
      mainMenu == 2 ? <div className="form">
          
      </div>:
      mainMenu == 3 ? <div className="form">
          
      </div>:<></>
      }
    </div>
    <div className="profile">{isGuest ? `(${toLang(lang, 'guest')})` : ''}{nickname}</div>
    {(mainMenu != -1 && !isInRoom) && <div className="back" onClick={e => setMainMenu(-1)}>{toLang(lang, 'back')}</div>}
  </div>
}

const Room:FC = () => {
  const {lang, setLang} = useContext(GlobalContext);
  const [team, setTeam] = useState<string>('');
  const [gamemode, setGamemode] = useState<string>('ffa');
  const [maxplayer, setMaxplayer] = useState<number>(10);
  const [roompublic, setRoompublic] = useState<string>('public');
  const [rows, setRows] = useState<number>(10);
  const [cols, setCols] = useState<number>(20);
  const [pls, setPls] = useState<{[key:string]:players}>({});
  const {myId, setMyId} = useContext(GlobalContext);
  const {targetRoom, setTargetRoom} = useContext(GlobalContext);
  const {isInRoom, setIsInRoom} = useContext(GlobalContext);

  const exitRoom = () => {
    setIsInRoom(false)
    setTargetRoom(0)
  }

  useEffect(() => {
    if(!isTeamMode(gamemode)) setTeam('')
    if(myId == targetRoom){
      socket.emit('updateRoomSetting', {gamemode, maxplayer, roompublic, rows, cols})
    }
  }, [gamemode, maxplayer, roompublic, rows, cols])

  useEffect(() => {
    setTeam(team.replace(/[^a-zA-Z]+/g, ''))
    updatePersonalRoomSetting()
  }, [team])

  useEffect(() => {
    socket.on('updateInRoom', (d:{[key:string]:{[key:string]:any}}) => {
      if(!d[targetRoom]) return exitRoom()
      setPls(d[targetRoom]['players'])
      setRoompublic(d[targetRoom]['isPublic'] ? 'public' : 'private')
      setGamemode(d[targetRoom]['mode'])
      setRows(d[targetRoom]['rows'])
      setCols(d[targetRoom]['cols'])
      setMaxplayer(d[targetRoom]['max'])
    })
  }, [])

  const updatePersonalRoomSetting = () => {
    socket.emit('updatePersonalRoomSetting', {team, targetRoom})
  }

  return <>
    <div className="form">
      <div className="ds">
        {isTeamMode(gamemode) &&
          <div>
            {toLang(lang, 'team name')}
            <input type="text" name="" id="" value={team} onChange={e => {setTeam(e.target.value)}} />
          </div>}
      </div>
      <div className="ps">
        {
          Object.values(pls).map((v:players,i) => (
            <div key={i}>{v.team ?
              <span style={{color:strToColor(v.team)}}>[{v.team}]</span> : ''}{v.guest ? `(${toLang(lang, 'guest')})` : ''}{v.nickname}</div>
          ))
        }
      </div>
      <div className="os">
        <div>{toLang(lang, 'gamemode')}
        <select disabled={myId != targetRoom} name="" id="" value={gamemode} onChange={e => {setGamemode(e.target.value);}}>
          {['ffa', 'tdm', 'com'].map((v, i) => (
            <option value={v} key={i}>{toLang(lang, v)}</option>
          ))}
        </select></div>
        <div>{toLang(lang, 'maxplayer')}
        <input disabled={myId != targetRoom} type="number" min={2} max={20} name="" id="" value={maxplayer}
        onChange={e => {
          let n = +e.target.value
          setMaxplayer(n < 2 ? 2 : n > 20 ? 20 : n);
        }} placeholder={toLang(lang, 'maxplayer')} /></div>
        <div>{toLang(lang, 'room public setting')}
        <select disabled={myId != targetRoom} name="" id="" value={roompublic} onChange={e => {setRoompublic(e.target.value);}}>
          {['public', 'private'].map((v, i) => (
            <option value={v} key={i}>{toLang(lang, v)}</option>
            ))}
        </select></div>
        <div>{toLang(lang, 'board rows')}
        <input disabled={myId != targetRoom} type="number" min={4} max={40} name="" id="" value={rows}
        onChange={e => {
          let n = +e.target.value
          setRows(n < 4 ? 4 : n > 40 ? 40 : n);
        }} placeholder={toLang(lang, 'board rows')} /></div>
        <div>{toLang(lang, 'board cols')}
        <input disabled={myId != targetRoom} type="number" min={4} max={40} name="" id="" value={cols}
        onChange={e => {
          let n = +e.target.value
          setCols(n < 4 ? 4 : n > 40 ? 40 : n);
        }} placeholder={toLang(lang, 'board cols')} /></div>
      </div>
    </div>
    {myId == targetRoom && <button className="start">{toLang(lang, 'start')}</button>}
  </>
}