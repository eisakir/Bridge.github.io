"use strict";

const auctionSimulator = document.getElementById("auctionSimulator");

if (auctionSimulator) {
    const players = ["North", "East", "South", "West"];
    const strains = [
        { key: "clubs", label: "♣", name: "Clubs" },
        { key: "diamonds", label: "♦", name: "Diamonds" },
        { key: "hearts", label: "♥", name: "Hearts" },
        { key: "spades", label: "♠", name: "Spades" },
        { key: "notrump", label: "NT", name: "No Trump" }
    ];

    const auctionTurn = document.getElementById("auctionTurn");
    const auctionGuidance = document.getElementById("auctionGuidance");
    const auctionHistory = document.getElementById("auctionHistory");
    const currentContract = document.getElementById("currentContract");
    const bidGrid = document.getElementById("bidGrid");
    const bidControls = document.getElementById("bidControls");
    const auctionResult = document.getElementById("auctionResult");
    const finalContract = document.getElementById("finalContract");
    const auctionResultText = document.getElementById("auctionResultText");
    const auctionReset = document.getElementById("auctionReset");
    const auctionAgain = document.getElementById("auctionAgain");
    const seatElements = [
        ...document.querySelectorAll("[data-auction-seat]")
    ];
    const passButton = document.querySelector('[data-call="pass"]');
    const doubleButton = document.querySelector('[data-call="double"]');
    const redoubleButton = document.querySelector('[data-call="redouble"]');

    let dealer = 0;
    let currentPlayer = 0;
    let calls = [];
    let highestBid = null;
    let consecutivePasses = 0;
    let doubleState = 0;
    let auctionEnded = false;

    function partnership(playerIndex) {
        return playerIndex % 2;
    }

    function bidValue(level, strainIndex) {
        return (level - 1) * strains.length + strainIndex;
    }

    function formatBid(bid) {
        return `${bid.level}${strains[bid.strainIndex].label}`;
    }

    function renderBidGrid() {
        bidGrid.innerHTML = "";

        for (let level = 1; level <= 7; level += 1) {
            strains.forEach((strain, strainIndex) => {
                const button = document.createElement("button");
                const value = bidValue(level, strainIndex);

                button.type = "button";
                button.className = `bid-button ${strain.key}`;
                button.dataset.level = String(level);
                button.dataset.strain = String(strainIndex);
                button.dataset.value = String(value);
                button.innerHTML =
                    `<span>${level}</span><strong>${strain.label}</strong>`;
                button.setAttribute(
                    "aria-label",
                    `${level} ${strain.name}`
                );
                button.addEventListener("click", () => {
                    makeBid(level, strainIndex);
                });

                bidGrid.appendChild(button);
            });
        }
    }

    function renderHistory() {
        if (calls.length === 0) {
            auctionHistory.innerHTML =
                '<p class="auction-placeholder">' +
                "Calls will appear here as the auction develops." +
                "</p>";
            return;
        }

        auctionHistory.innerHTML = calls.map(call => {
            const callClass = call.type === "bid"
                ? strains[call.strainIndex].key
                : call.type;
            const label = call.type === "bid"
                ? formatBid(call)
                : call.label;

            return (
                `<div class="auction-call">` +
                `<span>${players[call.player]}</span>` +
                `<strong class="${callClass}">${label}</strong>` +
                `</div>`
            );
        }).join("");

        auctionHistory.scrollLeft = auctionHistory.scrollWidth;
    }

    function doubleIsLegal() {
        return Boolean(
            highestBid &&
            doubleState === 0 &&
            partnership(currentPlayer) !==
                partnership(highestBid.player)
        );
    }

    function redoubleIsLegal() {
        return Boolean(
            highestBid &&
            doubleState === 1 &&
            partnership(currentPlayer) ===
                partnership(highestBid.player)
        );
    }

    function updateControls() {
        const minimum = highestBid ? highestBid.value : -1;

        bidGrid.querySelectorAll(".bid-button").forEach(button => {
            const legal = Number(button.dataset.value) > minimum;
            button.disabled = auctionEnded || !legal;
        });

        passButton.disabled = auctionEnded;
        doubleButton.disabled = auctionEnded || !doubleIsLegal();
        redoubleButton.disabled = auctionEnded || !redoubleIsLegal();
    }

    function updateDisplay(message) {
        seatElements.forEach((seat, index) => {
            seat.classList.toggle(
                "active",
                !auctionEnded && index === currentPlayer
            );
            seat.classList.toggle("dealer", index === dealer);
        });

        auctionTurn.textContent = auctionEnded
            ? "Auction complete"
            : `${players[currentPlayer]} to call`;

        auctionGuidance.textContent = message;

        if (!highestBid) {
            currentContract.textContent = "No bid yet";
        } else {
            const suffix = doubleState === 1
                ? " doubled"
                : doubleState === 2
                    ? " redoubled"
                    : "";

            currentContract.textContent =
                `${formatBid(highestBid)} by ` +
                `${players[highestBid.player]}${suffix}`;
        }

        renderHistory();
        updateControls();
    }

    function moveToNextPlayer(message) {
        currentPlayer = (currentPlayer + 1) % players.length;
        updateDisplay(message);
    }

    function makeBid(level, strainIndex) {
        if (auctionEnded) {
            return;
        }

        const value = bidValue(level, strainIndex);

        if (highestBid && value <= highestBid.value) {
            auctionGuidance.textContent =
                "A new bid must be higher than the current contract.";
            return;
        }

        const bid = {
            type: "bid",
            label: `${level}${strains[strainIndex].label}`,
            level,
            strainIndex,
            value,
            player: currentPlayer
        };

        calls.push(bid);
        highestBid = bid;
        consecutivePasses = 0;
        doubleState = 0;

        const tricks = level + 6;
        moveToNextPlayer(
            `${players[bid.player]} bid ${formatBid(bid)}, promising ` +
            `${tricks} tricks with ` +
            `${strains[strainIndex].name} as the strain.`
        );
    }

    function makePass() {
        if (auctionEnded) {
            return;
        }

        const player = currentPlayer;
        calls.push({ type: "pass", label: "Pass", player });
        consecutivePasses += 1;

        const passedOut = !highestBid && consecutivePasses === 4;
        const contractSet = highestBid && consecutivePasses === 3;

        if (passedOut || contractSet) {
            finishAuction(passedOut);
            return;
        }

        moveToNextPlayer(
            `${players[player]} passed. A pass keeps the current ` +
            "contract unchanged."
        );
    }

    function makeDouble() {
        if (!doubleIsLegal() || auctionEnded) {
            return;
        }

        const player = currentPlayer;
        calls.push({ type: "double", label: "Double", player });
        doubleState = 1;
        consecutivePasses = 0;

        moveToNextPlayer(
            `${players[player]} doubled the opponents' contract, ` +
            "increasing both the reward and the risk."
        );
    }

    function makeRedouble() {
        if (!redoubleIsLegal() || auctionEnded) {
            return;
        }

        const player = currentPlayer;
        calls.push({ type: "redouble", label: "Redouble", player });
        doubleState = 2;
        consecutivePasses = 0;

        moveToNextPlayer(
            `${players[player]} redoubled, raising the stakes again.`
        );
    }

    function findDeclarer() {
        const declaringSide = partnership(highestBid.player);

        return calls.find(call => (
            call.type === "bid" &&
            partnership(call.player) === declaringSide &&
            call.strainIndex === highestBid.strainIndex
        )).player;
    }

    function finishAuction(passedOut) {
        auctionEnded = true;
        bidControls.classList.add("hidden");
        auctionResult.classList.remove("hidden");
        if (window.BridgeProgress) {
            window.BridgeProgress.recordActivity("auction");
        }

        if (passedOut) {
            finalContract.textContent = "Passed out";
            auctionResultText.textContent =
                "All four players passed before any bid. There is no " +
                "contract, so the cards would be redealt or the board " +
                "recorded as passed out.";
            updateDisplay("Four opening passes ended the auction.");
            return;
        }

        const declarer = findDeclarer();
        const doubled = doubleState === 1
            ? " doubled"
            : doubleState === 2
                ? " redoubled"
                : "";
        const contract = `${formatBid(highestBid)}${doubled}`;

        finalContract.textContent =
            `${contract} by ${players[declarer]}`;
        auctionResultText.textContent =
            `${players[declarer]} is declarer because they were the first ` +
            `player on the winning partnership to bid ` +
            `${strains[highestBid.strainIndex].name}. ` +
            `${players[(declarer + 2) % 4]} becomes dummy.`;
        updateDisplay(
            `Three consecutive passes confirmed ${contract}.`
        );
    }

    function startAuction(moveDealer = false) {
        if (moveDealer) {
            dealer = (dealer + 1) % players.length;
        }

        currentPlayer = dealer;
        calls = [];
        highestBid = null;
        consecutivePasses = 0;
        doubleState = 0;
        auctionEnded = false;

        bidControls.classList.remove("hidden");
        auctionResult.classList.add("hidden");

        updateDisplay(
            `${players[dealer]} is dealer and makes the first call. ` +
            "Choose a bid or Pass."
        );
    }

    passButton.addEventListener("click", makePass);
    doubleButton.addEventListener("click", makeDouble);
    redoubleButton.addEventListener("click", makeRedouble);
    auctionReset.addEventListener("click", () => startAuction(true));
    auctionAgain.addEventListener("click", () => startAuction(true));

    renderBidGrid();
    startAuction();
}
