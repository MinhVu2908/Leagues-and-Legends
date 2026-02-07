import { Ball } from './ball.js';

export class CurveBall extends Ball {
  // CurveBall curves like a masse shot in billiards when it bounces
  // After hitting a wall, it applies a curved trajectory instead of straight bounce
  constructor(x, y, color, options = {}){
    const defaults = { r: 34, speed: 11, hp: 1200, damage: 120, critChance: 0.13, curveStrength: 0.20 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.curveStrength = options.curveStrength ?? defaults.curveStrength;
    this.typeName = 'Curve Ball';
    this.lastBounceTime = 0;
    this.bounceAxis = null; // 'x' or 'y' depending on which wall was hit
  }

  update(bounds, dt = 16){
    // Store velocity before update
    const prevVx = this.vx;
    const prevVy = this.vy;
    
    // Check if stunned
    const now = Date.now();
    const isStunned = this.stunExpireAt && this.stunExpireAt > now;
    
    // Apply single active slow multiplicatively to movement
    let mult = 1;
    if(this.slow){
      this.slow.remaining -= dt;
      if(this.slow.remaining <= 0){ this.slow = null; }
      else { mult *= (1 - (this.slow.percent || 0)); }
    }
    
    // Apply curve effect if recently bounced
    if(this.bounceAxis && Date.now() - this.lastBounceTime < 400){
      // Apply perpendicular curve to create masse effect WITHOUT increasing speed
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if(this.bounceAxis === 'x'){
        // bounced off left/right wall, curve perpendicular to x
        const curveAmount = this.curveStrength * (Math.random() > 0.5 ? 1 : -1);
        this.vy += curveAmount * currentSpeed;
        // Rescale to maintain original speed
        const newSpeed = Math.hypot(this.vx, this.vy);
        this.vx *= currentSpeed / newSpeed;
        this.vy *= currentSpeed / newSpeed;
      } else if(this.bounceAxis === 'y'){
        // bounced off top/bottom wall, curve perpendicular to y
        const curveAmount = this.curveStrength * (Math.random() > 0.5 ? 1 : -1);
        this.vx += curveAmount * currentSpeed;
        // Rescale to maintain original speed
        const newSpeed = Math.hypot(this.vx, this.vy);
        this.vx *= currentSpeed / newSpeed;
        this.vy *= currentSpeed / newSpeed;
      }
    }
    
    // stun prevents movement
    if(!isStunned){
      this.x += this.vx * mult; this.y += this.vy * mult;
    }
    
    const W = bounds.W, H = bounds.H;
    
    // Wall collisions with bounce tracking
    if(this.x < this.r){ 
      this.x = this.r; 
      this.vx = Math.abs(this.vx); 
      this.bounceAxis = 'x';
      this.lastBounceTime = Date.now();
      this.randomize(); 
    }
    if(this.x > W - this.r){ 
      this.x = W - this.r; 
      this.vx = -Math.abs(this.vx); 
      this.bounceAxis = 'x';
      this.lastBounceTime = Date.now();
      this.randomize(); 
    }
    if(this.y < this.r){ 
      this.y = this.r; 
      this.vy = Math.abs(this.vy); 
      this.bounceAxis = 'y';
      this.lastBounceTime = Date.now();
      this.randomize(); 
    }
    if(this.y > H - this.r){ 
      this.y = H - this.r; 
      this.vy = -Math.abs(this.vy); 
      this.bounceAxis = 'y';
      this.lastBounceTime = Date.now();
      this.randomize(); 
    }
    
    if(this.lastCrit > 0){ this.lastCrit = Math.max(0, this.lastCrit - dt); }
    
    // reset combo if timer expires
    if(this.combo > 0){
      this.comboTimer -= dt;
      if(this.comboTimer <= 0){ this.combo = 0; this.comboTimer = 0; }
    }
  }

  draw(ctx){
    super.draw(ctx);
  }
}
