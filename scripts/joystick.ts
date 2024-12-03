import utils = require("utils");


export class Joystick {
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private threshold: number = 20; // Minimum distance for a swipe to be considered
  private joystickElement: HTMLElement;
  private joystickCenterX: number;
  private joystickCenterY: number;
  private joystickRadius: number = 25; // Radius of the joystick
  private isTouching: boolean = false;

  constructor(private element: HTMLElement) {
    this.joystickElement = this.createJoystickElement();
    this.joystickCenterX = this.joystickElement.offsetLeft + this.joystickRadius;
    this.joystickCenterY = this.joystickElement.offsetTop + this.joystickRadius;

    document.body.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.body.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.body.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private createJoystickElement(): HTMLElement {
    const joystickElement = document.createElement('div');
    joystickElement.classList.add('joystick');
    joystickElement.style.position = 'absolute';
    joystickElement.style.width = `${this.joystickRadius * 2}px`;
    joystickElement.style.height = `${this.joystickRadius * 2}px`;
    joystickElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    joystickElement.style.borderRadius = '50%';
    joystickElement.style.left = `calc(50% - ${this.joystickRadius}px)`;
    joystickElement.style.bottom = '25%';
    this.element.appendChild(joystickElement);
    return joystickElement;
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.updateJoystickPosition(this.startX, this.startY);
    this.isTouching = true;
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.currentX = event.touches[0].clientX;
    this.currentY = event.touches[0].clientY;
    this.updateJoystickPosition(this.currentX, this.currentY);
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.currentX = this.joystickCenterX;
    this.currentY = this.joystickCenterY;
    this.updateJoystickPosition(this.currentX, this.currentY);
    this.isTouching = false;
  }

  private updateJoystickPosition(x: number, y: number): void {
    const deltaX = x - this.joystickCenterX;
    const deltaY = y - this.joystickCenterY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance > this.joystickRadius) {
      const angle = Math.atan2(deltaY, deltaX);
      this.joystickElement.style.left = `${this.joystickCenterX + this.joystickRadius * Math.cos(angle) - this.joystickRadius}px`;
      this.joystickElement.style.top = `${this.joystickCenterY + this.joystickRadius * Math.sin(angle) - this.joystickRadius}px`;
    } else {
      this.joystickElement.style.left = `${x - this.joystickRadius}px`;
      this.joystickElement.style.top = `${y - this.joystickRadius}px`;
    }
  }

  get direction(): utils.Vector2D {
    const deltaX = this.currentX - this.joystickCenterX;
    const deltaY = this.currentY - this.joystickCenterY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance <= this.threshold || !this.isTouching)
      return new utils.Vector2D(0, 0);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return new utils.Vector2D(x, y);
    this.onJoystickMove(x, y, distance / this.joystickRadius, '')
  }

  onJoystickMove(x: number, y: number, magnitude: number, direction: string): void {
    console.log(`Joystick moved: x=${x}, y=${y}, magnitude=${magnitude}, direction=${direction}`);
    // Implement your game logic here
  }


  onJoystickIdle(): void {
    console.log('Joystick is idle');
    // Implement your game logic here
  }
}
