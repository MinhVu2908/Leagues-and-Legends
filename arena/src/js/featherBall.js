import { Ball } from './ball.js';
import { Feather } from './feather.js';

export class FeatherBall extends Ball {
  // FeatherBall shoots 3 feathers that retract when hitting boundaries
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 9, hp: 1300, damage: 50, critChance: 0.09, shootInterval: 1200 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.shootInterval = options.shootInterval ?? defaults.shootInterval;
    this.typeName = 'Feather Ball';
    this.pendingFeathers = [];
    this.lastShootTime = 0;
  }

  update(bounds, dt = 16) {
    super.update(bounds, dt);
    this.pendingFeathers.length = 0; // clear pending feathers each frame

    const now = Date.now();
    if (now - this.lastShootTime >= this.shootInterval) {
      this.lastShootTime = now;
      // shoot 3 feathers in different directions
      const featherSpeed = 7;
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3 + (Math.random() - 0.5) * 0.3;
        const fx = this.x + Math.cos(angle) * (this.r + 8);
        const fy = this.y + Math.sin(angle) * (this.r + 8);
        const fvx = Math.cos(angle) * featherSpeed;
        const fvy = Math.sin(angle) * featherSpeed;
        const feather = new Feather(fx, fy, fvx, fvy, this);
        this.pendingFeathers.push(feather);
      }
    }
  }
}
