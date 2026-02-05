export class Mine {
  constructor(x, y, owner) {
    this.x = x;
    this.y = y;
    this.owner = owner;
    this.r = 5;
    this.damage = 50;
    this.alive = true;
    this.lifetime = 8000; // 8 seconds before despawn
    this.age = 0;
    this.color = '#d32f2f'; // red mine
  }

  update(bounds, dt = 16) {
    const { W, H } = bounds;

    this.age += dt;

    // despawn after lifetime expires
    if (this.age >= this.lifetime) {
      this.alive = false;
    }

    // despawn if out of bounds
    if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
