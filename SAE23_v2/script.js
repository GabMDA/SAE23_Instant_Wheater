// Éléments du DOM
const zipcodeInput = document.getElementById("zipcode");
const communeSelect = document.getElementById("commune");
const form = document.getElementById("weather-form");
const resultsDiv = document.getElementById("results");

// API Configuration
const API_KEY = "f7d06d2b23546fe98fcab761fda383ba1fc4c9be665e3f1a0e2e9d238538a18a";
const API_GEO = "https://geo.api.gouv.fr/communes?codePostal=";
const API_METEO = "https://api.meteo-concept.com/api/forecast/daily";

// code postal
zipcodeInput.addEventListener("input", async () => {
  const code = zipcodeInput.value.trim();
  
  // Vérifie si le code postal est valide (5 chiffres) grâce à rege
  if (!/^\d{5}$/.test(code)) {
    communeSelect.innerHTML = `<option value="">Entrez 5 chiffres</option>`;
    return;
  }

  // Charge les communes correspondantes
  communeSelect.innerHTML = `<option value="">Chargement...</option>`;
  
  try {
    const response = await fetch(`${API_GEO}${code}&fields=nom,code`);
    const communes = await response.json();

    communeSelect.innerHTML = communes.length 
      ? `<option value="">Choisissez</option>`
      : `<option value="">Aucune commune</option>`;
    
    // Ajoute chaque commune dans le selecteur
    communes.forEach(commune => {
      const option = new Option(commune.nom, commune.code);
      communeSelect.add(option);
    });
    
  } catch (error) {
    communeSelect.innerHTML = `<option value="">Erreur</option>`;
    console.error(error);
  }
});

// formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const inseeCode = communeSelect.value;
  const ville = communeSelect.options[communeSelect.selectedIndex].text;
  const days = parseInt(document.getElementById("days").value);
  
  if (!inseeCode) {
    resultsDiv.innerHTML = "<p>Sélectionnez une commune</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Chargement...</p>";

  try {
    // Récupère les données météo
    const response = await fetch(`${API_METEO}?token=${API_KEY}&insee=${inseeCode}`);
    const data = await response.json();

    // Affiche les résultats
    resultsDiv.innerHTML = data.forecast.slice(0, days).map(day => `
      <div class="card">
        <h3>${ville} - ${formatDate(day.datetime)}</h3>
        <p>${getWeatherDescription(day.weather)}</p>
        <p>Min: ${day.tmin}°C | Max: ${day.tmax}°C</p>
      </div>
    `).join('');
    
  } catch (error) {
    resultsDiv.innerHTML = "<p>Erreur de connexion</p>";
    console.error(error);
  }
});

// météo 
function getWeatherDescription(code) {
  const weatherMap = {
    0: "Soleil", 1: "Peu nuageux", 2: "Ciel voilé", 3: "Nuageux",
    5: "Couvert", 10: "Pluie faible", 11: "Pluie modérée",
    14: "Pluie orageuse", 20: "Neige faible", 30: "Pluie et neige",
    40: "Averses", 50: "Orages", 100: "Données indisponibles"
  };
  return weatherMap[code] || "Conditions inconnues";
}

// date française
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}