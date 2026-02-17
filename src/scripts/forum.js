import { forumRepository } from '../supabase/forum.js';

// DOM Elements
const forumList = document.getElementById('forumList');
const topicDetail = document.getElementById('topicDetail');
const topicsList = document.getElementById('topicsList');
const newTopicModal = document.getElementById('newTopicModal');
const newTopicForm = document.getElementById('newTopicForm');

// Image Upload Elements
const topicImageInput = document.getElementById('topicImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = imagePreview.querySelector('img');
const removeImageBtn = document.getElementById('removeImageBtn');

// Reply Name Modal Elements
const replyNameModal = document.getElementById('replyNameModal');
const replyAuthorInput = document.getElementById('replyAuthorName');
const confirmReplyNameBtn = document.getElementById('confirmReplyName');
const closeReplyNameBtn = document.getElementById('closeReplyNameModal');

// State
let currentTopicId = null;
let currentFilter = 'all';

// Profanity Filter List
const BANNED_WORDS = [
  'anjing', 'babi', 'bangsat', 'tolol', 'goblok', 'bodoh', 'idiot',
  'kontol', 'memek', 'jembut', 'ngentot', 'tai', 'anjir', 'kampret',
  'pantek', 'puki', 'sialan', 'brengsek'
];

function containsProfanity(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  await renderTopics();
  setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
  // New Topic Button
  const newTopicBtn = document.getElementById('newTopicBtn');
  if (newTopicBtn) {
    newTopicBtn.addEventListener('click', () => {
      newTopicModal.classList.add('active');
      const savedAuthor = localStorage.getItem('edunet_forum_username');
      if (savedAuthor) {
        document.getElementById('topicAuthor').value = savedAuthor;
      }
    });
  }

  // Close Modal
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

  // Image Preview
  if (topicImageInput) {
    topicImageInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
          imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function () {
      topicImageInput.value = '';
      imagePreview.style.display = 'none';
      previewImg.src = '';
    });
  }

  // New Topic Submit
  if (newTopicForm) {
    newTopicForm.addEventListener('submit', handleNewTopicSubmit);
  }

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderTopics(currentFilter);
    });
  });

  // Back to List
  const backBtn = document.getElementById('backToList');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      forumList.style.display = 'block';
      topicDetail.style.display = 'none';
      currentTopicId = null;
      renderTopics(currentFilter);
      // Clear detail view
      document.getElementById('detailTitle').textContent = '';
      document.getElementById('detailBody').textContent = '';
      document.getElementById('detailImage').style.display = 'none';
    });
  }

  // Submit Reply
  const submitReplyBtn = document.getElementById('submitReply');
  if (submitReplyBtn) {
    submitReplyBtn.addEventListener('click', handleReplySubmit);
  }

  // Reply Image Preview
  const replyImageInput = document.getElementById('replyImage');
  const replyImagePreview = document.getElementById('replyImagePreview');
  const removeReplyImageBtn = document.getElementById('removeReplyImageBtn');

  if (replyImageInput && replyImagePreview) {
    replyImageInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          replyImagePreview.querySelector('img').src = e.target.result;
          replyImagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });

    if (removeReplyImageBtn) {
      removeReplyImageBtn.addEventListener('click', function () {
        replyImageInput.value = '';
        replyImagePreview.style.display = 'none';
      });
    }
  }
}

// Render Topics List
async function renderTopics(filter = 'all') {
  if (!topicsList) return;

  topicsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p>Memuat diskusi...</p>
        </div>
    `;
  try {
    let topics = await forumRepository.getAllTopics();
    console.log('DEBUG: Fetched topics:', topics);

    if (!Array.isArray(topics)) {
      console.error('Invalid topics data:', topics);
      topics = [];
    }

    // STRICT FILTER: Remove any topic without a valid ID
    topics = topics.filter(t => t && t.id);



    if (filter !== 'all') {
      topics = topics.filter(t => t.category === filter);
    }

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
                            ${topic.image_url ? '<span class="forum-tag" style="background: rgba(59, 130, 246, 0.1); color: var(--accent-secondary);">Lampiran</span>' : ''}
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
                        ${escapeHtml(topic.author_name)}
                    </div>
                    <div class="forum-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        ${topic.count || topic.forum_replies?.length || 0} Balasan
                    </div>
                    <div class="forum-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        ${getRelativeTime(topic.created_at)}
                    </div>
                </div>
            </div>
        `).join('');

    // Add click listeners - SCOPED TO LIST ONLY
    topicsList.querySelectorAll('.forum-card').forEach(card => {
      card.addEventListener('click', function (e) {
        const topicId = this.dataset.id;

        if (topicId && topicId !== 'undefined') {
          showTopicDetail(topicId);
        } else {
          console.warn('Ignored click on card without ID:', this);
        }
      });
    });

  } catch (error) {
    console.error('Error rendering topics:', error);
    topicsList.innerHTML = `
            <div class="empty-state">
                <p style="color: #ef4444;">Gagal memuat topik. Silakan coba lagi.</p>
                <button class="btn btn-secondary btn-sm" onclick="location.reload()" style="margin-top: 1rem;">Muat Ulang</button>
            </div>
        `;
  }
}

// Handle New Topic Submit
async function handleNewTopicSubmit(e) {
  e.preventDefault();

  const submitBtn = newTopicForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Posting...';

  const author = document.getElementById('topicAuthor').value.trim();
  const category = document.getElementById('topicCategory').value;
  const title = document.getElementById('topicTitle').value.trim();
  const body = document.getElementById('topicBody').value.trim();
  const imageFile = topicImageInput.files[0];

  if (!author || !category || !title || !body) {
    alert('Mohon lengkapi semua field wajib.');
    resetSubmitBtn(submitBtn, originalBtnText);
    return;
  }

  // Profanity Check
  if (containsProfanity(title) || containsProfanity(body) || containsProfanity(author)) {
    alert('Mohon gunakan bahasa yang sopan. Posting anda mengandung kata-kata yang tidak diperbolehkan.');
    resetSubmitBtn(submitBtn, originalBtnText);
    return;
  }

  try {
    let imageUrl = null;

    // Upload image if exists
    if (imageFile) {
      submitBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Mengupload Gambar...';
      imageUrl = await forumRepository.uploadImage(imageFile);
    }

    // Create topic
    submitBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Menyimpan...';
    await forumRepository.createTopic({
      author_name: author,
      category,
      title,
      body,
      image_url: imageUrl
    });

    // Save username
    localStorage.setItem('edunet_forum_username', author);

    // Success
    if (window.showToast) window.showToast('Berhasil', 'Topik diskusi berhasil dibuat!', 'success');

    // Reset form
    newTopicForm.reset();
    topicImageInput.value = '';
    imagePreview.style.display = 'none';
    newTopicModal.classList.remove('active');

    // Refresh list
    renderTopics(currentFilter);

  } catch (error) {
    console.error('Error creating topic:', error);
    if (window.showToast) window.showToast('Gagal', 'Terjadi kesalahan saat membuat topik.', 'error');
    else alert('Gagal membuat topik. Silakan coba lagi.');
  } finally {
    resetSubmitBtn(submitBtn, originalBtnText);
  }
}

function resetSubmitBtn(btn, text) {
  btn.disabled = false;
  btn.innerHTML = text;
}

// Show Topic Detail
async function showTopicDetail(topicId) {
  console.log('DEBUG: showTopicDetail called with ID:', topicId, typeof topicId);

  if (!topicId || topicId === 'undefined' || topicId === 'null') {
    console.error('Invalid Topic ID:', topicId);
    if (window.showToast) window.showToast('Error', 'ID Topik tidak valid: ' + topicId, 'error');
    return;
  }
  currentTopicId = topicId;

  // Switch view immediately
  forumList.style.display = 'none';
  topicDetail.style.display = 'block';

  // Show loading skeleton/state
  document.getElementById('detailTitle').textContent = 'Memuat...';
  document.getElementById('detailBody').textContent = '';
  document.getElementById('detailMeta').innerHTML = '';
  document.getElementById('repliesList').innerHTML = '<div class="loading-spinner" style="margin: 2rem auto;"></div>';
  document.getElementById('detailImage').style.display = 'none';

  try {
    const topic = await forumRepository.getTopicById(topicId);

    if (!topic) throw new Error('Topik tidak ditemukan');

    // Render Data
    document.getElementById('detailTags').innerHTML = `<span class="forum-tag">${topic.category}</span>`;
    document.getElementById('detailTitle').textContent = topic.title;
    document.getElementById('detailBody').textContent = topic.body;

    // Render Image
    const imgContainer = document.getElementById('detailImage');
    if (topic.image_url) {
      imgContainer.style.display = 'block';
      imgContainer.querySelector('img').src = topic.image_url;
    } else {
      imgContainer.style.display = 'none';
    }

    // Render Meta
    document.getElementById('detailMeta').innerHTML = `
            <div class="forum-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                ${escapeHtml(topic.author_name)}
            </div>
            <div class="forum-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                ${getRelativeTime(topic.created_at)}
            </div>
        `;

    renderReplies(topic.forum_replies || []);

  } catch (error) {
    console.error('Error loading detail:', error);
    const errorMsg = error.message || String(error);
    document.getElementById('detailTitle').textContent = 'Error memuat topik: ' + errorMsg;
    if (window.showToast) window.showToast('Error', 'Gagal memuat: ' + errorMsg, 'error');
  }
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
                <div class="reply-avatar">${getInitials(reply.author_name)}</div>
                <div class="reply-info">
                    <div class="reply-name">${escapeHtml(reply.author_name)}</div>
                    <div class="reply-time">${getRelativeTime(reply.created_at)}</div>
                </div>
            </div>
            ${reply.image_url ? `
            <div style="margin-bottom: 1rem;">
                <img src="${reply.image_url}" alt="Attachment" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
            </div>
            ` : ''}
            <div class="reply-body">${escapeHtml(reply.body)}</div>
        </div>
    `).join('');
}

// Handle Reply Submit
async function handleReplySubmit() {
  const replyInput = document.getElementById('replyBody');
  const body = replyInput.value.trim();

  if (!body || !currentTopicId) return;

  let author = localStorage.getItem('edunet_forum_username');

  // If no author name, show modal
  if (!author) {
    if (replyNameModal) {
      replyNameModal.classList.add('active');
      replyAuthorInput.focus();

      // Handle modal submit
      return new Promise((resolve) => {
        const submitName = () => {
          const name = replyAuthorInput.value.trim();
          if (name) {
            localStorage.setItem('edunet_forum_username', name);
            replyNameModal.classList.remove('active');
            cleanup();
            // Retry submit with new name
            handleReplySubmit();
          } else {
            alert('Mohon masukkan nama kamu.');
          }
        };

        const close = () => {
          replyNameModal.classList.remove('active');
          cleanup();
        };

        const cleanup = () => {
          confirmReplyNameBtn.removeEventListener('click', submitName);
          closeReplyNameBtn.removeEventListener('click', close);
        };

        confirmReplyNameBtn.addEventListener('click', submitName);
        closeReplyNameBtn.addEventListener('click', close);
      });
    } else {
      // Fallback if modal missing (should not happen)
      author = prompt('Masukkan nama kamu untuk membalas:');
      if (!author) return;
      localStorage.setItem('edunet_forum_username', author);
    }
  }

  const submitBtn = document.getElementById('submitReply');

  // Profanity Check
  if (containsProfanity(body) || containsProfanity(author)) {
    alert('Mohon gunakan bahasa yang sopan. Komentar mengandung kata-kata yang tidak diperbolehkan.');
    return;
  }

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Mengirim...';

  try {
    let imageUrl = null;
    const replyImageInput = document.getElementById('replyImage');

    // Upload image if exists
    if (replyImageInput && replyImageInput.files[0]) {
      submitBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Uploading...';
      imageUrl = await forumRepository.uploadImage(replyImageInput.files[0]);
    }

    submitBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Posting...';

    await forumRepository.createReply({
      topic_id: currentTopicId,
      author_name: author,
      body: body,
      image_url: imageUrl
    });

    if (window.showToast) window.showToast('Berhasil', 'Balasan terkirim!', 'success');

    replyInput.value = '';

    // Reload detail to show new reply
    showTopicDetail(currentTopicId);

  } catch (error) {
    console.error('Error sending reply:', error);
    if (window.showToast) window.showToast('Gagal', 'Gagal mengirim balasan.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Utility Functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari yang lalu`;

  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
