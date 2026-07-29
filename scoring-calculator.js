"use strict";

(() => {
    const level = document.getElementById("scoreLevel");
    const strain = document.getElementById("scoreStrain");
    const doubleStatus = document.getElementById("scoreDouble");
    const tricks = document.getElementById("scoreTricks");
    const vulnerable = document.getElementById("scoreVulnerable");
    const calculateButton = document.getElementById("calculateScore");

    if (!level || !strain || !doubleStatus || !tricks || !vulnerable) {
        return;
    }

    const strainNames = {
        clubs: "♣",
        diamonds: "♦",
        hearts: "♥",
        spades: "♠",
        notrump: "NT"
    };

    function baseContractPoints(contractLevel, contractStrain) {
        if (contractStrain === "clubs" || contractStrain === "diamonds") {
            return contractLevel * 20;
        }
        if (contractStrain === "hearts" || contractStrain === "spades") {
            return contractLevel * 30;
        }
        return 40 + ((contractLevel - 1) * 30);
    }

    function doubledDownPenalty(undertricks, isVulnerable) {
        if (isVulnerable) {
            return 200 + (Math.max(0, undertricks - 1) * 300);
        }

        if (undertricks === 1) {
            return 100;
        }
        if (undertricks <= 3) {
            return 100 + ((undertricks - 1) * 200);
        }
        return 500 + ((undertricks - 3) * 300);
    }

    function calculateBridgeScore(options) {
        const contractLevel = Number(options.level);
        const contractStrain = options.strain;
        const multiplier = Number(options.multiplier);
        const tricksWon = Number(options.tricks);
        const isVulnerable = Boolean(options.vulnerable);
        const required = contractLevel + 6;
        const difference = tricksWon - required;
        const parts = [];

        if (difference < 0) {
            const undertricks = Math.abs(difference);
            let penalty;

            if (multiplier === 1) {
                penalty = undertricks * (isVulnerable ? 100 : 50);
            } else {
                penalty = doubledDownPenalty(undertricks, isVulnerable);
                if (multiplier === 4) {
                    penalty *= 2;
                }
            }

            parts.push({
                label: `${undertricks} undertrick${undertricks === 1 ? "" : "s"}`,
                points: -penalty
            });

            return {
                score: -penalty,
                made: false,
                difference,
                required,
                parts
            };
        }

        const rawContractPoints = baseContractPoints(
            contractLevel,
            contractStrain
        );
        const contractPoints = rawContractPoints * multiplier;
        let score = contractPoints;
        parts.push({ label: "Contract trick points", points: contractPoints });

        if (difference > 0) {
            let overtrickValue;
            if (multiplier === 1) {
                overtrickValue =
                    contractStrain === "clubs" ||
                    contractStrain === "diamonds"
                        ? 20
                        : 30;
            } else {
                overtrickValue =
                    (isVulnerable ? 200 : 100) * (multiplier === 4 ? 2 : 1);
            }
            const overtrickPoints = difference * overtrickValue;
            score += overtrickPoints;
            parts.push({
                label: `${difference} overtrick${difference === 1 ? "" : "s"}`,
                points: overtrickPoints
            });
        }

        if (multiplier > 1) {
            const insult = multiplier === 4 ? 100 : 50;
            score += insult;
            parts.push({
                label: multiplier === 4 ? "Redouble bonus" : "Double bonus",
                points: insult
            });
        }

        const gameBonus =
            contractPoints >= 100 ? (isVulnerable ? 500 : 300) : 50;
        score += gameBonus;
        parts.push({
            label: contractPoints >= 100 ? "Game bonus" : "Part-score bonus",
            points: gameBonus
        });

        if (contractLevel === 6) {
            const slamBonus = isVulnerable ? 750 : 500;
            score += slamBonus;
            parts.push({ label: "Small slam bonus", points: slamBonus });
        } else if (contractLevel === 7) {
            const slamBonus = isVulnerable ? 1500 : 1000;
            score += slamBonus;
            parts.push({ label: "Grand slam bonus", points: slamBonus });
        }

        return {
            score,
            made: true,
            difference,
            required,
            parts
        };
    }

    function contractLabel() {
        const suffix =
            Number(doubleStatus.value) === 4
                ? "XX"
                : Number(doubleStatus.value) === 2
                    ? "X"
                    : "";
        return `${level.value}${strainNames[strain.value]}${suffix}`;
    }

    function render(record = false) {
        const result = calculateBridgeScore({
            level: level.value,
            strain: strain.value,
            multiplier: doubleStatus.value,
            tricks: tricks.value,
            vulnerable: vulnerable.checked
        });
        const differenceText =
            result.difference === 0
                ? "made exactly"
                : result.difference > 0
                    ? `made with ${result.difference} overtrick${result.difference === 1 ? "" : "s"}`
                    : `down ${Math.abs(result.difference)}`;

        document.getElementById("calculatedScore").textContent =
            result.score > 0 ? `+${result.score}` : String(result.score);
        document.getElementById("scoreHeadline").textContent =
            `${contractLabel()} ${differenceText}`;
        document.getElementById("scoreExplanation").textContent =
            result.made
                ? `You needed ${result.required} tricks and won ${tricks.value}. Bonuses are added after the contract trick points.`
                : `You needed ${result.required} tricks and won ${tricks.value}. The negative score is the penalty given to the opponents.`;

        const breakdown = document.getElementById("scoreBreakdown");
        breakdown.replaceChildren(
            ...result.parts.map(part => {
                const row = document.createElement("div");
                const label = document.createElement("span");
                const points = document.createElement("strong");
                label.textContent = part.label;
                points.textContent =
                    part.points > 0 ? `+${part.points}` : String(part.points);
                row.append(label, points);
                return row;
            })
        );

        if (record && window.BridgeProgress) {
            window.BridgeProgress.recordActivity("score");
        }
    }

    [level, strain, doubleStatus, tricks, vulnerable].forEach(control => {
        control.addEventListener("change", () => render(false));
    });
    calculateButton?.addEventListener("click", () => render(true));

    window.BridgeScoring = { calculate: calculateBridgeScore };
    render(false);
})();
