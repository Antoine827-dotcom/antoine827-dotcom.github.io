// ========================================
// NAVIGATIE TUSSEN DE PAGINA'S
// ========================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active-page");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) {
        return;
    }

    selectedPage.classList.add("active-page");

    const selectedLink = document.querySelector(
        `.nav-link[data-page="${pageId}"]`
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(link.dataset.page);
    });
});


// ========================================
// SCROLLANIMATIE EN VOORTGANG
// ========================================

let scrollScheduled = false;

function updateScrollBackground() {
    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = maxScroll > 0
        ? window.scrollY / maxScroll
        : 0;

    const clampedProgress = Math.max(0, Math.min(1, progress));

    document.documentElement.style.setProperty(
        "--scroll-progress",
        clampedProgress
    );

    // De achtergrond beweegt mee met de scrollpositie.
    // De waarden worden als pixels berekend voor brede browserondersteuning.
    const x = Math.sin(clampedProgress * Math.PI * 2) * 70;
    const y = clampedProgress * 150;
    const rotation = clampedProgress * 12;

    document.body.style.setProperty("--scroll-x", `${x}px`);
    document.body.style.setProperty("--scroll-y", `${y}px`);
    document.body.style.setProperty("--scroll-rotation", `${rotation}deg`);

    document.body.style.setProperty(
        "--background-transform",
        `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`
    );

    scrollScheduled = false;
}

window.addEventListener("scroll", () => {
    if (!scrollScheduled) {
        window.requestAnimationFrame(updateScrollBackground);
        scrollScheduled = true;
    }
}, { passive: true });

window.addEventListener("resize", updateScrollBackground);

updateScrollBackground();


// ========================================
// ANIMATIE VOOR DE ONDERWERPKAARTEN
// ========================================

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            } else {
                // Wanneer je weer omhoog scrolt, kan de animatie opnieuw spelen.
                entry.target.classList.remove("visible");
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}


// ========================================
// RGB-KLEURCALCULATOR
// ========================================

const redInput = document.getElementById("redInput");
const greenInput = document.getElementById("greenInput");
const blueInput = document.getElementById("blueInput");

const rgbPreview = document.getElementById("rgbPreview");
const rgbValue = document.getElementById("rgbValue");
const hexValue = document.getElementById("hexValue");

const customColorPreview = document.getElementById("customColorPreview");
const customRgbValue = document.getElementById("customRgbValue");
const customHexValue = document.getElementById("customHexValue");

function clampColor(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(0, Math.min(255, Math.round(number)));
}

function rgbToHex(red, green, blue) {
    return "#" + [red, green, blue]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}

function updateColor() {
    if (!redInput || !greenInput || !blueInput) {
        return;
    }

    const red = clampColor(redInput.value);
    const green = clampColor(greenInput.value);
    const blue = clampColor(blueInput.value);

    const rgb = `rgb(${red}, ${green}, ${blue})`;
    const hex = rgbToHex(red, green, blue);

    if (rgbPreview) {
        rgbPreview.style.backgroundColor = rgb;
    }

    if (rgbValue) {
        rgbValue.textContent = `(${red}, ${green}, ${blue})`;
    }

    if (hexValue) {
        hexValue.textContent = hex;
    }

    if (customColorPreview) {
        customColorPreview.style.backgroundColor = rgb;
    }

    if (customRgbValue) {
        customRgbValue.textContent = `(${red}, ${green}, ${blue})`;
    }

    if (customHexValue) {
        customHexValue.textContent = hex;
    }
}

[redInput, greenInput, blueInput].forEach((input) => {
    if (input) {
        input.addEventListener("input", updateColor);

        input.addEventListener("change", () => {
            input.value = clampColor(input.value);
            updateColor();
        });
    }
});

updateColor();


// ========================================
// WEERBERICHT
// Gebruikt de gratis Open-Meteo API.
// ========================================

const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherStatus = document.getElementById("weatherStatus");

let weatherChart = null;

function setWeatherStatus(message, type = "") {
    if (!weatherStatus) {
        return;
    }

    weatherStatus.textContent = message;
    weatherStatus.classList.remove("error", "success");

    if (type) {
        weatherStatus.classList.add(type);
    }
}

async function getCoordinates(city) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

    url.search = new URLSearchParams({
        name: city,
        count: "1",
        language: "nl",
        format: "json"
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("De plaats kon niet worden opgezocht.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Geen plaats gevonden. Controleer de spelling.");
    }

    return data.results[0];
}

async function getForecast(latitude, longitude) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.search = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m,precipitation,wind_speed_10m",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
        forecast_days: "7",
        timezone: "auto"
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("De weersgegevens konden niet worden opgehaald.");
    }

    return response.json();
}

function updateWeatherChart(data) {
    const canvas = document.getElementById("weatherChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels = data.daily.time.slice(0, 7).map((date) => {
        return new Date(`${date}T12:00:00`).toLocaleDateString("nl-NL", {
            weekday: "short",
            day: "numeric"
        });
    });

    const averages = data.daily.temperature_2m_max
        .slice(0, 7)
        .map((maxTemp, index) => {
            const minTemp = data.daily.temperature_2m_min[index];
            return Number(((maxTemp + minTemp) / 2).toFixed(1));
        });

    if (weatherChart) {
        weatherChart.destroy();
    }

    const isLightTheme = document.body.classList.contains("light-theme");
    const textColor = isLightTheme ? "#475569" : "#cbd5e1";
    const gridColor = isLightTheme
        ? "rgba(71, 85, 105, 0.15)"
        : "rgba(203, 213, 225, 0.13)";

    weatherChart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Gemiddelde temperatuur (°C)",
                data: averages,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    },
                    title: {
                        display: true,
                        text: "Temperatuur in °C",
                        color: textColor
                    }
                }
            }
        }
    });
}

async function loadWeather(city) {
    const cleanCity = city.trim();

    if (!cleanCity) {
        setWeatherStatus("Vul eerst een plaatsnaam in.", "error");
        return;
    }

    if (weatherButton) {
        weatherButton.disabled = true;
        weatherButton.textContent = "Bezig...";
    }

    setWeatherStatus("Weersgegevens ophalen...");

    try {
        const location = await getCoordinates(cleanCity);
        const data = await getForecast(location.latitude, location.longitude);

        document.getElementById("currentTemp").textContent =
            `${data.current.temperature_2m} °C`;

        document.getElementById("currentRain").textContent =
            `${data.current.precipitation} mm`;

        document.getElementById("currentWind").textContent =
            `${data.current.wind_speed_10m} km/u`;

        document.getElementById("currentCity").textContent =
            location.name;

        // De eerste dag in de dagelijkse voorspelling kan vandaag zijn.
        // Daarom wordt de voorspelling van morgen op index 1 gezet.
        const tomorrowIndex = 1;

        document.getElementById("tomorrowMax").textContent =
            `${data.daily.temperature_2m_max[tomorrowIndex]} °C`;

        document.getElementById("tomorrowMin").textContent =
            `${data.daily.temperature_2m_min[tomorrowIndex]} °C`;

        document.getElementById("tomorrowRain").textContent =
            `${data.daily.precipitation_sum[tomorrowIndex]} mm`;

        updateWeatherChart(data);

        setWeatherStatus(
            `Weer voor ${location.name} is bijgewerkt.`,
            "success"
        );
    } catch (error) {
        setWeatherStatus(
            error.message || "Er is iets misgegaan bij het ophalen van het weer.",
            "error"
        );
    } finally {
        if (weatherButton) {
            weatherButton.disabled = false;
            weatherButton.textContent = "Zoek weer";
        }
    }
}

if (weatherButton) {
    weatherButton.addEventListener("click", () => {
        loadWeather(cityInput.value);
    });
}

if (cityInput) {
    cityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            loadWeather(cityInput.value);
        }
    });
}


// ========================================
// INSTELLINGEN
// ========================================

const settingsModal = document.getElementById("settingsModal");
const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");

const themeSelect = document.getElementById("themeSelect");
const backgroundSelect = document.getElementById("backgroundSelect");
const nameInput = document.getElementById("nameInput");
const settingsCityInput = document.getElementById("settingsCityInput");
const soundToggle = document.getElementById("soundToggle");

function openSettingsModal() {
    settingsModal?.classList.add("open");
}

function closeSettingsModal() {
    settingsModal?.classList.remove("open");
}

openSettings?.addEventListener("click", openSettingsModal);
closeSettings?.addEventListener("click", closeSettingsModal);

settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSettingsModal();
    }
});

function applyTheme(theme) {
    const prefersLight = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;

    const useLightTheme = theme === "light" ||
        (theme === "auto" && prefersLight);

    document.body.classList.toggle("light-theme", useLightTheme);

    if (weatherChart) {
        // De grafiek opnieuw tekenen als er al weergegevens zijn.
        // De volgende weeropvraag gebruikt de nieuwe themakleuren.
        weatherChart.options.plugins.legend.labels.color =
            useLightTheme ? "#475569" : "#cbd5e1";

        weatherChart.update();
    }
}

function applyBackground(background) {
    document.body.dataset.background = background;

    const animated = background === "animated";

    if (!animated) {
        document.body.style.setProperty("--background-transform", "none");
    }
}

function applyAccent(color) {
    document.documentElement.style.setProperty("--accent", color);

    const darkerColors = {
        "#3b82f6": "#2563eb",
        "#8b5cf6": "#7c3aed",
        "#10b981": "#059669",
        "#f97316": "#ea580c"
    };

    document.documentElement.style.setProperty(
        "--accent-dark",
        darkerColors[color] || color
    );

    document.querySelectorAll(".accent").forEach((button) => {
        button.classList.toggle(
            "selected",
            button.dataset.accent === color
        );
    });
}

function loadSettings() {
    let settings = {};

    try {
        settings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
    } catch {
        settings = {};
    }

    const theme = settings.theme || "auto";
    const background = settings.background || "animated";
    const accent = settings.accent || "#3b82f6";

    if (themeSelect) {
        themeSelect.value = theme;
    }

    if (backgroundSelect) {
        backgroundSelect.value = background;
    }

    if (nameInput) {
        nameInput.value = settings.name || "";
    }

    if (settingsCityInput) {
        settingsCityInput.value = settings.city || "";
    }

    if (soundToggle) {
        soundToggle.checked = settings.sound !== false;
    }

    applyTheme(theme);
    applyBackground(background);
    applyAccent(accent);

    if (settings.city && cityInput) {
        cityInput.value = settings.city;
    }

    if (settings.city) {
        loadWeather(settings.city);
    }
}

document.querySelectorAll(".accent").forEach((button) => {
    button.addEventListener("click", () => {
        applyAccent(button.dataset.accent);
    });
});

themeSelect?.addEventListener("change", () => {
    applyTheme(themeSelect.value);
});

backgroundSelect?.addEventListener("change", () => {
    applyBackground(backgroundSelect.value);
});

saveSettings?.addEventListener("click", () => {
    const settings = {
        theme: themeSelect?.value || "auto",
        background: backgroundSelect?.value || "animated",
        name: nameInput?.value.trim() || "",
        city: settingsCityInput?.value.trim() || "",
        sound: soundToggle?.checked ?? true,
        accent: getComputedStyle(document.documentElement)
            .getPropertyValue("--accent").trim() || "#3b82f6"
    };

    try {
        localStorage.setItem("websiteSettings", JSON.stringify(settings));
    } catch {
        // De website blijft werken als opslag niet beschikbaar is.
    }

    applyTheme(settings.theme);
    applyBackground(settings.background);
    applyAccent(settings.accent);

    if (settings.city && cityInput) {
        cityInput.value = settings.city;
        loadWeather(settings.city);
    }

    closeSettingsModal();
});

loadSettings();


// ========================================
// PENALTY GAME
// ========================================

const goalZones = document.querySelectorAll(".goal-zone");
const keeper = document.getElementById("keeper");
const scoreElement = document.getElementById("score");
const streakElement = document.getElementById("streak");
const keeperStatus = document.getElementById("keeperStatus");
const gameMessage = document.getElementById("gameMessage");
const resetGameButton = document.getElementById("resetGame");

let score = 0;
let streak = 0;
let gameLocked = false;

const keeperPositions = {
    "top-left": { left: "17%", top: "18%" },
    "top-center": { left: "50%", top: "18%" },
    "top-right": { left: "83%", top: "18%" },
    "middle-left": { left: "17%", top: "50%" },
    "middle-center": { left: "50%", top: "50%" },
    "middle-right": { left: "83%", top: "50%" },
    "bottom-left": { left: "17%", top: "82%" },
    "bottom-center": { left: "50%", top: "82%" },
    "bottom-right": { left: "83%", top: "82%" }
};

function updateGameStats() {
    if (scoreElement) {
        scoreElement.textContent = score;
    }

    if (streakElement) {
        streakElement.textContent = streak;
    }
}

function shootPenalty(zoneElement) {
    if (gameLocked) {
        return;
    }

    gameLocked = true;

    const chosenZone = zoneElement.dataset.zone;
    const zoneNames = Object.keys(keeperPositions);
    const keeperChoice = zoneNames[
        Math.floor(Math.random() * zoneNames.length)
    ];

    const position = keeperPositions[keeperChoice];

    if (keeper) {
        keeper.style.left = position.left;
        keeper.style.top = position.top;
    }

    if (keeperStatus) {
        keeperStatus.textContent = "Duikt";
    }

    if (chosenZone === keeperChoice) {
        streak = 0;

        if (gameMessage) {
            gameMessage.textContent = "De keeper houdt de bal tegen.";
        }

        zoneElement.classList.add("saved");
    } else {
        score += 1;
        streak += 1;

        if (gameMessage) {
            gameMessage.textContent = "Doelpunt. Je hebt gescoord.";
        }

        zoneElement.classList.add("scored");
    }

    updateGameStats();

    window.setTimeout(() => {
        if (keeper) {
            keeper.style.left = "50%";
            keeper.style.top = "50%";
        }

        if (keeperStatus) {
            keeperStatus.textContent = "Klaar";
        }

        zoneElement.classList.remove("saved", "scored");
        gameLocked = false;
    }, 900);
}

goalZones.forEach((zone) => {
    zone.setAttribute("role", "button");
    zone.setAttribute("tabindex", "0");

    zone.addEventListener("click", () => {
        shootPenalty(zone);
    });

    zone.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            shootPenalty(zone);
        }
    });
});

resetGameButton?.addEventListener("click", () => {
    score = 0;
    streak = 0;
    gameLocked = false;

    if (keeper) {
        keeper.style.left = "50%";
        keeper.style.top = "50%";
    }

    if (keeperStatus) {
        keeperStatus.textContent = "Klaar";
    }

    if (gameMessage) {
        gameMessage.textContent = "Kies een plek om te schieten.";
    }

    updateGameStats();
});

updateGameStats();