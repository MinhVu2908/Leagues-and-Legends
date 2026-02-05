import { Ball } from './ball.js';

export class StunBall extends Ball {
  // StunBall applies stun stacks on hit; after 4 hits, target is stunned for 3 seconds
  // options: { r, speed, hp, damage, maxStunStacks, stunDuration }
  constructor(x, y, color, options = {}){
    const defaults = { r: 36, speed: 11, hp: 1100, damage: 45, critChance: 0.10, maxStunStacks: 4, stunDuration: 3000 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.maxStunStacks = options.maxStunStacks ?? defaults.maxStunStacks;
    this.stunDuration = options.stunDuration ?? defaults.stunDuration;
    this.typeName = 'Stun Ball';
  }

  // target: Ball instance to receive stun stack
  applyStun(target){
    if(!target || !target.alive) return;
    
    // Initialize stun tracking on target if not present
    if(!target.stunStacks) target.stunStacks = 0;
    if(!target.stunExpireAt) target.stunExpireAt = 0;
    
    // If target is currently stunned, don't add more stacks during stun
    const now = Date.now();
    if(target.stunExpireAt > now){
      return; // already stunned, no stacking
    }
    
    // Add a stack
    target.stunStacks = Math.min(this.maxStunStacks, target.stunStacks + 1);
    
    // If max stacks reached, apply stun
    if(target.stunStacks >= this.maxStunStacks){
      target.stunExpireAt = now + this.stunDuration;
      target.stunStacks = 0; // reset stacks after stunning
    }
  }
}
