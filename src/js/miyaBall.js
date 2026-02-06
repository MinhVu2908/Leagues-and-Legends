import { Ball } from './ball.js';

export class MiyaBall extends Ball {
  // MiyaBall - Special ball that performs a slashing invincible attack after 5 hits
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 10, hp: 1200, damage: 85, critChance: 0.09, hitThreshold: 5 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.hitThreshold = options.hitThreshold ?? defaults.hitThreshold;
    this.typeName = 'MiyaBall';
    this.hitCount = 0;
    this.isAttacking = false;
    this.attackStartTime = 0;
    this.attackDuration = 2000; // 2 seconds for full slash animation
    this.slashDuration = 1200; // duration of slashing phase
    this.sheatDuration = 800; // duration of sheating phase
    this.attackTarget = null;
    this.damagePerCut = 70; // 5 cuts × 24 = 120 total damage
    this.cutsDealt = 0; // track how many cuts have been dealt
    this.maxCuts = 5; // number of cuts in the attack
    this.startX = x;
    this.startY = y;
    this.teleportPositions = []; // positions teleported to during attack
  }

  recordHit() {
    if (!this.isAttacking) {
      this.hitCount++;
    }
  }

  startAttack(target) {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackStartTime = Date.now();
    this.attackTarget = target;
    this.startX = this.x;
    this.startY = this.y;
    this.cutsDealt = 0;
  }

  updateAttack(bounds, targetX, targetY) {
    const now = Date.now();
    const elapsed = now - this.attackStartTime;
    const progress = Math.min(elapsed / this.attackDuration, 1);

    if (progress >= 1) {
      this.isAttacking = false;
      this.teleportPositions = [];
      return { finished: true, damageDealt: [] };
    }

    const damageDealt = [];
    const { W, H } = bounds;

    if (progress < this.slashDuration / this.attackDuration) {
      const slashProgress = progress / (this.slashDuration / this.attackDuration);
      const cutsToDeliver = Math.floor(slashProgress * this.maxCuts);
      if (cutsToDeliver > this.cutsDealt) {
        for (let i = this.cutsDealt; i < cutsToDeliver; i++) {
          damageDealt.push(this.damagePerCut);
          const padding = this.r + 30;
          const newX = padding + Math.random() * (W - 2 * padding);
          const newY = padding + Math.random() * (H - 2 * padding);
          this.teleportPositions.push({ x: newX, y: newY, cutIndex: i });
          this.x = newX;
          this.y = newY;
        }
        this.cutsDealt = cutsToDeliver;
      }
    }

    return { finished: false, damageDealt };
  }

  update(bounds, dt = 16) {
    if (this.isAttacking) {
      return;
    }
    super.update(bounds, dt);
  }

  draw(ctx) {
    if (this.isAttacking) {
      const now = Date.now();
      const elapsed = now - this.attackStartTime;
      const progress = Math.min(elapsed / this.attackDuration, 1);
      if (progress < this.slashDuration / this.attackDuration) {
        const slashProgress = progress / (this.slashDuration / this.attackDuration);
        ctx.save();
        ctx.globalAlpha = 0.8 * (1 - slashProgress);
        ctx.strokeStyle = '#25b8dd';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const numSlashes = 6;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        for (let i = 0; i < numSlashes; i++) {
          const angle = (i / numSlashes) * Math.PI * 2;
          const curveAmount = Math.sin(slashProgress * Math.PI) * 40;
          ctx.beginPath();
          const startDist = 100;
          const endDist = 400;
          const startX = centerX + Math.cos(angle) * startDist;
          const startY = centerY + Math.sin(angle) * startDist;
          const endX = centerX + Math.cos(angle) * endDist;
          const endY = centerY + Math.sin(angle) * endDist;
          const cpX = centerX + Math.cos(angle + Math.PI / 4) * curveAmount;
          const cpY = centerY + Math.sin(angle + Math.PI / 4) * curveAmount;
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.stroke();
          const angle2 = angle + Math.PI / 2.5;
          const start2X = centerX + Math.cos(angle2) * startDist;
          const start2Y = centerY + Math.sin(angle2) * startDist;
          const end2X = centerX + Math.cos(angle2) * endDist;
          const end2Y = centerY + Math.sin(angle2) * endDist;
          const cp2X = centerX + Math.cos(angle2 + Math.PI / 4) * curveAmount * 0.7;
          const cp2Y = centerY + Math.sin(angle2 + Math.PI / 4) * curveAmount * 0.7;
          ctx.beginPath();
          ctx.moveTo(start2X, start2Y);
          ctx.quadraticCurveTo(cp2X, cp2Y, end2X, end2Y);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    super.draw(ctx);
  }
}
