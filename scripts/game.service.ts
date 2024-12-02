import entityModels = require('entity.models');
import models = require('objects.models');
import entity = require('entity.service');
import player = require('player.models');
import user = require("user.service");
import drawer = require("drawer.service");
import joystick = require("joystick");
import utils = require("utils");


export class GameService {
  private currentUserEntity: player.Player;
  private lastUpdate: number;
  private pressedKeys: Set<string>;
  private animations: entityModels.Animation[];
  protected userService: user.UserService;
  protected drawerService: drawer.DrawerService;
  protected entityService: entity.EntityService;
  protected joystick: joystick.Joystick;

  constructor(userService, entityService, drawerService) {
    this.currentUserEntity = new player.Player(
      drawerService.widthView / 2,
      drawerService.heightView / 2,
    );
    this.userService = userService;
    this.entityService = entityService;
    this.drawerService = drawerService;

    this.pressedKeys = new Set<string>();
    this.animations = [];
    this.joystick = new joystick.Joystick(document.getElementById("joystick"));

    this.initListeners();
  }

  private handleJoystickChange(): void {
    const directionVector = this.joystick.direction.multiply(this.currentUserEntity.speed);
    this.currentUserEntity.applyForce(directionVector);
  }

  private handleKeypress(): void {
    for (let key of this.pressedKeys) {
      switch (key) {
        case 'w':
          this.currentUserEntity.move('u');
          break;
        case 'a':
          this.currentUserEntity.move('l');
          break;
        case 's':
          this.currentUserEntity.move('d');
          break;
        case 'd':
          this.currentUserEntity.move('r');
          break;
      }
    }
  }

  private initListeners(): void {
    document.body.addEventListener('keyup', (event: KeyboardEvent) => {
      if (this.pressedKeys.has(event.key)) {
        this.pressedKeys.delete(event.key);
      }
    });
    document.body.addEventListener('keydown', (event: KeyboardEvent) => {
      this.pressedKeys.add(event.key);
    });
  }

  private initUpdator() {
    this.lastUpdate = performance.now();
    this.drawerService.setCameraFollower(this.currentUserEntity);
    this.tick();
  }

  private addEntityPopAnimation(entity: entityModels.Entity) {
    const animation = entityModels.PopAnimation.fromEntity(entity);
    this.animations.push(animation);
  }

  private deleteAnimation(animation: entityModels.Animation): void {
    for (const el of this.animations) {
      if (animation == el) {
        this.animations.splice(this.animations.indexOf(el, 0), 1);
        return;
      }
    }
  }

  private generateCoin() {
    let entity = new models.Coin(
      utils.getRandomNumber(Math.max(0, this.currentUserEntity.x - window.innerWidth), this.currentUserEntity.x + window.innerWidth),
      utils.getRandomNumber(Math.max(0, this.currentUserEntity.y - window.innerHeight), this.currentUserEntity.y + window.innerHeight)
    )
    this.entityService.add(entity);
  }

  private tick() {
    this.handleKeypress();
    this.handleJoystickChange();

    var entities = this.entityService.getList();
    entities = entities.concat(this.userService.getList());
    entities = entities.concat([this.currentUserEntity]);

    const delta = (performance.now() - this.lastUpdate) / 1000;
    for (const element of entities) {
      element.update(delta);
      if (element.status == entityModels.EntityStatus.DEAD) {
        if (element.type == "coin")
          this.generateCoin();
        this.entityService.delete(element);
        this.addEntityPopAnimation(element);
      }
      if (element.checkCollision(this.currentUserEntity) && element != this.currentUserEntity) {
        element.resolveCollision(this.currentUserEntity);
      }
    }
    for (const element of this.animations) {
      element.update(delta);
      if (element.status == entityModels.AnimationStatus.FINISHED)
        this.deleteAnimation(element);
    }

    this.drawerService.update();
    this.drawerService.draw(entities, this.animations);

    requestAnimationFrame(() => {
      this.tick();
    });
    this.lastUpdate = performance.now();
  }

  start() {
    this.initUpdator();
    let enemy = new models.Enemy(500, 500, this.currentUserEntity);
    this.entityService.add(enemy);
  }
}
