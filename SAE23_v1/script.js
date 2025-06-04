const API_KEY = "f7d06d2b23546fe98fcab761fda383ba1fc4c9be665e3f1a0e2e9d238538a18a";
const API_GEO = "https://geo.api.gouv.fr/communes?codePostal=";
const API_METEO = "https://api.meteo-concept.com/api/forecast/daily";

const form = document.getElementById("weather-form");
const results = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const zipcode = document.getElementById("zipcode").value;
  const daysSelected = document.getElementById("days").value;
  const daysNumber = parseInt(daysSelected, 10);

  results.innerHTML = "<p>Chargement...</p>";

  try {
    // 1. Trouver la ville
    const villesReponse = await fetch(API_GEO + zipcode);
    const villes = await villesReponse.json();

    if (villes.length === 0) {
      results.innerHTML = "<p>Aucune ville trouvée</p>";
      return;
    }

    // 2. Récupérer la météo
    const meteoReponse = await fetch(
      `${API_METEO}?token=${API_KEY}&insee=${villes[0].code}&days=${daysNumber}`
    );
    const meteo = await meteoReponse.json();

    // 3. Afficher les résultats
    results.innerHTML = `<h2>Prévisions pour ${villes[0].nom} (${daysNumber} jours) :</h2>`;
    
    // On s'assure de n'afficher que le nombre de jours demandés
    meteo.forecast.slice(0, daysNumber).forEach(jour => {
      results.innerHTML += `
        <div class="card">
          <h3>${jour.datetime}</h3>
          <p>Min: ${jour.tmin}°C - Max: ${jour.tmax}°C</p>
        </div>
      `;
    });

  } catch (erreur) {
    results.innerHTML = "<p>Erreur de connexion</p>";
    console.log(erreur);
  }
});