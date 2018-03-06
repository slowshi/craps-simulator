const TABLE_ACTIONS = {
  ROLLED: 0,
  POINT_ON: 2,
  POINT_HIT: 3,
  CRAPS: 4,
  WIN: 5,
  CRAPS_OUT: 6
}
const BETS = {
  PLACE: [4,5,6,8,9,10],
  LAY: [4,5,6,8,9,10],
  FIELD: [2,3,4,5,9,10,11,12],
}

/**
 *
 */
class Betting {
  /**
   * @param {Boolean} debug
   */
  constructor(backroll = 200) {
    this.bankroll = backroll;
    this.clearAll();
  }
  setBet(bet) {
    console.log('add a bet');
  }
  resolveBet(roll) {
    switch (roll.action) {
      case TABLE_ACTIONS.ROLLED:
        if(BETS.PLACE.indexOf(roll.sum) > -1) {
          var bet = this.minBet
          if (roll.sum === 6 || roll.sum === 8) {
            bet = this.minBet + 1;
          }
          var pay = this.currentBet['place' + roll.sum] * bet;
          if (pay > 0) {
            console.log("Place",roll.sum,"Pays", pay)
          }
        }
      break;
      case TABLE_ACTIONS.POINT_ON:
      break;
      case TABLE_ACTIONS.POINT_HIT:
      break;
      case TABLE_ACTIONS.CRAPS:
      break;
      case TABLE_ACTIONS.WIN:
      break;
      case TABLE_ACTIONS.CRAPS_OUT:
      break;
    }
  }
  clearAll() {
    this.minBet = 5;
    this.betTotal = 0;
    this.currentBet = {
      come: [],
      dontCome: [],
      pass: 0,
      dontPass: 0,
      place4: 0,
      place5: 0,
      place6: 1,
      place8: 1,
      place9: 0,
      place10: 0,
      lay4: 0,
      lay5: 0,
      lay6: 0,
      lay8: 0,
      lay9: 0,
      lay10: 0,
      field: 0,
      hard4: 0,
      hard6: 0,
      hard8: 0,
      hard10: 0
    }
    this.bets = {
      pass: 0,
      dontPass: 0,
      come: 0,
      dontCome: 0,
      place4: 0,
      place5: 0,
      place6: 1,
      place8: 1,
      place9: 0,
      place10: 0,
      lay4: 0,
      lay5: 0,
      lay6: 0,
      lay8: 0,
      lay9: 0,
      lay10: 0,
      field: 0,
      hard4: 0,
      hard6: 0,
      hard8: 0,
      hard10: 0
    }
    this.settings = {
      maxOddsPass: false,
      maxOddsCome: false,
      hardwayWorking: false,
      oddsWorking: false,
      placeWoring: false
    }
    this.history = [];
  }
}

export default new Betting();