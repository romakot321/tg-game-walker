import user = require("user.service");
import entity = require("entity.repository");
import baseModels = require("entity.models");
import models = require("objects.models");

enum MessageEvent {
  MOVE = 0,
  ENTITY = 1,
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

interface EntityData extends MessageData {
  x: number
  y: number
  type: string
}

interface Message {
  event: MessageEvent;
  data: MoveData | InitData | EntityData | null;
}


export class ServerService {
  private connection: WebSocket | null;
  public isConnected: boolean = false;

  constructor(
        address: string,
        private userService: user.UserService,
        private entityRepository: entity.EntityRepository,
  ) {
    this.userService = userService;
    this.entityRepository = entityRepository;
    if (address.length != 0) {
      this.connection = new WebSocket('wss://' + address + "/ws")
      this.initHandlers();
    } else {
      this.connection = null;
    }
  }

  private initHandlers() {
    this.connection.onmessage = (event) => { return this.handleMessage(event) };
    this.connection.onopen = (event) => { return this.handleOpen(event) };
  }

  private sendMessage(msg: Message) {
    this.connection.send(JSON.stringify(msg));
  }

  private handleNewEntity(data: EntityData) {
    if (data.type == "box") {
      this.entityRepository.add(new models.Box(data.x, data.y));
    } else if (data.type == "wall") {
      this.entityRepository.add(new models.Wall(data.x, data.y));
    }
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

      case MessageEvent.ENTITY:
        this.handleNewEntity(message.data as EntityData);
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
    if (this.connection == null)
      return;
    let msg: Message = {event: MessageEvent.MOVE, data: {move: direction, username: username, x: x, y: y}};
    this.sendMessage(msg)
  }

  public sendPlayer(username: string, x: number, y: number): void {
    if (this.connection == null)
      return;
    let msg: Message = {event: MessageEvent.INIT, data: {x: x, y: y, username: username}};
    this.sendMessage(msg)
  }

  public sendNewEntity(entity: baseModels.Entity): void {
    if (this.connection == null)
      return;
    let msg: Message = {event: MessageEvent.ENTITY, data: {type: entity.type, x: entity.x, y: entity.y, username: ""}};
    this.sendMessage(msg);
  }
}
