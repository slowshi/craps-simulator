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
  let totalStats = [];
  class Strategy {
    constructor(params = {}) {
      this.game = new Craps.Game();
      this.name = params['name'] || 'Strategy';
      this.rollCount = params['rollCount'] || 1;
      this.bankroll = params['bankroll'] || 200;
      this.goal = params['goal'] || 300;
      this.maxRolls = params['maxRolls'] || 0;
      this.totalRisk = params['totalRisk'] || 0;
      this.totalPayout = params['totalPayout'] || 0;
      if (typeof(params['evaluateRoll']) === 'function') {
        this.evaluateRoll = params['evaluateRoll'];
      }
    }
  }
  class ThreePointMolly extends Strategy{
    constructor(params) {
      params = (typeof(params) === 'object') ? params : {};
      super(params);
      // this.rollCount = 1;
      // this.bankroll = bankroll;
      // this.totalRisk = 0;
      // this.totalPayout = 0;
    }
    startSession(roll) {
      console.log(this.rollDice())
      if(this.bankroll >= this.goal || (this.maxRolls > 0 && this.rollCount === this.maxRolls && this.bankroll > 0)) {
        console.log('win', this.bankroll, this.goal)
      } else if(this.bankroll === 0 || (this.maxRolls > 0 && this.rollCount === this.maxRolls)) {
        console.log('fail!')
      } else {
        console.log("ROLLDICE")
        this.startSession()
      }
      // if ((bank > 0 && bank < goal && maxRolls === 0) || (maxRolls > 0 && rollCount < maxRolls && bank > 0 && bank < goal)) {
      //   callBet()
      // } else if ((bank >= goal && maxRolls === 0) || (bank > 0  && maxRolls > 0)) {
      //   stats.win = true
      //   totalStats.push(stats)
      // } else {
      //   stats.win = false
      //   totalStats.push(stats)
      // }
    }
    rollDice() {
      let _this = this;
      let totalPayout = 0
      let totalRisk = 0
      let passLineBet = _this.game.playerBets
      .filter((bet) => bet.bet.constructor === Craps.PassLineBet)
      if(passLineBet.length === 0 && _this.bankroll >= 5) {
        _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 5));
        _this.bankroll += -5
      } else if (_this.game.findBet(passLineBet[0]).oddsAmount === 0) {
        let passBet = passLineBet[0]
        let pointValue = _this.game.findBet(passBet).bet.pointValue
        let oddsAmount = MAX_ODDS[pointValue] * _this.game.findBet(passBet).amount
        if (_this.bankroll >= oddsAmount) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 0, oddsAmount));
          _this.bankroll += -oddsAmount
        }
      }
      if (_this.game.pointValue > 0) {
        let comeBets = _this.game.playerBets.filter((bet) => bet.bet.constructor === Craps.ComeBet)
        if(comeBets.length < 2 && _this.bankroll >= 5) {
          comeBets.push(_this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(), 5)))
          _this.bankroll += -5
        }
        comeBets.forEach(function(bet, index) {
          let pointValue = _this.game.findBet(bet).bet.pointValue
          let oddsAmount = MAX_ODDS[pointValue] * _this.game.findBet(bet).amount
          if(pointValue && _this.game.findBet(bet).oddsAmount === 0 && _this.bankroll >= oddsAmount) {
            _this.game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(pointValue), 0, oddsAmount))
            _this.bankroll += -oddsAmount
          }
        });
      }
      _this.game.playerBets.forEach((bet)=> {
        totalRisk += bet.amount + bet.oddsAmount
      })
      let diceRoll = new Craps.DiceRoll(...dice.roll());
      let currentStats = {
        rollCount: _this.rollCount,
        bets: _this.game.playerBets,
        totalRisk: totalRisk,
        roll: diceRoll.toString(),
        totalPayout: 0,
        bankroll: _this.bankroll
      }
      _this.rollCount++
      _this.game.rollComplete(diceRoll, (bet, pay) => {
        totalPayout += bet.amount + bet.oddsAmount + pay;
      });
      _this.bankroll += totalPayout
      currentStats.totalPayout = totalPayout
      currentStats.bankroll = _this.bankroll
      return currentStats;
    }
  //   clearAll() {

  //   }
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