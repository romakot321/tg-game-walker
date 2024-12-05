import user = require("user.service");

enum MessageEvent {
  MOVE = 0,
  INIT = 99,
}

interface MessageData {
  username: string
}

interface MoveData extends MessageData {
  move: 'l' | 'r' | 'd' | 'u'
  x: number
  y: number
}

interface InitData extends MessageData {
  x: number
  y: number
}

interface Message {
  event: MessageEvent;
  data: MoveData | InitData | null;
}


export class ServerService {
  private connection: WebSocket;
  protected userService: user.UserService;
  public isConnected: boolean = false;

  constructor(address: string, userService: user.UserService) {
    this.connection = new WebSocket('wss://' + address + "/ws")
    this.userService = userService;

    this.initHandlers();
  }

  private initHandlers() {
    this.connection.onmessage = (event) => { return this.handleMessage(event) };
    this.connection.onopen = (event) => { return this.handleOpen(event) };
  }

  private sendMessage(msg: Message) {
    this.connection.send(JSON.stringify(msg));
  }

  private handleMessage(event) {
    console.log("Message", event.data);
    let message: Message = JSON.parse(event.data);
    switch(message.event) {
      case MessageEvent.MOVE:
        if (!this.userService.update(message.data as MoveData)) {
          this.userService.add({x: 0, y: 0, username: message.data.username})
        }
        break;

      default:
        console.log("Unknown event:", message);
        break;
    }
  }

  private handleOpen(event) {
    console.log("Connected")
    this.isConnected = true;
  }

  public sendPlayerMove(username: string, direction: 'l' | 'r' | 'u' | 'd', x: number, y: number): void {
    let msg: Message = {event: MessageEvent.MOVE, data: {move: direction, username: username, x: x, y: y}};
    this.sendMessage(msg)
  }

  public sendPlayer(username: string, x: number, y: number): void {
    let msg: Message = {event: MessageEvent.INIT, data: {x: x, y: y, username: username}};
    this.sendMessage(msg)
  }
}
