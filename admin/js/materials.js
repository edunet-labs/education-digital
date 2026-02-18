
import { getAllMaterials, getMaterialsByAuthor, addMaterial, updateMaterial, deleteMaterial } from '../../src/supabase/repository.js';
import { uploadFile, deleteFileByUrl } from '../../src/supabase/storage.js';
import { onAuthChange } from '../../src/supabase/auth.js';
import { getUserRole } from '../../src/supabase/users.js';
import { showToast, showConfirm, hideLoading } from './ui.js';

let allMaterials = [];
let isEditing = false;
let currentUser = null;
let currentUserRole = null;

let currentSearch = '';
let currentFilterClass = 'all';

// Initialize Materials Module
export function initMaterials() {
    const materialForm = document.getElementById('materialForm');
    if (!materialForm) return;

    // Search and Filter Listeners
    const searchInput = document.getElementById('searchMaterial');
    const filterSelect = document.getElementById('filterClass');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            filterMaterials();
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilterClass = e.target.value;
            filterMaterials();
        });
    }

    // Listen for Auth Changes to load data based on user role
    onAuthChange(async (user) => {
        if (user) {
            currentUser = user;
            const roleData = await getUserRole(user.id);
            currentUserRole = roleData ? roleData.role : 'admin';

            // Initial Load
            loadMaterials();
        }
    });

    // Event Listeners
    materialForm.addEventListener('submit', handleMaterialSubmit);
    document.getElementById('cancelBtn')?.addEventListener('click', resetForm);

    // Initialize File Inputs
    initFileInput('pdfFile', 'pdfFileName');
    initFileInput('jobsheetFile', 'jobsheetFileName');
    initFileInput('essayPdfFile', 'essayPdfFileName');
}

function initFileInput(inputId, displayId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    if (input && display) {
        input.addEventListener('change', function () {
            if (this.files.length > 0) {
                display.textContent = this.files[0].name;
                display.style.color = 'var(--text-primary)';
            } else {
                display.textContent = inputId.includes('pdf') ? 'Pilih file PDF...' : 'Pilih file Jobsheet...';
                display.style.color = 'var(--text-muted)';
            }
        });
    }
}

// Load Materials
async function loadMaterials() {
    if (!currentUser) return;

    try {
        // Super Admin sees ALL materials, Admin sees ONLY THEIR OWN
        if (currentUserRole === 'superadmin') {
            allMaterials = await getAllMaterials();
        } else {
            allMaterials = await getMaterialsByAuthor(currentUser.id);
        }

        renderMaterials(allMaterials);
        updateStats(allMaterials);

        // Apply initial filter (if any)
        filterMaterials();
    } catch (error) {
        console.error('Error loading materials:', error);
        showToast('Gagal memuat materi', 'error');
    }
}

// Render Materials Table
function renderMaterials(materials) {
    const listContainer = document.getElementById('materialsList');
    const countBadge = document.getElementById('materialsCount');

    if (!listContainer) return;

    if (countBadge) countBadge.textContent = `${materials.length} materi`;

    if (materials.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>Belum ada materi ${currentUserRole === 'admin' ? 'milik Anda' : ''}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    listContainer.innerHTML = materials.map(m => `
        <tr>
            <td data-label="Judul">
                <div style="font-weight: 600; color: var(--text-primary);">${m.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                    ${m.modul || '-'} • ${m.durasi} menit • ${m.tingkat}
                </div>
            </td>
            <td data-label="Kelas">
                ${(() => {
            const kelas = m.kelas;
            let badgeClass = 'badge-secondary';
            if (kelas == 10) badgeClass = 'badge-purple';
            else if (kelas == 11) badgeClass = 'badge-yellow';
            else if (kelas == 12) badgeClass = 'badge-orange';
            return `<span class="badge ${badgeClass}">Kelas ${kelas}</span>`;
        })()}
            </td>
            <td data-label="Spesialisasi">
                ${m.spesialisasi ? (() => {
            const spec = m.spesialisasi;
            let badgeClass = 'badge-secondary';
            if (spec === 'AIJ') badgeClass = 'badge-green';
            else if (spec === 'ASJ') badgeClass = 'badge-blue';
            else if (spec === 'KJ') badgeClass = 'badge-red';
            return `<span class="badge ${badgeClass}">${spec}</span>`;
        })() : '-'}
            </td>
            <td data-label="Tanggal">
                <div style="font-size: 0.85rem; color: var(--text-primary);">
                    ${m.created_at ? dayjs(m.created_at).format('DD MMM YYYY, HH:mm') : '-'}
                </div>
                ${m.updated_at && m.updated_at !== m.created_at ?
            `<div style="font-size: 0.75rem; color: var(--text-muted);">Updated: ${dayjs(m.updated_at).fromNow()}</div>`
            : ''}
            </td>
            <td data-label="Aksi">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon" onclick="editMaterial('${m.id}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteMaterialItem('${m.id}')" title="Hapus">
                        <i class="bi bi-trash"></i>
                    </button>
                    <a href="/pages/materi.html?id=${m.id}" target="_blank" class="btn-icon" title="Lihat">
                        <i class="bi bi-eye"></i>
                    </a>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter Materials
function filterMaterials() {
    let filtered = allMaterials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(currentSearch);
        const matchesClass = currentFilterClass === 'all' || m.kelas.toString() === currentFilterClass;
        return matchesSearch && matchesClass;
    });

    renderMaterials(filtered);
}

// Update Stats
function updateStats(materials) {
    const totalMaterials = document.getElementById('totalMaterials');
    const totalKelas = document.getElementById('totalKelas');
    const totalSpesialisasi = document.getElementById('totalSpesialisasi');

    if (totalMaterials) totalMaterials.textContent = materials.length;
    // Keep static/logic-based values for others if needed, or calculate unique
    if (totalKelas) {
        const uniqueClasses = new Set(materials.map(m => m.kelas));
        totalKelas.textContent = uniqueClasses.size || 3;
    }
    if (totalSpesialisasi) {
        const uniqueSpecs = new Set(materials.map(m => m.spesialisasi).filter(Boolean));
        totalSpesialisasi.textContent = uniqueSpecs.size || 3;
    }
}

// Handle Submit (Create/Update)
async function handleMaterialSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const originalText = document.getElementById('submitText').textContent;
    const originalIcon = submitBtn.querySelector('i').className;

    // Disable form
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

    // Show Progress Bar
    const progressWrapper = document.getElementById('uploadProgressWrapper');
    const progressBar = document.getElementById('uploadProgress');
    const statusText = document.getElementById('uploadStatus');

    if (progressWrapper) progressWrapper.style.display = 'block';

    try {
        // Collect Data
        const formData = {
            title: document.getElementById('title').value,
            kelas: parseInt(document.getElementById('kelas').value),
            spesialisasi: document.getElementById('spesialisasi').value || null,
            modul: document.getElementById('modul').value,
            durasi: parseInt(document.getElementById('durasi').value),
            tingkat: document.getElementById('tingkat').value,
            deskripsi: document.getElementById('deskripsi').value,
            konten: document.getElementById('konten').value,
            videourl: document.getElementById('videoUrl').value,
            // Hidden inputs for quiz/urls might be populated
            quiz_data: document.getElementById('quizData').value ? JSON.parse(document.getElementById('quizData').value) : null,
            pdfurl: document.getElementById('pdfUrl').value,
            jobsheeturl: document.getElementById('jobsheetUrl').value,
            essay_pdf_url: document.getElementById('essayPdfUrl').value,
            created_by: currentUser?.id // Use created_by instead of user_id to match schema
        };

        // Handle File Uploads
        const pdfFile = document.getElementById('pdfFile').files[0];
        const jobsheetFile = document.getElementById('jobsheetFile').files[0];
        const essayPdfFile = document.getElementById('essayPdfFile').files[0];

        // Helper to update progress
        const updateProgress = (width, text) => {
            if (progressBar) progressBar.style.width = width;
            if (statusText) statusText.textContent = text;
        }

        // Upload PDF
        if (pdfFile) {
            updateProgress('30%', 'Mengupload PDF Modul...');
            const result = await uploadFile(pdfFile, `materials/${Date.now()}_${pdfFile.name}`);
            if (!result.success) throw new Error('Gagal upload PDF: ' + result.error);
            formData.pdfurl = result.url;
        }

        // Upload Jobsheet
        if (jobsheetFile) {
            updateProgress('60%', 'Mengupload Jobsheet...');
            const result = await uploadFile(jobsheetFile, `jobsheets/${Date.now()}_${jobsheetFile.name}`);
            if (!result.success) throw new Error('Gagal upload Jobsheet: ' + result.error);
            formData.jobsheeturl = result.url;
        }

        // Upload Essay PDF
        if (essayPdfFile) {
            updateProgress('80%', 'Mengupload Soal Essay...');
            const result = await uploadFile(essayPdfFile, `essays/${Date.now()}_${essayPdfFile.name}`);
            if (!result.success) throw new Error('Gagal upload Essay: ' + result.error);
            formData.essay_pdf_url = result.url;
        }

        updateProgress('90%', 'Menyimpan Data...');

        // Save to DB
        let result;
        if (isEditing) {
            const id = document.getElementById('editId').value;
            result = await updateMaterial(id, formData);
        } else {
            result = await addMaterial(formData);
        }

        if (result.success) {
            showToast(`Materi berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`, 'success');
            resetForm();
            loadMaterials();
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Submit Error:', error);
        showToast('Gagal menyimpan materi: ' + error.message, 'error');
    } finally {
        // Reset UI
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="${originalIcon}"></i> <span id="submitText">${originalText}</span>`;
        if (progressWrapper) progressWrapper.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
    }
}

// Global Edit Handler
window.editMaterial = async (id) => {
    const material = allMaterials.find(m => m.id === id);
    if (!material) return;

    isEditing = true;
    document.getElementById('editId').value = id;
    document.getElementById('formTitle').textContent = 'Edit Materi';
    document.getElementById('submitText').textContent = 'Update Materi';
    document.getElementById('cancelBtn').style.display = 'inline-flex';
    document.querySelector('#submitBtn i').className = 'bi bi-save';

    // Populate Fields
    const el = (id) => document.getElementById(id);
    if (el('title')) el('title').value = material.title || '';
    if (el('kelas')) el('kelas').value = material.kelas || '';
    if (el('spesialisasi')) el('spesialisasi').value = material.spesialisasi || '';
    if (el('modul')) el('modul').value = material.modul || '';
    if (el('durasi')) el('durasi').value = material.durasi || '';
    if (el('tingkat')) el('tingkat').value = material.tingkat || '';
    if (el('deskripsi')) el('deskripsi').value = material.deskripsi || '';
    if (el('konten')) el('konten').value = material.konten || '';
    if (el('videoUrl')) el('videoUrl').value = material.videourl || '';
    if (el('pdfUrl')) el('pdfUrl').value = material.pdfurl || '';
    if (el('jobsheetUrl')) el('jobsheetUrl').value = material.jobsheeturl || '';
    if (el('essayPdfUrl')) el('essayPdfUrl').value = material.essay_pdf_url || '';

    // Quiz Data
    if (material.quiz_data) {
        if (el('quizData')) el('quizData').value = JSON.stringify(material.quiz_data);
        if (el('quizStats')) el('quizStats').textContent = `${material.quiz_data.length} Soal tersimpan`;
        if (el('quizPreview')) el('quizPreview').style.display = 'block';
    }

    // Scroll to form
    document.querySelector('.dashboard').scrollTo({ top: 0, behavior: 'smooth' });
};

// Global Delete Handler
window.deleteMaterialItem = async (id) => {
    const confirmed = await showConfirm('Yakin ingin menghapus materi ini?', {
        title: 'Hapus Materi',
        type: 'danger',
        confirmText: 'Ya, Hapus'
    });

    if (confirmed) {
        try {
            // Optional: Delete files from storage if we track them
            // const material = allMaterials.find(m => m.id === id);
            // if (material.pdfurl) await deleteFileByUrl(material.pdfurl);
            // if (material.jobsheeturl) await deleteFileByUrl(material.jobsheeturl);

            const result = await deleteMaterial(id);
            if (result.success) {
                showToast('Materi berhasil dihapus', 'success');
                loadMaterials();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Delete Error:', error);
            showToast('Gagal menghapus: ' + error.message, 'error');
        }
    }
};

// Reset Form
function resetForm() {
    isEditing = false;
    const el = (id) => document.getElementById(id);

    const materialForm = el('materialForm');
    if (materialForm) materialForm.reset();

    if (el('editId')) el('editId').value = '';
    if (el('formTitle')) el('formTitle').textContent = 'Tambah Materi Baru';
    if (el('submitText')) el('submitText').textContent = 'Simpan Materi';
    if (el('cancelBtn')) el('cancelBtn').style.display = 'none';

    const submitIcon = document.querySelector('#submitBtn i');
    if (submitIcon) submitIcon.className = 'bi bi-plus-lg';

    // Reset file displays
    if (el('pdfFileName')) el('pdfFileName').textContent = 'Pilih file PDF...';
    if (el('jobsheetFileName')) el('jobsheetFileName').textContent = 'Pilih file Jobsheet...';
    if (el('essayPdfFileName')) el('essayPdfFileName').textContent = 'Pilih file Essay...';
    if (el('quizFileName')) el('quizFileName').textContent = 'Pilih file Soal PDF...';

    // Reset hidden URLs and Quiz
    if (el('pdfUrl')) el('pdfUrl').value = '';
    if (el('jobsheetUrl')) el('jobsheetUrl').value = '';
    if (el('essayPdfUrl')) el('essayPdfUrl').value = '';
    if (el('quizData')) el('quizData').value = '';
    if (el('quizPreview')) el('quizPreview').style.display = 'none';

    // Reset Progress
    if (el('uploadProgressWrapper')) el('uploadProgressWrapper').style.display = 'none';
    if (el('uploadProgress')) el('uploadProgress').style.width = '0%';
}
