"use strict";

const practiceHandsCoach = document.getElementById("practiceHandsCoach");

if (practiceHandsCoach) {
    const practiceHands = [
        {
            hand: {
                spades: ["A", "J", "7"],
                hearts: ["K", "Q", "8"],
                diamonds: ["A", "6", "3"],
                clubs: ["K", "9", "5", "2"]
            },
            options: ["Pass", "1♣", "1NT", "2NT"],
            correct: "1NT",
            explanation:
                "Open 1NT with a balanced hand and 15–17 HCP. " +
                "This hand has 17 HCP and no five-card major.",
            focus: ["Balanced shape", "15–17 HCP", "No five-card major"]
        },
        {
            hand: {
                spades: ["A", "K", "J", "8", "4"],
                hearts: ["Q", "7", "3"],
                diamonds: ["K", "6"],
                clubs: ["9", "5", "2"]
            },
            options: ["Pass", "1♥", "1♠", "1NT"],
            correct: "1♠",
            explanation:
                "With opening strength and a five-card spade suit, " +
                "open 1♠. Five-card majors take priority over a minor.",
            focus: ["13 HCP", "Five spades", "Open the longer major"]
        },
        {
            hand: {
                spades: ["Q", "8", "3"],
                hearts: ["A", "K", "10", "7", "4"],
                diamonds: ["Q", "6", "2"],
                clubs: ["J", "5"]
            },
            options: ["Pass", "1♦", "1♥", "1NT"],
            correct: "1♥",
            explanation:
                "Open 1♥ with 12 HCP and a five-card heart suit. " +
                "The five-card major clearly describes the hand.",
            focus: ["12 HCP", "Five hearts", "Five-card major"]
        },
        {
            hand: {
                spades: ["A", "8", "4"],
                hearts: ["K", "7", "3"],
                diamonds: ["Q", "J", "9", "6"],
                clubs: ["Q", "8", "2"]
            },
            options: ["Pass", "1♣", "1♦", "1NT"],
            correct: "1♦",
            explanation:
                "There is opening strength but no five-card major. " +
                "Open the longer minor, which is diamonds.",
            focus: ["12 HCP", "Four diamonds", "No five-card major"]
        },
        {
            hand: {
                spades: ["A", "Q", "7", "4"],
                hearts: ["K", "8", "3"],
                diamonds: ["J", "9", "5"],
                clubs: ["Q", "6", "2"]
            },
            options: ["Pass", "1♣", "1♠", "1NT"],
            correct: "1♣",
            explanation:
                "Standard American normally requires five cards to open " +
                "a major. With equal three-card minors, open 1♣.",
            focus: ["12 HCP", "4–3–3–3 shape", "Better minor opening"]
        },
        {
            hand: {
                spades: ["K", "8", "4"],
                hearts: ["Q", "7", "3"],
                diamonds: ["J", "9", "6", "2"],
                clubs: ["Q", "8", "2"]
            },
            options: ["Pass", "1♣", "1♦", "1NT"],
            correct: "Pass",
            explanation:
                "Eight HCP is not enough for a normal one-level opening, " +
                "and the hand lacks the long suit needed for a preempt.",
            focus: ["8 HCP", "No long suit", "Wait for the next round"]
        },
        {
            hand: {
                spades: ["A", "K", "7"],
                hearts: ["A", "Q", "8"],
                diamonds: ["K", "Q", "6"],
                clubs: ["Q", "9", "5", "2"]
            },
            options: ["1NT", "2♣", "2NT", "3NT"],
            correct: "2NT",
            explanation:
                "A balanced 20–21 HCP hand opens 2NT in beginner " +
                "Standard American.",
            focus: ["20 HCP", "Balanced hand", "2NT range"]
        },
        {
            hand: {
                spades: ["A", "K", "Q"],
                hearts: ["A", "K", "8"],
                diamonds: ["A", "J", "6"],
                clubs: ["K", "9", "5", "2"]
            },
            options: ["1♣", "2♣", "2NT", "3NT"],
            correct: "2♣",
            explanation:
                "This 24-HCP powerhouse is too strong for a 2NT opening. " +
                "Use the artificial strong 2♣ opening.",
            focus: ["24 HCP", "Game-forcing strength", "Strong 2♣ opening"]
        },
        {
            hand: {
                spades: ["K", "Q", "J", "10", "8", "6", "3"],
                hearts: ["9", "4"],
                diamonds: ["8", "5"],
                clubs: ["7", "2"]
            },
            options: ["Pass", "1♠", "2♠", "3♠"],
            correct: "3♠",
            explanation:
                "A weak hand with a seven-card spade suit is a classic " +
                "three-level preempt. It uses playing shape, not HCP.",
            focus: ["6 HCP", "Seven spades", "Three-level preempt"]
        },
        {
            hand: {
                spades: ["A", "8"],
                hearts: ["K", "7", "3"],
                diamonds: ["Q", "6"],
                clubs: ["A", "J", "9", "5", "4", "2"]
            },
            options: ["Pass", "1♣", "1NT", "2♣"],
            correct: "1♣",
            explanation:
                "Open 1♣ with 14 HCP and a strong six-card club suit. " +
                "A jump opening would show a different type of hand.",
            focus: ["14 HCP", "Six clubs", "Natural one-level opening"]
        },
        {
            hand: {
                spades: ["K", "8"],
                hearts: ["A", "7", "3"],
                diamonds: ["A", "Q", "10", "8", "5", "2"],
                clubs: ["9", "4"]
            },
            options: ["Pass", "1♦", "1NT", "2♦"],
            correct: "1♦",
            explanation:
                "This hand has normal opening strength and six diamonds. " +
                "Open naturally at the one level with 1♦.",
            focus: ["13 HCP", "Six diamonds", "Natural one-level opening"]
        },
        {
            hand: {
                spades: ["8", "4"],
                hearts: ["K", "Q", "10", "9", "7", "3"],
                diamonds: ["7", "5", "2"],
                clubs: ["Q", "6"]
            },
            options: ["Pass", "1♥", "2♥", "3♥"],
            correct: "2♥",
            explanation:
                "A weak two-bid shows a good six-card suit with less than " +
                "normal opening strength. This is a textbook 2♥.",
            focus: ["7 HCP", "Six hearts", "Weak two-bid"]
        }
    ];

    const pointValues = { A: 4, K: 3, Q: 2, J: 1 };
    const suitNames = ["spades", "hearts", "diamonds", "clubs"];
    const titleElement = document.getElementById("handChallengeTitle");
    const hcpElement = document.getElementById("handHcp");
    const shapeElement = document.getElementById("handShape");
    const promptElement = document.getElementById("handPrompt");
    const decisionPoints = document.getElementById("decisionPoints");
    const decisionSuit = document.getElementById("decisionSuit");
    const decisionRule = document.getElementById("decisionRule");
    const hintButton = document.getElementById("coachHintButton");
    const hintElement = document.getElementById("coachHint");
    const optionsElement = document.getElementById("handBidOptions");
    const feedbackElement = document.getElementById("coachFeedback");
    const verdictElement = document.getElementById("coachVerdict");
    const bestBidElement = document.getElementById("coachBestBid");
    const explanationElement = document.getElementById("coachExplanation");
    const reasoningElement = document.getElementById("coachReasoning");
    const nextButton = document.getElementById("nextPracticeHand");
    const correctElement = document.getElementById("coachCorrect");
    const attemptsElement = document.getElementById("coachAttempts");

    let handIndex = -1;
    let correctAnswers = 0;
    let attempts = 0;
    let answered = false;

    function calculateHcp(hand) {
        return suitNames.reduce((total, suit) => (
            total + hand[suit].reduce(
                (points, rank) => points + (pointValues[rank] || 0),
                0
            )
        ), 0);
    }

    function handShape(hand) {
        return suitNames.map(suit => hand[suit].length).join("–");
    }

    function longestSuits(hand) {
        const longestLength = Math.max(
            ...suitNames.map(suit => hand[suit].length)
        );
        const longest = suitNames.filter(
            suit => hand[suit].length === longestLength
        );

        return { longest, longestLength };
    }

    function isBalanced(hand) {
        const lengths = suitNames
            .map(suit => hand[suit].length)
            .sort((a, b) => b - a)
            .join("-");

        return ["4-3-3-3", "4-4-3-2", "5-3-3-2"].includes(lengths);
    }

    function plainBidLabel(bid) {
        const labels = {
            Pass: "Do not open",
            "1♣": "Open one club",
            "1♦": "Open one diamond",
            "1♥": "Open one heart",
            "1♠": "Open one spade",
            "1NT": "Balanced no-trump opening",
            "2♣": "Very strong artificial opening",
            "2♦": "Open two diamonds",
            "2♥": "Weak two in hearts",
            "2♠": "Weak two in spades",
            "2NT": "Balanced 20–21 points",
            "3♥": "Three-level heart preempt",
            "3♠": "Three-level spade preempt",
            "3NT": "Open three no trump"
        };

        return labels[bid] || `Choose ${bid}`;
    }

    function coachingRule(challenge, hcp) {
        const { longest, longestLength } = longestSuits(challenge.hand);
        const balanced = isBalanced(challenge.hand);

        if (hcp >= 22) {
            return "With about 22+ points, look for the strong 2♣ opening.";
        }

        if (balanced && hcp >= 20 && hcp <= 21) {
            return "A balanced 20–21-point hand fits the 2NT range.";
        }

        if (balanced && hcp >= 15 && hcp <= 17) {
            return "A balanced 15–17-point hand fits the 1NT range.";
        }

        if (hcp < 12 && longestLength >= 7) {
            return "A weak hand with a seven-card suit can preempt at level 3.";
        }

        if (hcp < 12 && longestLength === 6) {
            return "A weak hand with a good six-card major may use a weak two-bid.";
        }

        if (hcp < 12) {
            return "With fewer than 12 points and no long suit, Pass.";
        }

        if (
            challenge.hand.spades.length >= 5 ||
            challenge.hand.hearts.length >= 5
        ) {
            return "With 12+ points and a five-card major, open that major.";
        }

        const preferredMinor =
            challenge.hand.diamonds.length > challenge.hand.clubs.length
                ? "diamonds"
                : "clubs";

        return (
            "With 12+ points and no five-card major, open the longer minor. " +
            `Here the beginner choice is ${preferredMinor}.`
        );
    }

    function chooseNewHand() {
        let nextIndex;

        do {
            nextIndex = Math.floor(Math.random() * practiceHands.length);
        } while (
            practiceHands.length > 1 &&
            nextIndex === handIndex
        );

        handIndex = nextIndex;
        return practiceHands[handIndex];
    }

    function renderHand() {
        const challenge = chooseNewHand();
        const hcp = calculateHcp(challenge.hand);
        const { longest, longestLength } = longestSuits(challenge.hand);

        answered = false;
        feedbackElement.classList.add("hidden");
        hintElement.classList.add("hidden");
        hintButton.textContent = "Need a hint?";
        titleElement.textContent = "What would you open?";
        promptElement.textContent =
            "You are the dealer. Choose your opening call.";
        hcpElement.textContent = `${hcp} HCP`;
        shapeElement.textContent = handShape(challenge.hand);
        decisionPoints.textContent =
            `${hcp} HCP — ${hcp >= 12 ? "opening strength" : "below a normal opening"}`;
        decisionSuit.textContent =
            `${longestLength} cards in ${longest.join(" / ")}`;
        decisionRule.textContent =
            "Use the quick guide above, or reveal a hint.";

        suitNames.forEach(suit => {
            const row = document.querySelector(
                `[data-hand-suit="${suit}"]`
            );
            row.querySelector("strong").textContent =
                challenge.hand[suit].join(" ");
        });

        const choices = [...challenge.options].sort(
            () => Math.random() - .5
        );
        optionsElement.innerHTML = "";

        choices.forEach(choice => {
            const button = document.createElement("button");

            button.type = "button";
            button.dataset.bid = choice;
            button.innerHTML =
                `<strong>${choice}</strong>` +
                `<span>${plainBidLabel(choice)}</span>`;
            button.addEventListener(
                "click",
                () => checkBid(choice, button)
            );
            optionsElement.appendChild(button);
        });
    }

    function checkBid(choice, selectedButton) {
        if (answered) {
            return;
        }

        answered = true;
        attempts += 1;
        attemptsElement.textContent = String(attempts);

        const challenge = practiceHands[handIndex];
        const isCorrect = choice === challenge.correct;
        const buttons = [...optionsElement.querySelectorAll("button")];
        if (window.BridgeProgress) {
            window.BridgeProgress.recordActivity("practiceHand", {
                correct: isCorrect
            });
        }

        if (isCorrect) {
            correctAnswers += 1;
            correctElement.textContent = String(correctAnswers);
        }

        buttons.forEach(button => {
            button.disabled = true;
            button.classList.toggle(
                "correct",
                button.dataset.bid === challenge.correct
            );
        });

        if (!isCorrect) {
            selectedButton.classList.add("incorrect");
        }

        verdictElement.textContent = isCorrect
            ? "✓ Strong choice"
            : "Not the best opening";
        verdictElement.className = isCorrect ? "correct" : "incorrect";
        bestBidElement.textContent = `Best bid: ${challenge.correct}`;
        explanationElement.textContent = challenge.explanation;
        reasoningElement.innerHTML = challenge.focus
            .map(point => `<span>${point}</span>`)
            .join("");
        feedbackElement.classList.remove("hidden");
    }

    nextButton.addEventListener("click", renderHand);
    hintButton.addEventListener("click", () => {
        const challenge = practiceHands[handIndex];
        const hcp = calculateHcp(challenge.hand);

        hintElement.textContent = coachingRule(challenge, hcp);
        hintElement.classList.remove("hidden");
        hintButton.textContent = "Hint revealed";
    });
    renderHand();
}
