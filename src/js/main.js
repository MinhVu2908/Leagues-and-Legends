import { Ball } from './ball.js';
import { SmallBall } from './smallBall.js';
import { BigBall } from './bigBall.js';
import { PoisonBall } from './poisonBall.js';
import { SpikerBall } from './spikerBall.js';
import { IceBall } from './iceBall.js';
import { StunBall } from './stunBall.js';
import { FeatherBall } from './featherBall.js';
import { MineBall } from './mineBall.js';
import { RageBall } from './rageBall.js';
import { TeleBall } from './teleBall.js';
import { MiyaBall } from './miyaBall.js';
import { MachineGunBall } from './machineGunBall.js';
import { SamiBall } from './samiBall.js';
import { LuxiBall } from './luxiBall.js';
import { CurveBall } from './curveBall.js';
import { HealingOrb } from './healingOrb.js';
import { TestBall } from './testBall.js';

document.addEventListener('DOMContentLoaded', ()=>{
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const R = 36;
  const SPEED = 12.0;

  // UI elements for HP
  const hpAfill = document.getElementById('hpA-fill');
  const hpBfill = document.getElementById('hpB-fill');
  const hpAtext = document.getElementById('hpA-text');
  const hpBtext = document.getElementById('hpB-text');
  const comboAtext = document.getElementById('comboA-text');
  const comboBtext = document.getElementById('comboB-text');
  const countdownEl = document.getElementById('countdown');

  function dist(x1,y1,x2,y2){ return Math.hypot(x2-x1,y2-y1); }

  // Damage popup system
  class DamagePopup{
    constructor(x,y,amount,isCrit=false,isPoison=false){ this.x = x; this.y = y; this.amount = amount; this.isCrit = !!isCrit; this.isPoison = !!isPoison; this.life = 800; this.age = 0; this.vy = -0.03 - Math.random()*0.05; this.alpha = 1; }
    update(dt){ this.age += dt; this.y += this.vy * dt; this.alpha = 1 - (this.age / this.life); }
    draw(ctx){ ctx.save(); ctx.globalAlpha = Math.max(0, this.alpha); const isHeal = this.amount < 0; let color;
      if(this.isCrit){ color = '#ffd54f'; }
      else if(this.isPoison){ color = '#1b5e20'; }
      else if(isHeal){ color = '#b9f6ca'; }
      else { color = '#fff'; }
      ctx.fillStyle = color; ctx.font = this.isCrit ? '24px system-ui' : '20px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      const text = this.amount > 0 ? `-${this.amount}` : `+${Math.abs(this.amount)}`;
      const display = this.isCrit ? `${text}!` : text;
      ctx.strokeText(display, this.x, this.y); ctx.fillText(display, this.x, this.y); ctx.restore(); }
    expired(){ return this.age >= this.life; }
  }
  const damagePopups = [];

  function spawnDamage(x,y,amount,isCrit=false,isPoison=false){ damagePopups.push(new DamagePopup(x,y,amount,isCrit,isPoison)); }



const hitAudio = new Audio('/sound/hit.mp3');
const critAudio = new Audio('/sound/critHit.mp3');
  hitAudio.volume = 0.46;
  critAudio.volume = 0.46;

  // centralized damage applier: applies vulnerability multiplier once if present, updates HP, shows popup
  function applyDamageTo(target, amount, isCrit=false, isPoison=false, attacker=null){
    if(!target || !target.alive) return;
    if(!amount || amount <= 0) return;
    // apply one-time vulnerability multiplier
    if(target.vulnerableMultiplier && !target.vulnerableUsed){
      amount = Math.round(amount * target.vulnerableMultiplier);
      target.vulnerableUsed = true;
    }
    target.hp -= amount;
    if(target.hp <= 0){ target.hp = 0; target.alive = false; target.vx = target.vy = 0; target.combo = 0; }
    spawnDamage(target.x, target.y - target.r - 6, amount, isCrit, isPoison);
    // increment combo for attacker
    if(attacker){
      if(!attacker.combo) attacker.combo = 0;
      attacker.combo++;
      attacker.comboTimer = 1000; // reset 1 second timer
    }
    // play sounds (quiet)
    try{
      if(isCrit){ critAudio.currentTime = 0; critAudio.play().catch(()=>{}); }
      else { hitAudio.currentTime = 0; hitAudio.play().catch(()=>{}); }
    } catch(e) { /* ignore */ }
  }

  // Ball is defined in ./ball.js and imported above. The Ball API used here:
  // new Ball(x,y,color, { r, speed, hp, damage })

  function spawnTwo(){
    // TEMPORARY: spawn specific balls for testing — set TEMP_SPAWN = false to revert to random
    const TEMP_SPAWN = true;
    if(TEMP_SPAWN){
      const a = {x: R + 60, y: H/2};
      const b = {x: W - R - 60, y: H/2};
      // Change these types as needed: Ball, SmallBall, BigBall, PoisonBall, SpikerBall, IceBall
      const ballA = new CurveBall(a.x, a.y, '#90caf9', {});
      const ballB = new TestBall(b.x, b.y, '#a5d6a7', {});
      return [ballA, ballB];
    }

    const a = {x: R + Math.random()*(W-2*R), y: R + Math.random()*(H-2*R)};
    let b; let tries=0;
    do{ b = {x: R + Math.random()*(W-2*R), y: R + Math.random()*(H-2*R)}; tries++; } while(dist(a.x,a.y,b.x,b.y) < 2*R + 8 && tries<200);
    // spawn two random ball types
    function makeRandom(x,y){
      const colors = ['#4fc3f7','#f06292','#ffd54f','#90caf9','#a5d6a7'];
      const color = colors[Math.floor(Math.random()*colors.length)];
      const t = Math.floor(Math.random()*17); // 0: base Ball, 1: SmallBall, 2: BigBall, 3: PoisonBall, 4: SpikerBall, 5: IceBall, 6: StunBall, 7: FeatherBall, 8: MineBall, 9: RageBall, 10: TeleBall, 11: MiyaBall, 12: SamiBall, 13: LuxiBall, 14: MachineGunBall, 15: CurveBall
      if(t === 1) return new SmallBall(x,y,color, { });
      if(t === 2) return new BigBall(x,y,color, { });
      if(t === 3) return new PoisonBall(x,y,color, { });
      if(t === 4) return new SpikerBall(x,y,color, { });
      if(t === 5) return new IceBall(x,y,color, { });
      if(t === 6) return new StunBall(x,y,color, { });
      if(t === 7) return new FeatherBall(x,y,color, { });
      if(t === 8) return new MineBall(x,y,color, { });
      if(t === 9) return new RageBall(x,y,color, { });
      if(t === 10) return new TeleBall(x,y,color, { });
      //if(t === 11) return new BoomerangBall(x,y,color, { });
      if(t === 11) return new MiyaBall(x,y,color, { });
      if(t === 12) return new SamiBall(x,y,color, { });
      if(t === 13) return new LuxiBall(x,y,color, { });
      if(t === 14) return new MachineGunBall(x,y,color, { });
      if(t === 15) return new CurveBall(x,y,color, { });
      return new Ball(x,y,color, { r: R, speed: SPEED, hp: 1200, damage: 100 });
    }
    const ballA = makeRandom(a.x,a.y);
    let ballB;
    let typeTries = 0;
    do{
      ballB = makeRandom(b.x,b.y);
      typeTries++;
    } while(ballB && ballA && ballB.constructor === ballA.constructor && typeTries < 200);
    return [ballA, ballB];
  }

  let balls = spawnTwo();
  // global spike projectiles
  let spikes = [];
  // global feather projectiles
  let feathers = [];
  // global mine projectiles
  let mines = [];
  // global boomerang projectiles
  let boomerangs = [];
  // global bullet projectiles
  let bullets = [];
  // global laser projectiles
  let lasers = [];
  // MiyaBall special attack state
  let miyaAttacking = false;
  let miyaAttacker = null;

  let previouslyColliding = false;
  // healing orb management
  let orb = null;
  function spawnOrb(){
    const padding = 24;
    const x = padding + Math.random()*(W-2*padding);
    const y = padding + Math.random()*(H-2*padding);
    orb = new HealingOrb(x,y, 300, 14);
  }
  spawnOrb();

  // respawn / match management
  let respawnActive = false;
  let respawnMs = 0;
  const RESPAWN_DELAY = 3000; // ms

  function fightEnded(){
    const alive = balls.filter(b => b.alive).length;
    return alive <= 1;
  }

  function startRespawn(){
    respawnActive = true; respawnMs = RESPAWN_DELAY; updateCountdownUI();
  }

  function cancelRespawn(){
    respawnActive = false; respawnMs = 0; updateCountdownUI();
  }

  function updateCountdownUI(){
    if(!respawnActive){ countdownEl.textContent = ''; return; }
    const s = Math.ceil(respawnMs/1000);
    countdownEl.textContent = `Next fight in: ${s}`;
  }
  function resolve(){
    const A = balls[0], B = balls[1]; const d = dist(A.x,A.y,B.x,B.y);
    const bounds = { W, H };
    const touching = d <= A.r + B.r;
    if(touching){
      const nx=(B.x-A.x)/d, ny=(B.y-A.y)/d; const overlap = A.r + B.r - d;
      A.x -= nx*overlap/2; A.y -= ny*overlap/2; B.x += nx*overlap/2; B.y += ny*overlap/2;
      // preserve each ball's speed magnitude
      const aSpeed = Math.hypot(A.vx, A.vy);
      const bSpeed = Math.hypot(B.vx, B.vy);
      const aProj = A.vx*nx + A.vy*ny; const bProj = B.vx*nx + B.vy*ny;
      const aPerpVx = A.vx - aProj*nx; const aPerpVy = A.vy - aProj*ny;
      const bPerpVx = B.vx - bProj*nx; const bPerpVy = B.vy - bProj*ny;
      // exchange normal components
      A.vx = aPerpVx + bProj*nx; A.vy = aPerpVy + bProj*ny;
      B.vx = bPerpVx + aProj*nx; B.vy = bPerpVy + aProj*ny;
      // rescale to original magnitudes (avoid speed change)
      const newASpeed = Math.hypot(A.vx, A.vy) || 1;
      const newBSpeed = Math.hypot(B.vx, B.vy) || 1;
      A.vx *= aSpeed / newASpeed; A.vy *= aSpeed / newASpeed;
      B.vx *= bSpeed / newBSpeed; B.vy *= bSpeed / newBSpeed;

      // apply damage once when collision begins
      if(!previouslyColliding){
        if(A.alive && B.alive){
          // check if either ball is stunned (stunned balls deal no damage)
          const now = Date.now();
          const aIsStunned = A.stunExpireAt && A.stunExpireAt > now;
          const bIsStunned = B.stunExpireAt && B.stunExpireAt > now;

          const bCrit = Math.random() < (B.critChance || 0);
          const aCrit = Math.random() < (A.critChance || 0);
          const rawBDamage = bIsStunned ? 0 : Math.round(B.damage * (bCrit ? 2 : 1));
          const rawADamage = aIsStunned ? 0 : Math.round(A.damage * (aCrit ? 2 : 1));

          // apply damage through centralized helper (handles one-time vulnerability multiplier)
          applyDamageTo(A, rawBDamage, bCrit, false, B);
          applyDamageTo(B, rawADamage, aCrit, false, A);
          // TeleBall attempt teleport when taking damage (very low chance to escape + restore HP)
          if(typeof A.attemptTeleport === 'function' && rawBDamage > 0){ A.attemptTeleport({ W, H }, rawBDamage); }
          if(typeof B.attemptTeleport === 'function' && rawADamage > 0){ B.attemptTeleport({ W, H }, rawADamage); }

          // show crit visual on attacker(s)
          if(aCrit && !aIsStunned){ A.lastCrit = 700; }
          if(bCrit && !bIsStunned){ B.lastCrit = 700; }
          // apply poison effects (if the attacker type implements it) — pass damage applier
          if(typeof B.applyPoison === 'function'){ B.applyPoison(A, applyDamageTo); }
          if(typeof A.applyPoison === 'function'){ A.applyPoison(B, applyDamageTo); }
          // apply slow effects (if the attacker type implements it)
          if(typeof B.applySlow === 'function'){ B.applySlow(A); }
          if(typeof A.applySlow === 'function'){ A.applySlow(B); }
          // apply stun effects (if the attacker type implements it)
          if(typeof B.applyStun === 'function'){ B.applyStun(A); }
          if(typeof A.applyStun === 'function'){ A.applyStun(B); }
          // record hits on RageBall when it receives damage (triggers rage mode)
          if(typeof A.recordHit === 'function' && rawBDamage > 0){ A.recordHit(); }
          if(typeof B.recordHit === 'function' && rawADamage > 0){ B.recordHit(); }
          // track hits for MiyaBall when it DEALS damage (not when it receives)
          if(B instanceof MiyaBall && rawBDamage > 0){ B.hitCount++; }
          if(A instanceof MiyaBall && rawADamage > 0){ A.hitCount++; }
          // track hits for SamiBall when it DEALS damage (stacked short window)
          if(B instanceof SamiBall && rawBDamage > 0){ if(typeof B.recordDeal === 'function') B.recordDeal(); }
          if(A instanceof SamiBall && rawADamage > 0){ if(typeof A.recordDeal === 'function') A.recordDeal(); }
          // check for MiyaBall special attack trigger (5 hits MADE by attacker)
          if(B instanceof MiyaBall && B.hitCount >= B.hitThreshold){ 
            miyaAttacking = true; 
            miyaAttacker = B;
            B.startAttack(A);
            B.hitCount = 0; // reset hit counter for next attack
          }
          if(A instanceof MiyaBall && A.hitCount >= A.hitThreshold){ 
            miyaAttacking = true; 
            miyaAttacker = A;
            A.startAttack(B);
            A.hitCount = 0; // reset hit counter for next attack
          }

          // slightly randomize directions to avoid sticking/circling while preserving speed
          if(typeof A.randomize === 'function') A.randomize();
          if(typeof B.randomize === 'function') B.randomize();

          if(A.hp <= 0){ A.hp = 0; A.alive = false; A.vx = A.vy = 0; }
          if(B.hp <= 0){ B.hp = 0; B.alive = false; B.vx = B.vy = 0; }
        }
        previouslyColliding = true;
      }
    } else {
      previouslyColliding = false;
    }
  }

  function checkOrbPickup(){
    if(!orb || !orb.alive) return;
    for(const b of balls){
      if(!b.alive) continue;
      const d = dist(b.x,b.y,orb.x,orb.y);
      if(d <= b.r + orb.r){
        const heal = Math.min(orb.healAmount, b.maxHp - b.hp);
        if(heal > 0){ b.hp += heal; spawnDamage(b.x, b.y - b.r - 6, -heal); }
        orb.alive = false;
        // respawn orb after random delay
        setTimeout(()=>{ spawnOrb(); }, 2000 + Math.random()*4000);
        break;
      }
    }
  }

  function draw(){
    const nowDt = 16; // ms per frame (approx)
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#000'; ctx.lineWidth=6; ctx.strokeRect(2,2,W-4,H-4);
    
    // Handle MiyaBall special attack
    if (miyaAttacking && miyaAttacker) {
      const attacker = miyaAttacker;
      const defender = balls[0] === attacker ? balls[1] : balls[0];
      
      // Update attack animation and get damage instances
      const attackResult = attacker.updateAttack({ W, H }, defender.x, defender.y);
      
      // Apply each cut's damage
      for (const damageAmount of attackResult.damageDealt) {
        applyDamageTo(defender, damageAmount, false, false, attacker);
      }
      
      if (attackResult.finished) {
        // Attack finished
        miyaAttacking = false;
        miyaAttacker = null;
      }
      
      // Don't update balls normally during attack, but keep them frozen
      // and only draw them
      for(const b of balls){ b.draw(ctx); }
    } else {
      // Normal game loop when not attacking
      for(const b of balls){ if(b.alive) b.update({ W, H }, nowDt); }
      // collect spikes spawned by any ball (SpikerBall sets pendingSpikes)
      for(const b of balls){ if(b.pendingSpikes && b.pendingSpikes.length){ for(const s of b.pendingSpikes){ spikes.push(s); } b.pendingSpikes.length = 0; } }
      // collect feathers spawned by any ball (FeatherBall sets pendingFeathers)
      for(const b of balls){ if(b.pendingFeathers && b.pendingFeathers.length){ for(const f of b.pendingFeathers){ feathers.push(f); } b.pendingFeathers.length = 0; } }
      // collect mines spawned by any ball (MineBall sets pendingMines)
      for(const b of balls){ if(b.pendingMines && b.pendingMines.length){ for(const m of b.pendingMines){ mines.push(m); } b.pendingMines.length = 0; } }
      // collect bullets spawned by any ball (MachineGunBall sets pendingBullets)
      for(const b of balls){ if(b.pendingBullets && b.pendingBullets.length){ for(const bu of b.pendingBullets){ bullets.push(bu); } b.pendingBullets.length = 0; } }
      // collect lasers spawned by any ball (LuxiBall sets pendingLasers)
      for(const b of balls){ if(b.pendingLasers && b.pendingLasers.length){ for(const l of b.pendingLasers){ lasers.push(l); } b.pendingLasers.length = 0; } }
      // collect boomerangs spawned by any ball (BoomerangBall sets pendingBoomerangs)
      //for(const b of balls){ if(b.pendingBoomerangs && b.pendingBoomerangs.length){ for(const bo of b.pendingBoomerangs){ boomerangs.push(bo); } b.pendingBoomerangs.length = 0; } }
      resolve();
      for(const b of balls){ b.draw(ctx); }
    }

    // update + draw spikes
    for(let i = spikes.length-1; i >= 0; --i){ const s = spikes[i]; s.update({ W, H }, nowDt); if(!s.alive){ spikes.splice(i,1); continue; }
      // check collision with balls (don't hit owner)
        for(const bb of balls){ if(!bb.alive) continue; if(bb === s.owner) continue; const d = dist(bb.x,bb.y,s.x,s.y); if(d <= bb.r + s.r){ // hit
          applyDamageTo(bb, s.damage, false, false, s.owner);
          s.alive = false; break; }
      }
    }
    for(const s of spikes){ s.draw(ctx); }

    // update + draw feathers
    for(let i = feathers.length-1; i >= 0; --i){ const f = feathers[i]; f.update({ W, H }, nowDt); if(!f.alive){ feathers.splice(i,1); continue; }
      // check collision with balls (don't hit owner)
      for(const bb of balls){ if(!bb.alive) continue; if(bb === f.owner) continue; const d = dist(bb.x,bb.y,f.x,f.y); if(d <= bb.r + f.r){ // hit
        applyDamageTo(bb, f.damage, false, false, f.owner);
        f.alive = false; break; }
      }
    }
    for(const f of feathers){ f.draw(ctx); }

    // update + draw mines
    for(let i = mines.length-1; i >= 0; --i){ const m = mines[i]; m.update({ W, H }, nowDt); if(!m.alive){ mines.splice(i,1); continue; }
      // check collision with balls (don't hit owner)
      for(const bb of balls){ if(!bb.alive) continue; if(bb === m.owner) continue; const d = dist(bb.x,bb.y,m.x,m.y); if(d <= bb.r + m.r){ // hit
        applyDamageTo(bb, m.damage, false, false, m.owner);
        m.alive = false; break; }
      }
    }
    for(const m of mines){ m.draw(ctx); }

    // update + draw bullets
    for(let i = bullets.length-1; i >= 0; --i){ const bu = bullets[i]; bu.update({ W, H }, nowDt); if(!bu.alive){ bullets.splice(i,1); continue; }
      // check collision with balls (don't hit owner)
      for(const bb of balls){ if(!bb.alive) continue; if(bb === bu.owner) continue; const d = dist(bb.x,bb.y,bu.x,bu.y); if(d <= bb.r + bu.r){ // hit
        applyDamageTo(bb, bu.damage, false, false, bu.owner);
        bu.alive = false; break; }
      }
    }
    for(const bu of bullets){ bu.draw(ctx); }

    // update + draw lasers
    for(let i = lasers.length-1; i >= 0; --i){ const L = lasers[i]; L.update({ W, H }, nowDt); if(!L.alive){ lasers.splice(i,1); continue; }
      // check collision with balls (don't hit owner)
      for(const bb of balls){ if(!bb.alive) continue; if(bb === L.owner) continue; if(L.hasDamaged(bb)) continue; if(L.intersectsCircle(bb.x, bb.y, bb.r)){
          applyDamageTo(bb, L.damage, false, false, L.owner);
          L.markDamaged(bb);
        }
      }
    }
    for(const L of lasers){ L.draw(ctx); }

    // update + draw boomerangs
    for(let i = boomerangs.length-1; i >= 0; --i){ const bo = boomerangs[i]; bo.update({ W, H }, nowDt); if(!bo.alive){ boomerangs.splice(i,1); continue; }
      // check collision with balls (don't hit owner, passes through but damages)
      for(const bb of balls){ if(!bb.alive) continue; if(bb === bo.owner) continue; const d = dist(bb.x,bb.y,bo.x,bo.y); if(d <= bb.r + bo.r){ // hit
        if(bo.canDamage(bb)){ applyDamageTo(bb, bo.damage, false, false, bo.owner); bo.markDamaged(bb); }
      }
      }
    }
    for(const bo of boomerangs){ bo.draw(ctx); }

    // draw orb (if present)
    if(orb && orb.alive){ orb.update(nowDt); orb.draw(ctx); }
    // update + draw damage popups
    for(let i = damagePopups.length-1; i >= 0; --i){ const p = damagePopups[i]; p.update(nowDt); p.draw(ctx); if(p.expired()) damagePopups.splice(i,1); }
    checkOrbPickup();
    updateHPUI();

    // respawn handling: if fight ended, start respawn timer; when timer finishes, spawn new pair
    if(fightEnded()){
      if(!respawnActive) startRespawn();
    }
    if(respawnActive){
      respawnMs -= nowDt;
      if(respawnMs <= 0){
        // respawn new fight
        balls = spawnTwo();
        for(const b of balls){ b.combo = 0; }
        damagePopups.length = 0;
        spikes.length = 0;
        feathers.length = 0;
        mines.length = 0;
        bullets.length = 0;
        boomerangs.length = 0;
        orb = null; spawnOrb();
        previouslyColliding = false;
        cancelRespawn();
        updateHPUI();
      } else {
        updateCountdownUI();
      }
    }
  }

  function updateHPUI(){
    const A = balls[0], B = balls[1];
    const aPct = Math.max(0, Math.min(1, A.hp / A.maxHp));
    const bPct = Math.max(0, Math.min(1, B.hp / B.maxHp));
    hpAfill.style.width = `${aPct*100}%`;
    hpBfill.style.width = `${bPct*100}%`;
    // include type name and color the text using the ball's color
    hpAtext.textContent = `${A.typeName} — ${Math.round(A.hp)} / ${A.maxHp}`;
    hpBtext.textContent = `${B.typeName} — ${Math.round(B.hp)} / ${B.maxHp}`;
    hpAtext.style.color = A.color;
    hpBtext.style.color = B.color;
    // display combo counters
    comboAtext.textContent = A.combo ? `Combo: ${A.combo}` : '';
    comboBtext.textContent = B.combo ? `Combo: ${B.combo}` : '';
    // color shift: green -> orange -> red
    hpAfill.style.background = aPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (aPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
    hpBfill.style.background = bPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (bPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
  }

  function loop(){ draw(); requestAnimationFrame(loop); }
  loop();

  document.getElementById('reset').addEventListener('click', ()=>{ cancelRespawn(); balls = spawnTwo(); for(const b of balls){ b.combo = 0; } damagePopups.length = 0; orb = null; spawnOrb(); updateHPUI(); });
});
