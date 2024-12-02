import models = require('objects.models');
import entity = require("entity.models");


export class EntityService {
  private entities: entity.Entity[] = [
    new models.Coin(30, 100),
    new models.Coin(100, 100),
    new models.Wall(500, 500),
    new models.Wall(500, 450),
    new models.Wall(500, 400),
    new models.Wall(500, 350),
    new models.Wall(500, 300),
  ];

  getList(): entity.Entity[] {
    return this.entities;
  }

  delete(entity: entity.Entity): boolean {
    for (const el of this.entities) {
      if (entity == el) {
        this.entities.splice(this.entities.indexOf(el, 0), 1);
        return true;
      }
    }
    return false;
  }
}
