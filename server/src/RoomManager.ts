export class RoomManager{
    rooms = new Map();
    static instance:RoomManager;
    //singleton pattern

    private constructor(){
        this.rooms = new Map();
    }
    static getInstance(){
        if(!this.instance){
            this.instance=new RoomManager();
        }
        return this.instance;
    }
    public removeUser(user, spaceId){
        if(!this.rooms.has(spaceId)){
            return;
        }
        this.rooms.set(spaceId,(this.rooms.get(spaceId).filter((u)=>u.id!==user.id)??[]));
    }
    public addUser(user, spaceId){
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId,[user]);
            return;
        }
        this.rooms.set(spaceId,[...(this.rooms.get(spaceId)??[]), user])
    }
}