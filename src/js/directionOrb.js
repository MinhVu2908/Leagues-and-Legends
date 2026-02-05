export class DirectionOrb {
  constructor(x, y, r = 14){
    this.x = x; this.y = y; this.r = r; this.alive = true;
    this.pulse = 0; // for simple animation
  }
  update(dt){ this.pulse += dt * 0.006; }
  draw(ctx){
    ctx.save();
    const s = 1 + Math.sin(this.pulse) * 0.08;
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    // outer glow (purple)
    ctx.beginPath(); ctx.arc(0,0,this.r+6,0,Math.PI*2); ctx.fillStyle = 'rgba(156, 39, 176, 0.08)'; ctx.fill();
    // orb body (purple)
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fillStyle = '#ab47bc'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#6a1b9a'; ctx.stroke();
    // arrow/swirl symbol
    ctx.strokeStyle = '#f3e5f5'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*1.5); ctx.stroke();
    ctx.restore();
  }
}
