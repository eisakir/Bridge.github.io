"use strict";

const q = (question, answers, correct, explanation) => ({
    question,
    answers,
    correct,
    explanation
});

window.bridgeQuestionBank = [
    q("What is the highest-ranking card in Bridge?", ["Ace", "King", "Queen", "Jack"], 0, "The Ace is the highest-ranking card."),
    q("How many players are in Contract Bridge?", ["2", "3", "4", "5"], 2, "Bridge is played by four players in two partnerships."),
    q("How many cards does each player receive?", ["10", "12", "13", "15"], 2, "A 52-card deck gives each of the four players 13 cards."),
    q("Which players are partners?", ["North and East", "North and South", "North and West", "East and South"], 1, "North and South are partners; East and West are partners."),
    q("How many cards are in a standard Bridge deck?", ["40", "48", "52", "54"], 2, "Bridge uses a standard 52-card deck without jokers."),
    q("How many jokers are used in Bridge?", ["0", "1", "2", "4"], 0, "Contract Bridge does not use jokers."),
    q("Which is the lowest-ranking card?", ["Ace", "Two", "Jack", "Ten"], 1, "The two is the lowest-ranking card."),
    q("Which rank comes immediately below the King?", ["Ace", "Queen", "Jack", "Ten"], 1, "The rank order begins A, K, Q, J, 10."),
    q("Partners sit where?", ["Beside each other", "Opposite each other", "Anywhere", "At separate tables"], 1, "Partners sit opposite one another."),
    q("How many cards are played to one trick?", ["2", "3", "4", "13"], 2, "Each player contributes one card, making four cards in a trick."),

    q("Who makes the first call in the auction?", ["North", "The dealer", "The dealer's partner", "The oldest player"], 1, "The dealer begins the auction."),
    q("In what direction does bidding proceed?", ["Clockwise", "Counterclockwise", "Across the table", "Randomly"], 0, "The auction proceeds clockwise."),
    q("What is the lowest possible bid?", ["1♣", "1♦", "1♠", "1NT"], 0, "The bidding ladder begins at 1♣."),
    q("Which is highest at the one level?", ["1♣", "1♦", "1♥", "1NT"], 3, "At the same level, the order is clubs, diamonds, hearts, spades, no trump."),
    q("Which bid outranks 1♥?", ["1♦", "1♣", "1♠", "Pass"], 2, "Spades rank above hearts in the bidding order."),
    q("Which bid is the lowest legal bid after 1♠?", ["1♥", "1NT", "1♦", "1♠ again"], 1, "At the one level, 1NT comes immediately after 1♠."),
    q("What does a bid of 1♣ promise?", ["1 trick", "6 tricks", "7 tricks", "13 tricks"], 2, "A contract requires six book tricks plus the bid level: 6 + 1 = 7."),
    q("What does a bid of 2♠ promise?", ["2 tricks", "7 tricks", "8 tricks", "9 tricks"], 2, "A two-level contract requires eight tricks."),
    q("What does 3NT require?", ["3 tricks", "8 tricks", "9 tricks", "10 tricks"], 2, "Three plus six equals nine required tricks."),
    q("What does 4♥ require?", ["8 tricks", "9 tricks", "10 tricks", "11 tricks"], 2, "Four plus six equals ten required tricks."),

    q("What does 5♦ require?", ["9 tricks", "10 tricks", "11 tricks", "12 tricks"], 2, "Five plus six equals eleven required tricks."),
    q("What does 6♠ require?", ["10 tricks", "11 tricks", "12 tricks", "13 tricks"], 2, "Six plus six equals twelve required tricks."),
    q("What does 7NT require?", ["10 tricks", "11 tricks", "12 tricks", "13 tricks"], 3, "A seven-level contract requires all thirteen tricks."),
    q("What does Pass mean?", ["End the game", "Choose not to bid at that turn", "Accept defeat", "Skip playing a card"], 1, "Pass means making no bid on that turn."),
    q("After a bid, what normally ends the auction?", ["One pass", "Two passes", "Three consecutive passes", "The dealer passing"], 2, "Three consecutive passes after a bid end the auction."),
    q("If all four players pass initially, what is the result?", ["A 1♣ contract", "A redeal or passed-out board", "Dealer becomes declarer", "No-trump play"], 1, "With four opening passes, the hand is passed out."),
    q("What becomes the contract?", ["The first bid", "The dealer's bid", "The final highest bid", "The longest suit"], 2, "The final highest bid determines the contract."),
    q("What is the strain of a contract?", ["The score", "The trump suit or no trump", "The dealer", "The number of players"], 1, "The strain is the named trump suit or no trump."),
    q("What does a Double generally do?", ["Changes trump", "Challenges an opponent's contract and raises the stakes", "Ends the auction", "Adds one trick"], 1, "A double challenges the opponents' contract and increases scoring consequences."),
    q("When can a Redouble be made?", ["After your side's contract is doubled", "After any pass", "Before any bid", "During card play"], 0, "A redouble responds when the opponents have doubled your side's contract."),

    q("Who becomes declarer?", ["The dealer", "The last bidder", "The first player from the winning partnership who named the final strain", "The player with most points"], 2, "Declarer is the first player on the declaring side who bid the final strain."),
    q("Who becomes dummy?", ["Declarer's partner", "Declarer's left opponent", "The dealer", "The opening leader"], 0, "The declarer's partner becomes dummy."),
    q("Who makes the opening lead?", ["Declarer", "Dummy", "The player to declarer's left", "The dealer"], 2, "The defender on declarer's left makes the opening lead."),
    q("When is dummy placed face up?", ["Before the auction", "After the opening lead", "After seven tricks", "At the end"], 1, "Dummy is exposed after the opening lead."),
    q("Who chooses the cards played from dummy?", ["Dummy", "Declarer", "Either defender", "The dealer"], 1, "Declarer directs the play from dummy."),
    q("How many hands does declarer control during play?", ["One", "Two", "Three", "Four"], 1, "Declarer plays both their own hand and dummy."),
    q("How many defenders are there?", ["One", "Two", "Three", "Four"], 1, "The two members of the opposing partnership defend."),
    q("What is the defenders' goal?", ["Help declarer", "Prevent the contract from being made", "Reveal their cards", "Change the contract"], 1, "Defenders try to hold declarer below the required number of tricks."),
    q("How many tricks are played in a complete hand?", ["7", "10", "12", "13"], 3, "All 52 cards are played in thirteen four-card tricks."),
    q("Who leads to the next trick?", ["The dealer", "Declarer", "The winner of the previous trick", "Dummy"], 2, "The winner of each trick leads the next one."),

    q("If you hold the suit led, what must you do?", ["Play any suit", "Follow suit", "Play trump", "Pass"], 1, "You must follow suit whenever possible."),
    q("If you cannot follow suit, what may you do?", ["Only pass", "Play a card from another suit", "Take back the lead", "End the trick"], 1, "When void in the led suit, you may play another suit, including trump."),
    q("Without a trump played, what normally wins a trick?", ["Highest card of the suit led", "Any Ace", "Last card played", "Highest card of any suit"], 0, "Only cards in the led suit can win unless a trump is played."),
    q("In a trump contract, what beats every non-trump card?", ["Any club", "A trump card", "The opening lead", "The dealer's card"], 1, "Even a low trump beats cards from non-trump suits."),
    q("If two trump cards are played, which wins?", ["The first trump", "The last trump", "The higher trump", "The lower trump"], 2, "The higher-ranking trump wins."),
    q("In no trump, how is a trick won?", ["By the highest card of the suit led", "By hearts", "By the last card", "By declarer automatically"], 0, "No-trump contracts have no trump suit, so the highest card in the led suit wins."),
    q("West leads ♣8 and East plays ♣K. No trump is played. Which currently leads?", ["West", "East", "Neither", "Dummy"], 1, "The King outranks the eight in the suit led."),
    q("Spades are led and you have a spade. Can you play a heart instead?", ["Yes, always", "Only if it is an Ace", "No", "Only as dummy"], 2, "You must follow suit when able."),
    q("Hearts are trump. Can ♥2 beat ♠A on a spade lead if the player is void in spades?", ["Yes", "No", "Only in no trump", "Only on the first trick"], 0, "A legal trump beats every non-trump card."),
    q("What is a revoke?", ["A legal pass", "Failing to follow suit when able", "Winning with trump", "Changing a bid"], 1, "A revoke is an illegal failure to follow suit."),

    q("What is an overtrick?", ["A trick above the contract requirement", "A lost trick", "The opening lead", "A doubled trick"], 0, "Extra tricks beyond the contract are overtricks."),
    q("What is an undertrick?", ["An extra trick", "A trick short of the contract", "A trump trick", "Dummy's first trick"], 1, "Each trick below the contract requirement is an undertrick."),
    q("A 4♠ contract wins 10 tricks. What happened?", ["One undertrick", "Contract made exactly", "One overtrick", "Passed out"], 1, "A four-level contract requires exactly ten tricks."),
    q("A 4♠ contract wins 11 tricks. What happened?", ["One overtrick", "One undertrick", "Two overtricks", "Contract failed"], 0, "Eleven is one more than the ten required."),
    q("A 4♠ contract wins 9 tricks. What happened?", ["Contract made", "One overtrick", "One undertrick", "Two undertricks"], 2, "Nine is one fewer than the ten required."),
    q("A 3NT contract wins 11 tricks. How many overtricks?", ["0", "1", "2", "3"], 2, "3NT requires nine tricks, so eleven tricks gives two overtricks."),
    q("A 5♦ contract wins 9 tricks. How many undertricks?", ["1", "2", "3", "4"], 1, "5♦ requires eleven tricks, so nine tricks is two short."),
    q("What is a small slam?", ["A five-level contract", "A six-level contract", "A seven-level contract", "Any doubled contract"], 1, "A contract at the six level is called a small slam."),
    q("What is a grand slam?", ["A game contract", "A six-level contract", "A seven-level contract", "A no-trump part-score"], 2, "A seven-level contract, requiring all thirteen tricks, is a grand slam."),
    q("What is duplicate Bridge designed to reduce?", ["Teamwork", "The effect of luck from the deal", "The number of cards", "Bidding"], 1, "Multiple tables play the same deals, making comparisons more skill-focused."),

    q("What is a singleton?", ["A one-card suit", "A two-card suit", "A suit with no cards", "One high card point"], 0, "A singleton is a suit containing exactly one card."),
    q("What is a doubleton?", ["No cards in a suit", "One card in a suit", "Two cards in a suit", "Two Aces"], 2, "A doubleton is a suit containing exactly two cards."),
    q("What is a void?", ["No cards in a suit", "One card in a suit", "No high cards", "A passed-out hand"], 0, "A void means holding no cards in a particular suit."),
    q("What is a lead?", ["The first card played to a trick", "The final bid", "A scoring bonus", "Dummy's hand"], 0, "The lead is the first card of a trick."),
    q("What is a finesse?", ["A technique for trying to win with a lower honor", "A scoring penalty", "A forced opening bid", "A redeal"], 0, "A finesse positions a lower honor to win if an opposing higher honor is favorably placed."),
    q("What is a part-score?", ["A successful contract below game level", "Exactly half the tricks", "A failed contract", "A grand slam"], 0, "A part-score contract does not earn the game bonus."),
    q("What is Rubber Bridge?", ["A traditional social scoring format", "A type of card", "A bidding convention", "A two-player game"], 0, "Rubber Bridge is a traditional form often played socially."),
    q("What is the auction?", ["The bidding phase", "The scoring phase", "The final trick", "The shuffle"], 0, "The auction is the bidding that determines the contract."),
    q("What is a contract?", ["The final winning bid", "The first card led", "The partnership agreement only", "A four-card trick"], 0, "The contract is the final bid the declaring side must try to fulfill."),
    q("What is trump?", ["A suit that can beat non-trump suits", "The suit led every time", "Always spades", "The highest card only"], 0, "The contract may designate one suit as trump."),

    q("Before bidding, what should every player check?", ["That they have 13 cards", "That they have an Ace", "That they are dealer", "That dummy is visible"], 0, "Each player should begin with exactly thirteen cards."),
    q("Which is good Bridge etiquette?", ["Rush slow players", "Comment during the hand", "Allow everyone time to think", "Blame partner"], 2, "Players should be patient and allow others to think."),
    q("When is a good time to discuss an interesting hand?", ["While it is still being played", "After it is finished", "During an opponent's turn", "Before dummy appears"], 1, "Discussing the hand afterward avoids giving unauthorized information."),
    q("What should a beginner focus on first?", ["Memorizing every convention", "Fundamental rules and enjoying play", "Never making mistakes", "Advanced squeezes"], 1, "Strong fundamentals and comfortable practice come before advanced conventions."),
    q("Why should players watch every card?", ["To track suits and plan later tricks", "To slow the game", "To change the score", "To reveal partner's hand"], 0, "Watching the cards helps you infer distributions and plan."),
    q("What should you avoid doing to your partner?", ["Encouraging them", "Blaming them for mistakes", "Reviewing later", "Sitting opposite them"], 1, "Good partnership etiquette means learning without blame."),
    q("What is the best description of Bridge?", ["A solo luck game", "A partnership trick-taking game with bidding", "A five-player shedding game", "A casino-only game"], 1, "Bridge combines partnership bidding with trick-taking card play."),
    q("Why is counting tricks useful?", ["It shows whether the contract is on track", "It changes card ranks", "It chooses the dealer", "It ends the auction"], 0, "Both sides need to know how many tricks they have won and still need."),
    q("Which skill is central to Bridge?", ["Teamwork", "Physical speed", "Dice rolling", "Bluffing with extra cards"], 0, "Bridge is fundamentally a partnership game."),
    q("After learning the mechanics, what is a sensible next step?", ["Learn a simple bidding system", "Add jokers", "Play with three people", "Ignore defense"], 0, "A simple system such as Standard American or Acol gives partners shared bidding meanings.")
];

window.bridgeQuestionBank.forEach((question, index) => {
    question.id = `bridge-question-${index + 1}`;
    question.topic = index < 10
        ? "Basics"
        : index < 30
            ? "Auction"
            : index < 40
                ? "Roles"
                : index < 50
                    ? "Card Play"
                    : index < 60
                        ? "Scoring"
                        : index < 70
                            ? "Vocabulary"
                            : "Table Skills";
});
