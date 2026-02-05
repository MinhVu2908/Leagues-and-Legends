export class HealingOrb {
  constructor(x, y, healAmount = 100, r = 14){
    this.x = x; this.y = y; this.healAmount = healAmount; this.r = r; this.alive = true;
    this.pulse = 0; // for simple animation
  }
  update(dt){ this.pulse += dt * 0.006; }
  draw(ctx){
    ctx.save();
    const s = 1 + Math.sin(this.pulse) * 0.08;
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    // outer glow
    ctx.beginPath(); ctx.arc(0,0,this.r+6,0,Math.PI*2); ctx.fillStyle = 'rgba(102, 187, 106, 0.08)'; ctx.fill();
    // orb body
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fillStyle = 'linear-gradient(90deg,#a5d6a7,#66bb6a)'; ctx.fillStyle = '#66bb6a'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#2e7d32'; ctx.stroke();
    // plus sign
    ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(6,0); ctx.moveTo(0,-6); ctx.lineTo(0,6);
    ctx.strokeStyle = '#e8f5e9'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
}
