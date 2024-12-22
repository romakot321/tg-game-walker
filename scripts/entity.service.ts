import models = require('objects.models');
import entity = require("entity.models");
import utils = require("utils");
import repository = require("entity.repository");
import animation = require("animation.repository");


export class EntityService {
  constructor(
      private entityRepository: repository.EntityRepository,
      private animationRepository: animation.AnimationRepository,
  ) {

  }

  tick(delta: number): entity.Entity[] {
    var entities = this.entityRepository.getList();

    for (const element of entities) {
      element.update(delta);
      if (element.status == entity.EntityStatus.DEAD) {
        if (element.type == "coin")
          this.generateCoin(element.x, element.y);
        this.entityRepository.delete(element);
        this.addEntityPopAnimation(element);
      }
    }

    return entities;
  }

  resolveCollisions(collideEntities: entity.Entity[]): void {
    var entities = this.entityRepository.getList();

    for (const element of collideEntities) {
      for (const entity of entities) {
        if (entity.checkCollision(element)) {
          entity.resolveCollision(element);
        }
      }
    }
  }

  add(model: entity.Entity): void {
    this.entityRepository.add(model);
  }

  private generateCoin(centerX, centerY) {
    let entity = new models.Coin(
      utils.getRandomNumber(Math.max(0, centerX - window.innerWidth), centerX + window.innerWidth),
      utils.getRandomNumber(Math.max(0, centerY - window.innerHeight), centerY + window.innerHeight)
    )
    this.entityRepository.add(entity);
  }

  private addEntityPopAnimation(e: entity.Entity) {
    const animation = entity.PopAnimation.fromEntity(e);
    this.animationRepository.add(animation);
  }
}
