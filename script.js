/*
==========================================================
Learn Bridge
script.js

Interactive Features
- Mobile navigation
- Active navigation highlighting
- Back-to-top button
- Scroll reveal animations
- Interactive quiz
- Mouse glow
- 3D hero cards
- Quiz sounds and confetti
==========================================================
*/

"use strict";

/* ==========================================================
   MOBILE NAVIGATION
========================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("open");

        const expanded =
            menuToggle.getAttribute("aria-expanded") === "true";

        menuToggle.setAttribute("aria-expanded", String(!expanded));
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

const sections = document.querySelectorAll("section");
const navigationLinks = document.querySelectorAll(".nav-links a");

function highlightCurrentSection() {
    let currentSection = "home";

    sections.forEach(section => {
        const top = section.offsetTop - 140;

        if (window.scrollY >= top && section.id) {
            currentSection = section.id;
        }
    });

    navigationLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentSection}`
        );
    });
}

window.addEventListener("scroll", highlightCurrentSection, { passive: true });
window.addEventListener("load", highlightCurrentSection);

/* ==========================================================
   READING PROGRESS + SCROLL SOUND
========================================================== */

const scrollProgress = document.getElementById("scrollProgress");
const scrollProgressBar = document.getElementById("scrollProgressBar");
let scrollFramePending = false;

function updateReadingProgress() {
    const scrollableDistance =
        document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableDistance > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableDistance))
        : 0;

    if (scrollProgressBar) {
        scrollProgressBar.style.transform = `scaleX(${progress})`;
    }

    if (scrollProgress) {
        scrollProgress.setAttribute(
            "aria-valuenow",
            String(Math.round(progress * 100))
        );
    }

    scrollFramePending = false;
}

function requestReadingProgressUpdate() {
    if (!scrollFramePending) {
        scrollFramePending = true;
        window.requestAnimationFrame(updateReadingProgress);
    }
}

window.addEventListener("scroll", requestReadingProgressUpdate, {
    passive: true
});
window.addEventListener("resize", requestReadingProgressUpdate);
window.addEventListener("load", requestReadingProgressUpdate);
window.addEventListener("bridge:view-changed", requestReadingProgressUpdate);
requestReadingProgressUpdate();

document.querySelectorAll(".navbar a, .navbar button").forEach(control => {
    control.addEventListener("click", () => {
        playCardRiffle();
    });
});

/* ==========================================================
   BACK TO TOP BUTTON
========================================================== */

const backToTopButton = document.getElementById("backToTop");

if (backToTopButton) {
    window.addEventListener(
        "scroll",
        () => {
            backToTopButton.classList.toggle("show", window.scrollY > 500);
        },
        { passive: true }
    );

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ==========================================================
   SCROLL REVEAL ANIMATION
========================================================== */

const revealSections = document.querySelectorAll(".section");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealSections.forEach(section => revealObserver.observe(section));
} else {
    revealSections.forEach(section => section.classList.add("visible"));
}

/* ==========================================================
   GLOSSARY FLIP CARDS
========================================================== */

document.querySelectorAll(".glossary-item").forEach(card => {
    const heading = card.querySelector("h3");
    const definition = card.querySelector("p");

    if (!heading || !definition) {
        return;
    }

    const term = heading.textContent.trim();
    const meaning = definition.textContent.trim();

    card.innerHTML =
        `<div class="glossary-card-inner">` +
            `<div class="glossary-card-face glossary-card-front">` +
                `<h3>${term}</h3>` +
            `</div>` +
            `<div class="glossary-card-face glossary-card-back">` +
                `<p>${meaning}</p>` +
            `</div>` +
        `</div>`;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `${term}: reveal definition`);

    function toggleGlossaryCard() {
        const isFlipped = card.classList.toggle("flipped");

        playCardSwish(isFlipped ? 1 : -1);
        card.setAttribute("aria-expanded", String(isFlipped));
        card.setAttribute(
            "aria-label",
            isFlipped
                ? `${term}: hide definition`
                : `${term}: reveal definition`
        );
    }

    card.addEventListener("click", toggleGlossaryCard);
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleGlossaryCard();
        }
    });
});

/* ==========================================================
   RANDOMIZED QUIZ SELECTION
========================================================== */

const QUESTIONS_PER_GAME = 10;
const questionBank = window.bridgeQuestionBank || [];
let quizQuestions = [];

function shuffledCopy(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
}

function selectQuestions() {
    const progress = window.BridgeProgress?.getData?.() || {};
    const mistakeIds = new Set(
        (progress.mistakes || []).map(mistake => mistake.id)
    );
    const weakTopics = new Set(
        Object.entries(progress.topicStats || {})
            .filter(([, stats]) => (
                stats.total >= 2 &&
                stats.correct / stats.total < .75
            ))
            .map(([topic]) => topic)
    );
    const priorityQuestions = shuffledCopy(questionBank.filter(question => (
        mistakeIds.has(question.id) || weakTopics.has(question.topic)
    )));
    const selected = priorityQuestions.slice(
        0,
        Math.min(6, priorityQuestions.length)
    );
    const selectedIds = new Set(selected.map(question => question.id));
    const remaining = shuffledCopy(questionBank.filter(
        question => !selectedIds.has(question.id)
    ));

    quizQuestions = [...selected, ...remaining]
        .slice(0, QUESTIONS_PER_GAME)
        .map(question => ({
            ...question,
            answers: [...question.answers]
        }));
}

/* ==========================================================
   QUIZ ELEMENTS AND STATE
========================================================== */

const questionNumber = document.getElementById("question-number");
const scoreDisplay = document.getElementById("score-display");
const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const feedbackBox = document.getElementById("answer-feedback");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackText = document.getElementById("feedback-text");
const nextQuestionButton = document.getElementById("next-question");
const quizResults = document.getElementById("quiz-results");
const finalScore = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-quiz");
const newQuizButton = document.getElementById("new-quiz");
const questionCard = document.getElementById("question-card");
const quizContainer = document.getElementById("quiz-container");

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

/* ==========================================================
   SOUND EFFECTS — NO AUDIO FILES REQUIRED
========================================================== */

let audioContext = null;
const cardShuffleAudio = new Audio("assets/audio/card-shuffle.mp3");
const cardFlipAudio = new Audio("assets/audio/card-flip.mp3");

cardShuffleAudio.preload = "auto";
cardFlipAudio.preload = "auto";
cardShuffleAudio.volume = 1;
cardFlipAudio.volume = 0.9;

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    return audioContext;
}

function playTone({
    frequency,
    duration,
    type = "sine",
    volume = 0.12,
    delay = 0
}) {
    if (
        window.BridgeA11y &&
        !window.BridgeA11y.soundEnabled()
    ) {
        return;
    }

    const context = getAudioContext();

    if (!context) {
        return;
    }

    const startTime = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);
}

function playCardRiffle(direction = 1) {
    if (
        window.BridgeA11y &&
        !window.BridgeA11y.soundEnabled()
    ) {
        return;
    }

    void direction;
    cardShuffleAudio.pause();
    cardShuffleAudio.currentTime = 0;
    cardShuffleAudio.play().catch(() => {});
}

function playCardSwish(direction = 1) {
    if (
        window.BridgeA11y &&
        !window.BridgeA11y.soundEnabled()
    ) {
        return;
    }

    void direction;
    cardFlipAudio.pause();
    cardFlipAudio.currentTime = 0;
    cardFlipAudio.play().catch(() => {});
}

function playCorrectSound() {
    playTone({
        frequency: 523.25,
        duration: 0.18,
        type: "sine",
        volume: 0.11
    });

    playTone({
        frequency: 659.25,
        duration: 0.2,
        type: "sine",
        volume: 0.1,
        delay: 0.1
    });

    playTone({
        frequency: 783.99,
        duration: 0.25,
        type: "sine",
        volume: 0.09,
        delay: 0.2
    });
}

function playLessonCompleteSound() {
    playTone({
        frequency: 880,
        duration: 0.34,
        type: "sine",
        volume: 0.12
    });

    playTone({
        frequency: 1320,
        duration: 0.28,
        type: "sine",
        volume: 0.055,
        delay: 0.025
    });
}

window.addEventListener(
    "bridge:lesson-completed",
    playLessonCompleteSound
);

function playWrongSound() {
    const context = getAudioContext();

    if (!context) {
        return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime;

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(220, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        90,
        startTime + 0.55
    );

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + 0.6
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.62);
}

/* ==========================================================
   CONFETTI
========================================================== */

function launchConfetti() {
    const container = document.getElementById("confetti-container");

    if (!container) {
        return;
    }

    const colors = [
        "#d4af37",
        "#1f3b57",
        "#5b7b67",
        "#d64545",
        "#ffffff"
    ];

    for (let i = 0; i < 70; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.top = `${-20 - Math.random() * 100}px`;
        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 0.25}s`;
        piece.style.animationDuration = `${1.2 + Math.random()}s`;

        container.appendChild(piece);

        window.setTimeout(() => piece.remove(), 2400);
    }
}

function celebrate() {
    launchConfetti();

    if (!quizContainer) {
        return;
    }

    quizContainer.classList.remove("quiz-correct");
    void quizContainer.offsetWidth;
    quizContainer.classList.add("quiz-correct");

    window.setTimeout(() => {
        quizContainer.classList.remove("quiz-correct");
    }, 650);
}

function showWrongEffect() {
    if (!quizContainer) {
        return;
    }

    quizContainer.classList.remove("quiz-wrong");
    void quizContainer.offsetWidth;
    quizContainer.classList.add("quiz-wrong");

    window.setTimeout(() => {
        quizContainer.classList.remove("quiz-wrong");
    }, 500);
}

/* ==========================================================
   QUIZ ENGINE
========================================================== */

function startQuiz() {
    selectQuestions();
    currentQuestionIndex = 0;
    score = 0;

    if (!quizResults || !questionCard) {
        return;
    }

    quizResults.classList.add("hidden");
    questionCard.classList.remove("hidden");

    loadQuestion();
}

function loadQuestion() {
    if (
        !feedbackBox ||
        !answerButtons ||
        !questionNumber ||
        !scoreDisplay ||
        !progressFill ||
        !questionText
    ) {
        return;
    }

    answered = false;
    feedbackBox.classList.add("hidden");
    answerButtons.innerHTML = "";

    const question = quizQuestions[currentQuestionIndex];

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

    scoreDisplay.textContent =
        `Score: ${score} / ${quizQuestions.length}`;

    progressFill.style.width =
        `${(currentQuestionIndex / quizQuestions.length) * 100}%`;

    questionText.textContent = question.question;

    question.answers.forEach((answer, index) => {
        const button = document.createElement("button");

        button.textContent = answer;
        button.type = "button";
        button.addEventListener("click", () => checkAnswer(index));

        answerButtons.appendChild(button);
    });
}

function checkAnswer(selectedIndex) {
    if (answered || !answerButtons || !feedbackBox) {
        return;
    }

    answered = true;

    const question = quizQuestions[currentQuestionIndex];
    const buttons = answerButtons.querySelectorAll("button");
    const isCorrect = selectedIndex === question.correct;

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === question.correct) {
            button.classList.add("correct");
        }

        if (index === selectedIndex && index !== question.correct) {
            button.classList.add("incorrect");
        }
    });

    window.BridgeProgress?.recordQuizAnswer?.(question, isCorrect);

    if (isCorrect) {
        score += 1;
        feedbackTitle.textContent = "✅ Correct!";
        playCorrectSound();
        celebrate();
    } else {
        feedbackTitle.textContent = "❌ Incorrect";
        playWrongSound();
        showWrongEffect();
    }

    feedbackText.textContent = question.explanation;
    scoreDisplay.textContent =
        `Score: ${score} / ${quizQuestions.length}`;
    feedbackBox.classList.remove("hidden");
}

function nextQuestion() {
    currentQuestionIndex += 1;

    if (currentQuestionIndex >= quizQuestions.length) {
        showResults();
        return;
    }

    loadQuestion();
}

function showResults() {
    if (
        !questionCard ||
        !quizResults ||
        !progressFill ||
        !finalScore ||
        !resultMessage
    ) {
        return;
    }

    questionCard.classList.add("hidden");
    quizResults.classList.remove("hidden");
    progressFill.style.width = "100%";
    finalScore.textContent = `${score} / ${quizQuestions.length}`;

    if (window.BridgeProgress) {
        window.BridgeProgress.recordActivity("quiz", {
            score,
            total: quizQuestions.length
        });
    }

    if (score === quizQuestions.length) {
        resultMessage.textContent =
            "Perfect! You're ready for your first Bridge game.";
        launchConfetti();
    } else if (score >= 8) {
        resultMessage.textContent =
            "Excellent! You have a strong understanding of the basics.";
    } else if (score >= 6) {
        resultMessage.textContent =
            "Nice work! Review a few sections and you'll be ready to play.";
    } else if (score >= 4) {
        resultMessage.textContent =
            "Good start! Review the lessons and try the quiz again.";
    } else {
        resultMessage.textContent =
            "Keep practicing! Every Bridge player starts as a beginner.";
    }
}

if (nextQuestionButton) {
    nextQuestionButton.addEventListener("click", nextQuestion);
}

if (restartButton) {
    restartButton.addEventListener("click", startQuiz);
}

if (newQuizButton) {
    newQuizButton.addEventListener("click", startQuiz);
}

/* ==========================================================
   SMOOTH SCROLLING AND MENU ACCESSIBILITY
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        if (event.defaultPrevented) {
            return;
        }

        const targetID = link.getAttribute("href");

        if (!targetID || targetID === "#") {
            return;
        }

        const target = document.querySelector(targetID);

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

document.addEventListener("click", event => {
    if (!menuToggle || !navMenu) {
        return;
    }

    const clickedMenu = navMenu.contains(event.target);
    const clickedButton = menuToggle.contains(event.target);

    if (
        !clickedMenu &&
        !clickedButton &&
        navMenu.classList.contains("open")
    ) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        navMenu &&
        navMenu.classList.contains("open")
    ) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && navMenu) {
        navMenu.classList.remove("open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }
});

/* ==========================================================
   MOUSE GLOW EFFECT
========================================================== */

const mouseGlow = document.querySelector(".mouse-glow");

if (mouseGlow && window.matchMedia("(pointer: fine)").matches) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let targetX = glowX;
    let targetY = glowY;

    document.addEventListener(
        "mousemove",
        event => {
            targetX = event.clientX;
            targetY = event.clientY;
        },
        { passive: true }
    );

    function animateGlow() {
        glowX += (targetX - glowX) * 0.08;
        glowY += (targetY - glowY) * 0.08;

        mouseGlow.style.left = `${glowX}px`;
        mouseGlow.style.top = `${glowY}px`;

        window.requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

/* ==========================================================
   HERO CARD 3D EFFECT
========================================================== */

document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = (x / rect.width - 0.5) * 18;
        const rotateX = (0.5 - y / rect.height) * 18;

        card.style.transform =
            `perspective(900px) ` +
            `rotateX(${rotateX}deg) ` +
            `rotateY(${rotateY}deg) ` +
            `translateY(-6px) scale(1.04)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform =
            "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
});

/* ==========================================================
   ANIMATED BRIDGE TABLE LESSON
========================================================== */

const bridgeLesson = document.getElementById("bridgeLesson");
const lessonStep = document.getElementById("lessonStep");
const lessonTitle = document.getElementById("lessonTitle");
const lessonText = document.getElementById("lessonText");
const lessonNext = document.getElementById("lessonNext");
const lessonReset = document.getElementById("lessonReset");
const trickWinner = document.getElementById("trickWinner");
const dealerChip = document.getElementById("dealerChip");
const tableSeats = [...document.querySelectorAll(".table-seat")];

const bridgeScenarios = [
    {
        dealer: "north",
        declarer: "north",
        dummy: "south",
        contract: "3NT",
        leader: "east",
        cards: { north: "A♠", east: "6♠", south: "Q♠", west: "K♠" },
        dummyCards: ["Q♠", "A♥", "10♦", "7♣"],
        winner: "north"
    },
    {
        dealer: "east",
        declarer: "south",
        dummy: "north",
        contract: "4♥",
        leader: "west",
        cards: { north: "2♣", east: "A♣", south: "5♣", west: "K♣" },
        dummyCards: ["2♣", "K♥", "Q♦", "8♠"],
        winner: "east"
    },
    {
        dealer: "south",
        declarer: "west",
        dummy: "east",
        contract: "2♠",
        leader: "north",
        cards: { north: "Q♦", east: "A♦", south: "3♦", west: "7♦" },
        dummyCards: ["A♦", "J♠", "8♥", "4♣"],
        winner: "east"
    },
    {
        dealer: "west",
        declarer: "east",
        dummy: "west",
        contract: "3NT",
        leader: "south",
        cards: { north: "K♥", east: "A♥", south: "J♥", west: "Q♥" },
        dummyCards: ["Q♥", "10♠", "7♦", "3♣"],
        winner: "east"
    },
    {
        dealer: "north",
        declarer: "east",
        dummy: "west",
        contract: "4♠",
        leader: "south",
        cards: { north: "9♦", east: "A♦", south: "J♦", west: "K♦" },
        dummyCards: ["K♦", "Q♠", "6♥", "4♣"],
        winner: "east"
    },
    {
        dealer: "east",
        declarer: "north",
        dummy: "south",
        contract: "2♥",
        leader: "east",
        cards: { north: "A♣", east: "10♣", south: "Q♣", west: "K♣" },
        dummyCards: ["Q♣", "J♥", "8♦", "5♠"],
        winner: "north"
    }
];

const seatOrder = ["north", "east", "south", "west"];
let lessonIndex = 0;
let scenarioIndex = -1;

function seatName(seat) {
    return seat.charAt(0).toUpperCase() + seat.slice(1);
}

function leftHandOpponent(seat) {
    return seatOrder[(seatOrder.indexOf(seat) + 1) % seatOrder.length];
}

function cardColor(card) {
    return card.includes("♥") || card.includes("♦") ? "red" : "black";
}

function chooseNewScenario() {
    let nextIndex;

    do {
        nextIndex = Math.floor(Math.random() * bridgeScenarios.length);
    } while (
        bridgeScenarios.length > 1 &&
        nextIndex === scenarioIndex
    );

    scenarioIndex = nextIndex;
    return bridgeScenarios[scenarioIndex];
}

function currentScenario() {
    return bridgeScenarios[scenarioIndex];
}

function applyScenario(scenario) {
    if (!bridgeLesson) {
        return;
    }

    bridgeLesson.classList.remove(
        "dealer-north",
        "dealer-east",
        "dealer-south",
        "dealer-west"
    );
    bridgeLesson.classList.add(`dealer-${scenario.dealer}`);

    tableSeats.forEach(seat => {
        const position = seat.dataset.seat;
        const role = seat.querySelector(".seat-role");
        const cards = [...seat.querySelectorAll(".mini-card")];
        const playCard = seat.querySelector(".play-card");

        seat.classList.toggle("is-dummy", position === scenario.dummy);
        playCard.classList.toggle("opening-lead", position === scenario.leader);
        playCard.classList.toggle("trick-winning-card", position === scenario.winner);

        let playerRole;

        if (position === scenario.declarer) {
            playerRole = "Declarer";
        } else if (position === scenario.dummy) {
            playerRole = "Dummy";
        } else if (position === scenario.leader) {
            playerRole = "Opening lead";
        } else {
            playerRole = "Defender";
        }

        role.textContent = position === scenario.dealer
            ? `Dealer · ${playerRole}`
            : playerRole;

        const displayedCards = position === scenario.dummy
            ? scenario.dummyCards
            : [
                scenario.cards[position],
                "9♠",
                "6♥",
                "3♦"
            ];

        cards.forEach((card, index) => {
            const face = card.querySelector(".card-face");
            face.textContent = displayedCards[index];
            face.classList.toggle(
                "red",
                cardColor(displayedCards[index]) === "red"
            );
        });
    });

    trickWinner.textContent =
        `${seatName(scenario.winner)} wins with ` +
        `${scenario.cards[scenario.winner]}`;

    dealerChip.setAttribute(
        "aria-label",
        `${seatName(scenario.dealer)} is the dealer`
    );
    dealerChip.title = `${seatName(scenario.dealer)} is the dealer`;
}

function lessonStepsFor(scenario) {
    const expectedLeader = leftHandOpponent(scenario.declarer);

    return [
        {
            label: "Interactive lesson",
            title: `${seatName(scenario.dealer)} is dealer`,
            text:
                `${seatName(scenario.dealer)} will begin the auction. ` +
                `This hand reaches ${scenario.contract} by ` +
                `${seatName(scenario.declarer)}.`,
            button: "Start lesson"
        },
        {
            label: "Step 1 of 4 · The deal",
            title: "Four hands, 13 cards each",
            text:
                `The cards are dealt clockwise. The dealer chip correctly ` +
                `marks ${seatName(scenario.dealer)} for this scenario.`,
            button: "Show opening lead"
        },
        {
            label: "Step 2 of 4 · Opening lead",
            title:
                `${seatName(scenario.leader)} leads ` +
                `${scenario.cards[scenario.leader]}`,
            text:
                `${seatName(scenario.dealer)} dealt this hand, but ` +
                `${seatName(scenario.declarer)} became declarer. Therefore ` +
                `${seatName(expectedLeader)}, the player on declarer's left, ` +
                `makes the opening lead.`,
            button: "Reveal dummy"
        },
        {
            label: "Step 3 of 4 · Dummy",
            title: `${seatName(scenario.dummy)}'s hand opens face up`,
            text:
                `${seatName(scenario.dummy)} is dummy because they are ` +
                `${seatName(scenario.declarer)}'s partner. Declarer chooses ` +
                `the cards played from dummy.`,
            button: "Play the trick"
        },
        {
            label: "Step 4 of 4 · The trick",
            title:
                `${seatName(scenario.winner)} wins with ` +
                `${scenario.cards[scenario.winner]}`,
            text:
                `All four players followed suit. ` +
                `${scenario.cards[scenario.winner]} is the highest card, so ` +
                `${seatName(scenario.winner)} wins and leads next.`,
            button: "Try a new scenario"
        }
    ];
}

function updateBridgeLesson() {
    if (!bridgeLesson) {
        return;
    }

    const content = lessonStepsFor(currentScenario())[lessonIndex];
    bridgeLesson.dataset.step = String(lessonIndex);
    lessonStep.textContent = content.label;
    lessonTitle.textContent = content.title;
    lessonText.textContent = content.text;
    lessonNext.textContent = content.button;
}

function resetBridgeLesson() {
    if (!bridgeLesson) {
        return;
    }

    lessonIndex = 0;
    applyScenario(chooseNewScenario());
    updateBridgeLesson();
}

if (lessonNext) {
    lessonNext.addEventListener("click", () => {
        if (lessonIndex === 4) {
            if (window.BridgeProgress) {
                window.BridgeProgress.recordActivity("animatedLesson");
            }
            resetBridgeLesson();
            window.setTimeout(() => {
                lessonIndex = 1;
                updateBridgeLesson();
            }, 400);
            return;
        }

        lessonIndex += 1;
        updateBridgeLesson();
    });
}

if (lessonReset) {
    lessonReset.addEventListener("click", resetBridgeLesson);
}

resetBridgeLesson();

/* ==========================================================
   INITIALIZE
========================================================== */

startQuiz();

console.log("Learn Bridge loaded successfully.");
console.log(
    `Loaded ${questionBank.length} questions; ` +
    `${QUESTIONS_PER_GAME} selected for this game.`
);
