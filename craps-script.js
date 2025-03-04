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
        if (amount <= 0 || isNaN(amount)) {
            throw new Error("Bet amount must be greater than zero");
        }
        this.type = type;
        this.amount = amount;
    }
  
    calculatePayout(dice, user) {
        const result = dice.result;
        if (this.type === 'Pass Line') {
            if (!user.puck) {  // Come-out roll (no point established)
                if (result === 7 || result === 11) {
                    return this.amount * 2;  // Win on 7 or 11
                } else if ([2, 3, 12].includes(result)) {
                    return 0;  
                } else {
                    user.puck = true;  
                    user.point = result;
                    return 0;
                }
            } else {  // Point phase
                if (result === 7) {
                    user.puck = false;
                    user.point = 0;
                    return 0;  // Pass Line loses on 7 after point is established
                } else if (result === user.point) {
                    user.puck = false;
                    user.point = 0;
                    return this.amount * 2;
                }
            }
        }
        return 0;
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
      } else if ([3, 4, 9, 10, 11].includes(dice.result)) {
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
        this.puck = false;  // Point not established at the start
        this.point = 0;
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
            resultText += '7 Rolled, Pass Line Loses!';
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
  
    if (this.user.puck) {  // Check if point is established
        const payouts = this.placeBetNumbers.map(number => {
            const placeBet = new PlaceBet(this.placeBetAmount, [number]);
            return placeBet.calculatePayout(this.dice);
        });
  
        payouts.forEach(payout => {
            if (payout > 0) {
                resultText += ` Place Bet Wins! +$${payout}`;
                this.user.updateBankroll(payout);
            }
        });
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
    const walkAwayLimit = parseInt(document.getElementById('bankroll_walk').value) || 0;
    const stopWhenDepleted = document.getElementById('bankset_depleted').checked;

    let placeBetNumbers = [];
    let placeBetAmount = 0;
    let fieldBetAmount = parseInt(document.getElementById('field_bet_amount').value) || 0;
    let isValid = true;
    const bets = [];

    ['pass_line', 'odds'].forEach(type => {
        const checkbox = document.getElementById(type);
        const amountField = document.getElementById(`${type}_bet_amount`);
        let betAmount = parseInt(amountField.value) || 0;

        if (checkbox.checked && betAmount > 0) {
            bets.push(new Bet(type.replace('_', ' '), betAmount));
        } else if (checkbox.checked && betAmount <= 0) {
            isValid = false;
        }
    });

    const fieldCheckbox = document.getElementById('field');
    if (fieldCheckbox && fieldCheckbox.checked) {  // Check if element exists
        if (fieldBetAmount > 0) {
            bets.push(new FieldBet(fieldBetAmount));
        } else {
            isValid = false;
        }
    }
    
    [4, 5, 6, 8, 9, 10].forEach(num => {
        const placeCheckbox = document.getElementById(`${num}place`);
        const placeBetAmountInput = document.getElementById(`${num}place_bet_amount`);
    
        if (placeCheckbox && placeBetAmountInput) {  // Ensure both elements exist
            let amount = parseInt(placeBetAmountInput.value) || 0;
    
            if (placeCheckbox.checked && amount > 0) {
                placeBetNumbers.push(num);
                placeBetAmount = amount;
            } else if (placeCheckbox.checked && amount <= 0) {
                isValid = false;
            }
        } else {
            console.warn(`Missing elements for ${num}place or ${num}place_bet_amount`);
        }
    });
    
    if (!isValid || (bets.length === 0 && placeBetNumbers.length === 0)) {
        return;
    }
    
    const user = new User(bankrollStart, walkAwayLimit, stopWhenDepleted);
    const simulation = new PlaySimulation(user, rounds, playsPerRound, placeBetNumbers, placeBetAmount, fieldBetAmount);
    const results = simulation.startSimulation();
    
    const resultsElement = document.getElementById('textResults');
    if (resultsElement) {
        resultsElement.value = results;
    } else {
        console.warn("Element with ID 'textResults' not found");
    }
    
    document.addEventListener("DOMContentLoaded", function() {});
}    


// module.exports = { Dice, Bet, HardwayBet, PlaceBet, FieldBet, User, PlaySimulation };