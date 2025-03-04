const { Dice, Bet, HardwayBet, PlaceBet, FieldBet, User, PlaySimulation } = require('../craps-script.js');

describe('Dice Class', () => {
    test('should roll a number between 2 and 12', () => {
        const dice = new Dice();
        for (let i = 0; i < 100; i++) {
            const roll = dice.roll();
            expect(roll).toBeGreaterThanOrEqual(2);
            expect(roll).toBeLessThanOrEqual(12);
        }
    });

    test('should roll all possible values between 2 and 12', () => {
        const dice = new Dice();
        const results = new Set();
        for (let i = 0; i < 1000; i++) {
            results.add(dice.roll());
        }
        for (let i = 2; i <= 12; i++) {
            expect(results.has(i)).toBe(true);
        }
    });    
});

describe('Bet Class', () => {
    test('Pass Line bet should win on come-out roll of 7 or 11', () => {
        const user = new User(100, 200, false);
        const dice = new Dice();
        dice.result = 7;
        const bet = new Bet('Pass Line', 10);
        expect(bet.calculatePayout(dice, user)).toBe(20);
    });

    test('Pass Line bet should lose on come-out roll of 2, 3, or 12', () => {
        const user = new User(100, 200, false);
        const dice = new Dice();
        dice.result = 2;
        const bet = new Bet('Pass Line', 10);
        expect(bet.calculatePayout(dice, user)).toBe(0);
    });

    test('should not allow negative or zero bet amounts', () => {
        expect(() => new Bet('Pass Line', -10)).toThrow();
        expect(() => new Bet('Pass Line', 0)).toThrow();
    });

    test('should return correct payout when point is established and won', () => {
        const user = new User(100, 200, false);
        user.puck = true;
        user.point = 8;
        const dice = new Dice();
        dice.result = 8;
        const bet = new Bet('Pass Line', 10);
        expect(bet.calculatePayout(dice, user)).toBe(20);
    }); 

    test('should return 0 when point is established but another number is rolled', () => {
        const user = new User(100, 200, false);
        user.puck = true;
        user.point = 6;
        const dice = new Dice();
        dice.result = 8;
        const bet = new Bet('Pass Line', 10);
        expect(bet.calculatePayout(dice, user)).toBe(0);
    });
});

describe('HardwayBet Class', () => {
    test('should win if doubles of selected number are rolled', () => {
        const dice = new Dice();
        dice.die1 = 2;
        dice.die2 = 2;
        dice.result = 4;
        const bet = new HardwayBet(10, [4]);
        expect(bet.calculatePayout(dice)).toBe(70);
    });

    test('should lose if non-doubles are rolled', () => {
        const dice = new Dice();
        dice.die1 = 2;
        dice.die2 = 3;
        dice.result = 5;
        const bet = new HardwayBet(10, [4]);
        expect(bet.calculatePayout(dice)).toBe(0);
    });
});

describe('FieldBet Class', () => {
    test('should pay double on 2 or 12', () => {
        const dice = new Dice();
        dice.result = 12;
        const bet = new FieldBet(10);
        expect(bet.calculatePayout(dice)).toBe(20);
    });

    test('should return the bet amount on 3, 4, 9, 10, or 11', () => {
        const dice = new Dice();
        dice.result = 9;
        const bet = new FieldBet(10);
        expect(bet.calculatePayout(dice)).toBe(10);
    });

    test('should lose on 5, 6, 7, or 8', () => {
        const dice = new Dice();
        dice.result = 6;
        const bet = new FieldBet(10);
        expect(bet.calculatePayout(dice)).toBe(-10);
    });
});

describe('User Class', () => {
    test('should update bankroll correctly', () => {
        const user = new User(100, 200, false);
        user.updateBankroll(50);
        expect(user.currentBankroll).toBe(150);
    });

    test('should check bankroll status correctly', () => {
        const user = new User(100, 200, false);
        expect(user.checkBankroll()).toBe(false);
        user.currentBankroll = 0;
        expect(user.checkBankroll()).toBe(true);
    });
});

describe('PlaySimulation Class', () => {
    test('should return a string result', () => {
        const user = new User(100, 200, false);
        const simulation = new PlaySimulation(user, 1, 1);
        const result = simulation.simulatePlay();
        expect(typeof result).toBe('string');
    });

    test('should stop simulation if bankroll is depleted', () => {
        const user = new User(10, 200, false);
        const simulation = new PlaySimulation(user, 10, 10);
        const result = simulation.startSimulation();
        expect(result.includes('Game Over')).toBe(true);
    });

    test('should stop simulation if walk-away limit is reached', () => {
        const user = new User(100, 150, false);
        const simulation = new PlaySimulation(user, 10, 10);
        user.updateBankroll(50);
        const result = simulation.startSimulation();
        expect(result.includes('Game Over')).toBe(true);
    });
});
