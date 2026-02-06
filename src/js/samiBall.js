import { Ball } from './ball.js';
import { Bullet } from './bullet.js';

export class SamiBall extends Ball {
  // SamiBall builds a short-lived hit stack when it DEALS damage.
  // If it hits the enemy 3 times within `stackTimeout`, it enters a spinning
  // firing mode where it shoots 4 directions and slowly rotates.
  constructor(x, y, color, options = {}){
    const defaults = { r: 38, speed: 10, hp: 1100, damage: 80, critChance: 0.08,
      stackTimeout: 2000, stackThreshold: 3, spinDuration: 1500,
      shootInterval: 30, bulletSpeed: 5, bulletDamage: 12 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.stackTimeout = options.stackTimeout ?? defaults.stackTimeout;
    this.stackThreshold = options.stackThreshold ?? defaults.stackThreshold;
    this.spinDuration = options.spinDuration ?? defaults.spinDuration;
    this.shootInterval = options.shootInterval ?? defaults.shootInterval;
    this.bulletSpeed = options.bulletSpeed ?? defaults.bulletSpeed;
    this.bulletDamage = options.bulletDamage ?? defaults.bulletDamage;

    this.hitStack = 0;
    this.lastHitAt = 0;

    this.spinning = false;
    this.spinExpireAt = 0;
    this.shootTimer = Math.random() * this.shootInterval;
    this.bulletAngle = 0;
    this.pendingBullets = [];
    this.typeName = 'Sami Ball';
  }

  // Called by main when this ball DEALS damage.
  recordDeal(){
    const now = Date.now();
    if(this.lastHitAt && (now - this.lastHitAt) <= this.stackTimeout){
      this.hitStack++;
    } else {
      this.hitStack = 1;
    }
    this.lastHitAt = now;

    if(this.hitStack >= this.stackThreshold){
      this.startSpin();
      this.hitStack = 0;
      this.lastHitAt = 0;
    }
  }

  startSpin(){
    const now = Date.now();
    this.spinning = true;
    this.spinExpireAt = now + this.spinDuration;
    this.shootTimer = 0;
    // slight random offset so two SamiBalls don't sync perfectly
    this.bulletAngle = Math.random() * Math.PI * 2;
  }

  update(bounds, dt = 16){
    super.update(bounds, dt);
    if(this.spinning){
      this.shootTimer -= dt;
      if(this.shootTimer <= 0){
        this.shootTimer += this.shootInterval;
        // spawn 4 bullets in cardinal directions offset by current angle
        for(let i=0;i<4;i++){
          const ang = this.bulletAngle + i * (Math.PI/2);
          const vx = Math.cos(ang) * this.bulletSpeed;
          const vy = Math.sin(ang) * this.bulletSpeed;
          const bx = this.x + Math.cos(ang) * (this.r + 4);
          const by = this.y + Math.sin(ang) * (this.r + 4);
          this.pendingBullets.push(new Bullet(bx, by, vx, vy, this, { damage: this.bulletDamage, r: 4, life: 1600, color: '#ff8a65' }));
        }
        // slowly rotate the 4-way pattern
        this.bulletAngle += Math.PI * 2 / 30; // slow rotation per shot
        if(this.bulletAngle >= Math.PI*2) this.bulletAngle -= Math.PI*2;
      }

      // expire spinning state
      if(Date.now() > this.spinExpireAt){ this.spinning = false; this.spinExpireAt = 0; }
    }
  }

  draw(ctx){
    // draw a small stack indicator above the ball
    super.draw(ctx);
    if(this.hitStack && this.hitStack > 0){
      ctx.save();
      const barWidth = this.r * 0.9;
      const barHeight = 6;
      const barX = this.x - barWidth/2;
      const barY = this.y - this.r - 14;
      ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barWidth, barHeight);
      const prog = Math.min(this.hitStack / this.stackThreshold, 1);
      ctx.fillStyle = '#29b6f6'; ctx.fillRect(barX, barY, barWidth * prog, barHeight);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barWidth, barHeight);
      ctx.restore();
    }
    // optional visual when spinning
    if(this.spinning){
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#ff8a65'; ctx.beginPath(); ctx.arc(this.x, this.y, this.r+10, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}
