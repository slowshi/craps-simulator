import Strategies from './Strategies'

let totalStats = [];
let iterations = 1000
let options = {
  goal: 0,
  bankroll: 200,
  maxRolls: 34,
  stopLoss: 0,
  odds: 5,
  comeBets: 2
};
for(let i = 0; i < iterations; i++) {
  let strat = new Strategies.ThreePointMolly(options);
  strat.startSession()
  totalStats.push({
    rollCount: strat.rollCount,
    win: strat.win,
    bankroll: strat.bankroll
  });
}
let totalWins = 0;
let totalLosses = 0;
let averageRolls = {
  wins: 0,
  losses: 0
};
let winAverage = 0;
let netWinLoss = 0;
totalStats.forEach(function(session){
  if (session.win) {
    averageRolls.wins += session.rollCount;
    totalWins += 1;
    winAverage += session.bankroll;
  } else {
    averageRolls.losses += session.rollCount;
    totalLosses += 1;
  }
  netWinLoss += session.bankroll;
})
console.log(options.comeBets + 1,'Point Molly Starting with:', '$' + options.bankroll, 'with a goal of:', '$' + options.goal);
console.log('Probability:', (totalWins/iterations) * 1000/10 + '%');
console.log('Average Payout:','$' + Math.round(winAverage/totalWins*100)/100);
console.log('Net win/loss:','$' + Math.round(netWinLoss/iterations*100)/100);
console.log('Average Roll Amount (Win):', Math.round(averageRolls.wins/totalWins));
console.log('Average Roll Amount (Loss):', Math.round(averageRolls.losses/(iterations - totalWins)));
