import { redirect, type LoaderFunction, type MetaFunction, json, ActionFunction } from "@remix-run/node";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { FC, useEffect, useState } from "react";
import {io} from 'socket.io-client'
import { checkNick, checkPass, sha256 } from "~/data/utils";
import { connectToMongoDB, getMongoDB }  from '../models/mongodb';
import { toLang } from "~/data/lang";

export const meta: MetaFunction = () => {
  return [
    { title: "Multiris" },
    { name: "description", content: "Multi Modern Tetris (by MswTester)" },
  ];
};
const socket = io(process.env.SOCKET as string)

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
      return redirect('login?res=already')
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
  if(!base) return redirect('/login')
  base = false
  return json({ ok :true })
}


export default function Index() {
  const [lang, setLang] = useState<string>('en-US')
  const [isLogined, setIsLogined] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search)
  useEffect(() => {
    const res = Array.from(queryParams.entries())
    if(res.length == 0){
      navigate('/login')
    } else {
      socket.on('checkNickExist', (d:boolean) => {
        if(d) navigate('/login?res=already')
      })
      socket.emit('checkNickExist', res[1][1])
      socket.emit('sucLogin', res.map(v => v[1]))
      setIsLogined(true)
    }
    setLang(navigator.language)
  }, [location.search])

  return (
    isLogined ? <Lobby /> :
    <div className="b-main main">
      <div className="loading">Loading</div>
    </div>
  );
}

const lobbyMenu = ['online', 'offline', 'settings', 'credits']
const Lobby:FC = () => {
  const [lang, setLang] = useState<string>('en-US')
  const [mainMenu, setMainMenu] = useState<number>(-1)
  useEffect(() => {
    setLang(navigator.language)
  })
  return <div className="y-main main">
    <div className="title">MULTIRIS</div>
    <div className="container">
      {mainMenu == -1 ? lobbyMenu.map((v,i) => (
        <div key={i} onClick={e => {setMainMenu(i)}}>{toLang(lang, v)}</div>
      )) : <div className="form"></div>}
    </div>
  </div>
}
