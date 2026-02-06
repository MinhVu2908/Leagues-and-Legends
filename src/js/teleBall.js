import { Ball } from './ball.js';

export class TeleBall extends Ball {
  // TeleBall has a low chance to teleport away and restore HP when hit
  constructor(x, y, color, options = {}) {
    const defaults = { r: 36, speed: 11, hp: 1100, damage: 75, critChance: 0.08, teleportChance: 0.25 };
    super(x, y, color, Object.assign({}, defaults, options));
    this.teleportChance = options.teleportChance ?? defaults.teleportChance; // 8% chance to teleport
    this.typeName = 'Tele Ball';
    this.lastHpLost = 0;
  }

  // Try to teleport when taking damage
  attemptTeleport(bounds, damageAmount) {
    // Low chance to trigger teleport
    if (Math.random() > this.teleportChance) {
      return false; // teleport did not occur
    }

    // Teleport to random location
    const { W, H } = bounds;
    const padding = this.r + 20;
    this.x = padding + Math.random() * (W - 2 * padding);
    this.y = padding + Math.random() * (H - 2 * padding);

    // Restore the HP that was lost
    this.hp = Math.min(this.maxHp, this.hp + damageAmount);

    return true; // teleport occurred
  }
}
