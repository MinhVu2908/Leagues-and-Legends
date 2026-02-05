import { Ball } from './ball.js';

export class PoisonBall extends Ball {
  // PoisonBall applies a damage-over-time effect on hit
  // options: { r, speed, hp, damage, poisonDmg, poisonDuration, poisonInterval }
  constructor(x, y, color, options = {}){
    const defaults = { r: 36, speed: 10, hp: 1500, damage: 40, critChance: 0.08, poisonDmg: 20, poisonDuration: 5000, poisonInterval: 600 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.poisonDmg = options.poisonDmg ?? defaults.poisonDmg;
    this.poisonDuration = options.poisonDuration ?? defaults.poisonDuration;
    this.poisonInterval = options.poisonInterval ?? defaults.poisonInterval;
    this.typeName = 'Poison Ball';
  }

  // target: Ball instance to receive poison
  // applyFn: function(target, amount, isCrit=false, isPoison=false) used to apply damage centrally (passed from main)
  applyPoison(target, applyFn){
    if(!target || !target.alive) return;
    const ticks = Math.max(1, Math.floor(this.poisonDuration / this.poisonInterval));
    let applied = 0;
    const id = setInterval(()=>{
      if(!target || !target.alive){ clearInterval(id); return; }
      applied += 1;
      const dmg = Math.round(this.poisonDmg);
      if(typeof applyFn === 'function'){
        applyFn(target, dmg, false, true);
      } else {
        // fallback: directly apply
        target.hp -= dmg;
      }
      if(target.hp <= 0){ target.hp = 0; target.alive = false; target.vx = target.vy = 0; clearInterval(id); }
      if(applied >= ticks) { clearInterval(id); }
    }, this.poisonInterval);
  }
}
