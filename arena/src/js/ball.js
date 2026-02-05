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
  }

  update(bounds, dt = 16){
    // bounds: { W, H }
    this.x += this.vx; this.y += this.vy;
    const W = bounds.W, H = bounds.H;
    if(this.x < this.r){ this.x=this.r; this.vx = Math.abs(this.vx); this.randomize(); }
    if(this.x > W - this.r){ this.x=W-this.r; this.vx = -Math.abs(this.vx); this.randomize(); }
    if(this.y < this.r){ this.y=this.r; this.vy = Math.abs(this.vy); this.randomize(); }
    if(this.y > H - this.r){ this.y=H-this.r; this.vy = -Math.abs(this.vy); this.randomize(); }
    if(this.lastCrit > 0){ this.lastCrit = Math.max(0, this.lastCrit - dt); }
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
