import dice from '../Dice'
import betting from '../Player'
import Promise from 'promise'

const TABLE_ACTIONS = {
  ROLLED: 0,
  POINT_ON: 2,
  POINT_HIT: 3,
  CRAPS: 4,
  WIN: 5,
  CRAPS_OUT: 6
}
/**
 *
 */
let rollCount = 0;
class Table {
  /**
   * @param {Boolean} debug
   */
  constructor() {
    this.dice = dice
    this.betting = betting;
    this.clearAll()
  }
  init() {
    let results = this.dice.history
    let rollCount = 0;
    for(let i in results) {
      let dice = results[i]
      let sum = dice[0] + dice[1]
      let hardways = dice[0] === dice[1]
      let hardwayString = hardways ? ' hardways' : '';
      let roll = {
        sum,
        hardways
      }
      let action = 0;
      this.stats.sum[sum] += 1
      if (hardways) {
        this.stats.hardways[sum] += 1
      }
      rollCount++
      if (this.point > 0 && roll.sum === 7) {
        actionString = '--Craps Out-- after ' + rollCount + ' rolls'
        this.stats.outcomes.crapOut += 1
        this.point = 0
        this.stats.rolls.sessions.push(rollCount);
        rollCount = 0
        action = TABLE_ACTIONS.CRAPS_OUT
      } else if (this.point === roll.sum) {
        actionString = 'Point Hit ' + roll.sum + hardwayString
        this.stats.point[roll.sum] += 1
        this.stats.outcomes.hit += 1
        this.point = 0
        action = TABLE_ACTIONS.POINT_HIT
      } else if (this.point > 0 && this.point !== roll.sum) {
        actionString = 'Rolled ' + roll.sum + hardwayString
        action = TABLE_ACTIONS.ROLLED
      } else if (roll.sum === 7 || roll.sum === 11) {
        actionString = 'Wins ' + roll.sum
        this.stats.outcomes.win += 1
        action = TABLE_ACTIONS.WIN
      } else if (roll.sum === 2 || roll.sum === 3 || roll.sum == 12) {
        actionString = 'Craps ' + roll.sum
        this.stats.outcomes.craps += 1
        action = TABLE_ACTIONS.CRAPS
      } else {
        this.point = roll.sum
        actionString = 'Point on '+ this.point
        action = TABLE_ACTIONS.POINT_ON
      }
      this.stats.tableCall.push(actionString);

      this.betting.resolveBet({
        sum,
        hardways,
        action
      });
    }

    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
    const arrMax = arr => Math.max(...this.stats.rolls.sessions);
    const arrMin = arr => Math.min(...this.stats.rolls.sessions);
    this.stats.rolls.longest = arrMax(this.stats.rolls.sessions)
    this.stats.rolls.shortest = arrMin(this.stats.rolls.sessions)
    this.stats.rolls.average = arrAvg(this.stats.rolls.sessions)
  }
  resolveTable(dice) {
    return new Promise(function (resolve, reject) {
      let sum = dice[0] + dice[1]
      let hardways = dice[0] === dice[1]
      let hardwayString = hardways ? ' hardways' : '';
      let roll = {
        sum,
        hardways
      }
      let action = 0;
      let actionString = '';
      this.stats.sum[sum] += 1
      if (hardways) {
        this.stats.hardways[sum] += 1
      }
      rollCount++
      if (this.point > 0 && roll.sum === 7) {
        actionString = '--Craps Out-- after ' + rollCount + ' rolls'
        this.stats.outcomes.crapOut += 1
        this.point = 0
        this.stats.rolls.sessions.push(rollCount);
        rollCount = 0
        action = TABLE_ACTIONS.CRAPS_OUT
      } else if (this.point === roll.sum) {
        actionString = 'Point Hit ' + roll.sum + hardwayString
        this.stats.point[roll.sum] += 1
        this.stats.outcomes.hit += 1
        this.point = 0
        action = TABLE_ACTIONS.POINT_HIT
      } else if (this.point > 0 && this.point !== roll.sum) {
        actionString = 'Rolled ' + roll.sum + hardwayString
        action = TABLE_ACTIONS.ROLLED
      } else if (roll.sum === 7 || roll.sum === 11) {
        actionString = 'Wins ' + roll.sum
        this.stats.outcomes.win += 1
        action = TABLE_ACTIONS.WIN
      } else if (roll.sum === 2 || roll.sum === 3 || roll.sum == 12) {
        actionString = 'Craps ' + roll.sum
        this.stats.outcomes.craps += 1
        action = TABLE_ACTIONS.CRAPS
      } else {
        this.point = roll.sum
        actionString = 'Point on '+ this.point
        action = TABLE_ACTIONS.POINT_ON
      }
      console.log(actionString);
      this.stats.tableCall.push(actionString);
      resolve({
        sum,
        hardways,
        action
      })
    }.bind(this))
    // const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
    // const arrMax = arr => Math.max(...this.stats.rolls.sessions);
    // const arrMin = arr => Math.min(...this.stats.rolls.sessions);
    // this.stats.rolls.longest = arrMax(this.stats.rolls.sessions)
    // this.stats.rolls.shortest = arrMin(this.stats.rolls.sessions)
    // this.stats.rolls.average = arrAvg(this.stats.rolls.sessions)
  }

  clearAll() {
    this.point = 0
    this.stats = {
      tableCall: [],
      outcomes: {
        hit: 0,
        crapOut: 0,
        craps: 0,
        win: 0
      },
      rolls: {
        sessions: [],
        longest: 0,
        shortest: 0,
        average: 0
      },
      point: {
        4: 0,
        5: 0,
        6: 0,
        8: 0,
        9: 0,
        10: 0,
      },
      sum: {
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
      },
      hardways: {
        2: 0,
        4: 0,
        6: 0,
        8: 0,
        10: 0,
        12: 0
      }
    }
  }
}

export default Table;