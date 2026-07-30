"use strict";

const CACHE_NAME = "learn-bridge-v4";
const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./questions.js",
    "./phase3-core.js",
    "./phase4.js",
    "./app-shell.js",
    "./firebase-sync.js",
    "./auction.js",
    "./playground.js",
    "./practice-hands.js",
    "./scoring-calculator.js",
    "./trick-trainer.js",
    "./script.js",
    "./manifest.webmanifest",
    "./assets/favicon.svg",
    "./assets/apple-touch-icon.png",
    "./assets/app-icon-192.png",
    "./assets/app-icon-512.png",
    "./assets/app-icon-maskable-512.png",
    "./assets/audio/card-shuffle.mp3",
    "./assets/audio/card-flip.mp3"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== "GET" ||
        url.origin !== self.location.origin
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(
                        cache => cache.put("./index.html", copy)
                    );
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(
                            cache => cache.put(request, copy)
                        );
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || network;
        })
    );
});
