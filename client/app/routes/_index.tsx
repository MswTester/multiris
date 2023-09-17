import { redirect, type LoaderFunction, type MetaFunction, json, ActionFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {io} from 'socket.io-client'

export const meta: MetaFunction = () => {
  return [
    { title: "Multiris" },
    { name: "description", content: "Multi Modern Tetris (by MswTester)" },
  ];
};

export const action:ActionFunction = async ({request}) => {
  const form = await request.formData();
  console.log(form.get('login'))
  return json({ok:true})
}

export const loader:LoaderFunction = async () => {
  console.log('loader')
  if(Math.random() > 0.5){
    return redirect('/login');
  }
  return json({ ok :true })
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 style={{fontFamily:'Anton'}}>Welcome to Remix</h1>
      <ul>
        <li>
          <Link to="/login">로그인 화면</Link>
        </li>
      </ul>
    </div>
  );
}
