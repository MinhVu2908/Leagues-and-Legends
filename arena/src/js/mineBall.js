import { Ball } from './ball.js';
import { Mine } from './mine.js';

export class MineBall extends Ball {
  // MineBall drops mines periodically as it moves
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 9, hp: 1100, damage: 80, critChance: 0.09, mineInterval: 800 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.mineInterval = options.mineInterval ?? defaults.mineInterval;
    this.typeName = 'Mine Ball';
    this.pendingMines = [];
    this.lastMineTime = 0;
  }

  update(bounds, dt = 16) {
    super.update(bounds, dt);
    this.pendingMines.length = 0; // clear pending mines each frame

    const now = Date.now();
    if (now - this.lastMineTime >= this.mineInterval) {
      this.lastMineTime = now;
      // drop a mine at current position
      const mine = new Mine(this.x, this.y, this);
      this.pendingMines.push(mine);
    }
  }
}
