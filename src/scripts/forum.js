/* ======================================
   Forum System for Edunet
   LocalStorage-based discussion forum
   ====================================== */

// Forum Manager Class
class ForumManager {
    constructor() {
        this.storageKey = 'edunet_forum_data';
        this.init();
    }

    init() {
        // Load existing data or create sample data
        if (!localStorage.getItem(this.storageKey)) {
            this.createSampleData();
        }
    }

    createSampleData() {
        const sampleTopics = [
            {
                id: Date.now() + 1,
                title: 'Bagaimana cara konfigurasi VLAN di MikroTik?',
                body: 'Saya masih bingung dengan konsep VLAN dan bagaimana cara mengkonfigurasinya di MikroTik. Apakah ada yang bisa bantu jelaskan step by step?',
                author: 'Budi Santoso',
                category: 'Kelas 11',
                timestamp: Date.now() - 86400000 * 2,
                replies: [
                    {
                        id: 1,
                        author: 'Andi Pratama',
                        body: 'VLAN itu singkatan dari Virtual LAN. Fungsinya untuk memisahkan jaringan secara logis. Di MikroTik, kamu bisa setting di Bridge > VLAN.',
                        timestamp: Date.now() - 86400000
                    }
                ]
            },
            {
                id: Date.now() + 2,
                title: 'Rekomendasi sumber belajar Cyber Security?',
                body: 'Halo teman-teman, ada yang punya rekomendasi website atau channel YouTube untuk belajar cyber security dari dasar? Saya tertarik ambil konsentrasi KJ.',
                author: 'Siti Rahma',
                category: 'KJ',
                timestamp: Date.now() - 86400000 * 3,
                replies: []
            },
            {
                id: Date.now() + 3,
                title: 'Perbedaan Apache dan Nginx?',
                body: 'Kedua-duanya web server, tapi apa sih yang membedakan Apache dan Nginx? Mana yang lebih baik untuk production?',
                author: 'Dewa Putra',
                category: 'ASJ',
                timestamp: Date.now() - 86400000 * 5,
                replies: [
                    {
                        id: 1,
                        author: 'Rizki Ahmad',
                        body: 'Nginx lebih cepat untuk serving static files dan lebih ringan memory-nya. Apache lebih fleksibel dengan .htaccess.',
                        timestamp: Date.now() - 86400000 * 4
                    },
                    {
                        id: 2,
                        author: 'Maya Sari',
                        body: 'Setuju sama Rizki. Nginx cocok untuk high traffic, Apache lebih user-friendly untuk pemula.',
                        timestamp: Date.now() - 86400000 * 3
                    }
                ]
            }
        ];

        localStorage.setItem(this.storageKey, JSON.stringify(sampleTopics));
    }

    getAllTopics() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    getTopicById(id) {
        const topics = this.getAllTopics();
        return topics.find(topic => topic.id === parseInt(id));
    }

    addTopic(topicData) {
        const topics = this.getAllTopics();
        const newTopic = {
            id: Date.now(),
            title: topicData.title,
            body: topicData.body,
            author: topicData.author,
            category: topicData.category,
            timestamp: Date.now(),
            replies: []
        };
        topics.unshift(newTopic); // Add to beginning
        localStorage.setItem(this.storageKey, JSON.stringify(topics));
        return newTopic;
    }

    addReply(topicId, replyData) {
        const topics = this.getAllTopics();
        const topic = topics.find(t => t.id === parseInt(topicId));

        if (topic) {
            const newReply = {
                id: topic.replies.length + 1,
                author: replyData.author,
                body: replyData.body,
                timestamp: Date.now()
            };
            topic.replies.push(newReply);
            localStorage.setItem(this.storageKey, JSON.stringify(topics));
            return newReply;
        }
        return null;
    }

    filterTopics(category) {
        const topics = this.getAllTopics();
        if (category === 'all') return topics;
        return topics.filter(topic => topic.category === category);
    }
}

// Initialize Forum Manager
const forum = new ForumManager();

// DOM Elements
const forumList = document.getElementById('forumList');
const topicDetail = document.getElementById('topicDetail');
const topicsList = document.getElementById('topicsList');
const newTopicModal = document.getElementById('newTopicModal');
const newTopicForm = document.getElementById('newTopicForm');

// State
let currentTopicId = null;
let currentFilter = 'all';

// Render Topics List
function renderTopics(filter = 'all') {
    const topics = forum.filterTopics(filter);

    if (topics.length === 0) {
        topicsList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3>Belum ada topik diskusi</h3>
        <p>Jadilah yang pertama membuat topik diskusi!</p>
      </div>
    `;
        return;
    }

    topicsList.innerHTML = topics.map(topic => `
    <div class="forum-card" data-id="${topic.id}">
      <div class="forum-card-header">
        <div>
          <div class="forum-tags">
            <span class="forum-tag">${topic.category}</span>
          </div>
          <h3 class="forum-title">${escapeHtml(topic.title)}</h3>
          <p class="forum-excerpt">${escapeHtml(topic.body.substring(0, 150))}${topic.body.length > 150 ? '...' : ''}</p>
        </div>
      </div>
      <div class="forum-stats">
        <div class="forum-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          ${escapeHtml(topic.author)}
        </div>
        <div class="forum-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          ${topic.replies.length} Balasan
        </div>
        <div class="forum-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          ${getRelativeTime(topic.timestamp)}
        </div>
      </div>
    </div>
  `).join('');

    // Add click listeners
    document.querySelectorAll('.forum-card').forEach(card => {
        card.addEventListener('click', function () {
            const topicId = this.dataset.id;
            showTopicDetail(topicId);
        });
    });
}

// Show Topic Detail
function showTopicDetail(topicId) {
    currentTopicId = topicId;
    const topic = forum.getTopicById(topicId);

    if (!topic) return;

    // Update UI
    forumList.style.display = 'none';
    topicDetail.style.display = 'block';

    // Render topic detail
    document.getElementById('detailTags').innerHTML = `<span class="forum-tag">${topic.category}</span>`;
    document.getElementById('detailTitle').textContent = topic.title;
    document.getElementById('detailBody').textContent = topic.body;
    document.getElementById('detailMeta').innerHTML = `
    <div class="forum-meta-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      ${escapeHtml(topic.author)}
    </div>
    <div class="forum-meta-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      ${getRelativeTime(topic.timestamp)}
    </div>
  `;

    // Render replies
    renderReplies(topic.replies);
}

// Render Replies
function renderReplies(replies) {
    const repliesCount = document.getElementById('repliesCount');
    const repliesList = document.getElementById('repliesList');

    repliesCount.textContent = `${replies.length} Balasan`;

    if (replies.length === 0) {
        repliesList.innerHTML = `
      <div class="empty-state">
        <p>Belum ada balasan. Jadilah yang pertama!</p>
      </div>
    `;
        return;
    }

    repliesList.innerHTML = replies.map(reply => `
    <div class="reply-card">
      <div class="reply-author">
        <div class="reply-avatar">${getInitials(reply.author)}</div>
        <div class="reply-info">
          <div class="reply-name">${escapeHtml(reply.author)}</div>
          <div class="reply-time">${getRelativeTime(reply.timestamp)}</div>
        </div>
      </div>
      <div class="reply-body">${escapeHtml(reply.body)}</div>
    </div>
  `).join('');
}

// Event Listeners
document.getElementById('newTopicBtn').addEventListener('click', () => {
    newTopicModal.classList.add('active');
    // Load saved username if exists
    const savedAuthor = localStorage.getItem('edunet_forum_username');
    if (savedAuthor) {
        document.getElementById('topicAuthor').value = savedAuthor;
    }
});

document.getElementById('closeModal').addEventListener('click', () => {
    newTopicModal.classList.remove('active');
});

document.getElementById('cancelTopic').addEventListener('click', () => {
    newTopicModal.classList.remove('active');
});

newTopicModal.addEventListener('click', (e) => {
    if (e.target === newTopicModal) {
        newTopicModal.classList.remove('active');
    }
});

// New Topic Form Submit
newTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const author = document.getElementById('topicAuthor').value.trim();
    const category = document.getElementById('topicCategory').value;
    const title = document.getElementById('topicTitle').value.trim();
    const body = document.getElementById('topicBody').value.trim();

    if (!author || !category || !title || !body) return;

    // Save username for future use
    localStorage.setItem('edunet_forum_username', author);

    // Add topic
    forum.addTopic({ author, category, title, body });

    // Reset form
    newTopicForm.reset();
    newTopicModal.classList.remove('active');

    // Refresh list
    renderTopics(currentFilter);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        currentFilter = this.dataset.filter;
        renderTopics(currentFilter);
    });
});

// Back to list
document.getElementById('backToList').addEventListener('click', () => {
    forumList.style.display = 'block';
    topicDetail.style.display = 'none';
    currentTopicId = null;
    renderTopics(currentFilter);
});

// Submit Reply
document.getElementById('submitReply').addEventListener('click', () => {
    const replyBody = document.getElementById('replyBody').value.trim();

    if (!replyBody || !currentTopicId) return;

    // Get author name
    let author = localStorage.getItem('edunet_forum_username');
    if (!author) {
        author = prompt('Masukkan nama kamu:');
        if (!author) return;
        localStorage.setItem('edunet_forum_username', author);
    }

    // Add reply
    forum.addReply(currentTopicId, { author, body: replyBody });

    // Clear textarea
    document.getElementById('replyBody').value = '';

    // Refresh topic detail
    showTopicDetail(currentTopicId);
});

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getRelativeTime(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari yang lalu`;

    return new Date(timestamp).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initial render
renderTopics();
