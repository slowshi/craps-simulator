import {Strategy, MAX_ODDS} from './Strategy.js'
import Craps from '../crapsengine.js'
import dice from '../Dice'

const game = new Craps.Game();
class InsidePressCome extends Strategy{
  constructor(params) {
    params = (typeof(params) === 'object') ? params : {};
    super(params);
    this.odds = params['odds'] || 0;
    this.press = params['press'] || false;
    this.molly = params['molly'] || false;
    this.cross = params['cross'] || false;
    this.press8 = 1;
    this.press6 = 1;
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
    let passBetPointValue = 0;
    let setPoints = [];
    let passComePoints = [];
    let passLineBet = [];
    let placeBets = [];
    let comeBets = [];
    _this.game.playerBets.forEach(function(playerBet){
      switch(playerBet.bet.constructor) {
        case Craps.PlaceBet:
          placeBets.push(playerBet);
          setPoints.push(playerBet.bet.pointValue);
        break;
        case Craps.PassLineBet:
          passLineBet.push(playerBet)
          passBetPointValue = playerBet.bet.pointValue;
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
            passComePoints.push(playerBet.bet.pointValue);
          }
        break;
        case Craps.ComeBet:
          comeBets.push(playerBet)
          if(playerBet.bet.pointValue > 0) {
            setPoints.push(playerBet.bet.pointValue);
            passComePoints.push(playerBet.bet.pointValue);
          }
        break;
      }
    })
    let hasMinBet = (_this.bankroll >= _this.minBet);
    if(passLineBet.length === 0 && hasMinBet) {
      _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), this.minBet));
      _this.bankroll -= _this.minBet;
    }

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
      if (passBetPointValue > 0 && setPoints.indexOf(6) < 0) {
        let betAmount = (_this.minBet + (_this.minBet/5)) * _this.press6;
        if(_this.bankroll >= betAmount) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(6), betAmount));
          _this.bankroll -= betAmount;
          setPoints.push(6);
        }
      }
      if (passBetPointValue > 0 && setPoints.indexOf(8) < 0) {
        let betAmount = (_this.minBet + (_this.minBet/5)) * _this.press8;
        if(_this.bankroll >= betAmount) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.PlaceBet(8), betAmount));
          _this.bankroll -= betAmount;
          setPoints.push(8);
        }
      }
      if ((setPoints.indexOf(8) > -1 && setPoints.indexOf(6) > -1 && setPoints.indexOf(5) > -1)) {
        let fieldBets = _this.game.playerBets.filter((bet)=> bet.constructor === Craps.FieldBet);
        if(fieldBets.length === 0 && _this.cross && hasMinBet) {
          _this.game.makeBet(new Craps.PlayerBet(1, new Craps.FieldBet(), _this.minBet));
          _this.bankroll -= _this.minBet;
        }
      }
      if(passComePoints.length === 2 && passComePoints.indexOf(6) > -1 && passComePoints.indexOf(8) > -1 && _this.molly && hasMinBet) {
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
        if(bet.bet.constructor === Craps.PlaceBet && _this.press) {
          if(bet.bet.pointValue === 6) {
            if(pay > 0) {
              _this.press6 += 1;
            } else {
              _this.press6 = 1;
            }
          }
          if(bet.bet.pointValue === 8) {
            if(pay > 0) {
              _this.press8 += 1;
            } else {
              _this.press8 = 1;
            }
          }
        }
        if (bet.bet.constructor === Craps.PassLineBet && pay > 0 && bet.bet.pointValue) {
          _this.press6 = 1;
          _this.press8 = 1;
        }

        if (bet.bet.constructor === Craps.ComeBet && pay > 0 && bet.bet.pointValue && (bet.bet.pointValue === 6 || bet.bet.pointValue === 8)) {
          _this.press6 = 1;
          _this.press8 = 1;
          // console.log(_this.press6, _this.press8)
        }
        payout += bet.getBetAction() + pay;
      }
    });
    _this.bankroll += payout;
    currentStats.payout = payout;
    currentStats.bankroll = _this.bankroll;
    // console.log(currentStats.setPoints, currentStats.roll, currentStats.risk, currentStats.bankroll);

    return currentStats;
  }
}
function exportToGlobal(global) {
  global.InsidePressCome = InsidePressCome;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}
