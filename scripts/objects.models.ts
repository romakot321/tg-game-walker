import entity = require("entity.models");
import playerModel = require("player.models");

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
