import utils = require("utils");

export enum EntityStatus {
  ALIVE = 0,
  DEAD = 1,
};

export class Entity {
  public size: number = 20;
  public speed: number = 1500;
  public mass: number = 1;
  public damping: number = 5.0;
  public x: number;
  public y: number;
  public velocity: utils.Vector2D;
  public acceleration: utils.Vector2D;
  public type: string;
  public status: EntityStatus;

  static color: string = "black";

  constructor(x: number, y: number, type: string) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.velocity = new utils.Vector2D(0, 0);
    this.acceleration = new utils.Vector2D(0, 0);
    this.status = EntityStatus.ALIVE;
  }

  get isCircle(): boolean {
    return this.type != "wall" && this.type != "box";
  }

  get isRect(): boolean {
    return this.type == "wall" || this.type == "box";
  }

  get isCollectable(): boolean {
    return this.type == "coin";
  }

  get centerx(): number {
    return this.isCircle ? this.x + this.size : this.x + this.size;
  }
  get centery(): number {
    return this.isCircle ? this.y + this.size : this.y + this.size;
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = Entity.color;

    ctx.beginPath();
    ctx.arc(this.x - xView, this.y - yView, this.size, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
  }

  applyForce(force: utils.Vector2D) {
    if (this.acceleration.x == 0) {
      this.acceleration.x = force.x / this.mass;
    }
    if (this.acceleration.y == 0) {
      this.acceleration.y = force.y / this.mass;
    }
  }

  update(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
    this.velocity = this.velocity.multiply(Math.max(0, 1 - this.damping * deltaTime));

    this.acceleration = this.acceleration.multiply(0);
  }

  move(direction: 'r' | 'l' | 'u' | 'd'): void {
    var force: utils.Vector2D;
    switch(direction) {
      case 'r':
        force = new utils.Vector2D(this.speed, 0);
        break;
      case 'l':
        force = new utils.Vector2D(-this.speed, 0);
        break;
      case 'd':
        force = new utils.Vector2D(0, this.speed);
        break;
      case 'u':
        force = new utils.Vector2D(0, -this.speed);
        break;
    }

    this.applyForce(force);
  }

  private checkCircleCollision(other: Entity | Animation): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    );
    return distance <= this.size + other.size;
  }

  private checkRectCollision(other: Entity | Animation): boolean {
    return (
      this.x < other.x + other.size &&
      this.x + this.size > other.x &&
      this.y < other.y + other.size &&
      this.y + this.size > other.y
    );
  }

  static checkRectWithCircleCollision(rect: Entity | Animation, circle: Entity | Animation): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
    const distance = Math.sqrt((circle.x - closestX) ** 2 + (circle.y - closestY) ** 2);

    return distance <= circle.size;
    // Проверка пересечения прямоугольника и круга
    const dx = Math.abs(rect.centerx - circle.centerx);
    const dy = Math.abs(rect.centery - circle.centery);

    if (dx > rect.size / 2 + circle.size || dy > rect.size / 2 + circle.size) {
      return false;
    }

    if (dx <= rect.size / 2 || dy <= rect.size / 2) {
      return true;
    }

    const cornerDistance_sq =
      Math.pow(dx - rect.size / 2, 2) + Math.pow(dy - rect.size / 2, 2);

    return cornerDistance_sq <= Math.pow(circle.size, 2);
  }

  checkCollision(other: Entity | Animation): boolean {
    if (this.isCircle && other.isCircle) { return this.checkCircleCollision(other) }
    if (this.isRect && other.isRect) { return this.checkRectCollision(other) }
    if (this.isRect && other.isCircle) { return Entity.checkRectWithCircleCollision(this, other) }
    if (other.isRect && this.isCircle) { return Entity.checkRectWithCircleCollision(other, this) }
  }

  resolveCollision(other: Entity): void {
    const dx = other.centerx - this.centerx;
    const dy = other.centery - this.centery;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const nx = dx / distance;
    const ny = dy / distance;

    const relativeVelocity = this.velocity.subtract(other.velocity);

    // Вычисление импульса столкновения
    const j =
      (-(1 + 0.5) * (nx * relativeVelocity.x + ny * relativeVelocity.y)) /
      ((1 / this.mass) + (1 / other.mass));

    if (this.isRect) {
      other.velocity.x -= (j / other.mass) * nx;
      other.velocity.y -= (j / other.mass) * ny;
    } else {
      this.velocity.x += (j / this.mass) * nx;
      this.velocity.y += (j / this.mass) * ny;
      other.velocity.x -= (j / other.mass) * nx;
      other.velocity.y -= (j / other.mass) * ny;
    }

    if (this.isCircle) {
      const overlap = this.size + other.size - distance;
      other.x += nx * overlap * 0.5;
      other.y += ny * overlap * 0.5;
    } else {

      const closestX = Math.max(this.x, Math.min(other.x, this.x + this.size));
      const closestY = Math.max(this.y, Math.min(other.y, this.y + this.size));
      const dx = other.x - closestX;
      const dy = other.y - closestY;
      other.x += dx * 0.03;
      other.y += dy * 0.03;
    }
  }
}

export enum AnimationForm {
  rect = 0,
  circle = 1
};

export enum AnimationStatus {
  STARTED = 0,
  FINISHED = 1
};

export class Animation {
  public x: number;
  public y: number;
  public size: number;
  public speed: number = 100;
  public form: AnimationForm;
  public color: string;
  public status: AnimationStatus;

  protected startSize: number;

  constructor(x: number, y: number, size: number, form: AnimationForm, color: string) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.form = form;
    this.color = color;

    this.status = AnimationStatus.STARTED;
    this.startSize = size;
  }

  get isCircle(): boolean { return this.form == AnimationForm.circle; }
  get isRect(): boolean { return this.form == AnimationForm.rect; }

  get centerx(): number { return this.x + this.size; }
  get centery(): number { return this.y + this.size; }

  static fromEntity(entity: Entity): Animation {
    var form: AnimationForm;
    if (entity.isCircle)
      form = AnimationForm.circle;
    else if (entity.isRect)
      form = AnimationForm.rect;
    return new this(entity.x, entity.y, entity.size, form, "black");
  }

  update(deltaTime: number): void {
    throw "Not implemented";
  }

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    ctx.strokeStyle = this.color;

    ctx.beginPath();
    if (this.form == AnimationForm.circle)
      ctx.arc(this.x - xView, this.y - yView, this.size, 0, 2 * Math.PI, false);
    else if (this.form == AnimationForm.rect)
      ctx.rect(this.x - xView, this.y - yView, this.size, this.size);
    ctx.stroke();
    ctx.closePath();
  }
}

export class PopAnimation extends Animation {
  update(deltaTime: number): void {
    if (this.status == AnimationStatus.FINISHED) { return; }

    this.size += this.speed * deltaTime;
    this.x += this.speed * deltaTime * 0.5;
    this.y += this.speed * deltaTime * 0.5;
    if (this.size / this.startSize >= 2) 
      this.status = AnimationStatus.FINISHED;
  }
}

export class PlaceAnimation extends Animation {
  private static dragColor: string = "#1010aa"
  private static errorColor: string = "#aa1010"

  constructor(x: number, y: number, size: number) {
    super(x, y, size, AnimationForm.rect, PlaceAnimation.dragColor);
  }

  onError(): void {
    this.color = PlaceAnimation.errorColor;
  }
  onNormal(): void {
    this.color = PlaceAnimation.dragColor;
  }

  update(deltaTime: number): void {}

  draw(ctx: CanvasRenderingContext2D, xView: number, yView: number): void {
    super.draw(ctx, 0, 0)
  }
}
