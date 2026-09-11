function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* =========================
   LOCAL STORAGE
========================= */

function getData() {
    const savedData = localStorage.getItem("dayoneData");

    if (!savedData) {
        return {};
    }

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        return {};
    }
}

function saveData(data) {
    localStorage.setItem(
        "dayoneData",
        JSON.stringify(data)
    );
}

function createEmptyDay() {
    return {
        food: false,
        cardio: false,
        reflection: ""
    };
}

function getTodayData() {
    const data = getData();
    const today = getToday();

    if (!data[today]) {
        data[today] = createEmptyDay();
        saveData(data);
    }

    return data[today];
}

/* =========================
   HÁBITOS
========================= */

function toggleHabit(habit) {
    const data = getData();
    const today = getToday();

    if (!data[today]) {
        data[today] = createEmptyDay();
    }

    data[today][habit] = !data[today][habit];

    saveData(data);
    updateInterface();
}

/* =========================
   REFLEXÃO
========================= */

function saveReflection() {
    const data = getData();
    const today = getToday();

    if (!data[today]) {
        data[today] = createEmptyDay();
    }

    const reflection =
        document.getElementById("reflection");

    data[today].reflection = reflection.value;

    saveData(data);
}

/* =========================
   OFENSIVA
========================= */

function isDayCompleted(day) {
    if (!day) {
        return false;
    }

    return day.food === true || day.cardio === true;
}

function calculateStreak() {
    const data = getData();

    let streak = 0;
    const date = new Date();

    const todayKey = formatDate(date);

    // Se hoje ainda não foi concluído,
    // começamos contando a partir de ontem.
    if (!isDayCompleted(data[todayKey])) {
        date.setDate(date.getDate() - 1);
    }

    while (true) {
        const key = formatDate(date);

        if (!isDayCompleted(data[key])) {
            break;
        }

        streak++;

        date.setDate(date.getDate() - 1);
    }

    return streak;
}

/* =========================
   MELHOR OFENSIVA
========================= */

function calculateBestStreak() {
    const data = getData();

    const dates = Object.keys(data)
        .filter(function (date) {
            return isDayCompleted(data[date]);
        })
        .sort();

    if (dates.length === 0) {
        return 0;
    }

    let best = 1;
    let current = 1;

    for (let i = 1; i < dates.length; i++) {
        const previousDate =
            new Date(dates[i - 1]);

        const currentDate =
            new Date(dates[i]);

        const difference =
            Math.round(
                (currentDate - previousDate) /
                (1000 * 60 * 60 * 24)
            );

        if (difference === 1) {
            current++;
        } else {
            current = 1;
        }

        if (current > best) {
            best = current;
        }
    }

    return best;
}

/* =========================
   TOTAL DE DIAS
========================= */

function calculateTotalDays() {
    const data = getData();

    return Object.values(data)
        .filter(function (day) {
            return isDayCompleted(day);
        })
        .length;
}

/* =========================
   FRASES
========================= */

function updateMotivation() {
    const phrases = [
        "Todo dia é uma nova chance.",
        "Cuide de hoje. O resto vem depois.",
        "Pequenas escolhas constroem grandes mudanças.",
        "Não precisa ser perfeito. Só precisa continuar.",
        "Um dia de cada vez.",
        "Seu único compromisso é com o dia de hoje.",
        "Consistência antes de perfeição."
    ];

    const day = new Date().getDate();

    const index = day % phrases.length;

    const motivation =
        document.getElementById("motivation");

    if (motivation) {
        motivation.textContent = phrases[index];
    }
}

/* =========================
   HISTÓRICO
========================= */

function renderHistory() {
    const grid =
        document.getElementById("historyGrid");

    if (!grid) {
        return;
    }

    const data = getData();

    grid.innerHTML = "";

    for (let i = 27; i >= 0; i--) {
        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        const key = formatDate(date);

        const day = data[key];

        const element =
            document.createElement("div");

        element.classList.add("history-day");

        if (day) {
            if (day.food && day.cardio) {
                element.classList.add("both");
            } else if (day.food) {
                element.classList.add("food");
            } else if (day.cardio) {
                element.classList.add("cardio");
            }
        }

        element.textContent =
            date.getDate();

        element.title =
            date.toLocaleDateString("pt-BR");

        grid.appendChild(element);
    }
}

/* =========================
   RESUMO SEMANAL
========================= */

function updateWeeklySummary() {
    const summary =
        document.getElementById("weeklySummary");

    if (!summary) {
        return;
    }

    const data = getData();

    let foodDays = 0;
    let cardioDays = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        const key = formatDate(date);

        const day = data[key];

        if (!day) {
            continue;
        }

        if (day.food) {
            foodDays++;
        }

        if (day.cardio) {
            cardioDays++;
        }
    }

    summary.textContent =
        `${foodDays} dia(s) de alimentação e ${cardioDays} dia(s) de cardio nesta semana.`;
}

/* =========================
   INTERFACE
========================= */

function updateInterface() {
    const today = getTodayData();

    const currentStreak =
        calculateStreak();

    const bestStreak =
        calculateBestStreak();

    const totalDays =
        calculateTotalDays();

    const todayDate =
        document.getElementById("todayDate");

    if (todayDate) {
        todayDate.textContent =
            new Date().toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "short"
                }
            );
    }

    const foodButton =
        document.getElementById("foodButton");

    if (foodButton) {
        foodButton.classList.toggle(
            "completed",
            today.food
        );
    }

    const cardioButton =
        document.getElementById("cardioButton");

    if (cardioButton) {
        cardioButton.classList.toggle(
            "completed",
            today.cardio
        );
    }

    const reflection =
        document.getElementById("reflection");

    if (reflection) {
        reflection.value =
            today.reflection || "";
    }

    const currentStreakElement =
        document.getElementById("currentStreak");

    if (currentStreakElement) {
        currentStreakElement.textContent =
            currentStreak;
    }

    const progressStreak =
        document.getElementById("progressStreak");

    if (progressStreak) {
        progressStreak.textContent =
            currentStreak;
    }

    const bestStreakElement =
        document.getElementById("bestStreak");

    if (bestStreakElement) {
        bestStreakElement.textContent =
            bestStreak;
    }

    const totalDaysElement =
        document.getElementById("totalDays");

    if (totalDaysElement) {
        totalDaysElement.textContent =
            totalDays;
    }

    updateMotivation();
    renderHistory();
    updateWeeklySummary();
    loadReminder();
}

/* =========================
   NAVEGAÇÃO
========================= */

function changePage(pageId, button) {
    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const navButtons =
        document.querySelectorAll(".nav-item");

    navButtons.forEach(function (navButton) {
        navButton.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    updateInterface();
}

/* =========================
   LEMBRETE
========================= */

function saveReminder() {
    const input =
        document.getElementById("reminderTime");

    if (!input) {
        return;
    }

    localStorage.setItem(
        "dayoneReminder",
        input.value
    );
}

function loadReminder() {
    const input =
        document.getElementById("reminderTime");

    if (!input) {
        return;
    }

    const savedTime =
        localStorage.getItem("dayoneReminder");

    if (savedTime) {
        input.value = savedTime;
    }
}

/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        getTodayData();
        updateInterface();
    }
)