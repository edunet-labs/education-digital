/**
 * Material Quiz Module
 * Handles interactive quizzes embedded within material pages.
 * Quiz data comes from the material's quiz_data field (parsed from PDF by admin).
 */

export function initQuiz(material) {
    if (!material.quiz_data || material.quiz_data.length === 0) return;

    // Inject "Mulai Kuis" button into sidebar
    const container = document.getElementById('materialSidebar');
    if (!container) return;

    const quizCard = document.createElement('div');
    quizCard.className = 'sidebar-card quiz-card';
    quizCard.innerHTML = `
        <h3><i class="bi bi-patch-question-fill" style="color: var(--accent-primary);"></i> Kuis Materi</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Uji pemahamanmu tentang materi ini dengan ${material.quiz_data.length} soal.
        </p>
        <button class="btn btn-primary full-width" id="openQuizBtn">
            <i class="bi bi-play-circle"></i> Mulai Kuis
        </button>
    `;
    container.appendChild(quizCard);

    document.getElementById('openQuizBtn').addEventListener('click', () => {
        openQuizModal(material.quiz_data);
    });
}

let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {};

function openQuizModal(quizData) {
    currentQuizData = quizData;
    currentQuestionIndex = 0;
    userAnswers = {};

    const modal = document.getElementById('quizModal');
    if (!modal) return;

    // Show modal
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));

    // Reset views
    document.getElementById('quizStartView').style.display = 'block';
    document.getElementById('quizQuestionView').style.display = 'none';
    document.getElementById('quizResultView').style.display = 'none';

    document.getElementById('quizTotalQuestions').textContent = quizData.length;

    // Setup buttons
    document.getElementById('startQuizBtn').onclick = startQuiz;
    document.querySelectorAll('.close-quiz-btn, .quiz-overlay').forEach(el => {
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
    renderQuestion();
}

function renderQuestion() {
    const question = currentQuizData[currentQuestionIndex];
    document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestionNum').textContent = currentQuizData.length;
    document.getElementById('questionText').textContent = question.question;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    Object.entries(question.options).forEach(([key, value]) => {
        const btn = document.createElement('div');
        btn.className = `option-btn ${userAnswers[question.id] === key ? 'selected' : ''}`;
        btn.innerHTML = `
            <div class="option-marker">${key.toUpperCase()}</div>
            <span>${value}</span>
        `;
        btn.onclick = () => selectOption(question.id, key);
        optionsContainer.appendChild(btn);
    });

    // Navigation
    const prevBtn = document.getElementById('prevQBtn');
    const nextBtn = document.getElementById('nextQBtn');

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === currentQuizData.length - 1 ? 'Selesai' : 'Selanjutnya';

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

function selectOption(questionId, key) {
    userAnswers[questionId] = key;
    renderQuestion();
}

function finishQuiz() {
    let correctCount = 0;
    currentQuizData.forEach(q => {
        if (userAnswers[q.id] && q.answer && userAnswers[q.id].toLowerCase() === q.answer.toLowerCase()) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / currentQuizData.length) * 100);

    document.getElementById('quizQuestionView').style.display = 'none';
    document.getElementById('quizResultView').style.display = 'block';

    document.getElementById('scoreValue').textContent = score;
    const msg = document.getElementById('resultMessage');

    if (score >= 80) {
        msg.textContent = 'Luar Biasa! 🎉';
        msg.style.color = 'var(--success)';
    } else if (score >= 60) {
        msg.textContent = 'Cukup Bagus! 👍';
        msg.style.color = 'var(--text-primary)';
    } else {
        msg.textContent = 'Belajar Lagi Yuk! 💪';
        msg.style.color = 'var(--danger)';
    }

    document.getElementById('retryQuizBtn').onclick = () => openQuizModal(currentQuizData);
    document.getElementById('closeResultBtn').onclick = closeQuizModal;
}
