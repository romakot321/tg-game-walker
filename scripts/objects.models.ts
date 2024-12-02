import entity = require("entity.models");
import playerModel = require("player.models");
import utils = require('utils');

export class Wall extends entity.Entity {
  public size: number = 50;
  static color: string = "black"
  
  constructor(x: number, y: number) {
    super(x, y, "wall");
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = Wall.color;

    ctx.beginPath();
    ctx.rect(this.x - xView, this.y - yView, this.size, this.size);
    ctx.stroke();
    ctx.closePath();
  }
}

export class Coin extends entity.Entity {
  public size: number = 15;
  static color: string = "yellow"
  
  constructor(x: number, y: number) {
    super(x, y, "coin");
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = Coin.color;

    ctx.beginPath();
    ctx.arc(this.x - xView, this.y - yView, this.size, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
  }

  resolveCollision(other: playerModel.Player): void {
    if (other.type !== "player" || this.status == entity.EntityStatus.DEAD) { return; }
    other.addCoins(1);
    this.status = entity.EntityStatus.DEAD;
    console.log("coins", other.coins);
  }
}

export class Enemy extends entity.Entity {
  public size: number = 25;
  public speed: number = 50;
  public mass: number = 0.1;
  public seeRange: number = Math.min(window.innerWidth, window.innerHeight) * 0.75;
  private followed: entity.Entity;

  static color: string = "darkred"
  
  constructor(x: number, y: number, followed: entity.Entity) {
    super(x, y, "enemy");
    this.followed = followed;
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = Enemy.color;

    ctx.beginPath();
    ctx.arc(this.x - xView, this.y - yView, this.size, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    const deltaX = this.followed.x - this.x;
    const deltaY = this.followed.y - this.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance <= this.size || distance > this.seeRange)
      return;

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    this.applyForce(new utils.Vector2D(x * this.speed, y * this.speed));
  }
}
