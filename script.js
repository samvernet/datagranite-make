const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cjlifl1ls08yxy51u7dgodf5ue5qowoo';

let allData = []; 
let map = null;

// 1. GESTION DE LA RECHERCHE (Connexion Make)
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
            resultsCountDiv.textContent = "Le serveur Make ne répond pas (Erreur " + response.status + ")";
        }
    } catch (error) {
        console.error("Erreur:", error);
        resultsCountDiv.textContent = "Erreur de connexion : Vérifiez que Make est sur 'Run Once'";
    }
};

// 2. FONCTION POUR NETTOYER LES LIENS PHOTOS (Google Drive ou Direct)
function getCleanImgUrl(url) {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1];
        return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
}

// 3. AFFICHAGE DES CARTES (Utilise vos noms de colonnes exacts)
function render(data) {
    const grid = document.getElementById('resultsGrid');
    if (!data || data.length === 0) {
        grid.innerHTML = "<p style='padding:20px; color:#64748b;'>Aucun résultat trouvé.</p>";
        return;
    }
    grid.innerHTML = data.map((item, index) => `
        <div class="card" onclick='showDetail(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
            <div class="card-status ${item['Etat de la stèle'] === 'Occupé' ? 'status-occupied' : 'status-free'}">
                ${item['Etat de la stèle'] || 'N/A'}
            </div>
            <div class="card-body">
                <h3>${item['prénom nom'] || 'Anonyme'}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${item['Ville de naissance'] || 'Lieu non renseigné'}</p>
                <div class="card-meta">
                    <span>ID: ${item.fid || index}</span>
                    <span><i class="far fa-calendar-alt"></i> ${item['Date de décés'] || '-'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. AFFICHAGE DE LA FICHE DÉTAILLÉE ET CARTE
function showDetail(item) {
    const modalData = document.getElementById('modalData');
    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Long);

    document.getElementById('ficheNom').textContent = item['prénom nom'] || "Détails de la fiche";
    
    modalData.innerHTML = `
        <div class="info-row"><i class="fas fa-id-card"></i><div><label>État</label><span>${item['Etat de la stèle'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-birthday-cake"></i><div><label>Naissance</label><span>${item['Ville de naissance'] || '-'} (${item['Date de naissance'] || '-'})</span></div></div>
        <div class="info-row"><i class="fas fa-cross"></i><div><label>Décès</label><span>${item['Date de décés'] || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-map-signs"></i><div><label>Emplacement</label><span>Section ${item.Section || '-'}, Rangée ${item.Rangée || '-'}</span></div></div>
        <div class="info-row"><i class="fas fa-clock"></i><div><label>Concession</label><span>${item['Type de concession'] || '-'} (Reste : ${item['Temps restant'] || '-'})</span></div></div>
    `;

    const photoContainer = document.getElementById('modalPhoto');
    const imgUrl = getCleanImgUrl(item['Url photo stèle']);
    
    photoContainer.innerHTML = imgUrl ?
