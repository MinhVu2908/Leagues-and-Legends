// Player System: Manages coins, player profile, and betting

export class PlayerSystem {
  constructor() {
    this.playerName = "Test User";
    this.coins = 1000; // Starting coins
    this.currentBet = 0;
    this.betBallIndex = null; // 0 or 1, which ball player bet on
    this.INTEREST_RATE = 0.5; // 50% interest on winning bets
    this.load();
  }

  save() {
    try {
      const data = {
        playerName: this.playerName,
        coins: this.coins
      };
      localStorage.setItem('playerData', JSON.stringify(data));
      console.log(`✓ Coins saved: ${this.coins}`);
    } catch (err) {
      console.error('❌ Failed to save coins:', err);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('playerData');
      if (saved) {
        const data = JSON.parse(saved);
        this.playerName = data.playerName || "Test User";
        const loadedCoins = data.coins || 1000;
        this.coins = loadedCoins;
        console.log(`✓ Coins loaded from localStorage: ${this.coins}`);
      } else {
        console.log('ℹ No saved data found. Starting with 1000 coins.');
      }
    } catch (err) {
      console.error('❌ Failed to load coins:', err);
      this.coins = 1000;
    }
  }

  // Start a bet on a specific ball (0 or 1)
  placeBet(ballIndex, amount) {
    if (amount <= 0 || amount > this.coins) {
      return { success: false, message: "Invalid bet amount" };
    }
    if (ballIndex !== 0 && ballIndex !== 1) {
      return { success: false, message: "Invalid ball selection" };
    }
    
    this.currentBet = amount;
    this.betBallIndex = ballIndex;
    this.coins -= amount; // Deduct bet from coins
    this.save();
    
    return { 
      success: true, 
      message: `Bet ${amount} coins on Ball ${ballIndex === 0 ? 'A' : 'B'}` 
    };
  }

  // Resolve the bet after match ends
  // winnerIndex: 0 or 1 (which ball won)
  resolveBet(winnerIndex) {
    if (this.betBallIndex === null) {
      return { 
        success: false, 
        message: "No active bet", 
        coinsGained: 0 
      };
    }

    const isWin = this.betBallIndex === winnerIndex;
    let coinsGained = 0;

    if (isWin) {
      // Win: get bet back + interest
      coinsGained = Math.floor(this.currentBet * (1 + this.INTEREST_RATE));
      this.coins += coinsGained;
    } else {
      // Loss: already deducted from coins during placeBet
      coinsGained = 0;
    }

    this.save();
    
    const result = {
      success: true,
      isWin,
      coinsGained,
      betAmount: this.currentBet,
      message: isWin 
        ? `✓ Won! +${coinsGained} coins` 
        : `✗ Lost. -${this.currentBet} coins`
    };

    // Reset bet
    this.currentBet = 0;
    this.betBallIndex = null;

    return result;
  }

  clearBet() {
    // Called when resetting without playing
    if (this.betBallIndex !== null) {
      // Refund the bet
      this.coins += this.currentBet;
      this.save();
    }
    this.currentBet = 0;
    this.betBallIndex = null;
  }

  getPlayerName() {
    return this.playerName;
  }

  getCoins() {
    return this.coins;
  }

  getCurrentBet() {
    return this.currentBet;
  }

  getBetBallIndex() {
    return this.betBallIndex;
  }

  hasActiveBet() {
    return this.betBallIndex !== null;
  }
  
  // Debug: Check if localStorage matches current coins
  debugCheckSync() {
    const saved = localStorage.getItem('playerData');
    if (!saved) {
      console.warn('⚠️ No playerData in localStorage!');
      return false;
    }
    const data = JSON.parse(saved);
    const match = data.coins === this.coins;
    if (!match) {
      console.warn(`⚠️ MISMATCH: UI shows ${this.coins} coins, localStorage has ${data.coins} coins`);
      console.log('Syncing to localStorage value...');
      this.coins = data.coins;
      return false;
    }
    console.log(`✓ Coins in sync: ${this.coins}`);
    return true;
  }
}
