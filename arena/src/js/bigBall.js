import { Ball } from './ball.js';

export class BigBall extends Ball {
  constructor(x, y, color, options = {}){
    const newDefaults = { r: 56, speed: 7, hp: 2500, damage: 100, critChance: 0.06 };
    super(x, y, color, Object.assign({}, newDefaults, options));
  }
}
