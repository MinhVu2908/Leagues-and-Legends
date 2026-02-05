import { Ball } from './ball.js';

export class SmallBall extends Ball {
  constructor(x, y, color, options = {}){
    const defaults = { r: 18, speed: 18, hp: 1000, damage: 200, critChance: 80 };
    const newDefaults = { r: 18, speed: 20, hp: 1000, damage: 150, critChance: 0.25 };
    super(x, y, color, Object.assign({}, newDefaults, options));
    this.typeName = 'Small Ball';
  }
}
