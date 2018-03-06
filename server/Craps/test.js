import Craps from './crapsengine.js'
import dice from './Dice'
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
let startSettion = (bank = 200, goal = 300, maxRolls = 0) => {
  // console.log("Started new session with $200")
  let rollCount = 1
  let stats = {
    // rolls: [],
    rollCount: 1,
    win: false,
    bankRoll: 0
  };
  let callBet = () => {
    let totalPayout = 0
    let totalRisk = 0
    let passLineBet = game.playerBets
    .filter((bet) => bet.bet.constructor === Craps.PassLineBet)
    if(passLineBet.length === 0 && bank >= 5) {
      game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 5));
      bank += -5
    } else if (game.findBet(passLineBet[0]).oddsAmount === 0) {
      let passBet = passLineBet[0]
      let pointValue = game.findBet(passBet).bet.pointValue
      let oddsAmount = MAX_ODDS[pointValue] * game.findBet(passBet).amount
      if (bank >= oddsAmount) {
        game.makeBet(new Craps.PlayerBet(1, new Craps.PassLineBet(), 0, oddsAmount));
        bank += -oddsAmount
      }
    }
    if (game.pointValue > 0) {
      let comeBets = game.playerBets.filter((bet) => bet.bet.constructor === Craps.ComeBet)
      if(comeBets.length < 2 && bank >= 5) {
        comeBets.push(game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(), 5)))
        bank += -5
      }
      comeBets.forEach(function(bet, index) {
        let pointValue = game.findBet(bet).bet.pointValue
        let oddsAmount = MAX_ODDS[pointValue] * game.findBet(bet).amount
        if(pointValue && game.findBet(bet).oddsAmount === 0 && bank >= oddsAmount) {
          game.makeBet(new Craps.PlayerBet(1, new Craps.ComeBet(pointValue), 0, oddsAmount))
          bank += -oddsAmount
        }
      });
    }
    game.playerBets.forEach((bet)=> {
      totalRisk += bet.amount + bet.oddsAmount
    })
    let diceRoll = new Craps.DiceRoll(...dice.roll());
    let currentStats = {
      rollCount: rollCount,
      bets: game.playerBets,
      totalRisk: totalRisk,
      roll: diceRoll.toString(),
      totalPayout: 0,
      bankroll: bank
    }
    rollCount++
    stats.rollCount = rollCount
    game.rollComplete(diceRoll, (bet, pay) => {
      totalPayout += bet.amount + bet.oddsAmount + pay;
    });
    currentStats.totalPayout = totalPayout
    bank += totalPayout
    currentStats.bankroll = bank
    stats.bankRoll = bank
    stats.rollCount = rollCount
    if ((bank > 0 && bank < goal && maxRolls === 0) || (maxRolls > 0 && rollCount < maxRolls && bank > 0 && bank < goal)) {
      callBet()
    } else if ((bank >= goal && maxRolls === 0) || (bank > 0  && maxRolls > 0)) {
      stats.win = true
      totalStats.push(stats)
    } else {
      stats.win = false
      totalStats.push(stats)
    }
  }
  callBet()
}
// startSettion()
// console.log(totalStats);
let bank = 200
let goal = 300
let iterations = 1000
for(let i = 0; i < iterations; i++) {
  startSettion(bank, goal)
}
// console.log(totalStats);
let totalWins = 0
let totalLosses = 0
let averageRolls = {
  wins: 0,
  losses: 0
};
let winAverage = 0
totalStats.forEach(function(session){
  if (session.win) {
    averageRolls.wins += session.rollCount
    totalWins += 1
    winAverage += session.bankRoll
  } else {
    averageRolls.losses += session.rollCount
    totalLosses += 1
  }
})
console.log('3 Point Molly Starting with:', '$' + bank, 'with a goal of:', '$' + goal)
console.log('Probability:', (totalWins/iterations) * 1000/10 + '%')
console.log('Average Payout:','$' + Math.round(winAverage/totalWins*100)/100)
console.log('Average Roll Amount (Win):', Math.round(averageRolls.wins/totalWins))
console.log('Average Roll Amount (Loss):', Math.round(averageRolls.losses/(iterations - totalWins)))