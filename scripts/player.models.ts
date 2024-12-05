import entity = require("entity.models");
import utils = require("utils");

var coinsElement = document.getElementById("coins")


export class Player extends entity.Entity {
  public coins: number;
  public username: string;
  static color: string = "darkgreen";

  constructor(x: number, y: number, username: string) {
    super(x, y, "player");

    this.coins = 0;
    this.username = username;
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = "darkgreen";
    ctx.fillStyle = "green";

    ctx.beginPath();
    ctx.arc(this.x - xView, this.y - yView, this.size, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  addCoins(value: number): void {
    this.coins += value;
    coinsElement.innerText = this.coins + "c";
  }

  applyUpdate(direction: 'l' | 'r' | 'u' | 'd' | null, x: number | null, y: number | null) {
    if (direction != null)
      this.move(direction);
    if (x != null && y != null) {
      var delta = Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y))
      if (delta > this.size) {
        this.x = x;
        this.y = y;
      }
    }
  }
}
