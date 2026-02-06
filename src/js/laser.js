export class Laser {
  // A thin moving beam that travels from a border into the arena.
  // Represented as a line segment of `length` starting at (x,y) in direction (dx,dy).
  constructor(x, y, dx, dy, owner = null, options = {}){
    const { speed = 12, length = 200, width = 430, life = 3000, damage = 60, color = '#80d8ff' } = options;
    // dx,dy should be normalized direction vector
    this.x = x; this.y = y;
    this.dx = dx; this.dy = dy;
    this.vx = dx * speed; this.vy = dy * speed;
    this.length = length;
    this.width = width;
    this.life = life;
    this.damage = damage;
    this.color = color;
    this.age = 0;
    this.alive = true;
    this.owner = owner;
    this._damaged = new Set(); // track who has been damaged to avoid repeat hits
  }

  update(bounds, dt = 16){
    if(!this.alive) return;
    this.age += dt;
    if(this.age >= this.life){ this.alive = false; return; }
    // move scaled by frame dt (base frame ~16ms)
    const factor = dt / 16;
    this.x += this.vx * factor;
    this.y += this.vy * factor;
    // kill if the entire segment (start->end) is outside an extended bounds box
    const x2 = this.x + this.dx * this.length;
    const y2 = this.y + this.dy * this.length;
    const minX = Math.min(this.x, x2), maxX = Math.max(this.x, x2);
    const minY = Math.min(this.y, y2), maxY = Math.max(this.y, y2);
    const margin = 200;
    if(maxX < -margin || minX > bounds.W + margin || maxY < -margin || minY > bounds.H + margin){ this.alive = false; }
  }

  // returns true if the beam intersects a circle at (cx,cy) with radius rr
  intersectsCircle(cx, cy, rr){
    // segment from (x,y) to (x + dx*length, y + dy*length)
    const x1 = this.x, y1 = this.y;
    const x2 = this.x + this.dx * this.length, y2 = this.y + this.dy * this.length;
    // project point onto segment
    const vx = x2 - x1, vy = y2 - y1;
    const wx = cx - x1, wy = cy - y1;
    const c1 = vx*wx + vy*wy;
    const c2 = vx*vx + vy*vy;
    let t = 0;
    if(c2 > 0) t = c1 / c2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + vx * t, py = y1 + vy * t;
    const distSq = (cx - px)*(cx - px) + (cy - py)*(cy - py);
    const hitDist = rr + this.width/2;
    return distSq <= hitDist*hitDist;
  }

  markDamaged(ball){ if(ball) this._damaged.add(ball); }
  hasDamaged(ball){ return ball && this._damaged.has(ball); }

  draw(ctx){
    if(!this.alive) return;
    ctx.save();
    ctx.lineWidth = this.width;
    ctx.strokeStyle = this.color;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.dx * this.length, this.y + this.dy * this.length);
    ctx.stroke();
    ctx.restore();
  }
}
