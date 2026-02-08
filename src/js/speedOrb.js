export class SpeedOrb {
  constructor(x, y, multiplier = 1.6, r = 14, duration = 5000){
    this.x = x; this.y = y; this.multiplier = multiplier; this.r = r; this.duration = duration; this.alive = true; this.pulse = 0;
  }
  update(dt){ this.pulse += dt * 0.006; }
  draw(ctx){
    ctx.save();
    const s = 1 + Math.sin(this.pulse) * 0.06;
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    // glow
    ctx.beginPath(); ctx.arc(0,0,this.r+6,0,Math.PI*2); ctx.fillStyle = 'rgba(3,169,244,0.08)'; ctx.fill();
    // body
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fillStyle = '#29b6f6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#0277bd'; ctx.stroke();
    // lightning
    ctx.beginPath(); ctx.moveTo(-4,-6); ctx.lineTo(0,0); ctx.lineTo(-1,0); ctx.lineTo(4,6); ctx.lineTo(1,0); ctx.lineTo(2,0); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  applyTo(ball){
    if(!ball) return;
    ball.applySpeedBuff(this.multiplier, this.duration);
  }
}
