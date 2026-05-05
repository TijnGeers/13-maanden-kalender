// 13-Maanden Kalender
// 13 maanden × 28 dagen + 1 Oudjaarsdag = 365 dagen
// Schrikkeljaar: + 1 Schrikkeljaardag = 366 dagen
// Elke maand begint op een maandag

const MAANDEN = [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Sol",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December"
];

const DAGNAMEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const DAGEN_PER_MAAND = 28;
const AANTAL_MAANDEN = 13;

let huidigJaar = new Date().getFullYear();
let huidigeMaand = 0; // 0-12 = maanden, 13 = Oudjaarsdag, 14 = Schrikkeljaardag

// DOM elementen
const prevYearBtn = document.getElementById("prev-year");
const nextYearBtn = document.getElementById("next-year");
const currentYearEl = document.getElementById("current-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const monthTitleEl = document.getElementById("month-title");
const calendarDaysEl = document.getElementById("calendar-days");
const specialDayEl = document.getElementById("special-day");
const monthListEl = document.getElementById("month-list");
const vandaagDisplayEl = document.getElementById("vandaag-display");

// Check of een jaar een schrikkeljaar is
function isSchrikkeljaar(jaar) {
    return (jaar % 4 === 0 && jaar % 100 !== 0) || (jaar % 400 === 0);
}

// Bereken welke dag van het jaar het vandaag is (1-indexed)
function getDagVanHetJaar() {
    const nu = new Date();
    const start = new Date(nu.getFullYear(), 0, 1);
    const diff = nu - start;
    const eenDag = 1000 * 60 * 60 * 24;
    return Math.floor(diff / eenDag) + 1;
}

// Converteer een Gregoriaanse datum naar dag-van-het-jaar (1-indexed)
function gregoriaNaarDagVanJaar(maand, dag) {
    // maand = 1-12 (Gregoriaans), dag = 1-31
    const dagenPerMaand = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let totaal = 0;
    for (let i = 0; i < maand - 1; i++) {
        totaal += dagenPerMaand[i];
    }
    return totaal + dag;
}

// Converteer dag-van-het-jaar naar 13-maanden positie
function dagVanJaarNaar13Maanden(dagVanJaar) {
    if (dagVanJaar > 364) return null; // Speciale dagen
    const maand = Math.floor((dagVanJaar - 1) / DAGEN_PER_MAAND);
    const dag = ((dagVanJaar - 1) % DAGEN_PER_MAAND) + 1;
    return { maand, dag };
}

// Bereken Pasen (Computus - Anonymous Gregorian algorithm)
function berekenPasen(jaar) {
    const a = jaar % 19;
    const b = Math.floor(jaar / 100);
    const c = jaar % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const maand = Math.floor((h + l - 7 * m + 114) / 31); // 3=maart, 4=april
    const dag = ((h + l - 7 * m + 114) % 31) + 1;
    return { maand, dag }; // Gregoriaans
}

// Haal alle feestdagen op voor een bepaald jaar (als dag-van-het-jaar)
function getFeestdagen(jaar) {
    const feestdagen = [];

    // Eigen feestdagen van het 13-maandensysteem (direct in maand/dag)
    const eigen = [
        { naam: "☀️ Lichtdag", maand: 6, dag: 21 },
    ];

    for (const f of eigen) {
        feestdagen.push({ naam: f.naam, maand: f.maand, dag: f.dag });
    }

    // Vaste feestdagen (Gregoriaanse datum → dag van het jaar)
    const vast = [
        { naam: "🎉 Nieuwjaarsdag", gMaand: 1, gDag: 1 },
        { naam: "💕 Valentijnsdag", gMaand: 2, gDag: 14 },
        { naam: "👑 Koningsdag", gMaand: 4, gDag: 27 },
        { naam: "🕊️ Bevrijdingsdag", gMaand: 5, gDag: 5 },
        { naam: "🎅 Sinterklaas", gMaand: 12, gDag: 5 },
        { naam: "🎄 Kerst", gMaand: 12, gDag: 25 },
        { naam: "🎄 2e Kerstdag", gMaand: 12, gDag: 26 },
        { naam: "👷 Dag van de Arbeid", gMaand: 5, gDag: 1 },
        { naam: "🎃 Halloween", gMaand: 10, gDag: 31 },
    ];

    for (const f of vast) {
        const dagVanJaar = gregoriaNaarDagVanJaar(f.gMaand, f.gDag);
        const pos = dagVanJaarNaar13Maanden(dagVanJaar);
        if (pos) {
            feestdagen.push({ naam: f.naam, maand: pos.maand, dag: pos.dag });
        }
    }

    // Variabele feestdagen (gebaseerd op Pasen)
    const pasen = berekenPasen(jaar);
    const pasenDag = gregoriaNaarDagVanJaar(pasen.maand, pasen.dag);

    const variabel = [
        { naam: "✝️ Goede Vrijdag", offset: -2 },
        { naam: "🐣 1e Paasdag", offset: 0 },
        { naam: "🐣 2e Paasdag", offset: 1 },
        { naam: "☁️ Hemelvaartsdag", offset: 39 },
        { naam: "🕊️ 1e Pinksterdag", offset: 49 },
        { naam: "🕊️ 2e Pinksterdag", offset: 50 },
    ];

    for (const f of variabel) {
        const dagVanJaar = pasenDag + f.offset;
        if (dagVanJaar >= 1 && dagVanJaar <= 364) {
            const pos = dagVanJaarNaar13Maanden(dagVanJaar);
            if (pos) {
                feestdagen.push({ naam: f.naam, maand: pos.maand, dag: pos.dag });
            }
        }
    }

    return feestdagen;
}

// Haal feestdagen op voor een specifieke maand
function getFeestdagenVoorMaand(jaar, maand) {
    const alle = getFeestdagen(jaar);
    return alle.filter(f => f.maand === maand);
}

// Bereken de huidige datum in het 13-maandensysteem
function getVandaag() {
    const nu = new Date();
    const jaar = nu.getFullYear();
    const dagVanJaar = getDagVanHetJaar();
    const schrikkel = isSchrikkeljaar(jaar);
    const totaleDagen = schrikkel ? 366 : 365;

    // Laatste dag = Oudjaarsdag (dag 365 of 366)
    if (dagVanJaar === totaleDagen) {
        return { jaar, maand: 13, dag: 0, dagnaam: "Oudjaarsdag" };
    }

    // Voorlaatste dag in schrikkeljaar = Schrikkeljaardag (dag 365)
    if (schrikkel && dagVanJaar === 365) {
        return { jaar, maand: 14, dag: 0, dagnaam: "Schrikkeljaardag" };
    }

    // Normale dag: maand en dag berekenen
    const maand = Math.floor((dagVanJaar - 1) / DAGEN_PER_MAAND);
    const dag = ((dagVanJaar - 1) % DAGEN_PER_MAAND) + 1;
    const dagVanWeek = (dag - 1) % 7; // 0=Ma, 6=Zo

    return { jaar, maand, dag, dagnaam: DAGNAMEN[dagVanWeek] };
}

// Toon vandaag bovenaan
function renderVandaag() {
    const v = getVandaag();

    if (v.maand === 13) {
        vandaagDisplayEl.textContent = `Vandaag: Oudjaarsdag ${v.jaar}`;
    } else if (v.maand === 14) {
        vandaagDisplayEl.textContent = `Vandaag: Schrikkeljaardag ${v.jaar}`;
    } else {
        vandaagDisplayEl.textContent = `Vandaag: ${v.dagnaam} ${v.dag} ${MAANDEN[v.maand]} ${v.jaar}`;
    }
}

// Render de kalender voor de huidige maand
function renderKalender() {
    currentYearEl.textContent = huidigJaar;
    renderVandaag();

    const calendarGrid = document.querySelector(".calendar-grid");

    if (huidigeMaand === 13) {
        monthTitleEl.textContent = "Oudjaarsdag";
        calendarGrid.style.display = "none";
        specialDayEl.classList.remove("hidden");
        specialDayEl.querySelector("h3").textContent = "Oudjaarsdag";
        specialDayEl.querySelector("p").textContent = "De extra dag aan het einde van het jaar";
        specialDayEl.querySelector(".special-icon").textContent = "🎆";
    } else if (huidigeMaand === 14) {
        monthTitleEl.textContent = "Schrikkeljaardag";
        calendarGrid.style.display = "none";
        specialDayEl.classList.remove("hidden");
        specialDayEl.querySelector("h3").textContent = "Schrikkeljaardag";
        specialDayEl.querySelector("p").textContent = "De extra dag in een schrikkeljaar";
        specialDayEl.querySelector(".special-icon").textContent = "🌟";
    } else {
        monthTitleEl.textContent = `${MAANDEN[huidigeMaand]} (Maand ${huidigeMaand + 1})`;
        calendarGrid.style.display = "grid";
        specialDayEl.classList.add("hidden");
        renderDagen();
    }

    renderMaandLijst();
}

function renderDagen() {
    calendarDaysEl.innerHTML = "";

    const vandaag = getVandaag();
    const isHuidigJaar = huidigJaar === vandaag.jaar;
    const feestdagen = getFeestdagenVoorMaand(huidigJaar, huidigeMaand);

    for (let dag = 1; dag <= DAGEN_PER_MAAND; dag++) {
        const cell = document.createElement("div");
        cell.className = "day-cell";

        // Dag van de week (0 = Ma, 6 = Zo)
        const dagVanWeek = (dag - 1) % 7;

        // Weekend markering (Za = 5, Zo = 6)
        if (dagVanWeek === 5 || dagVanWeek === 6) {
            cell.classList.add("weekend");
        }

        // Vandaag markering
        if (isHuidigJaar && vandaag.maand === huidigeMaand && vandaag.dag === dag) {
            cell.classList.add("today");
        }

        // Feestdag markering
        const feestdag = feestdagen.find(f => f.dag === dag);
        if (feestdag) {
            cell.classList.add("feestdag");
            cell.setAttribute("title", feestdag.naam);

            const nummer = document.createElement("span");
            nummer.className = "day-number";
            nummer.textContent = dag;
            cell.appendChild(nummer);

            const label = document.createElement("span");
            label.className = "feestdag-dot";
            cell.appendChild(label);
        } else {
            cell.textContent = dag;
        }

        // Klik handler voor info panel
        const dagNummer = dag;
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
            // Verwijder 'selected' van vorige selectie
            document.querySelectorAll(".day-cell.selected").forEach(el => el.classList.remove("selected"));
            // Voeg 'selected' toe aan geklikte dag
            cell.classList.add("selected");
            toonDagInfo(huidigeMaand, dagNummer, huidigJaar);
        });

        calendarDaysEl.appendChild(cell);
    }

    // Toon feestdagen lijst onder de kalender
    renderFeestdagenLijst(feestdagen);
}

function renderFeestdagenLijst(feestdagen) {
    let lijst = document.getElementById("feestdagen-lijst");
    if (!lijst) {
        lijst = document.createElement("div");
        lijst.id = "feestdagen-lijst";
        lijst.className = "feestdagen-lijst";
        document.querySelector(".calendar-container").appendChild(lijst);
    }

    if (feestdagen.length === 0) {
        lijst.innerHTML = "";
        lijst.style.display = "none";
        return;
    }

    lijst.style.display = "block";
    lijst.innerHTML = "<h4>Feestdagen deze maand</h4>" +
        feestdagen.map(f => `<div class="feestdag-item"><span class="feestdag-dag">dag ${f.dag}</span> ${f.naam}</div>`).join("");
}

function renderMaandLijst() {
    monthListEl.innerHTML = "";

    const schrikkel = isSchrikkeljaar(huidigJaar);

    for (let i = 0; i < AANTAL_MAANDEN; i++) {
        const item = document.createElement("div");
        item.className = "month-item";
        item.textContent = MAANDEN[i];

        if (i === huidigeMaand) {
            item.classList.add("active");
        }

        item.addEventListener("click", () => {
            huidigeMaand = i;
            renderKalender();
        });

        monthListEl.appendChild(item);
    }

    // Schrikkeljaardag (alleen in schrikkeljaren)
    if (schrikkel) {
        const schrikkelItem = document.createElement("div");
        schrikkelItem.className = "month-item special";
        schrikkelItem.textContent = "🌟 Schrikkeljaardag";

        if (huidigeMaand === 14) {
            schrikkelItem.classList.add("active");
        }

        schrikkelItem.addEventListener("click", () => {
            huidigeMaand = 14;
            renderKalender();
        });

        monthListEl.appendChild(schrikkelItem);
    }

    // Oudjaarsdag
    const oudjaarsItem = document.createElement("div");
    oudjaarsItem.className = "month-item special";
    oudjaarsItem.textContent = "🎆 Oudjaarsdag";

    if (huidigeMaand === 13) {
        oudjaarsItem.classList.add("active");
    }

    oudjaarsItem.addEventListener("click", () => {
        huidigeMaand = 13;
        renderKalender();
    });

    monthListEl.appendChild(oudjaarsItem);
}

// Converteer 13-maanden datum terug naar Gregoriaans
function naarGregoriaans(maand13, dag13, jaar) {
    // Bereken dag van het jaar
    const dagVanJaar = maand13 * DAGEN_PER_MAAND + dag13;

    // Converteer naar Gregoriaanse datum
    const dagenPerMaand = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (isSchrikkeljaar(jaar)) {
        dagenPerMaand[1] = 29;
    }

    let resterend = dagVanJaar;
    let gMaand = 0;
    while (gMaand < 12 && resterend > dagenPerMaand[gMaand]) {
        resterend -= dagenPerMaand[gMaand];
        gMaand++;
    }

    const GREG_MAANDEN = [
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december"
    ];

    return {
        dag: resterend,
        maand: gMaand + 1,
        maandNaam: GREG_MAANDEN[gMaand],
        jaar: jaar
    };
}

// Toon dag info in het zijpaneel
function toonDagInfo(maand13, dag13, jaar) {
    const infoPanel = document.getElementById("info-panel");
    const infoContent = document.getElementById("info-content");
    const placeholder = infoPanel.querySelector(".info-placeholder");

    // Verberg placeholder, toon content
    placeholder.style.display = "none";
    infoContent.classList.remove("hidden");

    // Bereken gegevens
    const dagVanWeek = (dag13 - 1) % 7;
    const weekNummer = Math.floor((maand13 * DAGEN_PER_MAAND + dag13 - 1) / 7) + 1;
    const dagVanJaar = maand13 * DAGEN_PER_MAAND + dag13;
    const greg = naarGregoriaans(maand13, dag13, jaar);

    // Feestdagen op deze dag
    const feestdagen = getFeestdagenVoorMaand(jaar, maand13).filter(f => f.dag === dag13);

    // Vandaag check
    const vandaag = getVandaag();
    const isVandaag = (jaar === vandaag.jaar && maand13 === vandaag.maand && dag13 === vandaag.dag);

    // Bouw info HTML
    let html = `<h3>${DAGNAMEN[dagVanWeek]} ${dag13} ${MAANDEN[maand13]}</h3>`;

    // Vandaag indicator
    if (isVandaag) {
        html += `<div class="info-section"><div class="info-value highlight">✨ Dit is vandaag!</div></div>`;
    }

    // Gregoriaanse datum
    html += `
        <div class="info-section">
            <div class="info-label">Normale kalender</div>
            <div class="info-value">${greg.dag} ${greg.maandNaam} ${greg.jaar}</div>
        </div>`;

    // Dag van het jaar & week
    html += `
        <div class="info-section">
            <div class="info-label">Dag van het jaar</div>
            <div class="info-value">${dagVanJaar} / ${isSchrikkeljaar(jaar) ? 366 : 365}</div>
        </div>`;

    html += `
        <div class="info-section">
            <div class="info-label">Week</div>
            <div class="info-value">Week ${weekNummer} van 52</div>
        </div>`;

    // Weekdag info
    html += `
        <div class="info-section">
            <div class="info-label">Weekdag</div>
            <div class="info-value">${DAGNAMEN[dagVanWeek]}</div>
        </div>`;

    // Feestdagen
    if (feestdagen.length > 0) {
        html += `<div class="info-section">
            <div class="info-label">Feestdag</div>`;
        for (const f of feestdagen) {
            html += `<div class="info-feestdag">${f.naam}</div>`;
        }
        html += `</div>`;
    }

    // Dagen tot einde jaar
    const totaleDagen = isSchrikkeljaar(jaar) ? 366 : 365;
    const dagenOver = totaleDagen - dagVanJaar;
    html += `
        <div class="info-section">
            <div class="info-label">Dagen tot einde jaar</div>
            <div class="info-value">${dagenOver} dagen</div>
        </div>`;

    infoContent.innerHTML = html;
}

// Ga naar vandaag
function gaNaarVandaag() {
    const v = getVandaag();
    huidigJaar = v.jaar;
    huidigeMaand = v.maand;
    renderKalender();
}

// Event listeners
prevYearBtn.addEventListener("click", () => {
    huidigJaar--;
    renderKalender();
});

nextYearBtn.addEventListener("click", () => {
    huidigJaar++;
    renderKalender();
});

prevMonthBtn.addEventListener("click", () => {
    if (huidigeMaand === 0) {
        huidigeMaand = 13;
        huidigJaar--;
    } else if (huidigeMaand === 13) {
        const schrikkel = isSchrikkeljaar(huidigJaar);
        huidigeMaand = schrikkel ? 14 : 12;
    } else if (huidigeMaand === 14) {
        huidigeMaand = 12;
    } else {
        huidigeMaand--;
    }
    renderKalender();
});

nextMonthBtn.addEventListener("click", () => {
    if (huidigeMaand === 13) {
        huidigeMaand = 0;
        huidigJaar++;
    } else if (huidigeMaand === 14) {
        huidigeMaand = 13;
    } else if (huidigeMaand === 12) {
        const schrikkel = isSchrikkeljaar(huidigJaar);
        huidigeMaand = schrikkel ? 14 : 13;
    } else {
        huidigeMaand++;
    }
    renderKalender();
});

// Keyboard navigatie
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        prevMonthBtn.click();
    } else if (e.key === "ArrowRight") {
        nextMonthBtn.click();
    } else if (e.key === "ArrowUp") {
        prevYearBtn.click();
    } else if (e.key === "ArrowDown") {
        nextYearBtn.click();
    } else if (e.key === "Home") {
        gaNaarVandaag();
    }
});

// Klik op "Vandaag" display gaat terug naar vandaag
vandaagDisplayEl.addEventListener("click", gaNaarVandaag);

// Initialiseer met vandaag
gaNaarVandaag();
