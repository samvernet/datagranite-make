const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cjlifl1ls08yxy51u7dgodf5ue5qowoo';

let allData = []; 
let map = null;

// 1. GESTION DE L'ENVOI DU FORMULAIRE (La connexion à Make)
document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resultsCountDiv = document.getElementById('resultsCount');
    resultsCountDiv.textContent = "Recherche en cours...";
    
    // On prépare les données à envoyer
    const params = new URLSearchParams({
        nom: document.getElementById('searchInput').value,
        ville: document.getElementById('locationInput').value,
        statut: document.getElementById('statusSelect').value
    });

    try {
        // Appel à Make (Méthode simplifiée pour éviter les erreurs de connexion)
        const response = await fetch(`${MAKE_WEBHOOK_URL}?${params.toString()}`);

        if (response.ok) {
            const results = await response.json();
            resultsCountDiv.textContent = `${results.length} enregistrements trouvés`;
            render(results); // On utilise votre fonction pour afficher les cartes
        } else {
            resultsCountDiv.textContent = "Le serveur Make ne répond pas (Erreur " + response.status + ")";
        }
    } catch (error) {
        console.error("Erreur:", error);
        resultsCountDiv.textContent = "Erreur de connexion : Vérifiez que Make est sur 'Run Once'";
    }
};

// 2. VOS FONCTIONS GRAPHIQUES (NE PAS CHANGER - GARDE VOTRE DESIGN)
function getCleanImgUrl(url) {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1];
        return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
}

function render(data) {
    const grid = document.getElementById('resultsGrid');
    if (!data || data.length === 0) {
        grid.innerHTML = "<p style='padding:20px; color:#64748b;'>Aucun résultat trouvé.</p>";
        return;
    }
    grid.innerHTML = data.map((item, index) => `
        <div class="card" onclick='showDetail(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
            <div class="card-status ${item.Etat === 'Occupé' ? 'status-occupied' : 'status-free'}">
                ${item.Etat || 'N/A'}
            </div>
            <div class="card-body">
                <h3>${item['prénom nom'] || 'Anonyme'}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${item['Ville de naissance'] || 'Lieu non renseigné'}</p>
                <div class="card-meta">
                    <span>ID: ${item.ID || index}</span>
                    <span><i class="far fa-calendar-alt"></i> ${item['Année de décès'] || '-'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showDetail(item) {
    const modalData = document.getElementById('modalData');
    const lat = parseFloat(item.Latitude);
    const lng = parseFloat(item.Longitude);

    document.getElementById('ficheNom').textContent = item['prénom nom'] || "Détails de la fiche";
    
    modalData.innerHTML = `
        <div class="info-row"><i class="fas fa-id-card"></i><div><label>État</label><span>${item.Etat}</span></div></div>
        <div class="info-row"><i class="fas fa-birthday-cake"></i><div><label>Naissance</label><span>${item['Ville de naissance'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-cross"></i><div><label>Décès</label><span>${item['Année de décès'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-info-circle"></i><div><label>Observations</label><span>${item.Observations || 'Aucune'}</span></div></div>
    `;

    const photoContainer = document.getElementById('modalPhoto');
    const imgUrl = getCleanImgUrl(item.Photo);
    photoContainer.innerHTML = imgUrl ? `<img src="${imgUrl}" style="width:100%; border-radius:15px;">` : `<div style="padding:40px; text-align:center; color:#cbd5e1;"><i class="fas fa-camera fa-3x"></i><p>Aucune photo</p></div>`;

    document.getElementById('detailModal').style.display = "block";

    setTimeout(() => {
        if (map) { map.remove(); map = null; }
        if (!isNaN(lat) && !isNaN(lng)) {
            map = L.map('map').setView([lat, lng], 19);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([lat, lng]).addTo(map);
            map.invalidateSize();
        }
    }, 450);
}

document.querySelector('.close
