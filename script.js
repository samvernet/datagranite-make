const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cjlifl1ls08yxy51u7dgodf5ue5qowoo';

let allData = []; 
let map = null;

// Gestion de la recherche via Make
document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resultsCountDiv = document.getElementById('resultsCount');
    resultsCountDiv.textContent = "Recherche en cours...";
    
    const searchData = {
        nom: document.getElementById('searchInput').value,
        ville: document.getElementById('locationInput').value,
        statut: document.getElementById('statusSelect').value
    };

    try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        if (response.ok) {
            const results = await response.json();
            resultsCountDiv.textContent = `${results.length} enregistrements trouvés`;
            render(results); 
        } else {
            resultsCountDiv.textContent = "Le serveur Make a répondu avec une erreur";
        }
    } catch (error) {
        console.error("Erreur détaillée:", error);
        resultsCountDiv.textContent = "Erreur de connexion au serveur";
    }
};

// --- EN DESSOUS, GARDEZ VOS FONCTIONS render(), showDetail() et getCleanImgUrl() ---

// Fonction de rendu (inchangée pour garder votre graphisme)
function render(data) {
    const grid = document.getElementById('resultsGrid');
    if (!data || data.length === 0) {
        grid.innerHTML = "<p style='padding:20px;'>Aucun résultat trouvé.</p>";
        return;
    }
    grid.innerHTML = data.map((item, index) => `
        <div class="card" onclick="showDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})">
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

// Gestion de la recherche via Make
document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resultsCountDiv = document.getElementById('resultsCount');
    resultsCountDiv.textContent = "Recherche en cours...";
    
    // Récupération des valeurs des champs
    const searchData = {
        nom: document.getElementById('searchInput').value,
        ville: document.getElementById('locationInput').value,
        statut: document.getElementById('statusSelect').value
    };

    try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchData)
        });

        if (response.ok) {
            const results = await response.json();
            resultsCountDiv.textContent = `${results.length} enregistrements trouvés`;
            render(results); // Utilise votre fonction de rendu existante
        } else {
            resultsCountDiv.textContent = "Erreur lors de la recherche";
        }
    } catch (error) {
        console.error("Erreur Make:", error);
        resultsCountDiv.textContent = "Erreur de connexion au serveur";
    }
};

// --- GARDEZ VOS FONCTIONS EXISTANTES CI-DESSOUS (getCleanImgUrl, showDetail, etc.) ---
function getCleanImgUrl(url) {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1];
        return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
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

document.querySelector('.close-btn').onclick = () => { document.getElementById('detailModal').style.display = "none"; };

window.onclick = (e) => { if (e.target == document.getElementById('detailModal')) { document.getElementById('detailModal').style.display = "none"; } };
