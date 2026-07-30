"use strict";

(() => {
    const viewport = document.querySelector(".app-viewport");
    const toolbar = document.getElementById("viewToolbar");
    const viewTitle = document.getElementById("viewTitle");
    const viewEyebrow = document.getElementById("viewEyebrow");
    const viewJump = document.getElementById("viewJump");
    const headerContext = document.getElementById("headerContext");

    if (!viewport || !toolbar) {
        return;
    }

    const pages = {
        home: {
            title: "Home",
            category: "home",
            sections: ["home", "four-stages"]
        },
        basics: {
            title: "The Basics",
            category: "learn",
            sections: ["basics"]
        },
        auction: {
            title: "The Auction",
            category: "learn",
            sections: ["auction"]
        },
        play: {
            title: "Playing the Hand",
            category: "learn",
            sections: ["play"]
        },
        scoring: {
            title: "Scoring",
            category: "learn",
            sections: ["scoring"]
        },
        quiz: {
            title: "Practice Quiz",
            category: "practice",
            sections: ["quiz"]
        },
        "trick-trainer": {
            title: "Full Deal Trainer",
            category: "practice",
            sections: ["trick-trainer"]
        },
        playground: {
            title: "Card Playground",
            category: "practice",
            sections: ["playground"]
        },
        "practice-hands": {
            title: "Bid Coach",
            category: "practice",
            sections: ["practice-hands"]
        },
        glossary: {
            title: "Glossary",
            category: "reference",
            sections: ["glossary"]
        },
        cheatsheet: {
            title: "Beginner Cheat Sheet",
            category: "reference",
            sections: ["cheatsheet"]
        },
        tips: {
            title: "First-Game Tips",
            category: "reference",
            sections: ["tips"]
        },
        "beginner-mistakes": {
            title: "Beginner Mistakes",
            category: "reference",
            sections: ["beginner-mistakes"]
        },
        etiquette: {
            title: "Bridge Etiquette",
            category: "reference",
            sections: ["etiquette"]
        },
        "keep-learning": {
            title: "Keep Learning",
            category: "reference",
            sections: ["keep-learning"]
        },
        faq: {
            title: "Frequently Asked Questions",
            category: "reference",
            sections: ["faq"]
        },
        dashboard: {
            title: "Your Progress",
            category: "progress",
            sections: ["dashboard"]
        },
        achievements: {
            title: "Achievements",
            category: "progress",
            sections: ["achievements"]
        },
        "learning-path": {
            title: "Guided Learning Path",
            category: "progress",
            sections: ["learning-path"]
        }
    };

    const categoryLabels = {
        home: "Learn Bridge",
        learn: "Learn",
        practice: "Practice",
        reference: "Reference",
        progress: "Progress"
    };
    const sections = [...viewport.querySelectorAll(":scope > section")];
    let currentPage = "home";

    function pageFromHash(hash = window.location.hash) {
        const requested = hash.replace(/^#/, "");
        return pages[requested] ? requested : "home";
    }

    function setActiveNavigation(category) {
        document.querySelectorAll("[data-app-nav]").forEach(link => {
            const active = link.dataset.appNav === category;
            link.classList.toggle("active", active);
            if (active) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function renderPage(pageKey, options = {}) {
        const page = pages[pageKey] || pages.home;
        const visible = new Set(page.sections);
        currentPage = pageKey;

        sections.forEach(section => {
            section.hidden = !visible.has(section.id);
        });

        const isHome = pageKey === "home";
        toolbar.hidden = isHome;
        viewTitle.textContent = page.title;
        viewEyebrow.textContent = categoryLabels[page.category];
        headerContext.textContent = page.title;
        setActiveNavigation(page.category);

        if (viewJump && [...viewJump.options].some(
            option => option.value === `#${pageKey}`
        )) {
            viewJump.value = `#${pageKey}`;
        }

        document.title = isHome
            ? "Learn Bridge — Beginner Bridge Lessons"
            : `${page.title} — Learn Bridge`;

        if (options.scroll !== false) {
            window.requestAnimationFrame(() => {
                window.scrollTo({
                    top: 0,
                    behavior: options.instant ? "auto" : "smooth"
                });
            });
        }

        window.dispatchEvent(new CustomEvent("bridge:view-changed", {
            detail: { page: pageKey, category: page.category }
        }));
    }

    function navigate(hash, options = {}) {
        const pageKey = pageFromHash(hash);
        const nextHash = `#${pageKey}`;

        if (options.replace) {
            window.history.replaceState({ page: pageKey }, "", nextHash);
        } else if (window.location.hash !== nextHash) {
            window.history.pushState({ page: pageKey }, "", nextHash);
        }

        renderPage(pageKey, options);
    }

    document.addEventListener("click", event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) {
            return;
        }

        const hash = link.getAttribute("href");
        if (!pages[hash.slice(1)]) {
            return;
        }

        event.preventDefault();
        navigate(hash);
    }, true);

    viewJump?.addEventListener("change", () => {
        navigate(viewJump.value);
    });

    window.addEventListener("popstate", () => {
        renderPage(pageFromHash(), { instant: true });
    });

    window.BridgeAppShell = {
        handlesHash: hash => Boolean(pages[hash.replace(/^#/, "")]),
        navigate,
        currentPage: () => currentPage
    };

    navigate(window.location.hash || "#home", {
        replace: !window.location.hash,
        instant: true
    });
})();
