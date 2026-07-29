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
==========================================================
*/

"use strict";

/* ==========================================
   QUIZ SOUND EFFECTS
========================================== */

const correctSound = new Audio("assets/correct.mp3");

const wrongSound = new Audio("assets/wrong.mp3");

correctSound.volume = 0.45;

wrongSound.volume = 0.45;

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

        menuToggle.setAttribute(
            "aria-expanded",
            String(!expanded)
        );

    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}

/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

const sections = document.querySelectorAll("section");
const navigationLinks = document.querySelectorAll(".nav-links a");

function highlightCurrentSection() {

    let currentSection = "";

    sections.forEach(section => {

        const top =
            section.offsetTop - 140;

        if (window.scrollY >= top) {

            currentSection = section.id;

        }

    });

    navigationLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

}

window.addEventListener(
    "scroll",
    highlightCurrentSection
);

highlightCurrentSection();

/* ==========================================================
   BACK TO TOP BUTTON
========================================================== */

const backToTopButton =
    document.getElementById("backToTop");

if (backToTopButton) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTopButton.classList.add("show");

        } else {

            backToTopButton.classList.remove("show");

        }

    });

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

const revealObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {

        threshold: 0.15

    }

);

document
.querySelectorAll(".section")
.forEach(section => {

    revealObserver.observe(section);

});

/* ==========================================================
   QUIZ QUESTIONS
========================================================== */

const quizQuestions = [

{
    question: "What is the highest-ranking card in Bridge?",

    answers: [
        "Ace",
        "King",
        "Queen",
        "Jack"
    ],

    correct: 0,

    explanation:
        "The Ace is the highest-ranking card."
},

{
    question:
        "How many players are in a game of Contract Bridge?",

    answers: [
        "2",
        "3",
        "4",
        "5"
    ],

    correct: 2,

    explanation:
        "Bridge is played by four players in two partnerships."
},

{
    question:
        "How many cards does each player receive?",

    answers: [
        "10",
        "12",
        "13",
        "15"
    ],

    correct: 2,

    explanation:
        "A standard 52-card deck deals 13 cards to each player."
},

{
    question:
        "Which partnership sits opposite each other?",

    answers: [
        "North & East",
        "North & South",
        "North & West",
        "East & South"
    ],

    correct: 1,

    explanation:
        "North and South are partners. East and West are partners."
},

{
    question:
        "If you have a card in the suit led, what must you do?",

    answers: [
        "Play any card",
        "Follow suit",
        "Play a trump card",
        "Pass"
    ],

    correct: 1,

    explanation:
        "Players must follow suit whenever possible."
},

{
    question:
        "Who becomes the dummy?",

    answers: [
        "The dealer",
        "The declarer's partner",
        "The highest bidder",
        "The player on declarer's left"
    ],

    correct: 1,

    explanation:
        "The declarer's partner becomes the dummy."
},

{
    question:
        "Who makes the opening lead?",

    answers: [
        "The declarer",
        "The dummy",
        "The player to declarer's left",
        "The dealer"
    ],

    correct: 2,

    explanation:
        "The defender sitting to declarer's left always makes the opening lead."
},

{
    question:
        "A contract of 4♥ requires how many tricks?",

    answers: [
        "8",
        "9",
        "10",
        "11"
    ],

    correct: 2,

    explanation:
        "Four plus six equals ten tricks."
},

{
    question:
        "What is true about a No Trump contract?",

    answers: [
        "Hearts are trump",
        "There is no trump suit",
        "Spades are always trump",
        "The dealer chooses the trump suit"
    ],

    correct: 1,

    explanation:
        "In No Trump there is no trump suit."
},

{
    question:
        "When does the auction end?",

    answers: [
        "After one pass",
        "After two passes",
        "After three consecutive passes after a bid",
        "Whenever the dealer decides"
    ],

    correct: 2,

    explanation:
        "The auction ends after three consecutive passes following a bid."
}

];

/* ==========================================================
   CONTINUES IN PART 2
========================================================== */

/* ==========================================================
   QUIZ ENGINE
========================================================== */

const questionNumber =
    document.getElementById("question-number");

const scoreDisplay =
    document.getElementById("score-display");

const progressFill =
    document.getElementById("progress-fill");

const questionText =
    document.getElementById("question-text");

const answerButtons =
    document.getElementById("answer-buttons");

const feedbackBox =
    document.getElementById("answer-feedback");

const feedbackTitle =
    document.getElementById("feedback-title");

const feedbackText =
    document.getElementById("feedback-text");

const nextQuestionButton =
    document.getElementById("next-question");

const quizResults =
    document.getElementById("quiz-results");

const finalScore =
    document.getElementById("final-score");

const resultMessage =
    document.getElementById("result-message");

const restartButton =
    document.getElementById("restart-quiz");

/* ==========================================================
   QUIZ STATE
========================================================== */

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

/* ==========================================================
   START QUIZ
========================================================== */

function startQuiz() {

    currentQuestionIndex = 0;
    score = 0;

    quizResults.classList.add("hidden");

    document
        .getElementById("question-card")
        .classList.remove("hidden");

    loadQuestion();

}

/* ==========================================================
   LOAD QUESTION
========================================================== */

function loadQuestion() {

    answered = false;

    feedbackBox.classList.add("hidden");

    answerButtons.innerHTML = "";

    const question =
        quizQuestions[currentQuestionIndex];

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

    scoreDisplay.textContent =
        `Score: ${score} / ${quizQuestions.length}`;

    progressFill.style.width =
        `${((currentQuestionIndex) / quizQuestions.length) * 100}%`;

    questionText.textContent =
        question.question;

    question.answers.forEach((answer, index) => {

        const button =
            document.createElement("button");

        button.textContent = answer;

        button.type = "button";

        button.addEventListener(
            "click",
            () => checkAnswer(index)
        );

        answerButtons.appendChild(button);

    });

}

/* ==========================================================
   CHECK ANSWER
========================================================== */

function checkAnswer(selectedIndex) {

    if (answered) {

        return;

    }

    answered = true;

    const question =
        quizQuestions[currentQuestionIndex];

    const buttons =
        answerButtons.querySelectorAll("button");

    buttons.forEach((button, index) => {

        button.disabled = true;

        if (index === question.correct) {

            button.classList.add("correct");

        }

        if (
            index === selectedIndex &&
            index !== question.correct
        ) {

            button.classList.add("incorrect");

        }

    });

    if (selectedIndex === question.correct) {

        score++;

        feedbackTitle.textContent = "✅ Correct!";

    } else {

        feedbackTitle.textContent = "❌ Incorrect";

    }

    feedbackText.textContent =
        question.explanation;

    scoreDisplay.textContent =
        `Score: ${score} / ${quizQuestions.length}`;

    feedbackBox.classList.remove("hidden");

}

/* ==========================================================
   NEXT QUESTION
========================================================== */

function nextQuestion() {

    currentQuestionIndex++;

    if (currentQuestionIndex >= quizQuestions.length) {

        showResults();

        return;

    }

    loadQuestion();

}

nextQuestionButton.addEventListener(
    "click",
    nextQuestion
);

/* ==========================================================
   SHOW RESULTS
========================================================== */

function showResults() {

    document
        .getElementById("question-card")
        .classList.add("hidden");

    quizResults.classList.remove("hidden");

    progressFill.style.width = "100%";

    finalScore.textContent =
        `${score} / ${quizQuestions.length}`;

    if (score === quizQuestions.length) {

        resultMessage.textContent =
            "Perfect! You're ready for your first Bridge game.";

    } else if (score >= 8) {

        resultMessage.textContent =
            "Excellent! You have a strong understanding of the basics.";

    } else if (score >= 6) {

        resultMessage.textContent =
            "Nice work! Review a few sections and you'll be ready to play.";

    } else if (score >= 4) {

        resultMessage.textContent =
            "Good start! Read through the lessons again and try the quiz once more.";

    } else {

        resultMessage.textContent =
            "Keep practicing! Every Bridge player starts as a beginner.";

    }

}

/* ==========================================================
   RESTART QUIZ
========================================================== */

restartButton.addEventListener(
    "click",
    startQuiz
);

/* ==========================================================
   INITIALIZE
========================================================== */

startQuiz();

/* ==========================================================
   CONTINUES IN PART 3
========================================================== */

/* ==========================================================
   ACCESSIBILITY & USABILITY ENHANCEMENTS
========================================================== */

/*
   Close the mobile menu when clicking outside it.
*/

document.addEventListener("click", event => {

    if (!menuToggle || !navMenu) {
        return;
    }

    const clickedMenu =
        navMenu.contains(event.target);

    const clickedButton =
        menuToggle.contains(event.target);

    if (
        !clickedMenu &&
        !clickedButton &&
        navMenu.classList.contains("open")
    ) {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

});

/*
   Close the menu when the Escape key is pressed.
*/

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        navMenu &&
        navMenu.classList.contains("open")
    ) {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.focus();

    }

});

/* ==========================================================
   IMPROVED SMOOTH SCROLLING
========================================================== */

document
.querySelectorAll('a[href^="#"]')
.forEach(link => {

    link.addEventListener("click", event => {

        const targetID =
            link.getAttribute("href");

        if (
            !targetID ||
            targetID === "#"
        ) {
            return;
        }

        const target =
            document.querySelector(targetID);

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

/* ==========================================================
   UPDATE ACTIVE NAVIGATION AFTER PAGE LOAD
========================================================== */

window.addEventListener("load", () => {

    highlightCurrentSection();

});

/* ==========================================================
   RESIZE HANDLER
========================================================== */

window.addEventListener("resize", () => {

    if (
        window.innerWidth > 900 &&
        navMenu
    ) {

        navMenu.classList.remove("open");

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }

});

/* ==========================================================
   DEFENSIVE QUIZ CHECK
========================================================== */

if (
    quizQuestions.length === 0
) {

    questionText.textContent =
        "No quiz questions were found.";

}

/* ==========================================================
   CONSOLE MESSAGE
========================================================== */

console.log(
    "Learn Bridge loaded successfully."
);

console.log(
    `Loaded ${quizQuestions.length} quiz questions.`
);


/* ==========================================================
   MOUSE GLOW EFFECT
========================================================== */

const mouseGlow =
    document.querySelector(".mouse-glow");

let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;

let targetX = glowX;
let targetY = glowY;

document.addEventListener("mousemove", event => {

    targetX = event.clientX;

    targetY = event.clientY;

});

function animateGlow() {

    glowX += (targetX - glowX) * 0.08;
    glowY += (targetY - glowY) * 0.08;

    if (mouseGlow) {

        mouseGlow.style.left = glowX + "px";
        mouseGlow.style.top = glowY + "px";

    }

    requestAnimationFrame(animateGlow);

}

animateGlow();


/* ==========================================================
   HERO CARD PARALLAX
========================================================== */

const heroCards =
    document.querySelectorAll(".playing-card");

document.addEventListener("mousemove", event => {

    const x =
        (event.clientX / window.innerWidth - 0.5) * 12;

    const y =
        (event.clientY / window.innerHeight - 0.5) * 12;

    heroCards.forEach((card, index) => {

        const speed = (index + 1) * 0.25;

        card.style.transform =
            `translate(${-x * speed}px, ${-y * speed}px)`;

    });

});




/* ==========================================
   HERO CARD 3D EFFECT
========================================== */

document.querySelectorAll(".tilt-card").forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 22;
        const rotateX = ((rect.height / 2 - y) / rect.height) * 22;

        card.style.transform =
            `perspective(900px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             scale(1.06)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "perspective

/* ==========================================================
   END OF FILE
========================================================== */
