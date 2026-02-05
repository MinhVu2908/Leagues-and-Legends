export class Ball {
  // options: { r, speed, hp, damage }
  constructor(x, y, color, options = {}){
    const { r = 36, speed = 12, hp = 100, damage = 20, critChance = 0.12 } = options;
    this.x = x; this.y = y; this.color = color;
    this.r = r;
    const a = Math.random() * Math.PI * 2;
    this.vx = Math.cos(a) * speed;
    this.vy = Math.sin(a) * speed;
    this.maxHp = hp; this.hp = hp; this.damage = damage; this.alive = true;
    this.critChance = critChance;
    this.lastCrit = 0; // ms remaining for crit visual
    this.typeName = options.typeName || 'Normal Ball';
    this.slow = null; // active slow: { percent: 0.3, remaining: ms }
  }

  update(bounds, dt = 16){
    // bounds: { W, H }
    // check if stunned
    const now = Date.now();
    const isStunned = this.stunExpireAt && this.stunExpireAt > now;
    
    // apply single active slow multiplicatively to movement (no stacking)
    let mult = 1;
    if(this.slow){
      this.slow.remaining -= dt;
      if(this.slow.remaining <= 0){ this.slow = null; }
      else { mult *= (1 - (this.slow.percent || 0)); }
    }
    
    // stun prevents movement
    if(!isStunned){
      this.x += this.vx * mult; this.y += this.vy * mult;
    }
    const W = bounds.W, H = bounds.H;
    if(this.x < this.r){ this.x=this.r; this.vx = Math.abs(this.vx); this.randomize(); }
    if(this.x > W - this.r){ this.x=W-this.r; this.vx = -Math.abs(this.vx); this.randomize(); }
    if(this.y < this.r){ this.y=this.r; this.vy = Math.abs(this.vy); this.randomize(); }
    if(this.y > H - this.r){ this.y=H-this.r; this.vy = -Math.abs(this.vy); this.randomize(); }
    if(this.lastCrit > 0){ this.lastCrit = Math.max(0, this.lastCrit - dt); }
  }

  applySlow(percent, duration){
    if(!percent || percent <= 0) return;
    if(!duration || duration <= 0) return;
    // do not stack slows — keep a single slow effect
    if(!this.slow){
      this.slow = { percent: percent, remaining: duration };
      return;
    }
    // if new slow is stronger, replace and reset duration
    if(percent > this.slow.percent){ this.slow.percent = percent; this.slow.remaining = duration; return; }
    // otherwise refresh remaining to the larger of existing/new
    this.slow.remaining = Math.max(this.slow.remaining, duration);
  }

  randomize(){ const ang = Math.atan2(this.vy,this.vx) + (Math.random()-0.5)*0.6; const mag = Math.hypot(this.vx,this.vy); this.vx = Math.cos(ang)*mag; this.vy = Math.sin(ang)*mag; }

  draw(ctx){
    ctx.save();
    if(this.lastCrit > 0){
      // glowing outline for recent crit
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffd54f';
    }
    ctx.beginPath(); ctx.fillStyle=this.alive ? this.color : 'rgba(120,120,120,0.45)'; ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
    ctx.restore();
    // draw slow visual if a slow is active
    if(this.slow){
      ctx.save();
      ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(33,150,243,0.5)'; ctx.arc(this.x,this.y,this.r+4,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }
    // draw stun bar if stun stacks exist
    const now = Date.now();
    const isStunned = this.stunExpireAt && this.stunExpireAt > now;
    if(isStunned){
      // draw stun indicator (pulsing red outline)
      ctx.save();
      ctx.beginPath(); ctx.lineWidth = 5; ctx.strokeStyle = '#ff1744'; ctx.arc(this.x,this.y,this.r+6,0,Math.PI*2); ctx.stroke(); ctx.restore();
    } else if(this.stunStacks && this.stunStacks > 0){
      // draw stun stack bar below the ball with 3 indicator lines
      ctx.save();
      const barY = this.y + this.r + 12;
      const barW = this.r * 1.5;
      const barH = 6;
      const maxStacks = 4;
      
      // background bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.x - barW/2, barY, barW, barH);
      
      // fill bar based on stacks
      const fillPct = this.stunStacks / maxStacks;
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(this.x - barW/2, barY, barW * fillPct, barH);
      
      // border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - barW/2, barY, barW, barH);
      
      // 3 indicator lines at 1/3, 2/3, 3/3 positions
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      for(let i = 1; i < 4; i++){
        const x = this.x - barW/2 + (barW * i / 4);
        ctx.beginPath();
        ctx.moveTo(x, barY);
        ctx.lineTo(x, barY + barH);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    // draw type name above the ball
    if(this.typeName){
      ctx.save();
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.fillStyle = '#fff';
      const y = this.y - this.r - 8;
      ctx.strokeText(this.typeName, this.x, y);
      ctx.fillText(this.typeName, this.x, y);
      ctx.restore();
    }
  }
}
