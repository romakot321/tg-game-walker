import models = require('player.models');

export interface User {
  first_name: string;
  last_name: string;
  username: string;
  score: number;
  telegram_id: number;
}

export interface UserUpdate {
  move: 'l' | 'r' | 'd' | 'u' | null
  x: number | null
  y: number | null
  username: string
}

export interface UserAdd {
  username: string
  x: number
  y: number
}

var users: models.Player[] = [];

export class UserService {
  protected baseUrl = "https://eramir.ru/api";
  private currentUsername: string;

  constructor(username: string) {
    this.currentUsername = username;
  }

  getList(): models.Player[] {
    return users;
  }

  add(schema: UserAdd): void {
    var model: models.Player = new models.Player(100, 100, schema.username);
    model.velocity.x = 0;
    model.velocity.y = 0;
    users.push(model);
  }

  update(schema: UserUpdate): boolean {
    if (schema.username === this.currentUsername) { return true; }
    for(let u of users) {
      if (u.username === schema.username) {
        u.applyUpdate(schema.move, schema.x, schema.y);
        return true;
      }
    }
    return false;
  }
}
