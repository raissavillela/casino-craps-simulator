# Casino CRAPS Simulator #

### **Summary**
The Casino CRAPS Simulator is an interactive and realistic simulation of the classic casino dice game, Craps. Players can place various bets, experience the thrill of dice rolls, and track their bankrolls across multiple rounds of play. The simulator follows standard Craps rules and offers an engaging way to practice and refine betting strategies.


### **Key Features**
1. **Dice Rolling Simulation**: Randomly simulates the rolling of two six-sided dice, determining the outcome of each roll in the game.

2. **Multiple Bet Types**: Supports Pass Line, Odds, Place, Hardway, and Field bets, each with distinct payout structures.

3. **Bankroll Management**: Tracks player balance, allows bankroll input, and supports customizable walk-away limits.

4. **Automated Game Flow**: Handles Come Out Rolls, Point Phases, and resolves bets automatically based on Craps rules.

5. **Customizable Settings**:  Player can set initial bankroll, number of rounds, and bet amounts to tailor their gameplay experience.


### **How to Play**
1. **Come Out Roll**:    
   - A roll of 7 or 11 wins immediately.  
   - A roll of 2, 3, or 12 results in an immediate loss.
   - Any other number establishes a "point".

2. **Point Phase**: 
   - Players continue rolling to match the point before rolling a 7.
   - Rolling the point results in a win; rolling a 7 results in a loss.

3. **Bankroll Updates**: 
   - Winning bets increase the player's bankroll, while losing bets deduct from it. 
   - The game continues until the player reaches their walk-away limit or depletes their bankroll.


### **Bet Types and Payouts**
**Pass Line Bet**: Wins on 7 or 11, loses on 2, 3, or 12, and establishes a point otherwise.

**Place Bet**:  Bets on specific numbers with varied payouts (e.g., 9:5 for 4/10, 7:5 for 5/9, 7:6 for 6/8).

**Hardway Bet**:  Wins if the selected hard number (e.g., 4, 6, 8, or 10) is rolled as doubles before a 7.

**Field Bet**:  Wins on 2, 3, 4, 9, 10, 11, and 12, with 2 and 12 paying double, while all other winning numbers pay even money.


### **Installation and Setup**
To get started with the Casino CRAPS Simulator, follow these steps:

1. **Install Dependencies**
Ensure you have Node.js installed. Then, navigate to the project directory and run:

```bash
$ npm install
```

This will install all required dependencies listed in `package.json`.

2. **Run the Simulator**
To play the game, simply open `index.html` in a web browser.

3. **Running Tests**
This project includes automated tests to ensure correctness. The test file `craps-script.test.js` is used to validate game logic.

**Before Running Tests**

Uncomment the following line in `script.js` to enable testing:

```bash
// module.exports = { Dice, Bet, HardwayBet, PlaceBet, FieldBet, User, PlaySimulation };
```

Change it to:

```bash
module.exports = { Dice, Bet, HardwayBet, PlaceBet, FieldBet, User, PlaySimulation };
```

Run the Tests

Once the line is uncommented, execute the tests using:

  ```bash
$ npx jest
  ```

This will run all test cases and validate game functionality.


### **User Interface**

The simulator features an interactive web-based interface where players can input their bankroll, place bets, and view game results in real time. The game runs automatically, displaying dice rolls and outcomes in an easy-to-read format.


### **Conclusion**

The Casino CRAPS Simulator provides an engaging and risk-free environment for players to practice Craps betting strategies. Whether you're a beginner learning the game or an experienced player refining your skills, this simulator offers a fun and educational experience.