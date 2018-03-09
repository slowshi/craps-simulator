import Craps from '../crapsengine.js'
import dice from '../Dice'
(function() {
  const game = new Craps.Game();
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
      this.rollCount = 1;
      this.sessionStats = [];
      this.win = false;
      if (typeof(params['evaluateRoll']) === 'function') {
        this.evaluateRoll = params['evaluateRoll'];
      }
    }
  }
  class ThreePointMolly extends Strategy{
    constructor(params) {
      params = (typeof(params) === 'object') ? params : {};
      super(params);
      this.odds = params['odds'] || 0;
      this.comeBets = params['point'] || 0;
    }
    startSession() {
      let rollStats = this.rollDice()
      this.sessionStats.push(rollStats)
      if((this.bankroll >= this.goal && this.goal > 0) || (this.maxRolls > 0 && this.rollCount === this.maxRolls && this.bankroll > 0)) {
        this.win = true;
      } else if(this.bankroll < 5 || (this.stopLoss > 0 && this.bankroll < this.stopLoss) || (this.maxRolls > 0 && this.rollCount === this.maxRolls)) {
        this.win = false;
      } else {
        this.startSession()
      }
    }
    rollDice() {
      let _this = this;
      let totalPayout = 0
      let totalRisk = 0
      let passLineBet = _this.game.playerBets
      .filter((bet) => bet.bet.constructor === Craps.PassLineBet)
      if(passLineBet.length === 0 && _this.bankroll >= 5) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 5));
        _this.bankroll += -5;
      }

      if (passLineBet.length > 0 && _this.game.findBet(passLineBet[0]).oddsAmount === 0) {
        let gameBet = _this.game.findBet(passLineBet[0])
        let pointValue = gameBet.bet.pointValue;
        let oddsAmount = Math.min(_this.odds, MAX_ODDS[pointValue]) * gameBet.amount;
        if (_this.bankroll >= oddsAmount && oddsAmount > 0) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 0, oddsAmount));;
          _this.bankroll += -oddsAmount;
        }
      }

      if (_this.game.pointValue > 0) {
        let comeBets = _this.game.playerBets.filter((bet) => bet.bet.constructor === Craps.ComeBet)
        if(comeBets.length < _this.comeBets && _this.bankroll >= 5) {
          comeBets.push(_this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(), 5)));
          _this.bankroll += -5;
        }
        comeBets.forEach(function(bet, index) {
          var gameBet = _this.game.findBet(bet);
          let pointValue = gameBet.bet.pointValue;
          let oddsAmount = Math.min(_this.odds, MAX_ODDS[pointValue]) * gameBet.amount;

          if(pointValue && gameBet.oddsAmount === 0 && _this.bankroll >= oddsAmount && oddsAmount > 0) {
            _this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(pointValue), 0, oddsAmount));
            _this.bankroll += -oddsAmount;
          }
        });
      }
      _this.game.playerBets.forEach((bet)=> {
        totalRisk += bet.amount + bet.oddsAmount;
      });
      let diceRoll = new Craps.DiceRoll(...dice.roll());
      let currentStats = {
        rollCount: _this.rollCount,
        bets: _this.game.playerBets,
        totalRisk: totalRisk,
        roll: diceRoll.toString(),
        totalPayout: 0,
        bankroll: _this.bankroll
      };
      _this.rollCount++

      _this.game.rollComplete(diceRoll, (bet, pay) => {
        if (pay) {
          totalPayout += bet.amount + bet.oddsAmount + pay;
        }
      });
      _this.bankroll += totalPayout;
      currentStats.totalPayout = totalPayout;
      currentStats.bankroll = _this.bankroll;
      return currentStats;
    }
  }

  function exportToGlobal(global) {
    global.ThreePointMolly = ThreePointMolly;
  }

  // Export the classes for node.js use.
  if (typeof exports !== 'undefined') {
    exportToGlobal(exports);
  }

  // Add the classes to the window for browser use.
  if (typeof window !== 'undefined') {
    exportToGlobal(window);
  }

})();