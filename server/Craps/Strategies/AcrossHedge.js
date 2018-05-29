import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'
const game = new Craps.Game();
class AcrossHedge extends Strategy {
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.press = 5;
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
    let passBetPointValue = 0;
    let currentPress = 0;
    let setPoints = [];
    let passLineBet = [];

    _this.game.playerBets.forEach(function(playerBet){
      switch(playerBet.bet.constructor) {
        case Craps.DontPassLineBet:
          passLineBet.push(playerBet)
          passBetPointValue = playerBet.bet.pointValue;
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
          }
        break;
        case Craps.PlaceBet:
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
          }
        break;
      }
    })

    if(_this.game.pointValue === 0 && _this.bankroll >= _this.minBet) {
      _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontPassLineBet(), _this.minBet));
      _this.bankroll -= _this.minBet;
    }
    if (_this.game.pointValue > 0) {
      if (_this.game.findBet(passLineBet[0]).oddsAmount === 0 && passLineBet[0].override === null) {
        let gameBet = _this.game.findBet(passLineBet[0])
        let oddsAmount = 6 * gameBet.amount;
        if (_this.bankroll >= oddsAmount && oddsAmount > 0) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontPassLineBet(), 0, oddsAmount));
          _this.bankroll += -oddsAmount;
        }
      }
      var placeBets = [6,8,5,9].filter((num)=> num !== _this.game.pointValue);
      var mins = {
        6: 0,
        8: 0,
        5: 0,
        9: 0,
        4: 0,
        10: 0
      }
      for(var i = 0; i < _this.press; i++) {
        mins[placeBets[i % placeBets.length]] += 1;
      }
      placeBets.forEach((place, index)=>{
        var currentBet = _this.game.playerBets.filter((bet)=> bet.bet.constructor === Craps.PlaceBet && bet.bet.pointValue === place)
        var currentAmount = 0;
        if(currentBet.length > 0) {
          var currentAmount = currentBet[0].amount;
        }
        var press = mins[place];
        var bet = _this.minBet * press;
        if(place === 6 || place === 8) {
          bet = (_this.minBet + (_this.minBet/5)) * press;
        }
        var updateBet = bet - currentAmount;
        if (updateBet < 0) {
          currentBet[0].setOverride(false);
        }
        if (updateBet > 0 && _this.bankroll >= updateBet) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(place), updateBet));
          _this.bankroll -= updateBet;
          if(setPoints.indexOf(place) < 0){
            setPoints.push(place);
          }
        }
      });
    }
    _this.game.playerBets.forEach((bet)=> {
      risk += bet.amount + bet.oddsAmount;
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
      cleanupRolls: false
    };

    _this.rollCount++
    let payout = 0;
    _this.game.rollComplete(diceRoll, (bet, pay) => {
      if(bet.bet.constructor === Craps.PlaceBet && pay > 0) {
        var minVal = _this.minBet;
        if (bet.bet.pointValue === 6 || bet.bet.pointValue === 8) {
          minVal = _this.minBet + (_this.minBet/5);
        }
        var increment = bet.amount/minVal;
        if(increment > 3) {
          increment = 3;
        }
        if(_this.press < 15 && _this.press + increment > 15) {
          _this.press = 15;
        } else {
          _this.press += increment;
        }
      }
      if(bet.bet.constructor === Craps.DontPassLineBet && (pay > 0 || pay < 0 && _this.press > 15)) {
        _this.press = 3;
      }

      if(bet && bet.pid === 1) {
        payout += bet.amount + bet.oddsAmount + pay;
      }
    });
    // console.log(_this.press)
    _this.bankroll += payout;
    currentStats.payout = payout;
    currentStats.bankroll = _this.bankroll;
    return currentStats;
  }
}
function exportToGlobal(global) {
  global.AcrossHedge = AcrossHedge;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
