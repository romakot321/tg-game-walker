import models = require('entity.models');


export class AnimationRepository {
  private animations: models.Animation[];

  constructor() {
    this.animations = [];
  }

  tick(delta: number): models.Animation[] {
    for (const element of this.animations) {
      element.update(delta);
      if (element.status == models.AnimationStatus.FINISHED)
        this.delete(element);
    }

    return this.animations;
  }

  add(animation: models.Animation): void {
    this.animations.push(animation);
  }

  getPlaceAnimations(): models.PlaceAnimation[] {
    var anims = [];

    for (const anim of this.animations) {
      if (!(anim instanceof models.PlaceAnimation))
        continue;
      anims.push(anim)
    }

    return anims;
  }

  getList(type: any | undefined = undefined): models.Animation[] {
    var anims = [];

    for (const anim of this.animations) {
      if (type != null && !(anim instanceof type))
        continue;
      anims.push(anim)
    }

    return anims;
  }

  delete(animation: models.Animation): void {
    for (const el of this.animations) {
      if (animation == el) {
        this.animations.splice(this.animations.indexOf(el, 0), 1);
        return;
      }
    }
  }
}
