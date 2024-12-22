import entityModels = require('entity.models');
import models = require('objects.models');
import entity = require('entity.service');
import animation = require('animation.repository');
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
  protected joystick: joystick.Joystick;
  protected wallButton: HTMLElement;

  constructor(
        username: string,
        protected userService: user.UserService,
        protected entityService: entity.EntityService,
        protected animationRepository: animation.AnimationRepository,
        protected drawerService: drawer.DrawerService,
        protected serverService: server.ServerService
  ) {
    this.currentUserEntity = new player.Player(
      100,
      100,
      username
    );

    this.pressedKeys = new Set<string>();
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

    var placeAnimations = this.animationRepository.getPlaceAnimations();
    for (let animation of placeAnimations) {
      if (this.currentUserEntity.coins < 5)
        animation.onError()
      animation.x = (cursorX + this.drawerService.xView - (cursorX + this.drawerService.xView) % 50) - this.drawerService.xView;
      animation.y = (cursorY + this.drawerService.yView - (cursorY + this.drawerService.yView) % 50) - this.drawerService.yView;
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
    this.joystick.disable();

    this.pressedKeys.add("click");

    var anim = new entityModels.PlaceAnimation(0, 0, 50)
    anim.x = (cursorX + this.drawerService.xView - (cursorX + this.drawerService.xView) % 50) - this.drawerService.xView;
    anim.y = (cursorY + this.drawerService.yView - (cursorY + this.drawerService.yView) % 50) - this.drawerService.yView;
    if (this.currentUserEntity.coins < 5)
      anim.onError()

    this.animationRepository.add(anim)
  }

  private handleCursorRelease(event: MouseEvent | TouchEvent) {
    if (!this.pressedKeys.has("click"))
      return;
    this.pressedKeys.delete("click");
    this.wallButton.style.visibility = "visible";
    this.joystick.enable();

    var placeX = 0, placeY = 0;
    for (let animation of this.animationRepository.getList()) {
      if (animation instanceof entityModels.PlaceAnimation) {
        placeX = animation.x + this.drawerService.xView;
        placeY = animation.y + this.drawerService.yView;
        this.animationRepository.delete(animation);
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

  private tick() {
    this.handleKeypress();
    this.handleJoystickChange();

    const delta = (performance.now() - this.lastUpdate) / 1000;
    console.log(1 / delta);
    var entities = this.entityService.tick(delta);
    var users = this.userService.getList();
    users = users.concat([this.currentUserEntity]);

    for (const element of users) {
      element.update(delta);
    }
    this.entityService.resolveCollisions(users);
    var animations = this.animationRepository.tick(delta)

    this.drawerService.update();
    this.drawerService.draw(entities.concat(users), animations);

    requestAnimationFrame(() => {
      this.tick();
    });
    this.lastUpdate = performance.now();
  }

  start() {
    this.initUpdator();
  }
}
