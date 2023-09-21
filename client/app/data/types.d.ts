export interface getroom{
    name:string;
    pass:string;
    ispass:boolean;
    code:string;
    player:number;
    max:number;
    owner:string;
    ownerid:string;
    ownerguest:boolean;
    public:boolean;
}

export interface players{nickname:string;guest:boolean;boardId:number;team:string;}