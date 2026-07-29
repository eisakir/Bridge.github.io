"use strict";

(() => {
    const root = document.getElementById("trickTrainer");
    if (!root) {
        return;
    }

    const suits = [
        { id: "spades", symbol: "♠", color: "black" },
        { id: "hearts", symbol: "♥", color: "red" },
        { id: "diamonds", symbol: "♦", color: "red" },
        { id: "clubs", symbol: "♣", color: "black" }
    ];
    const ranks = [
        { label: "2", value: 2 }, { label: "3", value: 3 },
        { label: "4", value: 4 }, { label: "5", value: 5 },
        { label: "6", value: 6 }, { label: "7", value: 7 },
        { label: "8", value: 8 }, { label: "9", value: 9 },
        { label: "10", value: 10 }, { label: "J", value: 11 },
        { label: "Q", value: 12 }, { label: "K", value: 13 },
        { label: "A", value: 14 }
    ];
    const order = ["west", "north", "east", "south"];
    const side = seat => ["north", "south"].includes(seat) ? "declarer" : "defenders";
    const names = { north: "North", east: "East", south: "South", west: "West" };
    let state;

    function shuffledDeck() {
        const deck = suits.flatMap(suit => ranks.map(rank => ({
            id: `${rank.label}-${suit.id}`,
            suit: suit.id,
            symbol: suit.symbol,
            color: suit.color,
            rank: rank.label,
            value: rank.value
        })));
        for (let index = deck.length - 1; index > 0; index -= 1) {
            const swap = Math.floor(Math.random() * (index + 1));
            [deck[index], deck[swap]] = [deck[swap], deck[index]];
        }
        return deck;
    }

    function sortHand(hand) {
        const suitOrder = Object.fromEntries(
            suits.map((suit, index) => [suit.id, index])
        );
        return hand.sort((first, second) =>
            suitOrder[first.suit] - suitOrder[second.suit] ||
            second.value - first.value
        );
    }

    function nextSeat(seat) {
        return order[(order.indexOf(seat) + 1) % order.length];
    }

    function legalCards(hand) {
        if (!state.trick.length) {
            return hand;
        }
        const ledSuit = state.trick[0].card.suit;
        const following = hand.filter(card => card.suit === ledSuit);
        return following.length ? following : hand;
    }

    function trickWinner(trick, trump) {
        const ledSuit = trick[0].card.suit;
        return trick.reduce((winner, play) => {
            const card = play.card;
            const winningCard = winner.card;
            const cardIsTrump = trump && card.suit === trump;
            const winnerIsTrump = trump && winningCard.suit === trump;

            if (cardIsTrump !== winnerIsTrump) {
                return cardIsTrump ? play : winner;
            }
            if (card.suit !== winningCard.suit) {
                return winner;
            }
            return card.value > winningCard.value ? play : winner;
        }, trick[0]).seat;
    }

    function cardButton(card, enabled = true) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `trainer-card ${card.color}`;
        button.dataset.cardId = card.id;
        button.disabled = !enabled;
        button.setAttribute("aria-label", `${card.rank} of ${card.suit}`);
        button.innerHTML = `<strong>${card.rank}</strong><span>${card.symbol}</span>`;
        return button;
    }

    function updateSeats() {
        Object.entries(state.hands).forEach(([seat, hand]) => {
            const seatNode = document.querySelector(
                `[data-trainer-seat="${seat}"]`
            );
            if (!seatNode) {
                return;
            }
            const seatElement = seatNode.querySelector("span");
            const role =
                seat === "north" ? "Dummy" :
                seat === "south" ? "Declarer" :
                seat === "west" && state.completedTricks === 0
                    ? "Opening lead"
                    : "Defender";
            seatElement.textContent = `${role} · ${hand.length} cards`;

            let cards = seatNode.querySelector(".trainer-seat-cards");
            if (!cards) {
                cards = document.createElement("div");
                cards.className = "trainer-seat-cards";
                seatNode.append(cards);
            }

            cards.replaceChildren();
            if (seat === "north" && state.dummyVisible) {
                cards.classList.add("face-up");
                hand.forEach(card => {
                    const visibleCard = document.createElement("span");
                    visibleCard.className =
                        `trainer-seat-card face ${card.color}`;
                    visibleCard.innerHTML =
                        `<strong>${card.rank}</strong>` +
                        `<small>${card.symbol}</small>`;
                    visibleCard.title = `${card.rank} of ${card.suit}`;
                    cards.append(visibleCard);
                });
            } else {
                cards.classList.remove("face-up");
                const visibleBacks = Math.min(5, hand.length);
                for (let index = 0; index < visibleBacks; index += 1) {
                    const cardBack = document.createElement("span");
                    cardBack.className = "trainer-seat-card back";
                    cardBack.setAttribute("aria-hidden", "true");
                    cardBack.textContent = "♠";
                    cards.append(cardBack);
                }
            }
        });
    }

    function renderTrick() {
        const area = document.getElementById("trainerTrickArea");
        area.replaceChildren();
        if (!state.trick.length) {
            const empty = document.createElement("span");
            empty.textContent = "Cards played to this trick appear here.";
            area.append(empty);
            return;
        }
        state.trick.forEach(play => {
            const wrapper = document.createElement("div");
            wrapper.className = `trainer-play trainer-play-${play.seat}`;
            const label = document.createElement("span");
            label.textContent = names[play.seat];
            wrapper.append(label, cardButton(play.card, false));
            area.append(wrapper);
        });
    }

    function renderDummy() {
        const dummy = document.getElementById("trainerDummy");
        if (!state.dummyVisible) {
            dummy.classList.add("hidden");
            return;
        }
        dummy.classList.remove("hidden");
        const cards = document.getElementById("trainerDummyCards");
        cards.replaceChildren(
            ...state.hands.north.map(card => cardButton(card, false))
        );
    }

    function renderActiveHand() {
        const hand = state.hands[state.active];
        const legal = new Set(legalCards(hand).map(card => card.id));
        const container = document.getElementById("trainerActiveHand");
        container.replaceChildren();

        hand.forEach(card => {
            const button = cardButton(
                card,
                !state.resolving && legal.has(card.id)
            );
            button.addEventListener("click", () => playCard(card.id));
            container.append(button);
        });

        document.getElementById("trainerActivePlayer").textContent =
            `${names[state.active]} to play`;
        const guidance = document.getElementById("trainerGuidance");
        if (!state.trick.length) {
            guidance.textContent = "Lead any card to begin the trick.";
        } else {
            const led = state.trick[0].card;
            const canFollow = hand.some(card => card.suit === led.suit);
            guidance.textContent = canFollow
                ? `${led.symbol} was led, so choose a ${led.suit.slice(0, -1)}.`
                : `You have no ${led.suit}; any card is legal.`;
        }
    }

    function render() {
        document.getElementById("declarerTricks").textContent =
            state.tricks.declarer;
        document.getElementById("defenderTricks").textContent =
            state.tricks.defenders;
        document.getElementById("trainerTrickNumber").textContent =
            `${Math.min(state.completedTricks + 1, 13)} / 13`;
        document.getElementById("trainerStatus").textContent =
            state.completedTricks
                ? `${names[state.active]} won the last trick and leads.`
                : "West makes the opening lead.";
        updateSeats();
        renderTrick();
        renderDummy();
        if (!state.finished) {
            renderActiveHand();
        }
    }

    function finishDeal() {
        state.finished = true;
        const made = state.tricks.declarer >= state.target;
        const difference = state.tricks.declarer - state.target;
        document.getElementById("trainerResultTitle").textContent =
            made ? "Contract made!" : "Contract defeated";
        document.getElementById("trainerResultText").textContent =
            `North–South won ${state.tricks.declarer} tricks. ` +
            (made
                ? `They made the contract${difference ? ` with ${difference} overtrick${difference === 1 ? "" : "s"}` : " exactly"}.`
                : `They finished ${Math.abs(difference)} trick${difference === -1 ? "" : "s"} short.`);
        document.getElementById("trainerResult").classList.remove("hidden");
        document.getElementById("trainerActiveHand").replaceChildren();
        document.getElementById("trainerActivePlayer").textContent =
            "Deal complete";
        document.getElementById("trainerGuidance").textContent =
            "Review the result or deal another hand.";
        if (window.BridgeProgress) {
            window.BridgeProgress.recordActivity("deal", { made });
        }
    }

    function completeTrick() {
        const winner = trickWinner(state.trick, state.trump);
        state.tricks[side(winner)] += 1;
        state.completedTricks += 1;
        state.active = winner;
        state.trick = [];
        state.resolving = false;
        if (state.completedTricks === 13) {
            finishDeal();
        }
        render();
    }

    function playCard(cardId) {
        if (state.finished || state.resolving) {
            return;
        }
        const hand = state.hands[state.active];
        const card = hand.find(candidate => candidate.id === cardId);
        if (!card || !legalCards(hand).some(candidate => candidate.id === cardId)) {
            return;
        }
        const seat = state.active;
        state.hands[seat] = hand.filter(candidate => candidate.id !== cardId);
        state.trick.push({ seat, card });
        if (!state.dummyVisible) {
            state.dummyVisible = true;
        }
        state.active = nextSeat(seat);
        if (state.trick.length === 4) {
            state.resolving = true;
        }
        render();

        if (state.trick.length === 4) {
            window.setTimeout(completeTrick, 450);
        }
    }

    function newDeal() {
        const deck = shuffledDeck();
        const contractOptions = [
            { level: 2, strain: "spades" },
            { level: 3, strain: "notrump" },
            { level: 4, strain: "hearts" },
            { level: 5, strain: "diamonds" }
        ];
        const contract =
            contractOptions[Math.floor(Math.random() * contractOptions.length)];
        state = {
            hands: {
                west: sortHand(deck.slice(0, 13)),
                north: sortHand(deck.slice(13, 26)),
                east: sortHand(deck.slice(26, 39)),
                south: sortHand(deck.slice(39, 52))
            },
            active: "west",
            trick: [],
            tricks: { declarer: 0, defenders: 0 },
            completedTricks: 0,
            dummyVisible: false,
            finished: false,
            resolving: false,
            target: contract.level + 6,
            trump: contract.strain === "notrump" ? null : contract.strain
        };
        document.getElementById("trainerContract").textContent =
            `Contract: ${contract.level}${contract.strain === "notrump" ? "NT" : suits.find(suit => suit.id === contract.strain).symbol} by South`;
        document.getElementById("trainerResult").classList.add("hidden");
        render();
    }

    document.getElementById("newTrainerDeal").addEventListener("click", newDeal);
    document.getElementById("trainerAgain").addEventListener("click", newDeal);
    newDeal();
    window.BridgeTrickTrainer = {
        trickWinner,
        newDeal,
        playCard,
        legalCardIds: () => legalCards(state.hands[state.active])
            .map(card => card.id),
        getState: () => JSON.parse(JSON.stringify(state))
    };
})();
