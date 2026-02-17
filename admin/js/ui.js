
// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const toast = document.getElementById('toast');
const loadingOverlay = document.getElementById('loadingOverlay');

export function initUI() {
    // Mobile menu toggle
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('show');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }

    // Sidebar close button (mobile)
    if (sidebarClose && sidebar && sidebarOverlay) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }

    // File input change handlers (Global)
    document.querySelectorAll('.file-input').forEach(input => {
        input.addEventListener('change', function () {
            const display = this.parentElement.querySelector('.file-input-display');
            const fileNameSpan = display.querySelector('span') || display;

            // If it has a specific ID for the filename span, use that
            if (this.id === 'pdfFile') {
                document.getElementById('pdfFileName').textContent = this.files[0]?.name || 'Pilih file PDF...';
            } else if (this.id === 'jobsheetFile') {
                document.getElementById('jobsheetFileName').textContent = this.files[0]?.name || 'Pilih file Jobsheet...';
            } else if (display.tagName === 'DIV' && !display.querySelector('span')) {
                // Fallback for simple inputs if any
                display.innerHTML = this.files[0] ?
                    `<i class="bi bi-file-earmark-text"></i> ${this.files[0].name}` :
                    `<i class="bi bi-upload"></i> Pilih file...`;
            }

            if (this.files[0]) {
                display.classList.add('has-file');
            } else {
                display.classList.remove('has-file');
            }
        });
    });

    // ===== Admin Theme Toggle =====
    initAdminTheme();
}

/**
 * Admin Panel Dark/Light theme toggle
 */
function initAdminTheme() {
    const toggleBtn = document.getElementById('adminThemeToggle');
    if (!toggleBtn) return;

    const updateToggleUI = () => {
        const current = document.documentElement.getAttribute('data-admin-theme') || 'dark';
        const icon = toggleBtn.querySelector('i');
        const label = toggleBtn.querySelector('span');

        if (current === 'dark') {
            if (icon) icon.className = 'bi bi-sun';
            if (label) label.textContent = 'Mode Terang';
        } else {
            if (icon) icon.className = 'bi bi-moon-stars';
            if (label) label.textContent = 'Mode Gelap';
        }
    };

    // Set initial UI
    updateToggleUI();

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-admin-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-admin-theme', next);
        localStorage.setItem('admin-theme', next);
        updateToggleUI();
    });
}

export function showToast(message, type = 'success') {
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

export function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

export function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

/**
 * Custom confirm modal — replaces native confirm() dialog
 * @param {string} message - The confirmation message
 * @param {object} options - Optional config
 * @param {string} options.title - Modal title (default: 'Konfirmasi')
 * @param {string} options.confirmText - Confirm button text (default: 'Hapus')
 * @param {string} options.cancelText - Cancel button text (default: 'Batal')
 * @param {string} options.type - 'danger' or 'warning' (default: 'danger')
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, options = {}) {
    const {
        title = 'Konfirmasi',
        confirmText = 'Hapus',
        cancelText = 'Batal',
        type = 'danger'
    } = options;

    return new Promise((resolve) => {
        // Remove existing modal if any
        const existing = document.getElementById('confirmModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.className = 'confirm-overlay';
        modal.innerHTML = `
            <div class="confirm-card">
                <div class="confirm-icon ${type}">
                    <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-circle'}"></i>
                </div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-btn cancel" id="confirmCancel">${cancelText}</button>
                    <button class="confirm-btn ${type}" id="confirmOk">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Trigger animation
        requestAnimationFrame(() => modal.classList.add('show'));

        const cleanup = (result) => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 200);
            resolve(result);
        };

        modal.querySelector('#confirmOk').addEventListener('click', () => cleanup(true));
        modal.querySelector('#confirmCancel').addEventListener('click', () => cleanup(false));

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cleanup(false);
        });

        // Close on Escape key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                cleanup(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}
