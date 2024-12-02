import entityModels = require('entity.models');
import entity = require('entity.service');
import player = require('player.models');
import user = require("user.service");
import drawer = require("drawer.service");


export class GameService {
  private currentUserEntity: player.Player;
  private lastUpdate: number;
  private pressedKeys: Set<string>;
  private animations: entityModels.Animation[];
  protected userService: user.UserService;
  protected drawerService: drawer.DrawerService;
  protected entityService: entity.EntityService;


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

    this.initListeners();
  }

  private handleKeypress() {
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

  private tick() {
    this.handleKeypress();

    var entities = this.entityService.getList();
    entities = entities.concat(this.userService.getList());
    entities = entities.concat([this.currentUserEntity]);

    const delta = (performance.now() - this.lastUpdate) / 1000;
    for (const element of entities) {
      element.update(delta);
      if (element.status == entityModels.EntityStatus.DEAD) {
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
  }
}
