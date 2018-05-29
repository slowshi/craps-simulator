import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'
const game = new Craps.Game();
class ThreePointNoMolly extends Strategy{
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.odds = params['odds'] || 0;
    this.comeBets = params['comeBets'] || 0;
    this.hardway = params['hardway'] || false;
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
          case Craps.HardwayBet:
            playerBet.setOverride(false);
          break;
          case Craps.DontPassLineBet:
          case Craps.DontComeBet:
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
    let passBetPointValue = 0;
    let setPoints = [];
    let passLineBet = [];
    let comeBets = [];
    _this.game.playerBets.forEach(function(playerBet){
      switch(playerBet.bet.constructor) {
        case Craps.DontPassLineBet:
          passLineBet.push(playerBet)
          passBetPointValue = playerBet.bet.pointValue;
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
          }
        break;
        case Craps.DontComeBet:
          comeBets.push(playerBet)
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
          }
        break;
      }
    })

    if(_this.game.pointValue === 0 && _this.bankroll >= this.minBet) {
      _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontPassLineBet(), this.minBet));
      _this.bankroll += -_this.minBet;
    }

    if (passBetPointValue > 0 && _this.game.findBet(passLineBet[0]).oddsAmount === 0 && passLineBet[0].override === null) {
      let gameBet = _this.game.findBet(passLineBet[0])
      let oddsAmount = 6 * gameBet.amount;
      if (_this.bankroll >= oddsAmount && oddsAmount > 0) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontPassLineBet(), 0, oddsAmount));
        _this.bankroll += -oddsAmount;
      }
    }
    if (passBetPointValue > 0  && passLineBet[0].override === null) {
      if(comeBets.length < _this.comeBets && _this.bankroll >= _this.minBet) {
        comeBets.push(_this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontComeBet(), _this.minBet)));
        _this.bankroll += -_this.minBet;
      }
      comeBets.forEach(function(bet, index) {
        var gameBet = _this.game.findBet(bet);
        let comePointValue = gameBet.bet.pointValue;
        let oddsAmount = 6 * gameBet.amount;
        if(comePointValue && gameBet.oddsAmount === 0 && _this.bankroll >= oddsAmount) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.DontComeBet(comePointValue), 0, oddsAmount));
          _this.bankroll += -oddsAmount;
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
  global.ThreePointNoMolly = ThreePointNoMolly;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
