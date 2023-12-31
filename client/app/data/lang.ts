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
    'enter room name':{
        'ko':'방 이름을 입력해주세요.',
        'en':'Enter your room name.',
    },
    'enter room name 16':{
        'ko':'방 이름을 16자 이내로 입력해주세요.',
        'en':'Enter your room name within 16 characters.',
    },
    'enter password':{
        'ko':'비밀번호를 입력해주세요.',
        'en':'Enter your room password.',
    },
    'create room':{
        'ko':'방 생성',
        'en':'Create room',
    },
    'enter room code':{
        'ko':'방 코드를 입력하여 참여하세요.',
        'en':'Enter a room code to join.',
    },
    'join':{
        'ko':'참가',
        'en':'Join',
    },
    'back':{
        'ko':'뒤로',
        'en':'Back',
    },
    'gamemode':{
        'ko':'게임모드',
        'en':'GameMode',
    },
    'ffa':{
        'ko':'개인전',
        'en':'Free For All',
    },
    'tdm':{
        'ko':'팀 데스매치',
        'en':'Team Deathmatch',
    },
    'com':{
        'ko':'코어 매치',
        'en':'Core Match',
    },
    'maxplayer':{
        'ko':'최대 플레이어',
        'en':'Max Player',
    },
    'room public setting':{
        'ko':'방 공개 설정',
        'en':'Room Public Settings',
    },
    'public':{
        'ko':'공개',
        'en':'Public',
    },
    'private':{
        'ko':'비공개',
        'en':'Private',
    },
    'board rows':{
        'ko':'보드 가로줄',
        'en':'Board Rows',
    },
    'board cols':{
        'ko':'보드 세로줄',
        'en':'Board Columns',
    },
    'guest':{
        'ko':'게스트',
        'en':'Guest',
    },
    'room is full':{
        'ko':'방의 인원이 가득 찼습니다.',
        'en':'Room is full.',
    },
    'incorrect password':{
        'ko':'잘못된 비밀번호입니다.',
        'en':'Incorrect password.',
    },
    'team name':{
        'ko':'팀 이름',
        'en':'Team Name',
    },
    'start':{
        'ko':'시작',
        'en':'Start',
    },
    'players less':{
        'ko':'시작을 위한 플레이어가 부족합니다.',
        'en':'Not enough players to start.',
    },
    'all players have team':{
        'ko':'모든 플레이어가 팀에 참가해야 합니다.',
        'en':'All players must join the team.',
    },
    'at least 2 team':{
        'ko':'시작하려면 적어도 두 개의 팀이 필요합니다.',
        'en':'You need at least two teams to start.',
    },
}

export function toLang(lang:string, data:string){
    return langs[data][lang.replace(/-\w+/, '')]
}

export const lang = 'en-US'