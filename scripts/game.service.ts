import entityModels = require('entity.models');
import models = require('objects.models');
import entity = require('entity.service');
import player = require('player.models');
import user = require("user.service");
import drawer = require("drawer.service");
import joystick = require("joystick");
import utils = require("utils");
import server = require("server.service");


export class GameService {
  private currentUserEntity: player.Player;
  private lastUpdate: number;
  private pressedKeys: Set<string>;
  private animations: entityModels.Animation[];
  protected userService: user.UserService;
  protected drawerService: drawer.DrawerService;
  protected entityService: entity.EntityService;
  protected serverService: server.ServerService;
  protected joystick: joystick.Joystick;
  protected wallButton: HTMLElement;

  constructor(username: string, userService, entityService, drawerService, serverService) {
    this.currentUserEntity = new player.Player(
      100,
      100,
      username
    );
    this.userService = userService;
    this.entityService = entityService;
    this.drawerService = drawerService;
    this.serverService = serverService;

    this.pressedKeys = new Set<string>();
    this.animations = [];
    this.joystick = new joystick.Joystick(document.getElementById("joystick"));
    this.wallButton = document.getElementById("wall-button");

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
          this.serverService.sendPlayerMove(this.currentUserEntity.username, 'u', this.currentUserEntity.x, this.currentUserEntity.y);
          break;
        case 'a':
          this.currentUserEntity.move('l');
          this.serverService.sendPlayerMove(this.currentUserEntity.username, 'l', this.currentUserEntity.x, this.currentUserEntity.y);
          break;
        case 's':
          this.currentUserEntity.move('d');
          this.serverService.sendPlayerMove(this.currentUserEntity.username, 'd', this.currentUserEntity.x, this.currentUserEntity.y);
          break;
        case 'd':
          this.currentUserEntity.move('r');
          this.serverService.sendPlayerMove(this.currentUserEntity.username, 'r', this.currentUserEntity.x, this.currentUserEntity.y);
          break;
      }
    }
  }

  private handleCursorMove(event: MouseEvent | TouchEvent) {
    if (!this.pressedKeys.has("click"))
      return;
    if (window.TouchEvent && event instanceof TouchEvent) {
      var cursorX = event.touches[0].clientX;
      var cursorY = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      var cursorX = event.pageX;
      var cursorY = event.pageY;
    }

    for (let animation of this.animations) {
      if (animation instanceof entityModels.PlaceAnimation) {
        if (this.currentUserEntity.coins < 5)
          animation.onError()
        animation.x = (cursorX + this.drawerService.xView - (cursorX + this.drawerService.xView) % 50) - this.drawerService.xView;
        animation.y = (cursorY + this.drawerService.yView - (cursorY + this.drawerService.yView) % 50) - this.drawerService.yView;
        break;
      }
    }
  }

  private handleCursorPressed(event: MouseEvent | TouchEvent) {
    if (this.pressedKeys.has("click"))
      return;

    if (window.TouchEvent && event instanceof TouchEvent) {
      var cursorX = event.touches[0].clientX;
      var cursorY = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      var cursorX = event.pageX;
      var cursorY = event.pageY;
    }

    var wallButtonRect = this.wallButton.getBoundingClientRect();
    if (!utils.checkPointInRect({x: cursorX, y: cursorY}, wallButtonRect))
      return;
    this.wallButton.style.visibility = "hidden";

    this.pressedKeys.add("click");

    var anim = new entityModels.PlaceAnimation(0, 0, 50)
    anim.x = (cursorX + this.drawerService.xView - (cursorX + this.drawerService.xView) % 50) - this.drawerService.xView;
    anim.y = (cursorY + this.drawerService.yView - (cursorY + this.drawerService.yView) % 50) - this.drawerService.yView;
    if (this.currentUserEntity.coins < 5)
      anim.onError()

    this.animations.push(anim);
  }

  private handleCursorRelease(event: MouseEvent | TouchEvent) {
    if (!this.pressedKeys.has("click"))
      return;
    this.pressedKeys.delete("click");
    this.wallButton.style.visibility = "visible";

    var placeX = 0, placeY = 0;
    for (let animation of this.animations) {
      if (animation instanceof entityModels.PlaceAnimation) {
        placeX = animation.x + this.drawerService.xView;
        placeY = animation.y + this.drawerService.yView;
        this.animations.splice(this.animations.indexOf(animation, 0), 1);
        break;
      }
    }

    if (this.currentUserEntity.coins >= 5) {
      var wall = new models.Wall(placeX, placeY)
      this.entityService.add(wall);
      this.currentUserEntity.addCoins(-5);
    }
  }

  private initListeners(): void {
    document.body.addEventListener('keyup', (event: KeyboardEvent) => {
      if (this.pressedKeys.has(event.key))
        this.pressedKeys.delete(event.key);
    });
    document.body.addEventListener('keydown', (event: KeyboardEvent) => {
      this.pressedKeys.add(event.key);
    });

    document.body.addEventListener('mousedown', this.handleCursorPressed.bind(this));
    document.body.addEventListener('mouseup', this.handleCursorRelease.bind(this));
    document.body.addEventListener('mousemove', this.handleCursorMove.bind(this));
    document.body.addEventListener('touchstart', this.handleCursorPressed.bind(this));
    document.body.addEventListener('touchend', this.handleCursorRelease.bind(this));
    document.body.addEventListener('touchmove', this.handleCursorMove.bind(this));
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
    var users = this.userService.getList();
    entities = entities.concat();
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
      if (element == this.currentUserEntity)
        continue
      if (element.checkCollision(this.currentUserEntity)) {
        element.resolveCollision(this.currentUserEntity);
      }
      users.forEach((u) => { if (element.checkCollision(u)) { element.resolveCollision(u) } });
    }
    for (const user of users) {
      user.update(delta);
    }
    for (const element of this.animations) {
      element.update(delta);
      if (element.status == entityModels.AnimationStatus.FINISHED)
        this.deleteAnimation(element);
    }

    this.drawerService.update();
    this.drawerService.draw(entities.concat(users), this.animations);

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
