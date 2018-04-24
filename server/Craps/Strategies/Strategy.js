import Craps from '../crapsengine.js'
const MAX_ODDS = {
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3
}
class Strategy {
  constructor(params = {}) {
    this.game = new Craps.Game();
    this.name = params['name'] || 'Strategy';
    this.bankroll = params['bankroll'] || 0;
    this.goal =  params['goal'] || 0;
    this.maxRolls = params['maxRolls'] || 0;
    this.stopLoss = params['stopLoss'] || 0;
    this.minBet = params['minBet'] || 5;
    this.rollCount = 1;
    this.sessionStats = [];
    this.win = false;
    if (typeof(params['evaluateRoll']) === 'function') {
      this.evaluateRoll = params['evaluateRoll'];
    }
  }
}
function exportToGlobal(global) {
  global.Strategy = Strategy;
  global.MAX_ODDS = MAX_ODDS;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
