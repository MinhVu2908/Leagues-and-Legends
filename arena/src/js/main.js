import { Ball } from './ball.js';
import { SmallBall } from './smallBall.js';
import { BigBall } from './bigBall.js';
import { PoisonBall } from './poisonBall.js';
import { HealingOrb } from './healingOrb.js';

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

  // Ball is defined in ./ball.js and imported above. The Ball API used here:
  // new Ball(x,y,color, { r, speed, hp, damage })

  function spawnTwo(){
    const a = {x: R + Math.random()*(W-2*R), y: R + Math.random()*(H-2*R)};
    let b; let tries=0;
    do{ b = {x: R + Math.random()*(W-2*R), y: R + Math.random()*(H-2*R)}; tries++; } while(dist(a.x,a.y,b.x,b.y) < 2*R + 8 && tries<200);
    // spawn two random ball types
    function makeRandom(x,y){
      const colors = ['#4fc3f7','#f06292','#ffd54f','#90caf9','#a5d6a7'];
      const color = colors[Math.floor(Math.random()*colors.length)];
      const t = Math.floor(Math.random()*4); // 0: base Ball, 1: SmallBall, 2: BigBall, 3: PoisonBall
      if(t === 1) return new SmallBall(x,y,color, { });
      if(t === 2) return new BigBall(x,y,color, { });
      if(t === 3) return new PoisonBall(x,y,color, { });
      return new Ball(x,y,color, { r: R, speed: SPEED, hp: 1200, damage: 100 });
    }
    const ballA = makeRandom(a.x,a.y);
    const ballB = makeRandom(b.x,b.y);
    return [ballA, ballB];
  }

  let balls = spawnTwo();

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
          const bCrit = Math.random() < (B.critChance || 0);
          const aCrit = Math.random() < (A.critChance || 0);
          const bDamage = Math.round(B.damage * (bCrit ? 2 : 1));
          const aDamage = Math.round(A.damage * (aCrit ? 2 : 1));
          A.hp -= bDamage; B.hp -= aDamage;
          // spawn damage popups showing damage taken (mark crits)
          spawnDamage(A.x, A.y - A.r - 6, bDamage, bCrit);
          spawnDamage(B.x, B.y - B.r - 6, aDamage, aCrit);
          // show crit visual on attacker(s)
          if(aCrit){ A.lastCrit = 700; }
          if(bCrit){ B.lastCrit = 700; }
          // apply poison effects (if the attacker type implements it)
          if(typeof B.applyPoison === 'function'){ B.applyPoison(A, spawnDamage); }
          if(typeof A.applyPoison === 'function'){ A.applyPoison(B, spawnDamage); }

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
    for(const b of balls){ if(b.alive) b.update({ W, H }, nowDt); }
    resolve();
    for(const b of balls){ b.draw(ctx); }
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
        damagePopups.length = 0;
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
    // color shift: green -> orange -> red
    hpAfill.style.background = aPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (aPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
    hpBfill.style.background = bPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (bPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
  }

  function loop(){ draw(); requestAnimationFrame(loop); }
  loop();

  document.getElementById('reset').addEventListener('click', ()=>{ cancelRespawn(); balls = spawnTwo(); damagePopups.length = 0; orb = null; spawnOrb(); updateHPUI(); });
});
