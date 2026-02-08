export class DamageOrb {
  constructor(x, y, multiplier = 1.5, r = 14, duration = 5000){
    this.x = x; this.y = y; this.multiplier = multiplier; this.r = r; this.duration = duration; this.alive = true; this.pulse = 0;
  }
  update(dt){ this.pulse += dt * 0.006; }
  draw(ctx){
    ctx.save();
    const s = 1 + Math.sin(this.pulse) * 0.06;
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    // glow
    ctx.beginPath(); ctx.arc(0,0,this.r+6,0,Math.PI*2); ctx.fillStyle = 'rgba(244,67,54,0.08)'; ctx.fill();
    // body
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fillStyle = '#ef5350'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#b71c1c'; ctx.stroke();
    // sword icon (damage)
    ctx.beginPath(); ctx.moveTo(-3,-6); ctx.lineTo(0,8); ctx.lineTo(3,-6); ctx.lineTo(0,-3); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  applyTo(ball){
    if(!ball) return;
    ball.applyDamageBuff(this.multiplier, this.duration);
  }
}
