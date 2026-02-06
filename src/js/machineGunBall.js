import { Ball } from './ball.js';
import { Bullet } from './bullet.js';

export class MachineGunBall extends Ball {
  // shoots bullets constantly in a circular pattern
  constructor(x, y, color, options = {}){
    const defaults = { r: 40, speed: 10, hp: 1100, damage: 85, critChance: 0.08, shootInterval: 10, bulletSpeed: 10, bulletDamage: 10 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.shootInterval = options.shootInterval ?? defaults.shootInterval;
    this.bulletSpeed = options.bulletSpeed ?? defaults.bulletSpeed;
    this.bulletDamage = options.bulletDamage ?? defaults.bulletDamage;
    this.shootTimer = Math.random() * this.shootInterval;
    this.bulletAngle = 0; // rotation angle for circular spread
    this.pendingBullets = [];
    this.typeName = 'Machine Gun Ball';
  }

  update(bounds, dt = 16){
    super.update(bounds, dt);
    this.shootTimer -= dt;
    if(this.shootTimer <= 0){
      this.shootTimer += this.shootInterval;
      // spawn bullet in rotating circular pattern
      const ang = this.bulletAngle;
      const vx = Math.cos(ang) * this.bulletSpeed;
      const vy = Math.sin(ang) * this.bulletSpeed;
      const bx = this.x + Math.cos(ang) * (this.r + 2);
      const by = this.y + Math.sin(ang) * (this.r + 2);
      this.pendingBullets.push(new Bullet(bx, by, vx, vy, this, { damage: this.bulletDamage, r: 3, life: 1500, color: '#ffeb3b' }));
      // increment angle for next bullet (creates circular spray)
      this.bulletAngle += Math.PI * 2 / 100; // 20 bullets per full rotation
      if(this.bulletAngle >= Math.PI * 2) this.bulletAngle -= Math.PI * 2;
    }
  }

  // main will read and clear this.pendingBullets after update
}
