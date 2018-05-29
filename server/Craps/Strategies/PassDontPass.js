import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'
const game = new Craps.Game();
class PassDontPass extends Strategy{
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.odds = params['odds'] || 0;
    this.passPress = 0;
    this.dontPassPress = 0;
  }
  startSession() {
    const PRESS_CHART = [1, 3, 7, 15, 30, 60, 120, 240];
    let rollStats = this.rollDice();
    let passBet = this.minBet * PRESS_CHART[this.passPress];
    let dontPassBet = this.minBet * PRESS_CHART[this.dontPassPress];
    this.sessionStats.push(rollStats)
    if((this.bankroll >= this.goal && this.goal > 0) || (this.maxRolls > 0 && this.rollCount === this.maxRolls && this.bankroll > 0)) {
      this.win = true;
      // this.clearTable();
    } else if(this.bankroll < (passBet + dontPassBet) || (this.stopLoss > 0 && this.bankroll < this.stopLoss) || (this.maxRolls > 0 && this.rollCount === this.maxRolls) || (this.passPress > 7 || this.dontPassPress > 7)) {
      this.win = false;
      // this.clearTable();
    } else {
      this.startSession();
    }
  }
  clearTable() {
    var _this = this;
    let remainingPlayerBets = _this.game.playerBets.filter((bet)=> bet.pid === 1);
    let dummyBettor = _this.game.playerBets.filter((bet)=> bet.pid === 2);
    if(dummyBettor.length === 0) {
      _this.game.makeBet(new Craps.PlayerBet(2, new Craps.PassLineBet(), _this.minBet))
    }
    if(remainingPlayerBets.length > 0) {
      let risk = 0;
      let setPoints = [];
      remainingPlayerBets.forEach(function(playerBet) {
        switch(playerBet.bet.constructor) {
          case Craps.HardwayBet:
            playerBet.setOverride(false);
          break;
          case Craps.PassLineBet:
          case Craps.ComeBet:
            playerBet.oddsAmount = 0;
            if(playerBet.bet.pointValue > 0) {
              setPoints.push(playerBet.bet.pointValue);
            }
          break;
        }
        risk += playerBet.amount + playerBet.oddsAmount;
      })
      let diceRoll = new Craps.DiceRoll(...dice.roll());
      let currentStats = {
        rollCount: _this.rollCount,
        bets: remainingPlayerBets,
        risk: risk,
        roll: diceRoll.toString(),
        payout: 0,
        bankroll: _this.bankroll,
        setPoints: setPoints,
        cleanupRolls: true
      };
      _this.rollCount++
      let payout = 0;
      _this.game.rollComplete(diceRoll, (bet, pay) => {
        if(bet && bet.pid === 1) {
          payout += bet.getBetAction() + pay;
        }
      });
      _this.bankroll += payout;
      currentStats.payout = payout;
      currentStats.bankroll = _this.bankroll;
      this.sessionStats.push(currentStats)
      remainingPlayerBets = _this.game.playerBets.filter((bet)=> bet.pid === 1)
      if(remainingPlayerBets.length > 0) {
        _this.clearTable()
      }
    }
  }
  rollDice() {
    const PRESS_CHART = [1, 3, 7, 15, 30, 60, 120, 240];
    let _this = this;
    let payout = 0;
    let risk = 0;
    let passLineBet = _this.game.playerBets
    .filter((bet) => (bet.bet.constructor === Craps.PassLineBet));
    let dontPassLineBet = _this.game.playerBets
    .filter((bet) => (bet.bet.constructor === Craps.DontPassLineBet));
    let passBet = _this.minBet * PRESS_CHART[_this.passPress];
    let dontPassBet = _this.minBet * PRESS_CHART[_this.dontPassPress];
    if(_this.bankroll >= (passBet + dontPassBet)) {
      if(passLineBet.length === 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), passBet));
        _this.bankroll += -passBet;
      }

      if(dontPassLineBet.length === 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontPassLineBet(), dontPassBet));
        _this.bankroll += -dontPassBet;
      }
    }

    _this.game.playerBets.forEach((bet)=> {
      risk += bet.amount + bet.oddsAmount;
    });
    let diceRoll = new Craps.DiceRoll(...dice.roll());
    let currentStats = {
      rollCount: _this.rollCount,
      bets: _this.game.playerBets,
      risk: risk,
      roll: diceRoll.toString(),
      payout: 0,
      bankroll: _this.bankroll,
      cleanupRolls: false
    };
    _this.rollCount++
    _this.game.rollComplete(diceRoll, (bet, pay) => {
      if (bet) {
        if (bet.bet.constructor === Craps.PassLineBet) {
          if (bet.getBetAction() + pay === 0) {
            _this.passPress += 1
          } else {
            _this.passPress = 0;
          }
        } else {
          if (bet.getBetAction() + pay === 0) {
            _this.dontPassPress += 1;
          } else {
            _this.dontPassPress = 0;
          }
        }
        payout += bet.amount + bet.oddsAmount + pay;
      }
    });

    _this.bankroll += payout;
    currentStats.payout = payout;
    currentStats.bankroll = _this.bankroll;
    return currentStats;
  }
}
function exportToGlobal(global) {
  global.PassDontPass = PassDontPass;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
