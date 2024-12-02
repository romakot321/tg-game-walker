import entity = require("entity.models");

var coinsElement = document.getElementById("coins")


export class Player extends entity.Entity {
  public coins: number;
  static color: string = "darkgreen";

  constructor(x: number, y: number) {
    super(x, y, "player");

    this.coins = 0;
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
}
