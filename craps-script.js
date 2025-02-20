class Dice {
  constructor() {
      this.die1 = 0;
      this.die2 = 0;
      this.result = 0;
  }
  roll() {
      this.die1 = Math.floor(Math.random() * 6) + 1;
      this.die2 = Math.floor(Math.random() * 6) + 1;
      this.result = this.die1 + this.die2;
      return this.result;
  }
}

class Bet {
  constructor(type, amount) {
      this.type = type;
      this.amount = amount;
  }
  
  calculatePayout(dice) {
      const payouts = {
          'Pass Line': (dice.result === 7 || dice.result === 11) ? this.amount * 2 : 0,
          'Odds': {4: this.amount * 2, 10: this.amount * 2, 5: this.amount * 1.5, 9: this.amount * 1.5, 6: this.amount * 1.2, 8: this.amount * 1.2}[dice.result] || 0,
          'Place': 0,  
          'Hardway': 0 
      };
      return payouts[this.type] || 0;
  }
}

class HardwayBet extends Bet {
  constructor(amount, selectedNumbers) {
      super('Hardway', amount);
      this.selectedNumbers = selectedNumbers;
  }

  calculatePayout(dice) {
      if (dice.die1 !== dice.die2) return 0;
      if (this.selectedNumbers.includes(dice.result)) {
          return dice.result === 4 || dice.result === 10 ? this.amount * 7 : this.amount * 9;
      }
      return 0;
  }
}

class PlaceBet extends Bet {
  constructor(amount, selectedNumbers) {
      super('Place', amount);
      this.selectedNumbers = selectedNumbers;
  }

  calculatePayout(dice) {
      const placePayouts = {
          4: this.amount * 9 / 5,
          5: this.amount * 7 / 5,
          6: this.amount * 7 / 6,
          8: this.amount * 7 / 6,
          9: this.amount * 7 / 5,
          10: this.amount * 9 / 5
      };
      return this.selectedNumbers.includes(dice.result) ? Math.floor(placePayouts[dice.result]) : 0;
  }
}

class FieldBet extends Bet {
  constructor(amount) {
      super('Field', amount);
  }

  calculatePayout(dice) {
      if (dice.result === 12 || dice.result === 2) {
          return this.amount * 2; 
      } else if ([3, 4, 6, 8, 9, 10].includes(dice.result)) {
          return this.amount; 
      }
      return -this.amount;
  }
}

class User {
  constructor(startingBankroll, walkAwayLimit, stopWhenDepleted) {
      this.startingBankroll = startingBankroll;
      this.currentBankroll = startingBankroll;
      this.walkAwayLimit = walkAwayLimit;
      this.stopWhenDepleted = stopWhenDepleted;
      this.puck = false;
  }

  updateBankroll(amount) {
      this.currentBankroll += amount;
      this.currentBankroll = Math.round(this.currentBankroll);
  }

  checkBankroll() {
      return this.currentBankroll <= 0 || (this.walkAwayLimit && this.currentBankroll >= this.walkAwayLimit);
  }
}

class PlaySimulation {
  constructor(user, rounds, playsPerRound, placeBetNumbers = [], placeBetAmount = 0, fieldBetAmount = 0) {
      this.user = user;
      this.rounds = rounds;
      this.playsPerRound = playsPerRound;
      this.dice = new Dice();
      this.playCount = 0;
      this.results = '';
      this.point = 0;
      this.placeBetNumbers = placeBetNumbers;
      this.placeBetAmount = placeBetAmount;
      this.fieldBetAmount = fieldBetAmount;

      if (this.placeBetNumbers.length > 0) {
          let totalBetAmount = this.placeBetNumbers.length * this.placeBetAmount;
          this.user.updateBankroll(-totalBetAmount);
      }
  }

  simulatePlay() {
      this.playCount++;
      const roll = this.dice.roll();
      let resultText = `Play ${this.playCount}: Roll: ${roll} - `;

      if (!this.user.puck) {
          if ([7, 11].includes(roll)) {
              resultText += 'Pass Line Wins!';
              this.user.updateBankroll(10);
          } else if ([2, 3, 12].includes(roll)) {
              resultText += 'Pass Line Loses.';
              this.user.updateBankroll(-10);
          } else {
              resultText += `Point Established at ${roll}! `;
              this.user.puck = true;
              this.point = roll;
          }
      } else {
          if (roll === 7) {
              resultText += '7 Rolled, All Bets Lost!';
              this.user.updateBankroll(-10);
              this.user.puck = false;
              this.point = 0;
          } else if (this.point === roll) {
              resultText += 'Pass Line Wins!';
              this.user.updateBankroll(10);
              this.user.puck = false;
              this.point = 0;
          }
      }

      if (this.placeBetNumbers.includes(roll)) {
          const payoutMultipliers = { 4: 1.8, 5: 1.4, 6: 1.166, 8: 1.166, 9: 1.4, 10: 1.8 };
          const payout = Math.floor(this.placeBetAmount * payoutMultipliers[roll]);
          resultText += ` Place Bet on ${roll} Wins! +$${payout}`;
          this.user.updateBankroll(payout);
      }

      if (this.fieldBetAmount > 0) {
          const fieldBet = new FieldBet(this.fieldBetAmount);
          const payout = fieldBet.calculatePayout(this.dice);
          this.user.updateBankroll(payout);
          resultText += payout > 0 ? ` Field Bet Wins! +$${payout}` : ` Field Bet Loses! -$${this.fieldBetAmount}`;
      }

      resultText += `\nUpdated Bankroll: $${this.user.currentBankroll}`;
      return resultText;
  }

  startSimulation() {
      this.results = '';
      for (let round = 1; round <= this.rounds; round++) {
          for (let play = 1; play <= this.playsPerRound; play++) {
              const playResult = this.simulatePlay();
              this.results += playResult + '\n';
              if (this.user.checkBankroll()) {
                  this.results += 'Game Over: Bankroll Depleted or Walk Away Limit Reached.\n';
                  return this.results;
              }
          }
      }
      return this.results;
  }
}

function formSubmit() {
  const bankrollStart = parseInt(document.getElementById('bankroll_start').value);
  const rounds = parseInt(document.getElementById('num_rounds').value);
  const playsPerRound = parseInt(document.getElementById('num_plays').value);
  const walkAwayLimit = parseInt(document.getElementById('bankroll_walk').value);
  const stopWhenDepleted = document.querySelector('[name="bankset_depleted"]').checked;
  const placeBetNumbers = [];
  let placeBetAmount = 0;
  let fieldBetAmount = 0;

  let isValid = true;

  document.querySelectorAll('[name="bet_type"]').forEach((input) => {
      const value = input.value.trim();
      if (value !== "") {
          const betAmount = parseInt(value);
          if (!isNaN(betAmount) && betAmount >= 1 && betAmount <= 1000) {
              if (input.id === "place_bet_amount") {
                  placeBetAmount = betAmount;
              } else if (input.id === "field_bet_amount") {
                  fieldBetAmount = betAmount;
              } else if (input.dataset.type === "place") {
                  placeBetNumbers.push(parseInt(input.dataset.number));
              }
          } else {
              isValid = false;
          }
      }
  });

  if (!isValid) {
      return;
  }

  const user = new User(bankrollStart, walkAwayLimit, stopWhenDepleted);
  const simulation = new PlaySimulation(user, rounds, playsPerRound, placeBetNumbers, placeBetAmount, fieldBetAmount);
  const results = simulation.startSimulation();

  document.getElementById('textResults').value = results;
}

