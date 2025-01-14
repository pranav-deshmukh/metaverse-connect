export class RoomManager {
  rooms = new Map<string, string[]>();
  static instance: RoomManager;

  private constructor() {
    this.rooms = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  public removeUser(socketId: string, spaceId: string) {
    if (!this.rooms.has(spaceId)) {
      return;
    }
    
    const usersInRoom = this.rooms.get(spaceId) || [];
    const updatedUsers = usersInRoom.filter((user) => user !== socketId);

    if (updatedUsers.length > 0) {
      this.rooms.set(spaceId, updatedUsers);
    } else {
      this.rooms.delete(spaceId);
    }
    console.log(`Removed user ${socketId} from space ${spaceId}`, this.rooms);
  }

  public addUser(user: string, spaceId: string) {
    // First, remove any existing instances of this user
    // this.rooms.forEach((users, key) => {
    //   if (users.includes(user)) {
    //     this.removeUser(user, key);
    //   }
    // });

    if (!this.rooms.has(spaceId)) {
      this.rooms.set(spaceId, [user]);
      console.log(`Added user ${user} to space ${spaceId}`);
      return;
    }
    
    const existingUsers = this.rooms.get(spaceId) || [];
    if (!existingUsers.includes(user)) {
      this.rooms.set(spaceId, [...existingUsers, user]);
      console.log(`Added user ${user} to space ${spaceId}`);
    }
  }

}