document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resultsCountDiv = document.getElementById('resultsCount');
    resultsCountDiv.textContent = "Recherche en cours...";
    
    // On crée l'URL avec les paramètres directement dedans (méthode GET)
    // C'est beaucoup moins sujet aux erreurs de connexion
    const params = new URLSearchParams({
        nom: document.getElementById('searchInput').value,
        ville: document.getElementById('locationInput').value,
        statut: document.getElementById('statusSelect').value
    });

    try {
        // On envoie une requête simple sans Headers compliqués
        const response = await fetch(`${MAKE_WEBHOOK_URL}?${params.toString()}`);

        if (response.ok) {
            const results = await response.json();
            resultsCountDiv.textContent = `${results.length} enregistrements trouvés`;
            render(results); 
        } else {
            resultsCountDiv.textContent = "Le serveur Make ne répond pas (Erreur " + response.status + ")";
        }
    } catch (error) {
        resultsCountDiv.textContent = "Connexion impossible : vérifiez que le scénario Make est sur 'Run Once'";
    }
};
