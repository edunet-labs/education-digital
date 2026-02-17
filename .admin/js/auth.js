
import { onAuthChange, signOut } from '../../src/supabase/auth.js';
import { getUserRole } from '../../src/supabase/users.js';

export function initAuth() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');

    onAuthChange(async (user) => {
        if (!user) {
            window.location.href = '/.admin/login.html';
            return;
        }

        const userData = await getUserRole(user.id);
        if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
            window.location.href = '/.admin/login.html';
            return;
        }

        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        if (userName) userName.textContent = userData.name || user.email;
        if (userRole) userRole.textContent = userData.role === 'superadmin' ? 'Super Admin' : 'Admin';
        if (userAvatar) userAvatar.textContent = (userData.name || user.email).charAt(0).toUpperCase();

        // Show/Hide Super Admin links
        if (userData.role === 'superadmin') {
            document.querySelectorAll('.super-admin-only').forEach(el => el.style.display = 'flex');
            const avatar = document.querySelector('.user-avatar');
            if (avatar) avatar.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
        }

        // Trigger event for other modules
        document.dispatchEvent(new CustomEvent('auth-ready', { detail: { user, userData } }));
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/.admin/login.html';
        });
    }
}
