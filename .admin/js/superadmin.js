
import { onAuthChange, signOut, createNewUser } from '../../src/supabase/auth.js';
import { getUserRole, setUserRole, getAllAdmins, deleteAdminRole } from '../../src/supabase/users.js';
import { initUI, showToast, hideLoading, showConfirm } from './ui.js';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const adminForm = document.getElementById('adminForm');
const adminsList = document.getElementById('adminsList');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initSuperAdmin();
});

function initSuperAdmin() {
    // Auth Check
    onAuthChange(async (user) => {
        if (!user) {
            window.location.href = '/.admin/login.html';
            return;
        }

        const userData = await getUserRole(user.id);
        if (!userData || userData.role !== 'superadmin') {
            window.location.href = '/.admin/login.html';
            return;
        }

        if (userName) userName.textContent = userData.name || user.email;
        if (userAvatar) userAvatar.textContent = (userData.name || user.email).charAt(0).toUpperCase();

        hideLoading();
        loadAdmins();
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/.admin/login.html';
        });
    }

    // Form Submit
    if (adminForm) {
        adminForm.addEventListener('submit', handleAddAdmin);
    }
}

async function loadAdmins() {
    try {
        const admins = await getAllAdmins();
        renderAdmins(admins);
        updateStats(admins);
    } catch (error) {
        console.error('Error loading admins:', error);
        showToast('Gagal memuat data admin', 'error');
    }
}

function updateStats(admins) {
    const totalAdmins = document.getElementById('totalAdmins');
    const totalSuperAdmins = document.getElementById('totalSuperAdmins');
    const adminsCount = document.getElementById('adminsCount');

    const superAdminCount = admins.filter(a => a.role === 'superadmin').length;
    const adminCount = admins.filter(a => a.role === 'admin').length;

    if (totalSuperAdmins) totalSuperAdmins.textContent = superAdminCount;
    if (totalAdmins) totalAdmins.textContent = adminCount;
    if (adminsCount) adminsCount.textContent = `${admins.length} admin`;
}

function renderAdmins(admins) {
    if (!adminsList) return;

    if (admins.length === 0) {
        adminsList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-people"></i>
                <p>Belum ada admin</p>
            </div>
        `;
        return;
    }

    adminsList.innerHTML = admins.map(admin => `
        <div class="admin-item">
            <div class="admin-info">
                <div class="admin-avatar ${admin.role}">
                    ${(admin.name || admin.email || '?').charAt(0).toUpperCase()}
                </div>
                <div class="admin-details">
                    <div class="admin-name">
                        ${admin.name || 'Admin'}
                        ${admin.role === 'superadmin' ? '<span class="badge badge-orange">Super Admin</span>' : '<span class="badge badge-blue">Admin</span>'}
                    </div>
                    <div class="admin-email">${admin.email}</div>
                </div>
            </div>
            ${admin.email !== 'superadmin@edunet.local' ? `
                <button class="delete-btn" onclick="deleteAdmin('${admin.id}')" title="Hapus Akses">
                    <i class="bi bi-trash"></i>
                </button>
            ` : ''}
        </div>
    `).join('');
}

async function handleAddAdmin(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menambahkan...';

    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const role = 'admin'; // Always admin, never supadmin again

    try {
        // Create user
        const result = await createNewUser(email, password);

        if (result.success && result.user) {
            const user = result.user;

            // Set role
            const roleResult = await setUserRole(user.id, {
                email: email,
                username: email.split('@')[0],
                role: role,
                name: name
            });

            if (roleResult.success) {
                showToast('Berhasil menambahkan Admin baru!', 'success');
                adminForm.reset();
                loadAdmins();
            } else {
                showToast('User created but failed to set role: ' + roleResult.error, 'warning');
            }

        } else {
            showToast('Gagal menambahkan admin: ' + (result.error?.message || result.error), 'error');
        }

    } catch (error) {
        console.error('Add Admin Error:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Global scope for onclick
window.deleteAdmin = async (id) => {
    const confirmed = await showConfirm('Yakin ingin menghapus akses admin ini?', {
        title: 'Hapus Admin',
        confirmText: 'Ya, Hapus',
        cancelText: 'Batal',
        type: 'danger'
    });

    if (confirmed) {
        try {
            const result = await deleteAdminRole(id);
            if (result.success) {
                showToast('Akses admin berhasil dihapus', 'success');
                loadAdmins();
            } else {
                showToast('Gagal menghapus: ' + (result.error?.message || result.error), 'error');
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
};
