import { Ball } from './ball.js';

export class IceBall extends Ball {
  // Slows target on hit by percent for duration (ms)
  constructor(x, y, color, options = {}){
    const defaults = { r: 40, speed: 9, hp: 1400, damage: 90, critChance: 0.06, slowPercent: 0.80, slowDuration: 1500 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.slowPercent = options.slowPercent ?? defaults.slowPercent;
    this.slowDuration = options.slowDuration ?? defaults.slowDuration;
    this.typeName = 'Ice Ball';
  }

  // apply slow to a target Ball instance
  applySlow(target){
    if(!target || !target.alive) return;
    if(typeof target.applySlow === 'function'){
      target.applySlow(this.slowPercent, this.slowDuration);
    }
  }
}
