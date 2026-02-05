export class Feather {
  constructor(x, y, vx, vy, owner) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.r = 4;
    this.damage = 25; // feather damage on hit
    this.alive = true;
    this.retracting = false;
    this.retractSpeed = 12;
  }

  update(bounds, dt = 16) {
    const { W, H } = bounds;

    if (this.retracting) {
      // move towards owner
      if (this.owner && this.owner.alive) {
        const dx = this.owner.x - this.x;
        const dy = this.owner.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 8) {
          this.alive = false;
          return;
        }
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.retractSpeed;
        this.y += ny * this.retractSpeed;
      } else {
        this.alive = false;
      }
    } else {
      // normal movement
      this.x += this.vx;
      this.y += this.vy;

      // check boundary collision and start retracting
      if (this.x < this.r || this.x > W - this.r || this.y < this.r || this.y > H - this.r) {
        this.retracting = true;
      }

      // out of bounds timeout
      if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
        this.alive = false;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.retracting ? '#ffeb3b' : '#fff59d';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f57f17';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
