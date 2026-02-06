import { Ball } from './ball.js';

export class TestBall extends Ball {
  constructor(x, y, color, options = {}){
    const newDefaults = { r: 36, speed: 7, hp: 10000, damage: 10, critChance: 0.06 };
    super(x, y, color, Object.assign({}, newDefaults, options));
    this.typeName = 'Test Ball';
  }
}
