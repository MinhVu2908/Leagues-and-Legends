import { Ball } from './ball.js';
import { Spike } from './spike.js';

export class SpikerBall extends Ball {
  // shoots spikes in all directions on an interval
  constructor(x, y, color, options = {}){
    const defaults = { r: 44, speed: 8, hp: 1800, damage: 100, critChance: 0.05, shootInterval: 2400, spikesPerShot: 12, spikeSpeed: 10, spikeDamage: 50 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.shootInterval = options.shootInterval ?? defaults.shootInterval;
    this.spikesPerShot = options.spikesPerShot ?? defaults.spikesPerShot;
    this.spikeSpeed = options.spikeSpeed ?? defaults.spikeSpeed;
    this.spikeDamage = options.spikeDamage ?? defaults.spikeDamage;
    this.shootTimer = Math.random() * this.shootInterval;
    this.pendingSpikes = [];
    this.typeName = 'Spiker Ball';
  }

  update(bounds, dt = 16){
    super.update(bounds, dt);
    this.shootTimer -= dt;
    if(this.shootTimer <= 0){
      this.shootTimer += this.shootInterval;
      // spawn spikes in all directions
      const spikes = [];
      const n = Math.max(3, Math.floor(this.spikesPerShot));
      for(let i=0;i<n;i++){
        const ang = (i / n) * Math.PI * 2;
        const vx = Math.cos(ang) * this.spikeSpeed;
        const vy = Math.sin(ang) * this.spikeSpeed;
        const sx = this.x + Math.cos(ang) * (this.r + 4);
        const sy = this.y + Math.sin(ang) * (this.r + 4);
        spikes.push(new Spike(sx, sy, vx, vy, this, { damage: this.spikeDamage, r: 6, life: 2600, color: '#8fbc8f' }));
      }
      this.pendingSpikes = spikes;
    }
  }

  // main will read and clear this.pendingSpikes after update
}
