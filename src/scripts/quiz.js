/* ======================================
   Dynamic Quiz Page Script
   Fetches materials with quizzes from Supabase,
   supports class filtering, and runs quizzes inline.
   ====================================== */

import { getAllMaterials } from '../supabase/repository.js';

// State
let allMaterials = [];
let activeFilter = '10';
let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// DOM Elements
const quizGrid = document.getElementById('quizGrid');
const classFilter = document.getElementById('classFilter');

// ===== INIT =====
async function initQuizPage() {
    try {
        // Check URL params for class filter
        const params = new URLSearchParams(window.location.search);
        const kelasParam = params.get('kelas');
        if (kelasParam && ['10', '11', '12'].includes(kelasParam)) {
            activeFilter = kelasParam;
            // Update active button
            classFilter.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.kelas === kelasParam);
            });
        }

        const materials = await getAllMaterials();
        allMaterials = materials.filter(m => m.quiz_data && m.quiz_data.length > 0);

        const filtered = allMaterials.filter(m => String(m.kelas) === activeFilter);
        renderQuizCards(filtered);
        setupFilters();
    } catch (error) {
        console.error('Error loading quizzes:', error);
        quizGrid.innerHTML = `
            <div class="empty-quiz-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Gagal memuat kuis</h3>
                <p>Silakan coba lagi nanti.</p>
            </div>
        `;
    }
}

// ===== FILTER LOGIC =====
function setupFilters() {
    if (!classFilter) return;

    classFilter.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        classFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeFilter = btn.dataset.kelas;

        const filtered = allMaterials.filter(m => String(m.kelas) === activeFilter);
        renderQuizCards(filtered);
    });
}

// ===== RENDER CARDS =====
function renderQuizCards(materials) {
    if (!quizGrid) return;

    if (materials.length === 0) {
        quizGrid.innerHTML = `
            <div class="empty-quiz-state">
                <i class="bi bi-inbox"></i>
                <h3>Belum ada kuis tersedia</h3>
                <p>Belum ada kuis untuk Kelas ${activeFilter}.</p>
            </div>
        `;
        return;
    }

    quizGrid.innerHTML = materials.map(m => `
        <div class="quiz-material-card" data-id="${m.id}">
            <div class="card-top">
                <span class="card-kelas-badge">
                    <i class="bi bi-mortarboard"></i>
                    Kelas ${m.kelas}
                </span>
                <span class="card-question-count">${m.quiz_data.length} Soal</span>
            </div>
            <h3 class="card-title">${escapeHtml(m.title)}</h3>
            <p class="card-subtitle">${escapeHtml(m.spesialisasi || 'Umum')}${m.modul ? ' • ' + escapeHtml(m.modul) : ''}</p>
            <button class="card-action">
                <i class="bi bi-play-circle"></i> Mulai Kuis
            </button>
        </div>
    `).join('');

    // Attach click events
    quizGrid.querySelectorAll('.quiz-material-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const material = allMaterials.find(m => m.id === id);
            if (material) openQuizModal(material);
        });
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

// ===== QUIZ MODAL LOGIC =====
function openQuizModal(material) {
    currentQuizData = material.quiz_data;
    currentQuestionIndex = 0;
    userAnswers = {};

    const modal = document.getElementById('quizModal');
    if (!modal) return;

    document.getElementById('quizModalTitle').textContent = material.title;
    document.getElementById('quizTotalQuestions').textContent = currentQuizData.length;

    document.getElementById('quizStartView').style.display = 'block';
    document.getElementById('quizQuestionView').style.display = 'none';
    document.getElementById('quizResultView').style.display = 'none';

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));

    document.getElementById('startQuizBtn').onclick = startQuiz;
    document.querySelectorAll('.close-quiz-btn, #quizModal > .quiz-overlay').forEach(el => {
        el.onclick = closeQuizModal;
    });
}

function closeQuizModal() {
    const modal = document.getElementById('quizModal');
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function startQuiz() {
    document.getElementById('quizStartView').style.display = 'none';
    document.getElementById('quizQuestionView').style.display = 'block';

    // Update progress bar
    updateProgressBar();
    renderQuestion();
}

function updateProgressBar() {
    const progressFill = document.getElementById('quizProgressFill');
    const progressText = document.getElementById('quizProgressText');
    if (progressFill) {
        const pct = ((currentQuestionIndex + 1) / currentQuizData.length) * 100;
        progressFill.style.width = pct + '%';
    }
    if (progressText) {
        progressText.textContent = `${currentQuestionIndex + 1} / ${currentQuizData.length}`;
    }
}

function renderQuestion() {
    const question = currentQuizData[currentQuestionIndex];

    document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestionNum').textContent = currentQuizData.length;
    document.getElementById('questionText').textContent = question.question;

    updateProgressBar();

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    // Add entrance animation
    optionsContainer.classList.remove('animate-in');
    void optionsContainer.offsetWidth; // trigger reflow
    optionsContainer.classList.add('animate-in');

    Object.entries(question.options).forEach(([key, value], index) => {
        const btn = document.createElement('div');
        const isSelected = userAnswers[question.id] === key;
        btn.className = `option-btn ${isSelected ? 'selected' : ''}`;
        btn.style.animationDelay = `${index * 0.08}s`;
        btn.innerHTML = `
            <div class="option-marker">${key.toUpperCase()}</div>
            <span>${escapeHtml(value)}</span>
            ${isSelected ? '<i class="bi bi-check-circle-fill option-check"></i>' : ''}
        `;
        btn.onclick = () => selectOption(question.id, key, btn);
        optionsContainer.appendChild(btn);
    });

    // Navigation
    const prevBtn = document.getElementById('prevQBtn');
    const nextBtn = document.getElementById('nextQBtn');

    prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === currentQuizData.length - 1) {
        nextBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Selesai';
        nextBtn.classList.add('finish-btn');
    } else {
        nextBtn.innerHTML = 'Selanjutnya <i class="bi bi-arrow-right"></i>';
        nextBtn.classList.remove('finish-btn');
    }

    prevBtn.onclick = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    };

    nextBtn.onclick = () => {
        if (currentQuestionIndex < currentQuizData.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            finishQuiz();
        }
    };
}

function selectOption(questionId, key, clickedBtn) {
    userAnswers[questionId] = key;

    // Visual feedback with animation
    const container = document.getElementById('optionsContainer');
    container.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        const check = btn.querySelector('.option-check');
        if (check) check.remove();
    });

    clickedBtn.classList.add('selected');
    clickedBtn.classList.add('pulse');
    setTimeout(() => clickedBtn.classList.remove('pulse'), 300);

    // Add check icon
    const checkIcon = document.createElement('i');
    checkIcon.className = 'bi bi-check-circle-fill option-check';
    clickedBtn.appendChild(checkIcon);
}

function finishQuiz() {
    let correctCount = 0;
    const results = [];

    currentQuizData.forEach((q, idx) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer && q.answer && userAnswer.toLowerCase() === q.answer.toLowerCase();
        if (isCorrect) correctCount++;

        results.push({
            num: idx + 1,
            question: q.question,
            userAnswer: userAnswer ? userAnswer.toUpperCase() : '-',
            correctAnswer: q.answer ? q.answer.toUpperCase() : '-',
            userAnswerText: userAnswer ? (q.options[userAnswer] || userAnswer) : 'Tidak dijawab',
            correctAnswerText: q.answer ? (q.options[q.answer] || q.answer) : '-',
            isCorrect
        });
    });

    const score = Math.round((correctCount / currentQuizData.length) * 100);

    document.getElementById('quizQuestionView').style.display = 'none';
    document.getElementById('quizResultView').style.display = 'block';

    document.getElementById('scoreValue').textContent = score;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('totalCount').textContent = currentQuizData.length;

    const msg = document.getElementById('resultMessage');
    const emoji = document.getElementById('resultEmoji');

    if (score >= 80) {
        msg.textContent = 'Luar Biasa!';
        msg.style.color = 'var(--success, #10b981)';
        emoji.textContent = '🎉';
    } else if (score >= 60) {
        msg.textContent = 'Cukup Bagus!';
        msg.style.color = 'var(--accent-primary)';
        emoji.textContent = '👍';
    } else {
        msg.textContent = 'Belajar Lagi Yuk!';
        msg.style.color = 'var(--danger, #ef4444)';
        emoji.textContent = '💪';
    }

    // Render answer review
    const reviewContainer = document.getElementById('answerReview');
    reviewContainer.innerHTML = results.map(r => `
        <div class="review-item ${r.isCorrect ? 'correct' : 'wrong'}">
            <div class="review-num">
                <span class="review-number">${r.num}</span>
                <i class="bi ${r.isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            </div>
            <div class="review-content">
                <p class="review-question">${escapeHtml(r.question)}</p>
                <div class="review-answers">
                    <span class="your-answer ${r.isCorrect ? '' : 'wrong-text'}">
                        Jawaban kamu: <strong>${r.userAnswer}. ${escapeHtml(r.userAnswerText)}</strong>
                    </span>
                    ${!r.isCorrect ? `
                        <span class="correct-answer">
                            Jawaban benar: <strong>${r.correctAnswer}. ${escapeHtml(r.correctAnswerText)}</strong>
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('retryQuizBtn').onclick = () => {
        currentQuestionIndex = 0;
        userAnswers = {};
        document.getElementById('quizResultView').style.display = 'none';
        document.getElementById('quizStartView').style.display = 'block';
    };
    document.getElementById('closeResultBtn').onclick = closeQuizModal;
}

// Start
document.addEventListener('DOMContentLoaded', initQuizPage);
