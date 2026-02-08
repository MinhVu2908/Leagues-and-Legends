export class SizeOrb {
  constructor(x, y, multiplier = 1.4, r = 14, duration = 5000){
    this.x = x; this.y = y; this.multiplier = multiplier; this.r = r; this.duration = duration; this.alive = true; this.pulse = 0;
  }
  update(dt){ this.pulse += dt * 0.006; }
  draw(ctx){
    ctx.save();
    const s = 1 + Math.sin(this.pulse) * 0.06;
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    // glow
    ctx.beginPath(); ctx.arc(0,0,this.r+6,0,Math.PI*2); ctx.fillStyle = 'rgba(156,39,176,0.06)'; ctx.fill();
    // body
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fillStyle = '#ab47bc'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#6a1b9a'; ctx.stroke();
    // size arrows
    ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-2,-4); ctx.lineTo(-2,4); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(2,-4); ctx.lineTo(2,4); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  applyTo(ball){
    if(!ball) return;
    ball.applySizeChange(this.multiplier, this.duration);
  }
}
