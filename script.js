const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cavxth4is4u9urs2g14lked6ib331d7v';

let map = null;

// GESTION DU FORMULAIRE
document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resultsCountDiv = document.getElementById('resultsCount');
    resultsCountDiv.textContent = "Recherche en cours...";
    
    const params = new URLSearchParams({
        nom: document.getElementById('searchInput').value,
        ville: document.getElementById('locationInput').value,
        statut: document.getElementById('statusSelect').value
    });

    try {
        const response = await fetch(`${MAKE_WEBHOOK_URL}?${params.toString()}`);

        if (response.ok) {
            const results = await response.json();
            resultsCountDiv.textContent = `${results.length} enregistrements trouvés`;
            render(results); 
        } else {
            resultsCountDiv.textContent = "Erreur : Le serveur Make ne répond pas correctement.";
        }
    } catch (error) {
        resultsCountDiv.textContent = "Connexion impossible : Vérifiez que le scénario Make est sur 'Run Once'.";
    }
};

// AFFICHAGE DES CARTES
function render(data) {
    const grid = document.getElementById('resultsGrid');
    if (!data || data.length === 0) {
        grid.innerHTML = "<p style='padding:20px;'>Aucun résultat trouvé.</p>";
        return;
    }
    grid.innerHTML = data.map((item, index) => `
        <div class="card" onclick='showDetail(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
            <div class="card-status ${item['Etat de la stèle'] === 'Occupé' ? 'status-occupied' : 'status-free'}">
                ${item['Etat de la stèle'] || 'Libre'}
            </div>
            <div class="card-body">
                <h3>${item['prénom nom'] || 'Nom inconnu'}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${item['Ville de naissance'] || 'Lieu non renseigné'}</p>
                <div class="card-meta">
                    <span>ID: ${item.fid || index}</span>
                    <span><i class="far fa-calendar-alt"></i> ${item['Date de décés'] || '-'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// AFFICHAGE DES DÉTAILS
function showDetail(item) {
    const modalData = document.getElementById('modalData');
    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Long);

    document.getElementById('ficheNom').textContent = item['prénom nom'] || "Détails";
    
    modalData.innerHTML = `
        <div class="info-row"><i class="fas fa-id-card"></i><div><label>État</label><span>${item['Etat de la stèle'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-birthday-cake"></i><div><label>Naissance</label><span>${item['Ville de naissance'] || '-'} (${item['Date de naissance'] || '-'})</span></div></div>
        <div class="info-row"><i class="fas fa-cross"></i><div><label>Décès</label><span>${item['Date de décés'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-map-signs"></i><div><label>Emplacement</label><span>Section ${item.Section || '-'}, Rangée ${item.Rangée || '-'}</span></div></div>
    `;

    const photoContainer = document.getElementById('modalPhoto');
    const imgUrl = item['Url photo stèle'];
    
    photoContainer.innerHTML = imgUrl ? 
        `<img src="${imgUrl}" style="width:100%; border-radius:15px;">` : 
        `<div style="padding:40px; text-align:center;"><i class="fas fa-camera fa-3x"></i><p>Pas de photo</p></div>`;

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

