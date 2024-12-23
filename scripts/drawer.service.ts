import entity = require("entity.models");
import models = require("objects.models");
import entityRep = require("entity.repository");
import utils = require("utils");


export class DrawerService {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private camera: {x: number, y: number}
  private followed: entity.Entity | null;
  private backgroundImage;
  private background: Map<number, string>;

  constructor(private entityRepository: entityRep.EntityRepository) {
    let canvas = document.getElementById('canvas') as
                 HTMLCanvasElement;
    let context = canvas.getContext("2d");
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 1;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';


    this.canvas = canvas;
    this.context = context;

    this.camera = {x: 0, y: 0};
    this.followed = null;
    this.backgroundImage = new Image();
    this.backgroundImage.src = 'resources/background.png';
    this.background = new Map<number, string>();
  }

  get xView(): number {
    return this.camera.x;
  }
  set xView(value: number) {
    this.camera.x = value;
  }

  get yView(): number {
    return this.camera.y;
  }
  set yView(value: number) {
    this.camera.y = value;
  }

  get widthView(): number {
    return this.canvas.width;
  }

  get heightView(): number {
    return this.canvas.height;
  }

  get xCells(): number {
    return this.widthView / 128;
  }
  get yCells(): number {
    return this.heightView / 128;
  }

  setCameraFollower(entity): void {
    this.followed = entity;
  }

  update() {
    if (this.followed.x - this.camera.x + this.widthView / 2 > this.widthView)
      this.xView = this.followed.x - this.widthView / 2;
    else if (this.followed.x - this.widthView < this.xView)
      this.xView = this.followed.x - this.widthView / 2;

    if (this.followed.y - this.yView + this.heightView > this.heightView)
      this.yView = this.followed.y - this.heightView / 2;
    else if (this.followed.y - this.heightView < this.yView)
      this.yView = this.followed.y - this.heightView / 2;

    if (this.xView < 0)
      this.xView = 0;
    if (this.yView < 0)
      this.yView = 0;
  }

  private generateStructures(chunkX: number, chunkY: number): void {
    var seed = utils.getRandomNumber(1, 100);
    if (seed < 50) {
      return;
    } else if (seed <= 100) {
      var box = new models.Box(
        utils.getRandomNumber(chunkX * 128 * this.xCells, (chunkX + 1) * 128 * this.xCells),
        utils.getRandomNumber(chunkY * 128 * this.yCells, (chunkY + 1) * 128 * this.yCells)
      );
      this.entityRepository.add(box);
    }
  }

  private generateBackground(chunkX: number, chunkY: number): string {
    let cached = this.background.get(chunkY * 1000 + chunkX);
    if (cached !== undefined) {
      return cached;
    }
    console.log("generate chunk");

    let current = "";
    for (let i = 0; i < (this.canvas.width / 128) * (this.canvas.height / 128); i++) {
      current += utils.getRandomNumber(0, 3);
    }
    this.background.set(chunkY * 1000 + chunkX, current);

    this.generateStructures(chunkX, chunkY);

    return current;
  }

  drawBackground() {
    const yCells = this.canvas.height / 128;
    const xCells = this.canvas.width / 128;
    const chunkX = Math.floor(this.followed.x / 128 / xCells);
    const chunkY = Math.floor(this.followed.y / 128 / yCells);
    this.generateBackground(chunkX, chunkY);

    for (let row = chunkX - 1; row <= chunkX + 1; row++) {
      for (let column = chunkY - 1; column <= chunkY + 1; column++) {
        for (let i = 1 * row; i < xCells * (row + 1); i++) {
          for (let j = 1 * column; j < yCells * (column + 1); j++) {
            this.context.save();
            this.context.translate(i * 128 - this.xView, j * 128 - this.yView);
            this.context.drawImage(this.backgroundImage, -64, -64, 128, 128);
            this.context.restore();
          }
        }
      }
    }
  }

  draw(entities: entity.Entity[], animations: entity.Animation[]) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    entities.forEach((el) => {
      el.draw(this.context, this.xView, this.yView);
    });
    animations.forEach(el => {
      el.draw(this.context, this.xView, this.yView);
    });
    this.context.closePath();
  }
}
