import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'
const game = new Craps.Game();
class IronCross extends Strategy {
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);

  }
  startSession() {
    let rollStats = this.rollDice()
    // console.log(JSON.stringify(rollStats, null, 2));
    this.sessionStats.push(rollStats)
    if((this.bankroll >= this.goal && this.goal > 0) || (this.maxRolls > 0 && this.rollCount === this.maxRolls && this.bankroll > 0)) {
      this.win = true;
    } else if(this.bankroll < this.minBet || (this.stopLoss > 0 && this.bankroll < this.stopLoss) || (this.maxRolls > 0 && this.rollCount === this.maxRolls)) {
      this.win = false;
    } else {
      this.startSession();
    }
  }
  rollDice() {
    let _this = this;
    let risk = 0;
    let dummyBettor = _this.game.playerBets.filter((bet)=> bet.pid === 2);
    let setPoints = [];
    let onField = false;
    _this.game.playerBets.forEach(function(playerBet){
      if(playerBet.pid === 1) {
        if(playerBet.bet.constructor === Craps.PlaceBet) {
          setPoints.push(playerBet.bet.pointValue)
        } else if (playerBet.bet.constructor === Craps.FieldBet) {
          onField = true;
        }
      }
    })
    if(dummyBettor.length === 0) {
      _this.game.makeBet(new Craps.PlayerBet(2, new Craps.PassLineBet(), 5))
    }
    if (_this.game.pointValue > 0) {
      if (_this.game.pointValue !== 5 && setPoints.indexOf(5) < 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(5), _this.minBet));
        _this.bankroll -= _this.minBet;
        setPoints.push(5);
      }
      if (_this.game.pointValue !== 6 && setPoints.indexOf(6) < 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(6), _this.minBet + (_this.minBet/5)));
        _this.bankroll -= _this.minBet + (_this.minBet/5);
        setPoints.push(6);
      }
      if (_this.game.pointValue !== 8 && setPoints.indexOf(8) < 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(8), _this.minBet + (_this.minBet/5)));
        _this.bankroll -= _this.minBet + (_this.minBet/5);
        setPoints.push(8);
      }
    }
    let fieldBets = _this.game.playerBets.filter((bet)=> bet.constructor === Craps.FieldBet);
    if(fieldBets.length === 0 && !onField) {
      _this.game.makeBet(new Craps.PlayerBet(1, new Craps.FieldBet(), _this.minBet));
      _this.bankroll -= _this.minBet;
      onField = true;
    }
    _this.game.playerBets.forEach((bet)=> {
      if(bet.pid === 1) {
        risk += bet.amount;
      }
    });
    // _this.game.playerBets.forEach((bet)=> {
    //   risk += bet.amount + bet.oddsAmount;
    // });
    let diceRoll = new Craps.DiceRoll(...dice.roll());
    let currentStats = {
      rollCount: _this.rollCount,
      bets: _this.game.playerBets.filter((bet)=> bet.pid === 1),
      risk: risk,
      roll: diceRoll.toString(),
      payout: 0,
      bankroll: _this.bankroll,
      setPoints: setPoints,
      onField: onField,
      cleanupRolls: false
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
    return currentStats;
  }
}
function exportToGlobal(global) {
  global.IronCross = IronCross;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
