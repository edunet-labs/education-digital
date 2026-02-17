
import { getAllMaterials } from '../../src/supabase/repository.js';

export async function initDashboard() {
    const totalMaterialsEl = document.getElementById('totalMaterials');
    const totalKelasEl = document.getElementById('totalKelas');
    const totalSpesialisasiEl = document.getElementById('totalSpesialisasi');
    const materialsCountEl = document.getElementById('materialsCount');

    if (!totalMaterialsEl) return; // Not on a page with dashboard stats

    try {
        const materials = await getAllMaterials();

        // Update Total Materials
        totalMaterialsEl.textContent = materials.length;
        if (materialsCountEl) materialsCountEl.textContent = `${materials.length} materi`;

        // Calculate Stats
        const uniqueKelas = new Set(materials.map(m => m.kelas)).size;
        const uniqueSpesialisasi = new Set(materials.map(m => m.spesialisasi).filter(s => s)); // Filter null/empty

        if (totalKelasEl) totalKelasEl.textContent = Math.max(3, uniqueKelas); // Min 3 (10, 11, 12)
        if (totalSpesialisasiEl) totalSpesialisasiEl.textContent = Math.max(3, uniqueSpesialisasi.size || 0);

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}
