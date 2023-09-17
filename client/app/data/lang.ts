const langs:{[key:string]:{[key:string]:string}} = {
    'use guest profile':{
        'ko':'만약 계정이 없다면, 게스트 프로필을 사용하세요.',
        'en':'If you don\'t have any accounts, use guest profile.'
    },
    'use account':{
        'ko':'이미 계정이 있다면, 로그인 하세요.',
        'en':'If you already have yours, login to your account.'
    },
    'register account':{
        'ko':'계정 생성',
        'en':'Create Account'
    },
    'play':{
        'ko':'플레이',
        'en':'Play'
    },
    'login':{
        'ko':'로그인',
        'en':'Login'
    },
    'register':{
        'ko':'회원가입',
        'en':'Register'
    },
    'cant find account':{
        'ko':'계정의 아이디나 비밀번호를 찾을 수 없습니다.',
        'en':'Can\'t find account\'s id or password.',
    },
    'creation success':{
        'ko':'성공적으로 계정이 생성되었습니다.',
        'en':'Your account has been successfully created.',
    },
    'regex failed':{
        'ko':'아이디는 영문, 숫자, _(밑줄), 한글, 공백을 포함한 3~12자 이내로 작성해주세요.\n비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상 작성해주세요.',
        'en':'Please input an ID within 3 to 12 characters that includes English, numbers, _,  and spaces.\nPassword should be 8 characters or more with a combination of English, numbers, and special characters.',
    },
    'online':{
        'ko':'온라인',
        'en':'ONLINE',
    },
    'offline':{
        'ko':'오프라인',
        'en':'OFFLINE',
    },
    'settings':{
        'ko':'설정',
        'en':'SETTINGS',
    },
    'credits':{
        'ko':'크레딧',
        'en':'CREDITS',
    },
    'already used nickname':{
        'ko':'이미 사용된 닉네임입니다.',
        'en':'This nickname is already used.',
    },
}

export function toLang(lang:string, data:string){
    return langs[data][lang.replace(/-\w+/, '')]
}

export const lang = 'en-US'