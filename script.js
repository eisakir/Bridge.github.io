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
    quizQuestions = shuffledCopy(questionBank)
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

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === question.correct) {
            button.classList.add("correct");
        }

        if (index === selectedIndex && index !== question.correct) {
            button.classList.add("incorrect");
        }
    });

    if (selectedIndex === question.correct) {
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
   INITIALIZE
========================================================== */

startQuiz();

console.log("Learn Bridge loaded successfully.");
console.log(
    `Loaded ${questionBank.length} questions; ` +
    `${QUESTIONS_PER_GAME} selected for this game.`
);
