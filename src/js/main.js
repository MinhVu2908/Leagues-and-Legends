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
import { DamageOrb } from './damageOrb.js';
import { SpeedOrb } from './speedOrb.js';
import { SizeOrb } from './sizeOrb.js';
import { TestBall } from './testBall.js';
import { PlayerSystem } from './playerSystem.js';

document.addEventListener('DOMContentLoaded', ()=>{
  const canvas = document.getElementById('c');
  if (!canvas) {
    console.error('Canvas element (#c) not found. Cannot start game.');
    return;
  }
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const R = 36;
  const SPEED = 12.0;

  // Initialize Player System
  const playerSystem = new PlayerSystem();
  
  // UI elements for HP
  const hpAfill = document.getElementById('hpA-fill');
  const hpBfill = document.getElementById('hpB-fill');
  const hpAtext = document.getElementById('hpA-text');
  const hpBtext = document.getElementById('hpB-text');
  const comboAtext = document.getElementById('comboA-text') || null;
  const comboBtext = document.getElementById('comboB-text') || null;
  const countdownEl = document.getElementById('countdown');

  // UI elements for coins and betting
  const coinsAmount = document.getElementById('coins-amount');
  const bettingUi = document.getElementById('betting-ui');
  const betResultUi = document.getElementById('bet-result-ui');
  const betResultMessage = document.getElementById('bet-result-message');
  const betResultCoins = document.getElementById('bet-result-coins');
  const betAmountInput = document.getElementById('bet-amount-input');
  const betOnABtn = document.getElementById('bet-on-a');
  const betOnBBtn = document.getElementById('bet-on-b');
  const winnerUi = document.getElementById('winner-ui');
  const winnerText = document.getElementById('winner-text');
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const profileName = document.getElementById('profile-name');
  const profileCoins = document.getElementById('profile-coins');
  const profileModalClose = document.querySelector('.profile-modal-close');
  const historyEntries = document.getElementById('history-entries');
  
  // Inline confirmation/warning container (will be injected into the betting UI)
  let inlineConfirmEl = null;
  function ensureInlineConfirm(){
    if (!bettingUi) return null;
    if (!inlineConfirmEl){
      inlineConfirmEl = document.createElement('div');
      inlineConfirmEl.id = 'inline-bet-confirm';
      inlineConfirmEl.className = 'inline-bet-confirm hidden';
      bettingUi.appendChild(inlineConfirmEl);
    }
    return inlineConfirmEl;
  }
  // Helper to show a short inline message under the betting box
  function showInlineMessage(text, type = 'info'){
    if (!bettingUi) return;
    let msg = bettingUi.querySelector('#bet-warning');
    if (!msg){
      msg = document.createElement('div');
      msg.id = 'bet-warning';
      msg.className = 'bet-warning';
      bettingUi.appendChild(msg);
    }
    msg.textContent = text;
    msg.dataset.type = type;
    // auto-clear after 4s for non-error messages
    if (type !== 'error') setTimeout(()=>{ if(msg) msg.textContent = ''; }, 4000);
  }
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  // Pending bet data (waiting for confirmation)
  let pendingBet = { ballIndex: null, amount: 0 };

  // Track if betting is locked (during active fight)
  let bettingLocked = false;

  // Update coins display
  function updateCoinsDisplay() {
    const currentCoins = playerSystem.getCoins();
    console.log(`📊 Updating UI to show ${currentCoins} coins`);
    if (coinsAmount) {
      coinsAmount.textContent = currentCoins;
      console.log(`  ✓ Updated #coins-amount element`);
    }
    const coinsMini = document.getElementById('coins-amount-mini');
    if (coinsMini) {
      coinsMini.textContent = currentCoins;
      console.log(`  ✓ Updated #coins-amount-mini element`);
    }
  }
  
  // Add entry to bet history
  function addHistoryEntry(betAmount, isWin, coinsChanged) {
    if (!historyEntries) return; // Guard against missing element
    const entryEl = document.createElement('div');
    
    let resultText, changeText, className;
    if (isWin === null) {
      // Draw
      className = 'history-entry draw';
      resultText = '⚔️ Draw';
      changeText = `±0`;
    } else {
      // Win or Loss
      className = `history-entry ${isWin ? 'win' : 'loss'}`;
      resultText = isWin ? '✓ Win' : '✗ Loss';
      changeText = isWin ? `+${coinsChanged}` : `-${coinsChanged}`;
    }
    
    entryEl.className = className;
    entryEl.innerHTML = `
      <span>Bet ${betAmount} (${resultText})</span>
      <span class="history-entry-amount">${changeText}</span>
    `;
    historyEntries.insertBefore(entryEl, historyEntries.firstChild);
    
    // Keep only last 20 entries
    while (historyEntries.children.length > 20) {
      historyEntries.removeChild(historyEntries.lastChild);
    }
  }
  
  // On page load: sync coins from localStorage and display
  console.log('🎮 Game initializing...');
  console.log(`Initial coins in memory: ${playerSystem.getCoins()}`);
  
  // Small delay to ensure DOM is fully rendered before updating
  setTimeout(() => {
    updateCoinsDisplay();
    console.log('✅ Initial coin display synced');
  }, 10);
  
  // Save coins to localStorage whenever page might unload
  window.addEventListener('beforeunload', () => {
    playerSystem.save();
  });
  
  // Initialize betting UI state (hidden at start, locked during fights)
  bettingLocked = true;
  if (bettingUi) bettingUi.classList.add('hidden');
  if (betResultUi) betResultUi.classList.add('hidden');
  if (winnerUi) winnerUi.classList.add('hidden');

  // Profile modal handlers
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (profileModal) profileModal.classList.remove('hidden');
      if (profileName) profileName.textContent = playerSystem.getPlayerName();
      if (profileCoins) profileCoins.textContent = playerSystem.getCoins();
    });
  }
  if (profileModalClose) {
    profileModalClose.addEventListener('click', () => {
      if (profileModal) profileModal.classList.add('hidden');
    });
  }
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        profileModal.classList.add('hidden');
      }
    });
  }

  // Quick amount button handlers
  const quickBtns = document.querySelectorAll('.bet-quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (betAmountInput) betAmountInput.value = e.target.dataset.amount;
    });
  });

  // Custom bet button handlers - show confirmation modal instead of placing bet directly
  function showBetConfirmation(ballIndex) {
    if (bettingLocked) {
      // show inline warning instead of alert
      showInlineMessage('Betting is locked during an active fight. Wait for the prepare timer.', 'error');
      return;
    }
    
    if (!betAmountInput) {
      alert('Betting interface not available');
      return;
    }
    
    const amount = parseInt(betAmountInput.value) || 0;
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Show inline confirmation inside betting UI
    pendingBet = { ballIndex, amount };
    const el = ensureInlineConfirm();
    if (!el) return;
    const teamName = ballIndex === 0 ? 'Ball A' : 'Ball B';
    el.innerHTML = `
      <div class="confirm-row">Confirm bet <strong>${amount}</strong> on <span class="confirm-team" style="color:${ballIndex===0? '#4fc3f7':'#f06292'}">${teamName}</span>?</div>
      <div class="confirm-actions">
        <button class="confirm-yes">Confirm</button>
        <button class="confirm-no">Cancel</button>
      </div>
    `;
    el.classList.remove('hidden');
    const yes = el.querySelector('.confirm-yes');
    const no = el.querySelector('.confirm-no');
    if (yes) yes.addEventListener('click', ()=>{ finalizeBet(); el.classList.add('hidden'); el.innerHTML = ''; });
    if (no) no.addEventListener('click', ()=>{ cancelBetConfirmation(); el.classList.add('hidden'); el.innerHTML = ''; });
  }
  
  // Actually place the bet (called when user clicks Confirm in modal)
  function finalizeBet() {
    if (pendingBet.ballIndex === null) return;
    
    const { ballIndex, amount } = pendingBet;
    const result = playerSystem.placeBet(ballIndex, amount);
    
    if (result.success) {
      // Lock betting immediately
      bettingLocked = true;
      
      // Hide betting UI
      if (bettingUi) bettingUi.classList.add('hidden');
      updateCoinsDisplay();
      
      // Add message to chat
      const teamName = ballIndex === 0 ? 'Ball A' : 'Ball B';
      addChatMessage(`You bet ${amount} coins on ${teamName} 🎲`, 'bet');
      
      console.log(result.message);
      pendingBet = { ballIndex: null, amount: 0 };
    } else {
      alert(result.message);
      pendingBet = { ballIndex: null, amount: 0 };
    }
    
    // Hide any inline confirmation if present
    const el = inlineConfirmEl || (bettingUi && bettingUi.querySelector('#inline-bet-confirm'));
    if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
  }
  
  // Cancel bet confirmation
  function cancelBetConfirmation() {
    pendingBet = { ballIndex: null, amount: 0 };
    const el = inlineConfirmEl || (bettingUi && bettingUi.querySelector('#inline-bet-confirm'));
    if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
  }
  
  // Chat system
  function addChatMessage(message, type = 'chat') {
    if (!chatMessages) return;
    
    const msgEl = document.createElement('div');
    msgEl.style.marginBottom = '6px';
    msgEl.style.padding = '6px';
    msgEl.style.borderRadius = '4px';
    
    if (type === 'bet') {
      msgEl.style.background = 'rgba(255, 213, 79, 0.15)';
      msgEl.style.color = '#ffd54f';
      msgEl.style.borderLeft = '3px solid #ffd54f';
    } else if (type === 'win') {
      msgEl.style.background = 'rgba(76, 175, 80, 0.15)';
      msgEl.style.color = '#b9f6ca';
      msgEl.style.borderLeft = '3px solid #4caf50';
    } else if (type === 'loss') {
      msgEl.style.background = 'rgba(244, 67, 54, 0.15)';
      msgEl.style.color = '#ffcdd2';
      msgEl.style.borderLeft = '3px solid #f44336';
    } else if (type === 'draw') {
      msgEl.style.background = 'rgba(156, 39, 176, 0.15)';
      msgEl.style.color = '#ce93d8';
      msgEl.style.borderLeft = '3px solid #9c27b0';
    } else {
      msgEl.style.color = '#ccc';
    }
    
    msgEl.textContent = message;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (betOnABtn) betOnABtn.addEventListener('click', () => showBetConfirmation(0));
  if (betOnBBtn) betOnBBtn.addEventListener('click', () => showBetConfirmation(1));

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



// audio files are stored under /public/sound in this project
const hitAudio = new Audio('/public/sound/hit.mp3');
const critAudio = new Audio('/public/sound/critHit.mp3');
hitAudio.preload = 'auto';
critAudio.preload = 'auto';
hitAudio.volume = 0.46;
critAudio.volume = 0.46;

// Many browsers block audio.play() until a user gesture occurs.
// Unlock audio on first user interaction by attempting a short play/pause.
function unlockAudioOnGesture(){
  try{
    // Attempt to play and immediately pause to satisfy autoplay policies
    hitAudio.currentTime = 0;
    critAudio.currentTime = 0;
    const p1 = hitAudio.play().catch(()=>{});
    const p2 = critAudio.play().catch(()=>{});
    Promise.all([p1,p2]).then(() => {
      try{ hitAudio.pause(); critAudio.pause(); } catch(e){}
      console.log('🔊 Audio unlocked by user gesture');
    }).catch(()=>{});
  } catch(e) { /* ignore */ }
}
document.addEventListener('pointerdown', unlockAudioOnGesture, { once: true });
document.addEventListener('keydown', unlockAudioOnGesture, { once: true });

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

  // Map ball type names to constructor functions
  function getBallConstructor(typeName){
    const map = {
      'Ball': Ball, 'SmallBall': SmallBall, 'BigBall': BigBall, 'PoisonBall': PoisonBall,
      'SpikerBall': SpikerBall, 'IceBall': IceBall, 'StunBall': StunBall, 'FeatherBall': FeatherBall,
      'MineBall': MineBall, 'RageBall': RageBall, 'TeleBall': TeleBall, 'MiyaBall': MiyaBall,
      'SamiBall': SamiBall, 'LuxiBall': LuxiBall, 'MachineGunBall': MachineGunBall, 'CurveBall': CurveBall
    };
    return map[typeName] || Ball;
  }

  function spawnTwo(forcedTypeA, forcedTypeB){
    // TEMPORARY: spawn specific balls for testing — set TEMP_SPAWN = false to revert to random
    const TEMP_SPAWN = false;
    if(TEMP_SPAWN){
      const a = {x: R + 60, y: H/2};
      const b = {x: W - R - 60, y: H/2};
      // TEMPORARY: test Ball
      const ballA = new RageBall(a.x, a.y, '#90caf9', {});
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
    
    function makeByType(typeName, x, y){
      const colors = ['#4fc3f7','#f06292','#ffd54f','#90caf9','#a5d6a7'];
      const color = colors[Math.floor(Math.random()*colors.length)];
      const Constructor = getBallConstructor(typeName);
      return new Constructor(x, y, color, {});
    }
    
    // Use forced types if provided, otherwise use random
    let ballA, ballB;
    if(forcedTypeA && forcedTypeB){
      ballA = makeByType(forcedTypeA, a.x, a.y);
      ballB = makeByType(forcedTypeB, b.x, b.y);
    } else {
      ballA = makeRandom(a.x,a.y);
      let typeTries = 0;
      do{
        ballB = makeRandom(b.x,b.y);
        typeTries++;
      } while(ballB && ballA && ballB.constructor === ballA.constructor && typeTries < 200);
    }
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
    // pick random orb type: 0=healing,1=damage buff,2=speed buff,3=size up,4=size down
    const t = Math.floor(Math.random()*5);
    if(t === 0) orb = new HealingOrb(x,y, 300, 14);
    else if(t === 1) orb = new DamageOrb(x,y, 1.6, 14, 5000);
    else if(t === 2) orb = new SpeedOrb(x,y, 1.6, 14, 5000);
    else if(t === 3) orb = new SizeOrb(x,y, 1.5, 14, 5000);
    else orb = new SizeOrb(x,y, 0.7, 14, 5000);
  }
  spawnOrb();

  // respawn / match management
  let respawnActive = false;
  let respawnMs = 0;
  const RESPAWN_DELAY = 10000; // ms
  
  // Store next fight ball type names for announcement
  let nextBallTypeNameA = 'Ball';
  let nextBallTypeNameB = 'Ball';
  
  // Generate and determine what the next fight balls will be (without spawning them yet)
  function generateNextFightNames(){
    const ballTypes = [
      'Ball', 'SmallBall', 'BigBall', 'PoisonBall', 'SpikerBall', 'IceBall', 'StunBall', 
      'FeatherBall', 'MineBall', 'RageBall', 'TeleBall', 'MiyaBall', 'SamiBall', 'LuxiBall', 
      'MachineGunBall', 'CurveBall'
    ];
    const getRandomBallType = () => ballTypes[Math.floor(Math.random() * ballTypes.length)];
    
    nextBallTypeNameA = getRandomBallType();
    nextBallTypeNameB = getRandomBallType();
    
    // Ensure they're different types
    let tries = 0;
    while(nextBallTypeNameA === nextBallTypeNameB && tries < 50){
      nextBallTypeNameB = getRandomBallType();
      tries++;
    }
  }

  function fightEnded(){
    const alive = balls.filter(b => b.alive).length;
    return alive <= 1;
  }

  function startRespawn(){
    generateNextFightNames(); // Pre-generate the next fight ball types
    respawnActive = true; respawnMs = RESPAWN_DELAY; updateCountdownUI();
  }

  function cancelRespawn(){
    respawnActive = false; respawnMs = 0; updateCountdownUI();
  }

  function updateCountdownUI(){
    if(!respawnActive){ if (countdownEl) countdownEl.textContent = ''; return; }
    const s = Math.ceil(respawnMs/1000);
    // Display the NEXT fight names (pre-generated), not the current fight
    if (countdownEl) countdownEl.textContent = `Next Fight: ${nextBallTypeNameA} vs ${nextBallTypeNameB} - ${s}s`;
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
          const rawBDamage = bIsStunned ? 0 : Math.round(B.damage * (B.damageMultiplier || 1) * (bCrit ? 2 : 1));
          const rawADamage = aIsStunned ? 0 : Math.round(A.damage * (A.damageMultiplier || 1) * (aCrit ? 2 : 1));

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
        if(typeof orb.applyTo === 'function') orb.applyTo(b, spawnDamage);
        orb.alive = false;
        // respawn orb after random delay
        setTimeout(()=>{ spawnOrb(); }, 2000 + Math.random()*400000);
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
      if(!respawnActive) {
        // Check for draw (both balls dead)
        const aliveCount = balls.filter(b => b.alive).length;
        const isDraw = aliveCount === 0;
        
        if (isDraw) {
          // DRAW: Both balls died at same time
          if (winnerText) winnerText.textContent = `⚔️ It's a Draw!`;
          if (winnerUi) winnerUi.classList.remove('hidden');
          
          // Refund bet without loss
          if (playerSystem.hasActiveBet()) {
            const betAmount = playerSystem.getCurrentBet();
            playerSystem.clearBet(); // Refund bet
            addHistoryEntry(betAmount, null, 0); // Neutral history entry
            addChatMessage(`⚔️ Draw! Your bet of ${betAmount} coins was refunded. 🔄`, 'draw');
            updateCoinsDisplay();
          }
        } else {
          // NORMAL: One ball alive
          const winner = balls[0].alive ? 0 : 1;
          const winnerName = balls[winner].typeName;
          if (winnerText) winnerText.textContent = `🏆 ${winnerName} Wins!`;
          if (winnerUi) winnerUi.classList.remove('hidden');
          
          // Resolve bet when fight ends
          if(playerSystem.hasActiveBet()){
            // Determine winner (which ball is alive)
            const winnerIndex = balls[0].alive ? 0 : 1;
            const winnerName = balls[winnerIndex].typeName || 'Ball';
            const betResult = playerSystem.resolveBet(winnerIndex);
            
            // Add to history
            addHistoryEntry(betResult.betAmount, betResult.isWin, betResult.isWin ? betResult.coinsGained : betResult.betAmount);
            
            // Add to chat
            if (betResult.isWin) {
              addChatMessage(`✓ ${winnerName} won! You won ${betResult.coinsGained} coins! 🎉`, 'win');
            } else {
              addChatMessage(`✗ ${winnerName} won. You lost ${betResult.betAmount} coins. 😢`, 'loss');
            }
            
            // Show bet result UI
            if (betResultMessage) betResultMessage.textContent = betResult.message;
            if (betResultCoins) {
              if (betResult.isWin) {
                betResultCoins.textContent = `+${betResult.coinsGained} 🪙`;
                betResultCoins.classList.remove('loss');
              } else {
                betResultCoins.textContent = `-${betResult.betAmount} 🪙`;
                betResultCoins.classList.add('loss');
              }
            }
            if (betResultUi) betResultUi.classList.remove('hidden');
            updateCoinsDisplay();
          } else {
            // No bet was placed
            if (betResultUi) betResultUi.classList.add('hidden');
          }
        }
        
        // Unlock betting for respawn period
        bettingLocked = false;
        startRespawn();
      }
    }
    if(respawnActive){
      respawnMs -= nowDt;
      if(respawnMs <= 0){
        // respawn new fight with the announced ball types
        balls = spawnTwo(nextBallTypeNameA, nextBallTypeNameB);
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
        
        // Lock betting now that fight has started
        bettingLocked = true;
        // Hide betting UI and winner announcement
        if (bettingUi) bettingUi.classList.add('hidden');
        if (betResultUi) betResultUi.classList.add('hidden');
        if (winnerUi) winnerUi.classList.add('hidden');
        
        // Clear bet input
        if (betAmountInput) betAmountInput.value = '';
      } else {
        updateCountdownUI();
        // Show betting UI during respawn timer (if not already bet)
        if (!playerSystem.hasActiveBet()) {
          if (bettingUi) bettingUi.classList.remove('hidden');
        }
      }
    }
  }

  function updateHPUI(){
    const A = balls[0], B = balls[1];
    const aPct = Math.max(0, Math.min(1, A.hp / A.maxHp));
    const bPct = Math.max(0, Math.min(1, B.hp / B.maxHp));
    if (hpAfill) hpAfill.style.width = `${aPct*100}%`;
    if (hpBfill) hpBfill.style.width = `${bPct*100}%`;
    // include type name and color the text using the ball's color
    if (hpAtext) {
      hpAtext.textContent = `${A.typeName} — ${Math.round(A.hp)} / ${A.maxHp}`;
      hpAtext.style.color = A.color;
    }
    if (hpBtext) {
      hpBtext.textContent = `${B.typeName} — ${Math.round(B.hp)} / ${B.maxHp}`;
      hpBtext.style.color = B.color;
    }
    // display combo counters
    if (comboAtext) comboAtext.textContent = A.combo ? `Combo: ${A.combo}` : '';
    if (comboBtext) comboBtext.textContent = B.combo ? `Combo: ${B.combo}` : '';
    // color shift: green -> orange -> red
    if (hpAfill) hpAfill.style.background = aPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (aPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
    if (hpBfill) hpBfill.style.background = bPct > 0.5 ? 'linear-gradient(90deg,#4caf50,#66bb6a)' : (bPct > 0.2 ? 'linear-gradient(90deg,#ffa726,#ffb74d)' : 'linear-gradient(90deg,#f44336,#ef5350)');
  }

  function loop(){ draw(); requestAnimationFrame(loop); }
  loop();

  const resetBtn = document.getElementById('reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', ()=>{ 
      cancelRespawn(); 
      playerSystem.clearBet(); 
      balls = spawnTwo(); 
      for(const b of balls){ b.combo = 0; } 
      damagePopups.length = 0; 
      orb = null; 
      spawnOrb(); 
      updateHPUI();
      
      // Reset betting UI
      bettingLocked = true;
      if (bettingUi) bettingUi.classList.add('hidden');
      if (betResultUi) betResultUi.classList.add('hidden');
      if (winnerUi) winnerUi.classList.add('hidden');
      if (betAmountInput) betAmountInput.value = '';
      
      updateCoinsDisplay();
    });
  }
});
