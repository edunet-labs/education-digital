// Card Renderer Utility
// Renders material cards dynamically from Firestore data

/**
 * Render a single material card
 * @param {Object} material - Material object from Firestore
 * @returns {string} HTML string
 */
export function renderCard(material) {
    return `
        <a href="/pages/materi.html?id=${material.id}" class="material-card">
            <div class="material-icon">
                <i class="${material.icon || 'bi bi-book'}"></i>
            </div>
            <h3 class="material-title">${material.title}</h3>
            <p class="material-desc">${material.deskripsi}</p>
            <div class="material-meta">
                <span class="material-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Baca Materi
                </span>
                ${material.videoUrl ? `
                    <span class="material-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Video
                    </span>
                ` : ''}
            </div>
        </a>
    `;
}

/**
 * Render grid of material cards
 * @param {Array} materials - Array of material objects
 * @param {HTMLElement} container - Container element
 */
export function renderGrid(materials, container) {
    if (!container) return;

    if (materials.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.5;"></i>
                <p style="margin-top: 1rem;">Belum ada materi untuk kategori ini</p>
            </div>
        `;
        return;
    }

    container.innerHTML = materials.map(m => renderCard(m)).join('');
}

/**
 * Render materials grouped by specialization (for Class 11 & 12)
 * @param {Array} materials - Array of material objects
 * @param {Object} containers - Object with AIJ, ASJ, KJ container elements
 */
export function renderBySpecialization(materials, containers) {
    const grouped = {
        AIJ: materials.filter(m => m.spesialisasi === 'AIJ'),
        ASJ: materials.filter(m => m.spesialisasi === 'ASJ'),
        KJ: materials.filter(m => m.spesialisasi === 'KJ'),
        general: materials.filter(m => !m.spesialisasi)
    };

    if (containers.AIJ) renderGrid(grouped.AIJ, containers.AIJ);
    if (containers.ASJ) renderGrid(grouped.ASJ, containers.ASJ);
    if (containers.KJ) renderGrid(grouped.KJ, containers.KJ);
    if (containers.general) renderGrid(grouped.general, containers.general);
}
