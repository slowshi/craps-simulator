import Random from 'random-js'

/**
 *
 */
class Dice {
  /**
   * @param {Boolean} debug
   */
  constructor() {
    this.history = [];
  }
  roll() {
    let random = new Random()
    let result = [random.integer(1,6), random.integer(1,6)];
    this.history.push(result)
    return result
  }
  batchRoll(count = 200) {
    for(var i = 0; i < count; i++) {
      this.roll();
    }
    return this.history;
  }
}
export default new Dice();