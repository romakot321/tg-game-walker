export class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get normalized(): Vector2D {
    const magnitude = this.magnitude;
    return new Vector2D(this.x / magnitude, this.y / magnitude);
  }

  get angles(): number {
		return -Math.atan2(-this.y, this.x);
  }

  get length(): number {
		return Math.sqrt(this.dot(this));
  }
    
	angleTo(a: Vector2D): number  {
		return Math.acos(this.dot(a) / (this.length * a.length));
  }
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
