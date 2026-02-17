
import { initAuth } from './auth.js';
import { initUI } from './ui.js';
import { initDashboard } from './dashboard.js';
import { initPdfUtils } from './pdf-utils.js';
import { initMaterials } from './materials.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dayjs (wrapped in try-catch to prevent crash)
    try {
        if (typeof dayjs !== 'undefined') {
            dayjs.extend(dayjs_plugin_relativeTime);
            dayjs.locale('id');
        }
    } catch (e) {
        console.warn('dayjs initialization failed:', e);
    }

    // Initialize Modules
    // Initialize Modules
    try { initAuth(); } catch (e) { console.error('Auth init failed:', e); }
    try { initUI(); } catch (e) { console.error('UI init failed:', e); }
    try { initDashboard(); } catch (e) { console.error('Dashboard init failed:', e); }
    try { initPdfUtils(); } catch (e) { console.error('PDF Utils init failed:', e); }
    try { initMaterials(); } catch (e) { console.error('Materials init failed:', e); }

    // Safety timeout: hide loading overlay after 5 seconds
    setTimeout(() => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            console.warn('Loading overlay forced hidden due to timeout');
            overlay.classList.add('hidden');
        }
    }, 5000);
});
