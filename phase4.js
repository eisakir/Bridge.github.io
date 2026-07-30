"use strict";

(() => {
    const questions = window.bridgeQuestionBank || [];
    const progressApi = window.BridgeProgress;
    const questionById = new Map(
        questions.map(question => [question.id, question])
    );
    const topicNames = [
        "Basics",
        "Auction",
        "Roles",
        "Card Play",
        "Scoring",
        "Vocabulary",
        "Table Skills"
    ];

    function localDateKey(date = new Date()) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function dateSeed(value) {
        return [...value].reduce(
            (seed, character) => (
                ((seed << 5) - seed) + character.charCodeAt(0)
            ) | 0,
            0
        );
    }

    function shuffled(items) {
        const result = [...items];

        for (let index = result.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[randomIndex]] =
                [result[randomIndex], result[index]];
        }

        return result;
    }

    function makeMessage(message, className = "feature-empty-state") {
        const element = document.createElement("p");
        element.className = className;
        element.textContent = message;
        return element;
    }

    function createQuestionView(question, onAnswer) {
        const wrapper = document.createElement("div");
        wrapper.className = "phase-four-question";

        const topic = document.createElement("span");
        topic.className = "question-topic";
        topic.textContent = question.topic;

        const heading = document.createElement("h3");
        heading.textContent = question.question;

        const answers = document.createElement("div");
        answers.className = "phase-four-answers";

        const feedback = document.createElement("div");
        feedback.className = "phase-four-feedback";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");

        question.answers.forEach((answer, answerIndex) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = answer;
            button.addEventListener("click", () => {
                const correct = answerIndex === question.correct;

                answers.querySelectorAll("button").forEach(
                    (answerButton, index) => {
                        answerButton.disabled = true;
                        if (index === question.correct) {
                            answerButton.classList.add("correct");
                        } else if (index === answerIndex) {
                            answerButton.classList.add("incorrect");
                        }
                    }
                );

                feedback.className =
                    `phase-four-feedback ${correct ? "correct" : "incorrect"}`;
                feedback.textContent =
                    `${correct ? "Correct. " : "Not quite. "}` +
                    question.explanation;
                onAnswer(correct, feedback);
            });
            answers.appendChild(button);
        });

        wrapper.append(topic, heading, answers, feedback);
        return wrapper;
    }

    function renderDailyChallenge() {
        const card = document.getElementById("dailyChallengeCard");
        const dateElement = document.getElementById("dailyChallengeDate");
        if (!card || !questions.length) {
            return;
        }

        const today = localDateKey();
        const questionIndex =
            Math.abs(dateSeed(today)) % questions.length;
        const question = questions[questionIndex];
        const progress = progressApi?.getData?.() || {};
        const completed = progress.daily?.lastCompleted === today;

        dateElement.textContent = new Intl.DateTimeFormat(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric"
        }).format(new Date());
        card.innerHTML = "";

        if (completed) {
            const completedBanner = makeMessage(
                "✓ Today’s challenge is complete. Come back tomorrow for a new one.",
                "daily-complete-banner"
            );
            card.appendChild(completedBanner);
        }

        const questionView = createQuestionView(question, correct => {
            progressApi?.recordQuizAnswer?.(question, correct);

            if (correct) {
                progressApi?.recordActivity?.("dailyChallenge", {
                    date: today
                });
                window.launchConfetti?.();
                if (progressApi?.isAuthenticated?.()) {
                    window.setTimeout(renderDailyChallenge, 650);
                } else {
                    feedback.textContent +=
                        " Sign in to save this completion.";
                }
            }
        });

        if (completed) {
            questionView.querySelectorAll("button").forEach(button => {
                button.disabled = true;
            });
        }

        card.appendChild(questionView);

        if (!progressApi?.isAuthenticated?.()) {
            card.appendChild(makeMessage(
                "Sign in with Google before answering to save your daily completion and streak."
            ));
        }
    }

    let adaptiveQuestions = [];
    let adaptiveIndex = 0;
    let adaptiveCorrect = 0;
    let adaptiveRecorded = false;

    function selectAdaptiveQuestions() {
        const progress = progressApi?.getData?.() || {};
        const mistakes = new Set(
            (progress.mistakes || []).map(mistake => mistake.id)
        );
        const topicAccuracy = progress.topicStats || {};
        const rankedTopics = topicNames
            .map(topic => {
                const stats = topicAccuracy[topic] || {
                    correct: 0,
                    total: 0
                };
                return {
                    topic,
                    accuracy: stats.total
                        ? stats.correct / stats.total
                        : .5
                };
            })
            .sort((first, second) => first.accuracy - second.accuracy);
        const weakTopics = new Set(
            rankedTopics.slice(0, 3).map(item => item.topic)
        );
        const priority = shuffled(questions.filter(question => (
            mistakes.has(question.id) || weakTopics.has(question.topic)
        )));
        const selected = priority.slice(0, 7);
        const selectedIds = new Set(selected.map(question => question.id));
        const remaining = shuffled(
            questions.filter(question => !selectedIds.has(question.id))
        );

        return [...selected, ...remaining].slice(0, 10);
    }

    function renderAdaptivePractice() {
        const card = document.getElementById("adaptivePracticeCard");
        const scoreElement = document.getElementById("adaptiveSessionScore");
        if (!card) {
            return;
        }

        card.innerHTML = "";

        if (!adaptiveQuestions.length) {
            const intro = document.createElement("div");
            intro.className = "adaptive-intro";
            const heading = document.createElement("h3");
            heading.textContent = "Start a personalized 10-question session";
            const copy = document.createElement("p");
            copy.textContent = progressApi?.isAuthenticated?.()
                ? "Your saved mistakes and lowest-accuracy topics will appear more often."
                : "Sign in first so Learn Bridge can personalize questions using your progress.";
            const button = document.createElement("button");
            button.type = "button";
            button.className = "primary-button";
            button.textContent = "Start adaptive practice";
            button.addEventListener("click", () => {
                adaptiveQuestions = selectAdaptiveQuestions();
                adaptiveIndex = 0;
                adaptiveCorrect = 0;
                adaptiveRecorded = false;
                renderAdaptivePractice();
            });
            intro.append(heading, copy, button);
            card.appendChild(intro);
            scoreElement.textContent = "Ready";
            return;
        }

        if (adaptiveIndex >= adaptiveQuestions.length) {
            const total = adaptiveQuestions.length;
            const result = document.createElement("div");
            result.className = "adaptive-result";
            const heading = document.createElement("h3");
            heading.textContent = "Adaptive session complete";
            const score = document.createElement("strong");
            score.textContent = `${adaptiveCorrect} / ${total}`;
            const copy = document.createElement("p");
            copy.textContent =
                "Your next session will adjust using these new results.";
            const restart = document.createElement("button");
            restart.type = "button";
            restart.className = "primary-button";
            restart.textContent = "Build another session";
            restart.addEventListener("click", () => {
                adaptiveQuestions = [];
                renderAdaptivePractice();
            });
            result.append(heading, score, copy, restart);
            card.appendChild(result);
            scoreElement.textContent = `${adaptiveCorrect} / ${total}`;
            if (!adaptiveRecorded) {
                adaptiveRecorded = true;
                progressApi?.recordActivity?.("quiz", {
                    score: adaptiveCorrect,
                    total
                });
            }
            return;
        }

        const question = adaptiveQuestions[adaptiveIndex];
        scoreElement.textContent =
            `${adaptiveIndex + 1} of ${adaptiveQuestions.length}`;
        card.appendChild(createQuestionView(question, (correct, feedback) => {
            progressApi?.recordQuizAnswer?.(question, correct);
            if (correct) {
                adaptiveCorrect += 1;
            }

            const next = document.createElement("button");
            next.type = "button";
            next.className = "secondary-button adaptive-next";
            next.textContent = adaptiveIndex === adaptiveQuestions.length - 1
                ? "See results"
                : "Next question";
            next.addEventListener("click", () => {
                adaptiveIndex += 1;
                renderAdaptivePractice();
            });
            feedback.appendChild(next);
        }));
    }

    function renderMistakeReview() {
        const list = document.getElementById("mistakeReviewList");
        const count = document.getElementById("mistakeReviewCount");
        if (!list || !count) {
            return;
        }

        const progress = progressApi?.getData?.() || {};
        const mistakes = (progress.mistakes || [])
            .map(record => ({
                record,
                question: questionById.get(record.id)
            }))
            .filter(item => item.question);
        list.innerHTML = "";
        count.textContent = `${mistakes.length} to review`;
        document.getElementById("dashboardMistakeCount").textContent =
            String(mistakes.length);

        if (!progressApi?.isAuthenticated?.()) {
            list.appendChild(makeMessage(
                "Sign in with Google to save missed questions and build your review list."
            ));
            return;
        }

        if (!mistakes.length) {
            list.appendChild(makeMessage(
                "Nothing to review right now. Missed quiz questions will appear here automatically."
            ));
            return;
        }

        mistakes.forEach(({ record, question }) => {
            const article = document.createElement("article");
            article.className = "mistake-review-card";
            const misses = document.createElement("span");
            misses.className = "mistake-count";
            misses.textContent =
                `Missed ${record.misses || 1} ` +
                `${(record.misses || 1) === 1 ? "time" : "times"}`;
            const questionView = createQuestionView(
                question,
                (correct, feedback) => {
                    progressApi.recordQuizAnswer(question, correct);
                    if (correct) {
                        feedback.textContent +=
                            " Removed from your review list.";
                        window.setTimeout(() => {
                            document.activeElement?.blur?.();
                            progressApi.resolveMistake(question.id);
                        }, 650);
                    }
                }
            );
            article.append(misses, questionView);
            list.appendChild(article);
        });
    }

    function renderStatistics() {
        const summary = document.getElementById("statisticsSummary");
        const topics = document.getElementById("topicStatistics");
        if (!summary || !topics) {
            return;
        }

        const progress = progressApi?.getData?.() || {};
        const stats = progress.stats || {};
        const topicStats = progress.topicStats || {};
        const totalAnswers = Object.values(topicStats).reduce(
            (sum, topic) => sum + (topic.total || 0),
            0
        );
        const correctAnswers = Object.values(topicStats).reduce(
            (sum, topic) => sum + (topic.correct || 0),
            0
        );
        const accuracy = totalAnswers
            ? Math.round((correctAnswers / totalAnswers) * 100)
            : 0;
        const cards = [
            ["Questions answered", totalAnswers],
            ["Overall accuracy", `${accuracy}%`],
            ["Best quiz", stats.quizAttempts ? `${stats.quizBest}%` : "—"],
            ["Practice sessions", stats.quizAttempts || 0],
            ["Deals completed", stats.deals || 0],
            ["Daily challenges", stats.dailyChallenges || 0]
        ];

        summary.innerHTML = cards.map(([label, value]) => (
            `<article><span>${label}</span><strong>${value}</strong></article>`
        )).join("");
        if (!progressApi?.isAuthenticated?.()) {
            summary.prepend(makeMessage(
                "Sign in with Google to save and view your personal statistics.",
                "statistics-sign-in-note"
            ));
        }
        topics.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Accuracy by topic";
        topics.appendChild(heading);

        topicNames.forEach(topic => {
            const statsForTopic = topicStats[topic] || {
                correct: 0,
                total: 0
            };
            const topicAccuracy = statsForTopic.total
                ? Math.round(
                    (statsForTopic.correct / statsForTopic.total) * 100
                )
                : 0;
            const row = document.createElement("div");
            row.className = "topic-stat-row";
            row.innerHTML =
                `<div><strong>${topic}</strong>` +
                `<span>${statsForTopic.correct} / ` +
                `${statsForTopic.total} correct</span></div>` +
                `<div class="topic-stat-track" role="progressbar" ` +
                `aria-label="${topic} accuracy" aria-valuemin="0" ` +
                `aria-valuemax="100" aria-valuenow="${topicAccuracy}">` +
                `<span style="width:${topicAccuracy}%"></span></div>` +
                `<strong>${topicAccuracy}%</strong>`;
            topics.appendChild(row);
        });
    }

    let activeAchievementFilter = "all";

    function applyAchievementFilter() {
        document.querySelectorAll("[data-achievement-category]").forEach(
            achievement => {
                achievement.hidden = (
                    activeAchievementFilter !== "all" &&
                    achievement.dataset.achievementCategory !==
                        activeAchievementFilter
                );
            }
        );
    }

    document.getElementById("achievementFilters")?.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "[data-achievement-filter]"
            );
            if (!button) {
                return;
            }
            activeAchievementFilter = button.dataset.achievementFilter;
            document.querySelectorAll("[data-achievement-filter]").forEach(
                filter => {
                    filter.classList.toggle("active", filter === button);
                    filter.setAttribute(
                        "aria-pressed",
                        String(filter === button)
                    );
                }
            );
            applyAchievementFilter();
        }
    );

    const celebrationQueue = [];
    let celebrationActive = false;

    function playAchievementChime() {
        if (window.BridgeA11y?.soundEnabled?.() === false) {
            return;
        }

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        const context = new AudioContextClass();
        const gain = context.createGain();
        const now = context.currentTime;
        const notes = [523.25, 659.25, 783.99];

        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(.12, now + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, now + .75);
        gain.connect(context.destination);

        notes.forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            oscillator.connect(gain);
            oscillator.start(now + (index * .13));
            oscillator.stop(now + .32 + (index * .13));
        });

        window.setTimeout(() => context.close(), 1000);
    }

    function showNextAchievement() {
        if (celebrationActive || !celebrationQueue.length) {
            return;
        }

        celebrationActive = true;
        const achievement = celebrationQueue.shift();
        const toast = document.createElement("div");
        toast.className = "achievement-celebration";
        toast.setAttribute("role", "status");
        toast.innerHTML =
            `<span class="celebration-icon">${achievement.icon}</span>` +
            `<div><small>Achievement unlocked</small>` +
            `<strong>${achievement.title}</strong>` +
            `<p>${achievement.description}</p></div>` +
            `<button type="button" aria-label="Dismiss achievement">×</button>`;
        document.body.appendChild(toast);
        window.launchConfetti?.();
        playAchievementChime();

        const dismiss = () => {
            if (!toast.isConnected) {
                return;
            }
            toast.classList.add("leaving");
            window.setTimeout(() => {
                toast.remove();
                celebrationActive = false;
                showNextAchievement();
            }, 250);
        };

        toast.querySelector("button").addEventListener("click", dismiss);
        window.setTimeout(dismiss, 5000);
    }

    window.addEventListener("bridge:achievements-unlocked", event => {
        celebrationQueue.push(...(event.detail?.achievements || []));
        showNextAchievement();
    });

    let installPrompt = null;
    const installCard = document.getElementById("installAppCard");
    const installButton = document.getElementById("installAppButton");
    const installMessage = document.getElementById("installAppMessage");

    function installedAsApp() {
        return window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;
    }

    function updateInstallCard() {
        if (!installCard || !installButton || !installMessage) {
            return;
        }

        if (installedAsApp()) {
            installButton.hidden = true;
            installMessage.textContent =
                "Learn Bridge is installed on this device.";
            installCard.classList.add("installed");
        } else if (installPrompt) {
            installButton.disabled = false;
            installMessage.textContent =
                "Install Learn Bridge for quick access and offline lessons.";
        } else {
            installButton.disabled = false;
            installMessage.textContent =
                "On iPhone or iPad, use Share → Add to Home Screen. " +
                "Other supported browsers can use the button.";
        }
    }

    window.addEventListener("beforeinstallprompt", event => {
        event.preventDefault();
        installPrompt = event;
        updateInstallCard();
    });

    installButton?.addEventListener("click", async () => {
        if (!installPrompt) {
            installMessage.textContent =
                "Open your browser menu and choose Install App or " +
                "Add to Home Screen.";
            return;
        }

        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        updateInstallCard();
    });

    window.addEventListener("appinstalled", updateInstallCard);

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").catch(() => {
                if (installMessage) {
                    installMessage.textContent =
                        "Offline installation is temporarily unavailable.";
                }
            });
        });
    }

    function updateMistakeCount() {
        const count = (progressApi?.getData?.().mistakes || []).length;
        const dashboardCount = document.getElementById(
            "dashboardMistakeCount"
        );
        if (dashboardCount) {
            dashboardCount.textContent = String(count);
        }
    }

    function renderPhaseFourSummary() {
        updateMistakeCount();
        renderStatistics();
        applyAchievementFilter();
        updateInstallCard();
    }

    progressApi?.subscribe?.(() => {
        renderPhaseFourSummary();
        const currentPage = window.BridgeAppShell?.currentPage?.();
        if (
            currentPage === "daily-challenge" &&
            !document.getElementById("dailyChallengeCard")
                ?.contains(document.activeElement)
        ) {
            renderDailyChallenge();
        }
        if (
            currentPage === "mistake-review" &&
            !document.getElementById("mistakeReviewList")
                ?.contains(document.activeElement)
        ) {
            renderMistakeReview();
        }
    });
    window.addEventListener("bridge:view-changed", event => {
        if (event.detail?.page === "adaptive-practice") {
            renderAdaptivePractice();
        }
        if (event.detail?.page === "daily-challenge") {
            renderDailyChallenge();
        }
        if (event.detail?.page === "mistake-review") {
            renderMistakeReview();
        }
        renderPhaseFourSummary();
    });

    renderAdaptivePractice();
    renderDailyChallenge();
    renderMistakeReview();
    renderPhaseFourSummary();
})();
