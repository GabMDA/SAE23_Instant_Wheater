// Configuration des API
const API_KEY = "f7d06d2b23546fe98fcab761fda383ba1fc4c9be665e3f1a0e2e9d238538a18a";
const API_GEO = "https://geo.api.gouv.fr/communes?codePostal=";
const API_METEO = "https://api.meteo-concept.com/api/forecast/daily";

// Éléments DOM
const elements = {
  zipcode: document.getElementById("zipcode"),
  commune: document.getElementById("commune"),
  form: document.getElementById("weather-form"),
  results: document.getElementById("results"),
  dayButtons: document.querySelectorAll("#days button")
};

// Écouteur pour la saisie du code postal
elements.zipcode.addEventListener("input", async () => {
  const code = elements.zipcode.value.trim();
  elements.commune.innerHTML = "<option value=''>Chargement...</option>";

  if (/^\d{5}$/.test(code)) {
    try {
      // Récupère les communes via l'API
      const response = await fetch(`${API_GEO}${code}&fields=nom,code`);
      const communes = await response.json();

      elements.commune.innerHTML = communes.length 
        ? "<option value=''>Choisissez une commune</option>"
        : "<option value=''>Aucune commune trouvée</option>";

      // Ajoute les options de commune
      communes.forEach(commune => {
        const option = new Option(commune.nom, commune.code);
        elements.commune.add(option);
      });
    } catch (error) {
      elements.commune.innerHTML = "<option value=''>Erreur</option>";
      console.error(error);
    }
  } else {
    elements.commune.innerHTML = "<option value=''>Code postal invalide</option>";
  }
});

// Gestion de la sélection des jours
elements.dayButtons.forEach(button => {
  button.addEventListener("click", () => button.classList.toggle("selected"));
});

// Soumission du formulaire
elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const insee = elements.commune.value;
  const ville = elements.commune.options[elements.commune.selectedIndex].text;
  const selectedDays = getSelectedDays();

  // Validation
  if (!insee) {
    elements.results.innerHTML = "<p>Sélectionnez une commune</p>";
    return;
  }
  if (selectedDays.length === 0) {
    elements.results.innerHTML = "<p>Sélectionnez au moins un jour</p>";
    return;
  }

  elements.results.innerHTML = "<p>Chargement...</p>";

  try {
    // Récupère les données météo
    const response = await fetch(`${API_METEO}?token=${API_KEY}&insee=${insee}`);
    const data = await response.json();

    // Filtre les jours sélectionnés
    const forecasts = data.forecast.filter(day => 
      selectedDays.includes(day.day)
    );

    // Affiche les résultats
    elements.results.innerHTML = forecasts.map(day => `
      <div class="card">
        <h3>${ville} - ${formatDate(day.datetime)}</h3>
        <p>${getWeatherDescription(day.weather)}</p>
        <p>Min: ${day.tmin}°C | Max: ${day.tmax}°C</p>
      </div>
    `).join('');
  } catch (error) {
    elements.results.innerHTML = "<p>Erreur de connexion</p>";
    console.error(error);
  }
});

// Récupère les jours sélectionnés
function getSelectedDays() {
  return Array.from(document.querySelectorAll("#days button.selected"))
    .map(btn => parseInt(btn.dataset.day));
}

// Dictionnaire des conditions météo
function getWeatherDescription(code) {
  const weatherTypes = {
    0: "Soleil", 1: "Peu nuageux", 2: "Ciel voilé", 
    3: "Nuageux", 5: "Couvert", 10: "Pluie faible",
    11: "Pluie modérée", 14: "Pluie orageuse", 
    20: "Neige faible", 30: "Pluie et neige",
    40: "Averses", 50: "Orages", 100: "Données indisponibles"
  };
  return weatherTypes[code] || "Inconnu";
}

// Formatage de la date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });
}