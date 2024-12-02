import models = require('player.models');

export interface User {
  first_name: string;
  last_name: string;
  username: string;
  score: number;
  telegram_id: number;
}

export class UserService {
  protected baseUrl = "https://eramir.ru/api";

  getList(): models.Player[] {
    return [];
  }
}
