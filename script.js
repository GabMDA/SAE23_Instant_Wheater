// Activation des boutons jours
document.querySelectorAll("#days button").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.toggle("selected");
  });
});

// Chargement des communes selon le code postal
document.getElementById("zipcode").addEventListener("input", async (e) => {
  const code = e.target.value.trim();
  const communeSelect = document.getElementById("commune");
  communeSelect.innerHTML = `<option value="">Chargement...</option>`;

  if (/^\d{5}$/.test(code)) {
    const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${code}&fields=nom,code,centre&format=json`);
    const data = await res.json();

    if (data.length === 0) {
      communeSelect.innerHTML = `<option value="">Aucune commune trouvée</option>`;
    } else {
      communeSelect.innerHTML = `<option value="">Choisissez une commune</option>`;
      data.forEach(c => {
        const opt = document.createElement("option");
        opt.value = JSON.stringify({
          insee: c.code,
          nom: c.nom,
          lat: c.centre.coordinates[1],
          lon: c.centre.coordinates[0]
        });
        opt.textContent = c.nom;
        communeSelect.appendChild(opt);
      });
    }
  } else {
    communeSelect.innerHTML = `<option value="">Entrez un code postal valide</option>`;
  }
});

// formulaire
document.getElementById("weather-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const communeData = JSON.parse(document.getElementById("commune").value);
  const selectedDays = [...document.querySelectorAll("#days button.selected")].map(b => parseInt(b.dataset.day));
  const checkedOptions = [...document.querySelectorAll("input[name='options']:checked")].map(opt => opt.value);
  const results = document.getElementById("results");

  if (!communeData || selectedDays.length === 0) {
    results.innerHTML = "<p>Veuillez sélectionner une commune et au moins un jour.</p>";
    return;
  }

  results.innerHTML = "Chargement...";

  try {
    const res = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=f7d06d2b23546fe98fcab761fda383ba1fc4c9be665e3f1a0e2e9d238538a18a&insee=${communeData.insee}`);
    const data = await res.json();

    if (data.error) {
      results.innerHTML = `<p>Erreur API : ${data.error.message}</p>`;
      return;
    }

    const forecasts = data.forecast.filter(f => selectedDays.includes(f.day));

    results.innerHTML = forecasts.map(f => {
      const emoji = getWeatherEmoji(f.weather);
      const extras = [];

      if (checkedOptions.includes("lat")) extras.push(`<p>Latitude : ${communeData.lat.toFixed(4)}</p>`);
      if (checkedOptions.includes("lon")) extras.push(`<p>Longitude : ${communeData.lon.toFixed(4)}</p>`);
      if (checkedOptions.includes("rain")) extras.push(`<p>Cumul pluie : ${f.rr10} mm</p>`);
      if (checkedOptions.includes("wind")) extras.push(`<p>Vent moyen : ${f.wind10m} km/h</p>`);
      if (checkedOptions.includes("winddir")) extras.push(`<p>Direction vent : ${f.dirwind10m}°</p>`);

      return `
        <div class="card">
          <div style="font-size: 3em;">${emoji}</div>
          <h3>${communeData.nom} - ${formatDate(f.datetime)}</h3>
          <p>${getWeatherDescription(f.weather)}</p>
          <p>Min : ${f.tmin}°C | Max : ${f.tmax}°C</p>
          ${extras.join("")}
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Erreur API météo :", err);
    results.innerHTML = "<p>Erreur lors du chargement des données.</p>";
  }
});

// Condition météo
function getWeatherDescription(code) {
  const d = {
    0: "Soleil", 1: "Peu nuageux", 2: "Voilé", 3: "Nuageux", 4: "Très nuageux", 5: "Couvert",
    6: "Brouillard", 7: "Brouillard givrant", 10: "Pluie faible", 11: "Pluie modérée", 12: "Pluie forte",
    13: "Pluie très forte", 14: "Pluie orageuse", 20: "Neige faible", 21: "Neige modérée",
    22: "Neige forte", 30: "Pluie/neige", 40: "Averses", 50: "Orages", 60: "Averses neige", 70: "Grêle"
  };
  return d[code] || "Inconnu";
}

// Emojis météo
function getWeatherEmoji(code) {
  const icons = {
    0: "☀️",
    1: "🌤️",
    2: "🌥️",
    3: "☁️",
    4: "🌫️",
    5: "🌁",
    6: "🌫️",
    7: "🌫️",
    10: "🌧️",
    11: "🌧️",
    12: "🌧️",
    13: "🌧️",
    14: "⛈️",
    20: "🌨️",
    21: "🌨️",
    22: "🌨️",
    30: "🌨🌧",
    40: "🌦️",
    50: "⛈️",
    60: "❄️",
    70: "🌨️"
  };
  // si il n'y a pas d'émojis existant
  return icons[code] || "❓";
}

// Format de date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("dark-toggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Réinitialiser le formulaire au chargement
  document.getElementById("weather-form").reset();

  // Appliquer le thème sombre si déjà choisi
  const toggle = document.getElementById("dark-toggle");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
});

