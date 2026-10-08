/* ============================================================
   PAGINA-NAVIGATIE
   Dit gedeelte zorgt ervoor dat de knoppen in het menu
   de juiste pagina zichtbaar maken.
   ============================================================ */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");


/* Deze functie laat één pagina zien en verbergt de andere pagina's. */
function showPage(pageId) {

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    /* De actieve knop in het menu krijgt een andere kleur. */
    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.dataset.page === pageId) {
            link.classList.add("active");
        }

    });


    /* Op mobiel gaat de gebruiker terug naar de bovenkant. */
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* Aan iedere navigatielink wordt een klik-event gekoppeld. */
navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        showPage(link.dataset.page);

    });

});


/* ============================================================
   INSTELLINGEN
   ============================================================ */

const settingsModal = document.getElementById("settingsModal");

const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");


/* Open de instellingen */
openSettings.addEventListener("click", () => {
    settingsModal.classList.add("open");
});


/* Sluit de instellingen */
closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove("open");
});


/* Klik buiten het venster om het venster te sluiten. */
settingsModal.addEventListener("click", event => {

    if (event.target === settingsModal) {
        settingsModal.classList.remove("open");
    }

});


/* ============================================================
   THEMA
   ============================================================ */

const themeSelect = document.getElementById("themeSelect");


function applyTheme(theme) {

    document.body.classList.remove("dark");

    if (theme === "dark") {

        document.body.classList.add("dark");

    } else if (theme === "auto") {

        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark");
        }

    }

}


/* Wanneer de gebruiker een thema kiest, wordt dit direct toegepast. */
themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
});


/* ============================================================
   ACHTERGROND
   ============================================================ */

const backgroundSelect = document.getElementById("backgroundSelect");


function applyBackground(background) {

    document.body.classList.remove(
        "background-pattern",
        "background-animated"
    );

    if (background === "pattern") {
        document.body.classList.add("background-pattern");
    }

    if (background === "animated") {
        document.body.classList.add("background-animated");
    }

}


backgroundSelect.addEventListener("change", () => {
    applyBackground(backgroundSelect.value);
});


/* ============================================================
   ACCENTKLEUR
   ============================================================ */

const accentButtons = document.querySelectorAll(".accent");


accentButtons.forEach(button => {

    button.addEventListener("click", () => {

        const accent = button.dataset.accent;

        document.documentElement.style.setProperty(
            "--accent",
            accent
        );

    });

});


/* ============================================================
   INSTELLINGEN OPSLAAN
   ============================================================ */

saveSettings.addEventListener("click", () => {

    const name =
        document.getElementById("nameInput").value.trim();

    const city =
        document.getElementById("settingsCityInput").value.trim();


    if (name !== "") {

        document.getElementById("displayName").textContent = name;

        localStorage.setItem("websiteName", name);

    }


    if (city !== "") {

        document.getElementById("cityInput").value = city;

        localStorage.setItem("weatherCity", city);

        loadWeather(city);

    }


    localStorage.setItem(
        "websiteTheme",
        themeSelect.value
    );


    localStorage.setItem(
        "websiteBackground",
        backgroundSelect.value
    );


    settingsModal.classList.remove("open");

});


/* ============================================================
   INSTELLINGEN LADEN
   ============================================================ */

function loadSettings() {

    const savedName =
        localStorage.getItem("websiteName");

    const savedCity =
        localStorage.getItem("weatherCity");

    const savedTheme =
        localStorage.getItem("websiteTheme");

    const savedBackground =
        localStorage.getItem("websiteBackground");


    if (savedName) {

        document.getElementById("displayName").textContent =
            savedName;

        document.getElementById("nameInput").value =
            savedName;

    }


    if (savedCity) {

        document.getElementById("cityInput").value =
            savedCity;

        document.getElementById("settingsCityInput").value =
            savedCity;

    }


    if (savedTheme) {

        themeSelect.value = savedTheme;

        applyTheme(savedTheme);

    }


    if (savedBackground) {

        backgroundSelect.value = savedBackground;

        applyBackground(savedBackground);

    }

}


loadSettings();


/* ============================================================
   WEER
   Open-Meteo wordt gebruikt voor de weergegevens.
   Eerst zoeken we de coördinaten van de plaats.
   Daarna halen we de actuele en dagelijkse gegevens op.
   ============================================================ */

const weatherButton =
    document.getElementById("weatherButton");

const cityInput =
    document.getElementById("cityInput");

const weatherStatus =
    document.getElementById("weatherStatus");

let weatherChart = null;


/* Plaats zoeken en daarna het weer ophalen. */
async function loadWeather(city) {

    if (!city) {

        weatherStatus.textContent =
            "Vul eerst een plaats in.";

        return;

    }


    weatherStatus.textContent =
        "Weergegevens worden geladen...";


    try {

        /* INVOER:
           De gebruiker geeft een plaatsnaam op.

           VERWERKING:
           De geocoding API zoekt de geografische coördinaten. */

        const geoResponse =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=nl&format=json`
            );


        const geoData =
            await geoResponse.json();


        if (!geoData.results || geoData.results.length === 0) {

            weatherStatus.textContent =
                "Ik kon deze plaats niet vinden.";

            return;

        }


        const location =
            geoData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        /* Met de gevonden coördinaten halen we het weer op. */

        const weatherResponse =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,rain_sum&timezone=auto&forecast_days=7`
            );


        const weather =
            await weatherResponse.json();


        /* UITVOER:
           De gegevens worden in de HTML-kaarten geplaatst. */

        document.getElementById("currentTemp").textContent =
            `${weather.current.temperature_2m} °C`;

        document.getElementById("currentRain").textContent =
            `${weather.current.rain} mm`;

        document.getElementById("currentWind").textContent =
            `${weather.current.wind_speed_10m} km/u`;

        document.getElementById("currentCity").textContent =
            location.name;


        document.getElementById("tomorrowMax").textContent =
            `${weather.daily.temperature_2m_max[1]} °C`;

        document.getElementById("tomorrowMin").textContent =
            `${weather.daily.temperature_2m_min[1]} °C`;

        document.getElementById("tomorrowRain").textContent =
            `${weather.daily.rain_sum[1]} mm`;


        weatherStatus.textContent =
            `Weer geladen voor ${location.name}.`;


        drawWeatherChart(weather);

    } catch (error) {

        console.error(error);

        weatherStatus.textContent =
            "Er ging iets mis bij het ophalen van het weer.";

    }

}


weatherButton.addEventListener("click", () => {

    loadWeather(cityInput.value.trim());

});


cityInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        loadWeather(cityInput.value.trim());
    }

});


/* ============================================================
   WEERGRAFIEK
   ============================================================ */

function drawWeatherChart(weather) {

    const canvas =
        document.getElementById("weatherChart");

    const context =
        canvas.getContext("2d");


    if (weatherChart) {
        weatherChart.destroy();
    }


    const labels =
        weather.daily.time.map(date => {

            const parts = date.split("-");

            return `${parts[2]}-${parts[1]}`;

        });


    const averageTemperatures =
        weather.daily.time.map((_, index) => {

            const max =
                weather.daily.temperature_2m_max[index];

            const min =
                weather.daily.temperature_2m_min[index];

            return Math.round(
                ((max + min) / 2) * 10
            ) / 10;

        });


    weatherChart =
        new Chart(context, {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "Gemiddelde temperatuur °C",

                    data: averageTemperatures,

                    tension: 0.35,

                    borderWidth: 3,

                    pointRadius: 5

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {
                        beginAtZero: false
                    }

                }

            }

        });

}


/* Als er eerder een plaats is opgeslagen, laden we die automatisch. */
const storedCity =
    localStorage.getItem("weatherCity");


if (storedCity) {

    cityInput.value = storedCity;

    loadWeather(storedCity);

}


/* ============================================================
   KLEURMODEL
   Dit gedeelte rekent RGB om naar hexadecimaal.
   ============================================================ */

const colorButton =
    document.getElementById("colorButton");


const redInput =
    document.getElementById("redInput");

const greenInput =
    document.getElementById("greenInput");

const blueInput =
    document.getElementById("blueInput");


function decimalToHex(value) {

    return Number(value)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();

}


function updateColor() {

    /* INVOER:
       Drie decimale RGB-waarden tussen 0 en 255. */

    const red =
        Math.min(255, Math.max(0, Number(redInput.value)));

    const green =
        Math.min(255, Math.max(0, Number(greenInput.value)));

    const blue =
        Math.min(255, Math.max(0, Number(blueInput.value)));


    /* VERWERKING:
       De drie waarden worden omgezet naar hexadecimale waarden. */

    const hex =
        `#${decimalToHex(red)}${decimalToHex(green)}${decimalToHex(blue)}`;


    /* UITVOER:
       De kleur, RGB-code en hex-code worden getoond. */

    document.getElementById("rgbPreview").style.background =
        `rgb(${red}, ${green}, ${blue})`;

    document.getElementById("rgbValue").textContent =
        `(${red}, ${green}, ${blue})`;

    document.getElementById("hexValue").textContent =
        hex;

    document.getElementById("colorOutput").textContent =
        `RGB(${red}, ${green}, ${blue}) → ${hex}`;

}


colorButton.addEventListener("click", updateColor);


/* ============================================================
   PENALTY GAME
   ============================================================ */

const goalZones =
    document.querySelectorAll(".goal-zone");

const keeper =
    document.getElementById("keeper");

const scoreElement =
    document.getElementById("score");

const streakElement =
    document.getElementById("streak");

const gameMessage =
    document.getElementById("gameMessage");

const keeperStatus =
    document.getElementById("keeperStatus");

const resetGameButton =
    document.getElementById("resetGame");


let score = 0;
let streak = 0;


/* De keeper kiest willekeurig een zone. */
function randomKeeperZone() {

    const zones = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-center",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right"
    ];

    return zones[
        Math.floor(Math.random() * zones.length)
    ];

}


/* Visuele positie van de keeper */
function moveKeeper(zone) {

    const positions = {

        "top-left": ["20%", "20%"],
        "top-center": ["50%", "20%"],
        "top-right": ["80%", "20%"],

        "middle-left": ["20%", "50%"],
        "middle-center": ["50%", "50%"],
        "middle-right": ["80%", "50%"],

        "bottom-left": ["20%", "80%"],
        "bottom-center": ["50%", "80%"],
        "bottom-right": ["80%", "80%"]

    };


    const position =
        positions[zone];


    keeper.style.left =
        position[0];

    keeper.style.top =
        position[1];

}


/* Een penalty wordt geschoten wanneer een zone wordt aangeklikt. */
goalZones.forEach(zone => {

    zone.addEventListener("click", () => {

        const playerChoice =
            zone.dataset.zone;

        const keeperChoice =
            randomKeeperZone();


        moveKeeper(keeperChoice);


        if (playerChoice === keeperChoice) {

            /* Keeper stopt de bal. */

            streak = 0;

            keeperStatus.textContent =
                "Geraden!";

            gameMessage.textContent =
                "🧤 De keeper heeft hem!";

        } else {

            /* Goal! */

            score++;

            streak++;

            keeperStatus.textContent =
                "Goal!";

            gameMessage.textContent =
                "⚽ GOOOAL!";

        }


        scoreElement.textContent =
            score;

        streakElement.textContent =
            streak;

    });

});


/* Resetknop van het spel */
resetGameButton.addEventListener("click", () => {

    score = 0;

    streak = 0;

    scoreElement.textContent = "0";

    streakElement.textContent = "0";

    keeperStatus.textContent = "Klaar";

    gameMessage.textContent =
        "Kies een plek om te schieten!";

    keeper.style.left = "50%";

    keeper.style.top = "50%";

});


/* ============================================================
   GELUID
   Een eenvoudige instelling wordt opgeslagen.
   ============================================================ */

const soundToggle =
    document.getElementById("soundToggle");


soundToggle.addEventListener("change", () => {

    localStorage.setItem(
        "websiteSound",
        soundToggle.checked
    );

});


const savedSound =
    localStorage.getItem("websiteSound");


if (savedSound !== null) {

    soundToggle.checked =
        savedSound === "true";

}