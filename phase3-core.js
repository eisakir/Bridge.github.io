"use strict";

(() => {
    const PROGRESS_KEY = "learnBridgeProgressV1";
    const ACCESSIBILITY_KEY = "learnBridgeAccessibilityV1";
    const lessonIds = ["basics", "auction", "play", "scoring", "practice"];
    const listeners = new Set();

    const defaultProgress = () => ({
        version: 1,
        lessons: {},
        stats: {
            quizBest: 0,
            quizAttempts: 0,
            auctions: 0,
            exercises: 0,
            handsCorrect: 0,
            handsAttempts: 0,
            deals: 0,
            scoringUses: 0,
            animatedLessons: 0,
            dailyChallenges: 0
        },
        achievements: [],
        mistakes: [],
        topicStats: {},
        daily: {
            lastCompleted: null
        },
        streak: {
            count: 0,
            lastDate: null
        }
    });

    const achievementDefinitions = [
        {
            id: "first-step",
            icon: "🌱",
            title: "First Step",
            description: "Complete any lesson or activity.",
            test: data => totalActivity(data) > 0
        },
        {
            id: "first-lesson",
            icon: "📖",
            title: "Lesson Learner",
            description: "Complete your first guided lesson.",
            test: data => lessonIds.some(id => data.lessons[id])
        },
        {
            id: "lesson-halfway",
            icon: "🧭",
            title: "Halfway There",
            description: "Complete three guided lessons.",
            test: data => lessonIds.filter(id => data.lessons[id]).length >= 3
        },
        {
            id: "path-complete",
            icon: "🎓",
            title: "Bridge Graduate",
            description: "Complete all five guided lessons.",
            test: data => lessonIds.every(id => data.lessons[id])
        },
        {
            id: "quiz-rookie",
            icon: "❓",
            title: "Quiz Rookie",
            description: "Finish your first practice quiz.",
            test: data => data.stats.quizAttempts >= 1
        },
        {
            id: "quiz-explorer",
            icon: "🧠",
            title: "Quiz Explorer",
            description: "Finish five practice quizzes.",
            test: data => data.stats.quizAttempts >= 5
        },
        {
            id: "quiz-veteran",
            icon: "📚",
            title: "Quiz Veteran",
            description: "Finish ten practice quizzes.",
            test: data => data.stats.quizAttempts >= 10
        },
        {
            id: "quiz-ace",
            icon: "⭐",
            title: "Quiz Ace",
            description: "Earn a best quiz score of at least 80%.",
            test: data => data.stats.quizBest >= 80
        },
        {
            id: "perfect-quiz",
            icon: "🏆",
            title: "Perfect Quiz",
            description: "Score 100% on a quiz.",
            test: data => data.stats.quizBest === 100
        },
        {
            id: "first-auction",
            icon: "📣",
            title: "First Call",
            description: "Complete your first auction.",
            test: data => data.stats.auctions >= 1
        },
        {
            id: "auctioneer",
            icon: "🗣️",
            title: "Auctioneer",
            description: "Complete three auctions.",
            test: data => data.stats.auctions >= 3
        },
        {
            id: "auction-master",
            icon: "🔨",
            title: "Auction Master",
            description: "Complete ten auctions.",
            test: data => data.stats.auctions >= 10
        },
        {
            id: "first-follow",
            icon: "♣",
            title: "Suit Starter",
            description: "Solve your first following-suit exercise.",
            test: data => data.stats.exercises >= 1
        },
        {
            id: "follow-suit",
            icon: "🃏",
            title: "Follow-Suit Pro",
            description: "Solve five following-suit exercises.",
            test: data => data.stats.exercises >= 5
        },
        {
            id: "follow-suit-master",
            icon: "🎯",
            title: "Follow-Suit Master",
            description: "Solve fifteen following-suit exercises.",
            test: data => data.stats.exercises >= 15
        },
        {
            id: "first-bid",
            icon: "💬",
            title: "Opening Bid",
            description: "Answer your first opening hand correctly.",
            test: data => data.stats.handsCorrect >= 1
        },
        {
            id: "bid-student",
            icon: "💡",
            title: "Bid Student",
            description: "Answer five opening hands correctly.",
            test: data => data.stats.handsCorrect >= 5
        },
        {
            id: "bid-expert",
            icon: "🧩",
            title: "Bid Expert",
            description: "Answer fifteen opening hands correctly.",
            test: data => data.stats.handsCorrect >= 15
        },
        {
            id: "full-deal",
            icon: "♠",
            title: "Full Deal",
            description: "Finish a complete 13-trick deal.",
            test: data => data.stats.deals >= 1
        },
        {
            id: "deal-maker",
            icon: "🂡",
            title: "Deal Maker",
            description: "Finish five complete deals.",
            test: data => data.stats.deals >= 5
        },
        {
            id: "scorekeeper",
            icon: "🧮",
            title: "Scorekeeper",
            description: "Use the scoring calculator once.",
            test: data => data.stats.scoringUses >= 1
        },
        {
            id: "scoring-pro",
            icon: "➕",
            title: "Scoring Pro",
            description: "Use the scoring calculator five times.",
            test: data => data.stats.scoringUses >= 5
        },
        {
            id: "table-tour",
            icon: "♦",
            title: "Table Tour",
            description: "Complete the animated table lesson.",
            test: data => data.stats.animatedLessons >= 1
        },
        {
            id: "streak-three",
            icon: "🔥",
            title: "Three-Day Streak",
            description: "Practice on three consecutive days.",
            test: data => data.streak.count >= 3
        },
        {
            id: "streak-seven",
            icon: "🌟",
            title: "Week at the Table",
            description: "Practice on seven consecutive days.",
            test: data => data.streak.count >= 7
        },
        {
            id: "all-rounder",
            icon: "🌈",
            title: "All-Rounder",
            description: "Try every type of interactive activity.",
            test: data => (
                data.stats.quizAttempts > 0 &&
                data.stats.auctions > 0 &&
                data.stats.exercises > 0 &&
                data.stats.handsAttempts > 0 &&
                data.stats.deals > 0 &&
                data.stats.scoringUses > 0 &&
                data.stats.animatedLessons > 0
            )
        },
        {
            id: "bridge-devotion",
            icon: "👑",
            title: "Bridge Devotion",
            description: "Complete fifty lessons and activities.",
            test: data => totalActivity(data) >= 50
        },
        {
            id: "daily-deal",
            icon: "☀️",
            title: "Daily Deal",
            description: "Complete your first Daily Bridge Challenge.",
            test: data => data.stats.dailyChallenges >= 1
        },
        {
            id: "daily-regular",
            icon: "📅",
            title: "Daily Regular",
            description: "Complete seven Daily Bridge Challenges.",
            test: data => data.stats.dailyChallenges >= 7
        }
    ];

    function safeParse(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function storageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            /* Progress still works for the current visit. */
        }
    }

    function storageRemove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch {
            /* The in-memory reset still protects signed-out progress. */
        }
    }

    function normalizeProgress(saved = {}) {
        const defaults = defaultProgress();

        return {
            ...defaults,
            ...saved,
            lessons: { ...defaults.lessons, ...(saved.lessons || {}) },
            stats: { ...defaults.stats, ...(saved.stats || {}) },
            streak: { ...defaults.streak, ...(saved.streak || {}) },
            daily: { ...defaults.daily, ...(saved.daily || {}) },
            topicStats: { ...defaults.topicStats, ...(saved.topicStats || {}) },
            mistakes: Array.isArray(saved.mistakes)
                ? saved.mistakes
                : [],
            achievements: Array.isArray(saved.achievements)
                ? saved.achievements
                : []
        };
    }

    let progress = defaultProgress();
    let authenticated = false;

    function localDateKey(date = new Date()) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function daysBetween(first, second) {
        const start = new Date(`${first}T12:00:00`);
        const end = new Date(`${second}T12:00:00`);
        return Math.round((end - start) / 86400000);
    }

    function updateStreak() {
        const today = localDateKey();
        const lastDate = progress.streak.lastDate;

        if (lastDate === today) {
            return;
        }

        progress.streak.count =
            lastDate && daysBetween(lastDate, today) === 1
                ? progress.streak.count + 1
                : 1;
        progress.streak.lastDate = today;
    }

    function totalActivity(data) {
        return (
            Object.values(data.lessons).filter(Boolean).length +
            data.stats.quizAttempts +
            data.stats.auctions +
            data.stats.exercises +
            data.stats.handsAttempts +
            data.stats.deals +
            data.stats.scoringUses +
            data.stats.animatedLessons +
            data.stats.dailyChallenges
        );
    }

    function updateAchievements() {
        const newlyUnlocked = [];

        achievementDefinitions.forEach(achievement => {
            if (
                achievement.test(progress) &&
                !progress.achievements.includes(achievement.id)
            ) {
                progress.achievements.push(achievement.id);
                newlyUnlocked.push(achievement);
            }
        });

        return newlyUnlocked;
    }

    function saveProgress() {
        if (!authenticated) {
            return;
        }

        const newlyUnlocked = updateAchievements();
        storageSet(
            PROGRESS_KEY,
            JSON.stringify(progress)
        );
        renderProgress();
        listeners.forEach(listener => listener(getData()));

        if (newlyUnlocked.length) {
            window.dispatchEvent(new CustomEvent(
                "bridge:achievements-unlocked",
                { detail: { achievements: newlyUnlocked } }
            ));
        }
    }

    function recordActivity(type, detail = {}) {
        if (!authenticated) {
            return;
        }

        updateStreak();

        switch (type) {
            case "quiz":
                progress.stats.quizAttempts += 1;
                progress.stats.quizBest = Math.max(
                    progress.stats.quizBest,
                    Math.round((detail.score / detail.total) * 100)
                );
                break;
            case "auction":
                progress.stats.auctions += 1;
                break;
            case "exercise":
                progress.stats.exercises += 1;
                break;
            case "practiceHand":
                progress.stats.handsAttempts += 1;
                if (detail.correct) {
                    progress.stats.handsCorrect += 1;
                }
                break;
            case "deal":
                progress.stats.deals += 1;
                break;
            case "score":
                progress.stats.scoringUses += 1;
                break;
            case "animatedLesson":
                progress.stats.animatedLessons += 1;
                break;
            case "dailyChallenge":
                if (progress.daily.lastCompleted === detail.date) {
                    return;
                }
                progress.daily.lastCompleted = detail.date;
                progress.stats.dailyChallenges += 1;
                break;
            default:
                return;
        }

        saveProgress();
    }

    function recordQuizAnswer(question, correct) {
        if (!authenticated || !question?.id) {
            return;
        }

        const topic = question.topic || "General";
        const topicRecord = progress.topicStats[topic] || {
            correct: 0,
            total: 0
        };
        topicRecord.total += 1;
        if (correct) {
            topicRecord.correct += 1;
        }
        progress.topicStats[topic] = topicRecord;

        const existing = progress.mistakes.find(
            mistake => mistake.id === question.id
        );

        if (!correct) {
            if (existing) {
                existing.misses = (existing.misses || 1) + 1;
                existing.lastMissed = new Date().toISOString();
            } else {
                progress.mistakes.push({
                    id: question.id,
                    misses: 1,
                    lastMissed: new Date().toISOString()
                });
            }
        }

        saveProgress();
    }

    function resolveMistake(questionId) {
        if (!authenticated) {
            return;
        }

        progress.mistakes = progress.mistakes.filter(
            mistake => mistake.id !== questionId
        );
        saveProgress();
    }

    function completeLesson(id, complete = true) {
        if (!authenticated || !lessonIds.includes(id)) {
            return;
        }

        progress.lessons[id] = complete;
        updateStreak();
        saveProgress();
    }

    function getData() {
        return JSON.parse(JSON.stringify(progress));
    }

    function replaceData(nextProgress) {
        progress = normalizeProgress(nextProgress);
        updateAchievements();
        if (authenticated) {
            storageSet(PROGRESS_KEY, JSON.stringify(progress));
        }
        renderProgress();
        listeners.forEach(listener => listener(getData()));
    }

    function resetData() {
        storageRemove(PROGRESS_KEY);
        replaceData(defaultProgress());
    }

    function setAuthenticated(isAuthenticated) {
        authenticated = Boolean(isAuthenticated);
        if (!authenticated) {
            resetData();
        } else {
            renderProgress();
        }
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function overallProgress() {
        const lessonCount = lessonIds.filter(
            id => progress.lessons[id]
        ).length;
        const activityChecks = [
            progress.stats.quizAttempts > 0,
            progress.stats.auctions > 0,
            progress.stats.exercises > 0,
            progress.stats.handsAttempts > 0,
            progress.stats.deals > 0
        ].filter(Boolean).length;

        return Math.round(((lessonCount + activityChecks) / 10) * 100);
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function achievementCategory(id) {
        if (
            id.includes("quiz") ||
            id === "perfect-quiz"
        ) {
            return "quiz";
        }
        if (
            id.includes("auction") ||
            id.includes("bid") ||
            id === "first-call"
        ) {
            return "bidding";
        }
        if (
            id.includes("follow") ||
            id.includes("deal") ||
            id === "table-tour" ||
            id === "scorekeeper" ||
            id === "scoring-pro"
        ) {
            return "play";
        }
        if (
            id.includes("streak") ||
            id.includes("daily") ||
            id === "bridge-devotion" ||
            id === "all-rounder"
        ) {
            return "consistency";
        }
        return "learning";
    }

    function renderProgress() {
        const percentage = overallProgress();
        const progressTrack = document.querySelector(
            ".dashboard-progress-track"
        );
        const progressFill = document.getElementById(
            "overallProgressFill"
        );

        setText("learningStreak", progress.streak.count);
        setText("overallProgressText", `${percentage}% complete`);
        setText(
            "overallProgressDetail",
            `${lessonIds.filter(id => progress.lessons[id]).length} of ` +
            "5 lessons completed"
        );
        setText(
            "dashboardQuiz",
            progress.stats.quizAttempts
                ? `${progress.stats.quizBest}%`
                : "—"
        );
        setText("dashboardAuctions", progress.stats.auctions);
        setText("dashboardExercises", progress.stats.exercises);
        setText(
            "dashboardHands",
            `${progress.stats.handsCorrect} / ` +
            `${progress.stats.handsAttempts}`
        );
        setText("dashboardDeals", progress.stats.deals);

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (progressTrack) {
            progressTrack.setAttribute(
                "aria-valuenow",
                String(percentage)
            );
        }

        document.querySelectorAll("[data-learning-card]").forEach(card => {
            const id = card.dataset.learningCard;
            const complete = Boolean(progress.lessons[id]);
            const status = card.querySelector(".path-status");
            const button = card.querySelector("[data-complete-lesson]");

            card.classList.toggle("completed", complete);
            status.textContent = complete ? "Completed ✓" : "Not completed";
            button.textContent = !authenticated
                ? "Sign in to complete"
                : complete
                    ? "Completed"
                    : "Mark complete";
            button.disabled = !authenticated;
            button.setAttribute("aria-pressed", String(complete));
        });

        const grid = document.getElementById("achievementGrid");

        if (grid) {
            const unlocked = new Set(progress.achievements);

            grid.innerHTML = achievementDefinitions.map(achievement => {
                const isUnlocked = unlocked.has(achievement.id);
                const status = isUnlocked ? "Unlocked" : "Not yet unlocked";

                return (
                    `<article class="achievement-badge ` +
                        `${isUnlocked ? "unlocked" : "locked"}" ` +
                        `data-achievement-category="` +
                        `${achievementCategory(achievement.id)}" ` +
                        `aria-label="${achievement.title}: ${status}">` +
                        `<span class="achievement-icon" aria-hidden="true">` +
                            `${achievement.icon}</span>` +
                        `<div><span class="achievement-category">` +
                            `${achievementCategory(achievement.id)}</span>` +
                        `<span class="achievement-status">${status}</span>` +
                        `<strong>${achievement.title}</strong>` +
                        `<p>${achievement.description}</p></div>` +
                    `</article>`
                );
            }).join("");
        }

        const unlockedCount = achievementDefinitions.filter(
            achievement => progress.achievements.includes(achievement.id)
        ).length;

        setText(
            "achievementCount",
            `${unlockedCount} / ` +
            `${achievementDefinitions.length} unlocked`
        );
    }

    window.BridgeProgress = {
        recordActivity,
        recordQuizAnswer,
        resolveMistake,
        completeLesson,
        getData,
        replaceData,
        resetData,
        setAuthenticated,
        isAuthenticated: () => authenticated,
        subscribe,
        render: renderProgress
    };

    document.querySelectorAll("[data-complete-lesson]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.completeLesson;
            const wasComplete = Boolean(progress.lessons[id]);
            completeLesson(id, !wasComplete);

            if (authenticated && !wasComplete) {
                window.dispatchEvent(
                    new CustomEvent("bridge:lesson-completed")
                );
            }
        });
    });

    /* Theme and retained accessibility preferences */
    const defaultAccessibility = {
        text: "normal",
        theme: "auto",
        contrast: false,
        motion: false,
        sound: true
    };
    let accessibility = {
        ...defaultAccessibility,
        ...safeParse(
            storageGet(ACCESSIBILITY_KEY),
            {}
        )
    };
    if (!["auto", "light", "dark"].includes(accessibility.theme)) {
        accessibility.theme = "auto";
    }

    const themeToggle = document.getElementById("themeToggle");
    const systemTheme = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
    );

    function applyAccessibility() {
        const root = document.documentElement;

        const isDark =
            accessibility.theme === "dark" ||
            (
                accessibility.theme === "auto" &&
                Boolean(systemTheme?.matches)
            );
        root.dataset.theme = isDark ? "dark" : "light";
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            "content",
            isDark ? "#0d1b25" : "#173f5e"
        );
        root.classList.toggle(
            "a11y-large",
            accessibility.text === "large"
        );
        root.classList.toggle(
            "a11y-larger",
            accessibility.text === "larger"
        );
        root.classList.toggle(
            "high-contrast",
            accessibility.contrast
        );
        root.classList.toggle(
            "reduce-motion",
            accessibility.motion
        );

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(isDark));
            themeToggle.setAttribute(
                "aria-label",
                `Switch to ${isDark ? "light" : "dark"} mode`
            );
            const icon = themeToggle.querySelector(".theme-toggle-icon");
            const text = themeToggle.querySelector(".theme-toggle-text");
            if (icon) icon.textContent = isDark ? "☀️" : "🌙";
            if (text) text.textContent = isDark ? "Light" : "Dark";
        }

        storageSet(
            ACCESSIBILITY_KEY,
            JSON.stringify(accessibility)
        );
    }

    themeToggle?.addEventListener("click", () => {
        const currentlyDark =
            document.documentElement.dataset.theme === "dark";
        accessibility.theme = currentlyDark ? "light" : "dark";
        applyAccessibility();
    });

    function followSystemTheme() {
        if (accessibility.theme === "auto") {
            applyAccessibility();
        }
    }

    if (systemTheme?.addEventListener) {
        systemTheme.addEventListener("change", followSystemTheme);
    } else {
        systemTheme?.addListener?.(followSystemTheme);
    }

    window.BridgeA11y = {
        soundEnabled: () => accessibility.sound,
        getSettings: () => ({ ...accessibility })
    };

    const hero = document.getElementById("home");
    const dashboard = document.getElementById("dashboard");
    const learningPath = document.getElementById("learning-path");
    if (hero && dashboard) {
        hero.insertAdjacentElement("afterend", dashboard);
        if (learningPath) {
            dashboard.insertAdjacentElement("afterend", learningPath);
        }
    }

    applyAccessibility();
    renderProgress();
})();
