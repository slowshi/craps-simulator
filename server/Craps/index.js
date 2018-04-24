import Strategies from './Strategies'
function logStats (totalStats, _bankroll) {
  let totalWins = 0;
  let totalLosses = 0;
  let averageRolls = {
    wins: 0,
    losses: 0,
    total: 0
  };
  let winAverage = 0;
  let netWinLoss = 0;
  let highestWin = 0;
  let averageRisk = 0;
  let maxRisk = 0;
  let iterations = totalStats.length;
  let filteredStats = [].concat(totalStats)
  .filter((stat)=>{
    return stat.win
  })
  .sort((a,b) =>{
    return a.bankroll - b.bankroll;
  });
  var half = Math.floor(filteredStats.length/2);
  let medianWin = 0;
  if(filteredStats.length) {
    if(filteredStats.length % 2)
      medianWin = filteredStats[half].bankroll;
    else
      medianWin = (filteredStats[(half - 1)].bankroll + filteredStats[half].bankroll) / 2.0;
  }

  totalStats.forEach(function(session){
    if (session.win) {
      averageRolls.wins += session.rollCount;
      totalWins += 1;
      winAverage += session.bankroll;
      if(session.bankroll > highestWin) {
        highestWin = session.bankroll;
      }
    } else {
      averageRolls.losses += session.rollCount;
      totalLosses += 1;
    }
    if(session.maxRisk > maxRisk) {
      maxRisk = session.maxRisk;
    }
    averageRisk += session.averageRisk
    averageRolls.total += session.rollCount;
    netWinLoss += session.bankroll;
  })
  console.log('Probability:', (totalWins/iterations) * 1000/10 + '%');
  console.log('Average Winnings:','$' + Math.round((winAverage/totalWins)  - _bankroll));
  console.log('Median Win:', '$' + Math.floor(medianWin - _bankroll));
  console.log('Max Win:','$' + (highestWin - _bankroll));
  console.log('Net Win/Iterations:','$' + Math.round((netWinLoss/iterations) - _bankroll));
  console.log('Max Risk', '$' + maxRisk);
  console.log('Average Risk:', '$' + Math.round(averageRisk/iterations))
  console.log('Average Roll Amount (Total):', Math.round(averageRolls.total/iterations));
  console.log('Average Roll Amount (Win):', Math.round(averageRolls.wins/totalWins));
  console.log('Average Roll Amount (Loss):', Math.round(averageRolls.losses/(iterations - totalWins)));
}
function runner(_options, _iterations, _strategy) {
  let totalStats = [];
  for(let i = 0; i < _iterations; i++) {
    let strat = new _strategy(_options);
    strat.startSession();
    let maxRisk = 0;
    let risk = 0;
    strat.sessionStats.forEach((roll)=>{
      if(roll.risk > maxRisk) {
        maxRisk = roll.risk;
      }
      risk += roll.risk;
      // console.log(roll.setPoints, roll.roll, roll.risk, roll.bankroll);
    })
    let averageRisk = Math.round(risk/strat.rollCount);
    totalStats.push({
      rollCount: strat.rollCount,
      win: strat.win,
      bankroll: strat.bankroll,
      averageRisk: averageRisk,
      maxRisk: maxRisk
    });
  }
  logStats(totalStats, _options.bankroll);
}
function mollyStrat (_options, _iterations) {
  let iterations = _iterations || 20000;
  let options = _options || {
    goal: 0,
    bankroll: 200,
    maxRolls: 200,
    stopLoss: 0,
    odds: 5,
    minBet: 5,
    comeBets: 2,
    hardway: false
  };
  console.log('---', options.comeBets + 1 + ' Point Molly with:', '$' + options.bankroll, 'Minimum Bets:', '$' + options.minBet);
  runner(options, iterations, Strategies.ThreePointMolly);
}

function ironCrossStrat(_options, _iterations) {
  let iterations = _iterations || 20000;
  let options = _options || {
    goal: 0,
    bankroll: 200,
    maxRolls: 100,
    stopLoss: 0,
    minBet: 5,
  };
  console.log('---Iron Cross Starting with:', '$' + options.bankroll, 'Minimum Bets:', '$' + options.minBet);
  runner(options, iterations, Strategies.IronCross);
}

function insidePressComeStrat(_options, _iterations) {
  let iterations = _iterations || 20000;
  let options = _options || {
    goal: 0,
    bankroll: 250,
    maxRolls: 200,
    stopLoss: 0,
    minBet: 5,
    molly: false,
    cross: false,
    press: false,
    odds: 1
  };
  console.log('---Inside Press Come with:', '$' + options.bankroll, 'Minimum Bets:', '$' + options.minBet, 'Molly:', options.molly, 'Cross:', options.cross, 'Press:', options.press);
  runner(options, iterations, Strategies.InsidePressCome);
}

function passDontPass(_options, _iterations) {
  let iterations = _iterations || 20000;
  let options = _options || {
    goal: 0,
    bankroll: 2830,
    maxRolls: 200,
    stopLoss: 0,
    odds: 1,
    minBet: 5,
  };
  console.log('--- Pass/Dont Pass with:', '$' + options.bankroll, 'Minimum Bets:', '$' + options.minBet);
  runner(options, iterations, Strategies.PassDontPass);
}

function noMollyStrat (_options, _iterations) {
  let iterations = _iterations || 20000;
  let options = _options || {
    goal: 0,
    bankroll: 200,
    maxRolls: 200,
    stopLoss: 0,
    odds: 5,
    minBet: 5,
    comeBets: 2,
    hardway: false
  };
  console.log('---', options.comeBets + 1 + ' NO Point Molly with:', '$' + options.bankroll, 'Minimum Bets:', '$' + options.minBet);
  runner(options, iterations, Strategies.ThreePointNoMolly);
}
// mollyStrat();
// ironCrossStrat();
var iterations = 1000;
var strat = {
  goal: 0,
  bankroll: 2380,
  maxRolls: 200,
  stopLoss: 0,
  minBet: 10,
  odds: 2,
  press: true,
  molly: false,
  cross: false
};
let molly = {
  goal: 0,
  bankroll: 2380,
  maxRolls: 200,
  stopLoss: 0,
  minBet: 5,
  odds: 2,
  comeBets: 2,
  hardway: false
};
let passDontPassBets = {
  goal: 0,
  bankroll: 2380,
  maxRolls: 200,
  stopLoss: 0,
  odds: 1,
  minBet: 5,
}
insidePressComeStrat(strat, iterations);
molly.minBet = 10;
mollyStrat(molly, iterations);
molly.minBet = 5;
noMollyStrat(molly, iterations);
passDontPass(passDontPassBets, iterations);
