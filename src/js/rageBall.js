import { Ball } from './ball.js';

export class RageBall extends Ball {
  // RageBall enters rage mode after being hit a certain number of times
  // While raged: grows larger, deals increased damage, then transforms back to normal
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 10, hp: 1000, damage: 100, critChance: 0.08, rageHitThreshold: 5, rageDuration: 4000, rageScaleFactor: 1.4, rageDamageMultiplier: 3.0 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.rageHitThreshold = options.rageHitThreshold ?? defaults.rageHitThreshold;
    this.rageDuration = options.rageDuration ?? defaults.rageDuration;
    this.rageScaleFactor = options.rageScaleFactor ?? defaults.rageScaleFactor;
    this.rageDamageMultiplier = options.rageDamageMultiplier ?? defaults.rageDamageMultiplier;
    this.typeName = 'Rage Ball';
    this.hitCount = 0;
    this.rageExpireAt = 0;
    this.baseRadius = this.r;
    this.baseDamage = this.damage;
  }

  // Track hits received
  recordHit() {
    const now = Date.now();
    // Only count hits if not currently raged
    if (now > this.rageExpireAt) {
      this.hitCount++;
      if (this.hitCount >= this.rageHitThreshold) {
        this.activateRage();
      }
    }
  }

  activateRage() {
    const now = Date.now();
    this.rageExpireAt = now + this.rageDuration;
    this.hitCount = 0; // reset hit counter
    this.r = Math.round(this.baseRadius * this.rageScaleFactor);
    this.damage = Math.round(this.baseDamage * this.rageDamageMultiplier);
  }

  update(bounds, dt = 16) {
    super.update(bounds, dt);

    // Check if rage duration expired
    const now = Date.now();
    if (now > this.rageExpireAt && this.rageExpireAt > 0) {
      // Transform back to normal
      this.r = this.baseRadius;
      this.damage = this.baseDamage;
      this.rageExpireAt = 0;
    }
  }

  draw(ctx) {
    // Draw with glow effect when raged
    const now = Date.now();
    const isRaged = now < this.rageExpireAt;

    if (isRaged) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff6f00'; // orange rage aura
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    super.draw(ctx);

    // Draw hit progress bar above ball (only when not raged)
    if (!isRaged && this.rageHitThreshold > 0) {
      const barWidth = this.r * 1.5;
      const barHeight = 6;
      const barX = this.x - barWidth / 2;
      const barY = this.y - this.r - 16;

      // Background (empty bar)
      ctx.save();
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress fill (red/orange for hits)
      const progress = Math.min(this.hitCount / this.rageHitThreshold, 1);
      ctx.fillStyle = '#ff6f00';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      ctx.restore();
    }
  }
}
