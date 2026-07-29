"use strict";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    doc,
    getDoc,
    getFirestore,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4AG0caxjQ4uAIAzdjNz5PQMLv3lxjz48",
    authDomain: "bridge-website-d250b.firebaseapp.com",
    projectId: "bridge-website-d250b",
    storageBucket: "bridge-website-d250b.firebasestorage.app",
    messagingSenderId: "641539434629",
    appId: "1:641539434629:web:e5925b771b8d5e4454a1ec",
    measurementId: "G-MZ59KJSNBV"
};

const signInButton = document.getElementById("googleSignIn");
const signOutButton = document.getElementById("googleSignOut");
const userAccount = document.getElementById("userAccount");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const syncStatus = document.getElementById("syncStatus");

if (
    signInButton &&
    signOutButton &&
    userAccount &&
    window.BridgeProgress
) {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getFirestore(app);
    const provider = new GoogleAuthProvider();
    let currentUser = null;
    let applyingCloudData = false;
    let saveTimer = null;

    provider.setCustomParameters({ prompt: "select_account" });

    function setStatus(message, state = "") {
        syncStatus.textContent = message;
        syncStatus.dataset.state = state;
    }

    function mergeProgress(local, cloud) {
        const localStats = local.stats || {};
        const cloudStats = cloud.stats || {};
        const statKeys = new Set([
            ...Object.keys(localStats),
            ...Object.keys(cloudStats)
        ]);
        const stats = {};

        statKeys.forEach(key => {
            stats[key] = Math.max(
                Number(localStats[key]) || 0,
                Number(cloudStats[key]) || 0
            );
        });

        const localStreak = local.streak || {};
        const cloudStreak = cloud.streak || {};
        const cloudIsNewer =
            (cloudStreak.lastDate || "") > (localStreak.lastDate || "");

        return {
            ...local,
            ...cloud,
            lessons: {
                ...(local.lessons || {}),
                ...Object.fromEntries(
                    Object.entries(cloud.lessons || {}).map(
                        ([key, value]) => [
                            key,
                            Boolean(value || local.lessons?.[key])
                        ]
                    )
                )
            },
            stats,
            achievements: [
                ...new Set([
                    ...(local.achievements || []),
                    ...(cloud.achievements || [])
                ])
            ],
            streak: cloudIsNewer
                ? { ...localStreak, ...cloudStreak }
                : { ...cloudStreak, ...localStreak }
        };
    }

    async function saveToCloud(progress) {
        if (!currentUser) {
            return;
        }

        setStatus("Saving…", "saving");
        try {
            await setDoc(
                doc(database, "users", currentUser.uid),
                {
                    progress,
                    updatedAt: serverTimestamp(),
                    schemaVersion: 1
                },
                { merge: true }
            );
            setStatus("Progress saved", "saved");
        } catch (error) {
            console.error("Could not save Bridge progress:", error);
            setStatus("Sync needs attention", "error");
        }
    }

    function queueCloudSave(progress) {
        if (!currentUser || applyingCloudData) {
            return;
        }
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(
            () => saveToCloud(progress),
            700
        );
    }

    function showSignedOut() {
        signInButton.innerHTML =
            `<span aria-hidden="true">G</span> Sign in`;
        signInButton.classList.remove("hidden");
        userAccount.classList.add("hidden");
        userAvatar.removeAttribute("src");
        currentUser = null;
    }

    function showSignedIn(user) {
        signInButton.classList.add("hidden");
        userAccount.classList.remove("hidden");
        userName.textContent =
            user.displayName || user.email || "Bridge learner";
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        } else {
            userAvatar.removeAttribute("src");
        }
        setStatus("Loading progress…", "saving");
    }

    async function loadCloudProgress(user) {
        const reference = doc(database, "users", user.uid);
        try {
            const snapshot = await getDoc(reference);
            const local = window.BridgeProgress.getData();
            const cloud = snapshot.exists()
                ? snapshot.data().progress || {}
                : {};
            const merged = mergeProgress(local, cloud);

            applyingCloudData = true;
            window.BridgeProgress.replaceData(merged);
            applyingCloudData = false;
            await saveToCloud(merged);
        } catch (error) {
            applyingCloudData = false;
            console.error("Could not load Bridge progress:", error);
            setStatus("Sync needs attention", "error");
        }
    }

    signInButton.addEventListener("click", async () => {
        signInButton.disabled = true;
        signInButton.textContent = "Opening Google…";
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google sign-in failed:", error);
            signInButton.textContent =
                error.code === "auth/unauthorized-domain"
                    ? "Domain not authorized"
                    : "Try sign-in again";
        } finally {
            signInButton.disabled = false;
        }
    });

    signOutButton.addEventListener("click", async () => {
        signOutButton.disabled = true;
        setStatus("Signing out…", "saving");
        applyingCloudData = true;
        currentUser = null;
        window.clearTimeout(saveTimer);

        try {
            await signOut(auth);
            window.BridgeProgress.resetData();
        } catch (error) {
            currentUser = auth.currentUser;
            console.error("Google sign-out failed:", error);
            setStatus("Could not sign out", "error");
        } finally {
            applyingCloudData = false;
            signOutButton.disabled = false;
        }
    });

    window.BridgeProgress.subscribe(queueCloudSave);

    onAuthStateChanged(auth, user => {
        if (!user) {
            showSignedOut();
            return;
        }
        currentUser = user;
        showSignedIn(user);
        loadCloudProgress(user);
    });

    window.BridgeFirebase = {
        mergeProgress
    };
}
