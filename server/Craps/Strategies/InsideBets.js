import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'
const game = new Craps.Game();
class InsideBets extends Strategy {
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.actionState = 0;
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

    _this.game.playerBets.forEach(function(playerBet){
      if(playerBet.pid === 1) {
        if(playerBet.bet.constructor === Craps.PlaceBet) {
          setPoints.push(playerBet.bet.pointValue)
        }
      }
    })

    if(dummyBettor.length === 0) {
      _this.game.makeBet(new Craps.PlayerBet(2, new Craps.PassLineBet(), 5))
    }
    let makeBets = function makeBets(place, index) {
      var bet = _this.minBet;
      if(place === 6 || place === 8) {
        bet = (_this.minBet + (_this.minBet/5));
      }

      if (_this.bankroll >= bet && setPoints.indexOf(place) < 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(place), bet));
        _this.bankroll -= bet;
        setPoints.push(place);
      }
    };
    var mins = {
      6: 0,
      8: 0,
      5: 0,
      9: 0,
    }
    for(var i = 0; i < _this.actionState - 3; i++) {
      mins[[6,8,5,9][i % 4]] += 1;
    }

    if(_this.actionState === 0 || _this.actionState > 2) {
      [6,8,5,9].forEach(makeBets);
    } else if (_this.actionState === 1) {
      [6,8].forEach(makeBets);
    } else if (_this.actionState === 2) {
      [6,8,9].forEach(makeBets);
    }
    if(_this.game.pointValue > 0) {
      _this.game.playerBets.forEach((bet)=> {
        if(bet.pid === 1) {
          risk += bet.amount;
        }
      });
    }

    let diceRoll = new Craps.DiceRoll(...dice.roll());

    let currentStats = {
      point: _this.game.pointValue,
      rollCount: _this.rollCount,
      bets: _this.game.playerBets.filter((bet)=> bet.pid === 1),
      risk: risk,
      roll: diceRoll.toString(),
      payout: 0,
      bankroll: _this.bankroll,
      setPoints: setPoints,
      cleanupRolls: false
    };
    // console.log(_this.actionState, mins);

    _this.rollCount++
    let payout = 0;
    _this.game.rollComplete(diceRoll, (bet, pay) => {
      if(bet && bet.pid === 1) {
        if(pay > 0) {
          _this.actionState += 1;
        } else {
          _this.actionState = 0;
        }
        if(_this.actionState === 1) {

          let giveBacks = _this.game.playerBets
          .filter((bet)=> bet.pid === 1 && (bet.bet.pointValue === 5 || bet.bet.pointValue === 9))
          .forEach((bet)=>{
            payout += bet.amount;
          });

          let bets = _this.game.playerBets
          .filter((bet)=> bet.pid === 1 && (bet.bet.pointValue !== 5 && bet.bet.pointValue !== 9));
          _this.game.playerBets = bets.concat(dummyBettor);
        }
        payout += bet.amount + pay;
      }
    });
    _this.bankroll += payout;
    currentStats.payout = payout;
    currentStats.bankroll = _this.bankroll;

    return currentStats;
  }
}
function exportToGlobal(global) {
  global.InsideBets = InsideBets;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
