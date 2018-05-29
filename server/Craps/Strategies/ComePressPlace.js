import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'

const game = new Craps.Game();
class ComePressPlace extends Strategy{
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.odds = params['odds'] || 0;
    this.placeBets = {
      4: 0,
      5: 0,
      6: 2,
      8: 2,
      9: 0,
      10: 0
    };
  }
  startSession() {
    let rollStats = this.rollDice()
    this.sessionStats.push(rollStats)
    if((this.bankroll >= this.goal && this.goal > 0) || (this.maxRolls > 0 && this.rollCount === this.maxRolls && this.bankroll > 0)) {
      this.win = true;
      this.clearTable();
    } else if(this.bankroll < this.minBet || (this.stopLoss > 0 && this.bankroll < this.stopLoss) || (this.maxRolls > 0 && this.rollCount === this.maxRolls)) {
      this.win = false;
      this.clearTable();
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
          case Craps.PlaceBet:
            playerBet.setOverride(false);
            setPoints.push(playerBet.bet.pointValue);
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
    let _this = this;
    let payout = 0;
    let risk = 0;
    let setPoints = [];
    let passComePoints = [];
    let passBetPointValue = _this.game.pointValue;
    let passLineBet = _this.game.playerBets.filter((playerBet) => playerBet.bet.constructor === Craps.PassLineBet);
    let placeBets = [];
    let comeBets = _this.game.playerBets.filter((playerBet) => playerBet.bet.constructor === Craps.ComeBet);
    _this.game.playerBets.forEach(function(playerBet){
      if(playerBet.bet.pointValue > 0) {
        setPoints.push(playerBet.bet.pointValue);
      }
    })
    let hasMinBet = (_this.bankroll >= _this.minBet);
    if(passLineBet.length === 0 && hasMinBet) {
      _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), this.minBet));
      _this.bankroll -= _this.minBet;
    }
    // var placeBets = [6,8,5,9].filter((num)=> num !== _this.game.pointValue);
    // var mins = {
    //   6: 0,
    //   8: 0,
    //   5: 0,
    //   9: 0,
    //   4: 0,
    //   10: 0
    // }
    if (passBetPointValue > 0 && _this.game.findBet(passLineBet[0]).oddsAmount === 0 && passLineBet[0].override === null) {
      let gameBet = _this.game.findBet(passLineBet[0])
      let oddsAmount = Math.min(_this.odds, MAX_ODDS[passBetPointValue]) * gameBet.amount;
      if (_this.bankroll >= oddsAmount && oddsAmount > 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 0, oddsAmount));
        _this.bankroll -= oddsAmount;
      }
    }
    if (passBetPointValue > 0  && passLineBet[0].override === null) {
      if(comeBets.length < 1 && hasMinBet) {
        comeBets.push(_this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(), _this.minBet)));
        _this.bankroll -= _this.minBet;
      }

      comeBets.forEach(function(bet, index) {
        var gameBet = _this.game.findBet(bet);
        let comePointValue = gameBet.bet.pointValue;
        let oddsAmount = Math.min(_this.odds, MAX_ODDS[comePointValue]) * gameBet.amount;
        if(comePointValue && gameBet.oddsAmount === 0 && _this.bankroll >= oddsAmount && oddsAmount > 0) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(comePointValue), 0, oddsAmount));
          _this.bankroll -= oddsAmount;
        }
      });
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
      setPoints: setPoints,
      cleanupRolls: false
    };
    _this.rollCount++
    _this.game.rollComplete(diceRoll, (bet, pay) => {
      if (bet) {
        payout += bet.getBetAction() + pay;
        if((bet.bet.constructor === Craps.ComeBet || bet.bet.constructor === Craps.PassLineBet) &&
        (pay > 0 && bet.bet.pointValue > 0)) {
          _this.placeBets[bet.bet.pointValue] += (_this.minBet/5)
        }
        if (pay > 0 && bet.bet.pointValue > 0) {
          // console.log(bet.bet.pointValue, "WIN ON")
        }
        if(pay < 0) {
          // _this.placeBest = {
          //   4: 0,
          //   5: 0,
          //   6: 2,
          //   8: 2,
          //   9: 0,
          //   10: 0
          // }
          // console.log("CRAP OUT", pay)
        }
      }
    });
    console.log(_this.placeBets);
    _this.bankroll += payout;
    currentStats.payout = payout;
    currentStats.bankroll = _this.bankroll;
    // console.log(currentStats.setPoints, currentStats.roll, currentStats.payout);

    return currentStats;
  }
}
function exportToGlobal(global) {
  global.ComePressPlace = ComePressPlace;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
