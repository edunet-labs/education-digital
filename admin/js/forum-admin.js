
import { forumRepository } from '../../src/supabase/forum.js';
import { showToast, showLoading, hideLoading, showConfirm, initUI } from './ui.js';
import { initAuth } from './auth.js';

let allTopics = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dayjs
    try {
        if (typeof dayjs !== 'undefined') {
            dayjs.extend(dayjs_plugin_relativeTime);
            dayjs.locale('id');
        }
    } catch (e) {
        console.warn('dayjs init failed:', e);
    }

    initAuth();
    initUI();
    initForumAdmin();
});

async function initForumAdmin() {
    showLoading();
    try {
        await loadTopics();
        setupSearch();
    } catch (error) {
        console.error('Error initializing forum admin:', error);
        showToast('Gagal memuat data forum', 'error');
    } finally {
        hideLoading();
    }
}

async function loadTopics() {
    try {
        allTopics = await forumRepository.getAllTopics();
        renderTopics(allTopics);
        updateStats(allTopics);
    } catch (error) {
        console.error('Error loading topics:', error);
        throw error;
    }
}

function updateStats(topics) {
    const totalTopicsEl = document.getElementById('totalTopics');
    const totalRepliesEl = document.getElementById('totalReplies');

    if (totalTopicsEl) totalTopicsEl.textContent = topics.length;

    if (totalRepliesEl) {
        const replyCount = topics.reduce((acc, topic) => {
            // Check if forum_replies is an array or object with count
            if (Array.isArray(topic.forum_replies)) {
                return acc + topic.forum_replies.length;
            } else if (topic.forum_replies && typeof topic.forum_replies[0]?.count === 'number') {
                // Supabase count query returns [{count: N}]
                return acc + topic.forum_replies[0].count;
            }
            // Fallback if count is directly on object (depends on query)
            return acc + (topic.reply_count || 0);
        }, 0);
        totalRepliesEl.textContent = replyCount;
    }
}

function renderTopics(topics) {
    const tbody = document.getElementById('topicsList');
    if (!tbody) return;

    if (topics.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>Tidak ada topik ditemukan</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = topics.map(topic => {
        // Calculate reply count safely
        let replyCount = 0;
        if (Array.isArray(topic.forum_replies)) {
            replyCount = topic.forum_replies.length;
        } else if (topic.forum_replies && typeof topic.forum_replies[0]?.count === 'number') {
            replyCount = topic.forum_replies[0].count;
        }

        return `
        <tr>
            <td data-label="Topik">
                <a href="/pages/forum.html?id=${topic.id}" target="_blank" style="font-weight: 600; color: var(--text-primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                    ${escapeHtml(topic.title)}
                    <i class="bi bi-box-arrow-up-right" style="font-size: 0.75em; opacity: 0.7;"></i>
                </a>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 300px;">
                    ${escapeHtml(topic.body)}
                </div>
            </td>
            <td data-label="Penulis">${escapeHtml(topic.author_name)}</td>
            <td data-label="Kategori"><span class="badge badge-blue">${escapeHtml(topic.category)}</span></td>
            <td data-label="Jumlah Balasan">${replyCount}</td>
            <td data-label="Dibuat">${dayjs(topic.created_at).fromNow()}</td>
            <td data-label="Aksi">
                <button class="btn-icon delete-btn" data-id="${topic.id}" title="Hapus Topik">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `}).join('');

    // Attach event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            await handleDeleteTopic(id);
        });
    });
}

async function handleDeleteTopic(id) {
    const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus topik ini? Semua balasan juga akan dihapus.', {
        title: 'Hapus Topik',
        confirmText: 'Ya, Hapus',
        type: 'danger'
    });

    if (confirmed) {
        showLoading();
        try {
            await forumRepository.deleteTopic(id);
            showToast('Topik berhasil dihapus', 'success');
            await loadTopics();
        } catch (error) {
            console.error('Error deleting topic:', error);
            showToast('Gagal menghapus topik', 'error');
        } finally {
            hideLoading();
        }
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchTopic');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allTopics.filter(topic =>
            topic.title.toLowerCase().includes(query) ||
            topic.body.toLowerCase().includes(query) ||
            topic.author_name.toLowerCase().includes(query)
        );
        renderTopics(filtered);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
