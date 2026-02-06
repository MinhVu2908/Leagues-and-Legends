import { Ball } from './ball.js';
import { Laser } from './laser.js';

export class LuxiBall extends Ball {
  // LuxiBall periodically causes a thin laser to spawn from a random border
  // and travel across the arena. The laser originates from the border (not the ball).
  constructor(x, y, color, options = {}){
    const defaults = { r: 38, speed: 10, hp: 1000, damage: 65, critChance: 0.06,
        spawnInterval: 2400, laserSpeed: 5, laserWidth: 100, laserDamage: 150 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.spawnInterval = options.spawnInterval ?? defaults.spawnInterval;
    this.laserSpeed = options.laserSpeed ?? defaults.laserSpeed;
    this.laserWidth = options.laserWidth ?? defaults.laserWidth;
    this.laserDamage = options.laserDamage ?? defaults.laserDamage;

    this.spawnTimer = Math.random() * this.spawnInterval;
    this.pendingLasers = [];
    this.typeName = 'Luxi Ball';
  }

  update(bounds, dt = 16){
    super.update(bounds, dt);
    this.spawnTimer -= dt;
    if(this.spawnTimer <= 0){
      this.spawnTimer += this.spawnInterval + Math.random()*800;
      // pick a random edge and spawn a laser just outside it toward a random interior point
      const W = bounds.W, H = bounds.H;
      const edge = Math.floor(Math.random()*4); // 0:left,1:right,2:top,3:bottom
      let sx, sy;
      if(edge === 0){ sx = -24; sy = Math.random()*H; }
      else if(edge === 1){ sx = W + 24; sy = Math.random()*H; }
      else if(edge === 2){ sx = Math.random()*W; sy = -24; }
      else { sx = Math.random()*W; sy = H + 24; }
      // target a random point inside arena
      const tx = 30 + Math.random()*(Math.max(0, W-60));
      const ty = 30 + Math.random()*(Math.max(0, H-60));
      const dx = tx - sx, dy = ty - sy;
      const mag = Math.hypot(dx, dy) || 1;
      const ndx = dx / mag, ndy = dy / mag;
      // spawn a stationary short-lived beam (appears then disappears)
      const laser = new Laser(sx, sy, ndx, ndy, this, { speed: 0, width: this.laserWidth, damage: this.laserDamage, color: '#b3e5fc', length: Math.max(W,H)*1.2, life: 1000 });
      this.pendingLasers.push(laser);
    }
  }

  draw(ctx){ super.draw(ctx); }
}
