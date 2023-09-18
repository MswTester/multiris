import { MetaFunction } from "@remix-run/node";
import { Form, useLocation, useNavigate, useNavigation } from "@remix-run/react"
import { useEffect, useState } from "react"
import { toLang } from "~/data/lang"
import { sha256 } from "~/data/utils"

export const meta: MetaFunction = () => {
    return [
        { title: "MULTIRIS - Login" },
        { name: "description", content: "Multi Modern Tetris (by MswTester)" },
    ];
};

export default function Login(){
    const [lang, setLang] = useState<string>('en-US')
    const [login, setLogin] = useState<boolean>(true)
    const [acc, setAcc] = useState<boolean>(true)
    const [id, setId] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [rid, setrId] = useState<string>('')
    const [rpassword, setrPassword] = useState<string>('')
    const [nickname, setNickname] = useState<string>('')
    const [error, setError] = useState<string>('')
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search)
    useEffect(() => {
        const res = Array.from(queryParams.entries())
        if(res.length != 0){
            setAcc(true)
            setLogin(true)
            setId('')
            setPassword('')
            setrId('')
            setrPassword('')
            setNickname('')
            const resmap = res[0]
            const cond = resmap[0] == 'res' && resmap[1] == 'null'
            const condsuc = resmap[0] == 'res' && resmap[1] == 'success'
            const condregex = resmap[0] == 'res' && resmap[1] == 'condition'
            const already = resmap[0] == 'res' && resmap[1] == 'already'
            
            setError(cond ? 'cant find account' : condsuc ? 'creation success' : condregex ? 'regex failed' :
            already ? 'already used nickname' : '')
        }

        setLang(navigator.language)
    }, [location.search])
    
    const resetQuery = () => {
        setError('')
        navigate('/login')
    }
    return <>
        <div className="l-main main">
            <div className="title">MULTIRIS</div>
            {
                login ?
                acc ? <Form method="post" action={`/?index&id=${id}&password=${sha256(password)}`}>
                    <input type="text" name="id" id="" value={id}
                    onChange={e => {setId(e.target.value);resetQuery()}}/>
                    <input type="password" name="password" id="" value={password}
                    onChange={e => {setPassword(e.target.value);resetQuery()}}/>
                    <button>{toLang(lang, 'login')}</button>
                </Form> : <Form method="post" action={`/?index&nickname=${nickname}`}>
                    <input type="text" name="nickname" id="" value={nickname}
                    onChange={e => {setNickname(e.target.value);resetQuery()}}/>
                    <button>{toLang(lang, 'play')}</button>
                </Form> :
                <Form method="post" action={`/?index`}>
                    <input type="text" name="rid" id="" value={rid}
                    onChange={e => {setrId(e.target.value);resetQuery()}}/>
                    <input type="password" name="rpassword" id="" value={rpassword}
                    onChange={e => {setrPassword(e.target.value);resetQuery()}}/>
                    <button>{toLang(lang, 'register')}</button>
                </Form>
            }
            <div className="register" onClick={() => {setLogin(!login);resetQuery();setAcc(true)}}
            >{ login ? toLang(lang, 'register account') : toLang(lang, 'use account')}</div>
            {login ? <div className="desc" onClick={() => {setAcc(!acc);resetQuery()}}
            >{ acc ? toLang(lang, 'use guest profile') : toLang(lang, 'use account')}</div> : <></>}
            <div className="errorline">{error ? toLang(lang, error) : ''}</div>
        </div>
    </>
}