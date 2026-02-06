export class Bullet {
  constructor(x, y, vx, vy, owner = null, options = {}){
    const { r = 3, life = 1500, damage = 8, color = '#ffeb3b' } = options;
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.r = r; this.life = life; this.damage = damage; this.color = color;
    this.age = 0; this.alive = true; this.owner = owner; // owner is a Ball instance
  }

  update(bounds, dt = 16){
    if(!this.alive) return;
    this.age += dt;
    if(this.age >= this.life){ this.alive = false; return; }
    this.x += this.vx; this.y += this.vy;
    // simple bounds kill
    if(this.x < -50 || this.x > bounds.W + 50 || this.y < -50 || this.y > bounds.H + 50){ this.alive = false; }
  }

  draw(ctx){
    if(!this.alive) return;
    ctx.save();
    ctx.beginPath(); ctx.fillStyle = this.color; ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke();
    ctx.restore();
  }
}
