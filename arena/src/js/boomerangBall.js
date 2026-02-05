import { Ball } from './ball.js';
import { Boomerang } from './boomerang.js';

export class BoomerangBall extends Ball {
  // BoomerangBall shoots a boomerang that goes out, passes through enemies, and returns
  // The boomerang does damage on each contact but doesn't disappear
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 10, hp: 1150, damage: 70, critChance: 0.09, shootInterval: 1400 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.shootInterval = options.shootInterval ?? defaults.shootInterval;
    this.typeName = 'Boomerang Ball';
    this.pendingBoomerangs = [];
    this.lastShootTime = 0;
    this.hasActiveBoomerang = false; // track if a boomerang is currently active
  }

  update(bounds, dt = 16) {
    super.update(bounds, dt);
    this.pendingBoomerangs.length = 0; // clear pending boomerangs each frame

    const now = Date.now();
    // Only shoot if no boomerang is active and enough time has passed
    if (!this.hasActiveBoomerang && now - this.lastShootTime >= this.shootInterval) {
      this.lastShootTime = now;
      // shoot a boomerang in a random direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 8;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const boomerang = new Boomerang(this.x, this.y, vx, vy, this);
      this.pendingBoomerangs.push(boomerang);
      this.hasActiveBoomerang = true;
    }
  }
}
