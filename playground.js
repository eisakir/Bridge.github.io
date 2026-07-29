"use strict";

const cardPlayground = document.getElementById("cardPlayground");

if (cardPlayground) {
    const suits = [
        { symbol: "♠", name: "spades", color: "black", order: 0 },
        { symbol: "♥", name: "hearts", color: "red", order: 1 },
        { symbol: "♦", name: "diamonds", color: "red", order: 2 },
        { symbol: "♣", name: "clubs", color: "black", order: 3 }
    ];
    const ranks = [
        { label: "A", value: 14 }, { label: "K", value: 13 },
        { label: "Q", value: 12 }, { label: "J", value: 11 },
        { label: "10", value: 10 }, { label: "9", value: 9 },
        { label: "8", value: 8 }, { label: "7", value: 7 },
        { label: "6", value: 6 }, { label: "5", value: 5 },
        { label: "4", value: 4 }, { label: "3", value: 3 },
        { label: "2", value: 2 }
    ];

    const handElement = document.getElementById("playgroundHand");
    const leadCardElement = document.getElementById("leadCard");
    const promptElement = document.getElementById("playgroundPrompt");
    const feedbackElement = document.getElementById("playgroundFeedback");
    const dropZone = document.getElementById("cardDropZone");
    const nextExercise = document.getElementById("nextExercise");
    const correctElement = document.getElementById("playgroundCorrect");
    const attemptsElement = document.getElementById("playgroundAttempts");
    const newHandButton = document.getElementById("newHand");
    const shuffleButton = document.getElementById("shuffleHand");
    const sortSuitButton = document.getElementById("sortSuit");
    const sortRankButton = document.getElementById("sortRank");

    let hand = [];
    let leadCard = null;
    let exerciseComplete = false;
    let draggedCardId = null;
    let correct = 0;
    let attempts = 0;

    function buildDeck() {
        return suits.flatMap(suit => (
            ranks.map(rank => ({
                id: `${rank.label}-${suit.name}`,
                rank: rank.label,
                value: rank.value,
                suit: suit.name,
                suitSymbol: suit.symbol,
                suitOrder: suit.order,
                color: suit.color
            }))
        ));
    }

    function shuffle(items) {
        const copy = [...items];

        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[randomIndex]] =
                [copy[randomIndex], copy[index]];
        }

        return copy;
    }

    function renderCard(card) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = `practice-card hand-card ${card.color}`;
        button.dataset.cardId = card.id;
        button.draggable = true;
        button.setAttribute("aria-label", `${card.rank} of ${card.suit}`);
        button.innerHTML =
            `<span class="card-rank">${card.rank}</span>` +
            `<span class="card-suit">${card.suitSymbol}</span>` +
            `<span class="card-center-suit">${card.suitSymbol}</span>`;

        button.addEventListener("click", () => playCard(card.id));
        button.addEventListener("dragstart", event => {
            draggedCardId = card.id;
            button.classList.add("dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", card.id);
        });
        button.addEventListener("dragend", () => {
            draggedCardId = null;
            button.classList.remove("dragging");
        });
        button.addEventListener("dragover", event => {
            event.preventDefault();
        });
        button.addEventListener("drop", event => {
            event.preventDefault();
            const sourceId =
                event.dataTransfer.getData("text/plain") ||
                draggedCardId;
            reorderCard(sourceId, card.id);
        });

        return button;
    }

    function renderHand() {
        handElement.innerHTML = "";
        hand.forEach(card => handElement.appendChild(renderCard(card)));
    }

    function updateLeadCard() {
        leadCardElement.classList.toggle("red", leadCard.color === "red");
        leadCardElement.querySelector(".card-rank").textContent =
            leadCard.rank;
        leadCardElement.querySelector(".card-suit").textContent =
            leadCard.suitSymbol;
        leadCardElement.querySelector(".card-center-suit").textContent =
            leadCard.suitSymbol;
    }

    function chooseLead() {
        const deck = buildDeck().filter(card => (
            !hand.some(handCard => handCard.id === card.id)
        ));
        const suitsInHand = [...new Set(hand.map(card => card.suit))];
        const voidSuits = suits
            .map(suit => suit.name)
            .filter(suit => !suitsInHand.includes(suit));
        const availableLeadSuits = new Set(deck.map(card => card.suit));
        const candidateSuits = (
            Math.random() < .25 && voidSuits.length > 0
                ? voidSuits
                : suitsInHand
        ).filter(suit => availableLeadSuits.has(suit));
        const selectedSuit = candidateSuits[
            Math.floor(Math.random() * candidateSuits.length)
        ];
        const candidates = deck.filter(card => card.suit === selectedSuit);

        leadCard = candidates[
            Math.floor(Math.random() * candidates.length)
        ];
    }

    function startExercise() {
        exerciseComplete = false;
        nextExercise.classList.add("hidden");
        dropZone.classList.remove("correct", "incorrect");
        dropZone.innerHTML = "<span>Play card here</span>";

        chooseLead();
        updateLeadCard();

        const canFollow = hand.some(card => card.suit === leadCard.suit);

        promptElement.textContent = canFollow
            ? `${leadCard.suitSymbol} was led. Which cards are legal?`
            : `${leadCard.suitSymbol} was led, but you are void. What now?`;
        feedbackElement.textContent =
            "Click a card or drag it onto the play area.";
        renderHand();
    }

    function cardIsLegal(card) {
        const canFollow = hand.some(item => item.suit === leadCard.suit);
        return !canFollow || card.suit === leadCard.suit;
    }

    function playCard(cardId) {
        if (exerciseComplete) {
            return;
        }

        const card = hand.find(item => item.id === cardId);

        if (!card) {
            return;
        }

        attempts += 1;
        attemptsElement.textContent = String(attempts);

        if (!cardIsLegal(card)) {
            feedbackElement.textContent =
                `Not legal yet: you still hold ${leadCard.suit}. ` +
                "Bridge requires you to follow suit.";
            dropZone.classList.remove("correct");
            dropZone.classList.add("incorrect");
            cardPlayground.classList.remove("playground-shake");
            void cardPlayground.offsetWidth;
            cardPlayground.classList.add("playground-shake");
            return;
        }

        exerciseComplete = true;
        correct += 1;
        correctElement.textContent = String(correct);
        if (window.BridgeProgress) {
            window.BridgeProgress.recordActivity("exercise");
        }
        dropZone.classList.remove("incorrect");
        dropZone.classList.add("correct");
        dropZone.innerHTML =
            `<div class="practice-card played-card ${card.color}">` +
                `<span class="card-rank">${card.rank}</span>` +
                `<span class="card-suit">${card.suitSymbol}</span>` +
                `<span class="card-center-suit">${card.suitSymbol}</span>` +
            `</div>`;

        feedbackElement.textContent = card.suit === leadCard.suit
            ? `Correct. You followed ${leadCard.suit}, as required.`
            : `Correct. You had no ${leadCard.suit}, so any card was legal.`;
        nextExercise.classList.remove("hidden");

        handElement.querySelectorAll(".hand-card").forEach(element => {
            element.disabled = true;
            element.classList.toggle(
                "selected",
                element.dataset.cardId === card.id
            );
        });
    }

    function reorderCard(sourceId, targetId) {
        if (!sourceId || sourceId === targetId || exerciseComplete) {
            return;
        }

        const sourceIndex = hand.findIndex(card => card.id === sourceId);
        const targetIndex = hand.findIndex(card => card.id === targetId);

        if (sourceIndex < 0 || targetIndex < 0) {
            return;
        }

        const [card] = hand.splice(sourceIndex, 1);
        hand.splice(targetIndex, 0, card);
        renderHand();
    }

    function dealNewHand() {
        hand = shuffle(buildDeck()).slice(0, 13);
        correct = 0;
        attempts = 0;
        correctElement.textContent = "0";
        attemptsElement.textContent = "0";
        startExercise();
    }

    function sortBySuit() {
        hand.sort((a, b) => (
            a.suitOrder - b.suitOrder ||
            b.value - a.value
        ));
        renderHand();
    }

    function sortByRank() {
        hand.sort((a, b) => (
            b.value - a.value ||
            a.suitOrder - b.suitOrder
        ));
        renderHand();
    }

    dropZone.addEventListener("dragover", event => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", event => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
        playCard(
            event.dataTransfer.getData("text/plain") ||
            draggedCardId
        );
    });

    newHandButton.addEventListener("click", dealNewHand);
    shuffleButton.addEventListener("click", () => {
        hand = shuffle(hand);
        renderHand();
    });
    sortSuitButton.addEventListener("click", sortBySuit);
    sortRankButton.addEventListener("click", sortByRank);
    nextExercise.addEventListener("click", startExercise);

    dealNewHand();
}
