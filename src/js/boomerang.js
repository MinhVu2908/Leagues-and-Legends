export class Boomerang {
  constructor(x, y, vx, vy, owner) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.r = 30;
    this.damage = 20;
    this.alive = true;
    this.phase = 'outgoing'; // 'outgoing' or 'returning'
    this.startX = x;
    this.startY = y;
    this.maxDistance = 300; // max distance before returning
    this.retractSpeed = 10;
    this.damagedThisPhase = new Set(); // track which enemies we've hit this phase
    this.color = '#ff9800'; // orange boomerang
    this.rotation = 0; // spinning animation
  }

  update(bounds, dt = 16) {
    const { W, H } = bounds;

    // Update rotation for spinning effect
    this.rotation += 0.08; // spin speed

    if (this.phase === 'outgoing') {
      // Move outward
      this.x += this.vx;
      this.y += this.vy;

      // Check if we've traveled far enough to start returning
      const distFromStart = Math.hypot(this.x - this.startX, this.y - this.startY);
      if (distFromStart > this.maxDistance) {
        this.phase = 'returning';
        this.damagedThisPhase.clear(); // reset damaged list for returning phase
      }

      // Bounce off walls during outgoing phase
      if (this.x < this.r || this.x > W - this.r) {
        this.vx *= -1;
        this.x = Math.max(this.r, Math.min(W - this.r, this.x));
      }
      if (this.y < this.r || this.y > H - this.r) {
        this.vy *= -1;
        this.y = Math.max(this.r, Math.min(H - this.r, this.y));
      }
    } else {
      // Returning phase: move back to owner
      if (this.owner && this.owner.alive) {
        const dx = this.owner.x - this.x;
        const dy = this.owner.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 12) {
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
    }

    // Despawn if way out of bounds
    if (this.x < -100 || this.x > W + 100 || this.y < -100 || this.y > H + 100) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw eclipse shape (elongated ellipse)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Draw ellipse: wider horizontally, thinner vertically
    ctx.ellipse(0, 0, this.r, this.r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#e65100';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  // Track if we've already damaged this enemy in current phase
  canDamage(enemy) {
    return !this.damagedThisPhase.has(enemy);
  }

  // Mark enemy as damaged in current phase
  markDamaged(enemy) {
    this.damagedThisPhase.add(enemy);
  }
}
