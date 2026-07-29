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
            animatedLessons: 0
        },
        achievements: [],
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
            id: "perfect-quiz",
            icon: "🏆",
            title: "Perfect Quiz",
            description: "Score 100% on a quiz.",
            test: data => data.stats.quizBest === 100
        },
        {
            id: "auctioneer",
            icon: "🗣️",
            title: "Auctioneer",
            description: "Complete three auctions.",
            test: data => data.stats.auctions >= 3
        },
        {
            id: "follow-suit",
            icon: "🃏",
            title: "Follow-Suit Pro",
            description: "Solve five following-suit exercises.",
            test: data => data.stats.exercises >= 5
        },
        {
            id: "bid-student",
            icon: "💡",
            title: "Bid Student",
            description: "Answer five opening hands correctly.",
            test: data => data.stats.handsCorrect >= 5
        },
        {
            id: "full-deal",
            icon: "♠",
            title: "Full Deal",
            description: "Finish a complete 13-trick deal.",
            test: data => data.stats.deals >= 1
        },
        {
            id: "path-complete",
            icon: "🎓",
            title: "Bridge Graduate",
            description: "Complete all five guided lessons.",
            test: data => lessonIds.every(id => data.lessons[id])
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

    function loadProgress() {
        const saved = safeParse(
            storageGet(PROGRESS_KEY),
            {}
        );
        const defaults = defaultProgress();

        return {
            ...defaults,
            ...saved,
            lessons: { ...defaults.lessons, ...(saved.lessons || {}) },
            stats: { ...defaults.stats, ...(saved.stats || {}) },
            streak: { ...defaults.streak, ...(saved.streak || {}) },
            achievements: Array.isArray(saved.achievements)
                ? saved.achievements
                : []
        };
    }

    let progress = loadProgress();

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
            data.stats.animatedLessons
        );
    }

    function updateAchievements() {
        achievementDefinitions.forEach(achievement => {
            if (
                achievement.test(progress) &&
                !progress.achievements.includes(achievement.id)
            ) {
                progress.achievements.push(achievement.id);
            }
        });
    }

    function saveProgress() {
        updateAchievements();
        storageSet(
            PROGRESS_KEY,
            JSON.stringify(progress)
        );
        renderProgress();
        listeners.forEach(listener => listener(getData()));
    }

    function recordActivity(type, detail = {}) {
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
            default:
                return;
        }

        saveProgress();
    }

    function completeLesson(id, complete = true) {
        if (!lessonIds.includes(id)) {
            return;
        }

        progress.lessons[id] = complete;
        updateStreak();
        saveProgress();
    }

    function getData() {
        return JSON.parse(JSON.stringify(progress));
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
            button.textContent = complete ? "Completed" : "Mark complete";
            button.setAttribute("aria-pressed", String(complete));
        });

        const grid = document.getElementById("achievementGrid");

        if (grid) {
            const unlockedAchievements = achievementDefinitions.filter(
                achievement => progress.achievements.includes(achievement.id)
            );

            grid.innerHTML = unlockedAchievements.length
                ? unlockedAchievements.map(achievement => (
                    `<article class="achievement-badge unlocked">` +
                        `<span>${achievement.icon}</span>` +
                        `<div><strong>${achievement.title}</strong>` +
                        `<p>${achievement.description}</p></div>` +
                    `</article>`
                )).join("")
                : `<p class="achievement-empty">Keep learning—your first ` +
                    `milestone will appear here when you unlock it.</p>`;
        }

        setText(
            "achievementCount",
            `${progress.achievements.length} / ` +
            `${achievementDefinitions.length} unlocked`
        );
    }

    window.BridgeProgress = {
        recordActivity,
        completeLesson,
        getData,
        subscribe,
        render: renderProgress
    };

    document.querySelectorAll("[data-complete-lesson]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.completeLesson;
            completeLesson(id, !progress.lessons[id]);
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
    if (!["light", "dark"].includes(accessibility.theme)) {
        accessibility.theme =
            window.matchMedia?.("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
    }

    const themeToggle = document.getElementById("themeToggle");

    function applyAccessibility() {
        const root = document.documentElement;

        const isDark = accessibility.theme === "dark";
        root.dataset.theme = isDark ? "dark" : "light";
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
        accessibility.theme =
            accessibility.theme === "dark" ? "light" : "dark";
        applyAccessibility();
    });

    window.BridgeA11y = {
        soundEnabled: () => accessibility.sound,
        getSettings: () => ({ ...accessibility })
    };

    const hero = document.getElementById("home");
    const dashboard = document.getElementById("dashboard");
    if (hero && dashboard) {
        hero.insertAdjacentElement("afterend", dashboard);
    }

    applyAccessibility();
    renderProgress();
})();
