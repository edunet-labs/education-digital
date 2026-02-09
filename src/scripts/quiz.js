/* ======================================
   Quiz System for Edunet
   ====================================== */

// Quiz data for each class
const quizData = {
    '10': [
        {
            question: 'Apa kepanjangan dari K3LH?',
            options: [
                'Keselamatan dan Kesehatan Kerja Lingkungan Hidup',
                'Keamanan Kerja Kesehatan Lingkungan Hidup',
                'Keselamatan Kerja Kesehatan Lingkungan',
                'Kebersihan Keamanan Kesehatan Lingkungan'
            ],
            correct: 0
        },
        {
            question: 'Komponen komputer yang berfungsi sebagai otak adalah?',
            options: ['RAM', 'Processor', 'Hard Disk', 'Motherboard'],
            correct: 1
        },
        {
            question: 'Berapa jumlah layer pada model OSI?',
            options: ['5 layer', '7 layer', '9 layer', '10 layer'],
            correct: 1
        },
        {
            question: 'IP Address 192.168.1.1 termasuk dalam kelas?',
            options: ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D'],
            correct: 2
        },
        {
            question: 'Perintah untuk melihat konfigurasi IP di Windows adalah?',
            options: ['ping', 'ipconfig', 'tracert', 'netstat'],
            correct: 1
        },
        {
            question: 'Topologi jaringan yang berbentuk lingkaran disebut?',
            options: ['Bus', 'Star', 'Ring', 'Mesh'],
            correct: 2
        },
        {
            question: 'Perangkat yang berfungsi menghubungkan dua jaringan berbeda adalah?',
            options: ['Switch', 'Hub', 'Router', 'Repeater'],
            correct: 2
        },
        {
            question: 'Port default untuk HTTP adalah?',
            options: ['21', '22', '80', '443'],
            correct: 2
        },
        {
            question: 'Sistem operasi berbasis Linux yang populer untuk server adalah?',
            options: ['Windows Server', 'Ubuntu Server', 'MacOS', 'Android'],
            correct: 1
        },
        {
            question: 'Kabel jaringan yang umum digunakan untuk LAN adalah?',
            options: ['Coaxial', 'Fiber Optic', 'UTP', 'Serial'],
            correct: 2
        }
    ],
    '11': [
        {
            question: 'Protokol routing yang termasuk Distance Vector adalah?',
            options: ['OSPF', 'RIP', 'BGP', 'EIGRP'],
            correct: 1
        },
        {
            question: 'VLAN adalah singkatan dari?',
            options: [
                'Virtual Local Area Network',
                'Very Large Area Network',
                'Variable LAN',
                'Voice LAN'
            ],
            correct: 0
        },
        {
            question: 'Port yang digunakan untuk trunk VLAN adalah?',
            options: ['Access Port', 'Trunk Port', 'Voice Port', 'Management Port'],
            correct: 1
        },
        {
            question: 'Metode queue yang paling sederhana di MikroTik adalah?',
            options: ['PCQ', 'HTB', 'Simple Queue', 'Queue Tree'],
            correct: 2
        },
        {
            question: 'Standar WiFi yang paling cepat adalah?',
            options: ['802.11a', '802.11b', '802.11g', '802.11ac'],
            correct: 3
        },
        {
            question: 'Subnet mask /24 sama dengan?',
            options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
            correct: 2
        },
        {
            question: 'Switch bekerja pada layer berapa di OSI?',
            options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
            correct: 1
        },
        {
            question: 'Protokol yang digunakan untuk konfigurasi IP otomatis adalah?',
            options: ['DNS', 'DHCP', 'FTP', 'SMTP'],
            correct: 1
        },
        {
            question: 'Channel WiFi yang tidak overlap pada 2.4GHz adalah?',
            options: ['1, 2, 3', '1, 6, 11', '2, 7, 12', '1, 5, 9'],
            correct: 1
        },
        {
            question: 'NAT adalah singkatan dari?',
            options: [
                'Network Address Translation',
                'New Access Technology',
                'Network Automated Transfer',
                'Node Address Table'
            ],
            correct: 0
        }
    ],
    '12': [
        {
            question: 'Protokol routing BGP bekerja pada layer?',
            options: ['Layer 2', 'Layer 3', 'Layer 4', 'Layer 7'],
            correct: 2
        },
        {
            question: 'Service web server yang populer di Linux adalah?',
            options: ['IIS', 'Apache', 'Tomcat', 'WebLogic'],
            correct: 1
        },
        {
            question: 'Port default untuk SSH adalah?',
            options: ['21', '22', '23', '25'],
            correct: 1
        },
        {
            question: 'Firewall di Linux menggunakan?',
            options: ['Windows Firewall', 'iptables', 'pfSense', 'Checkpoint'],
            correct: 1
        },
        {
            question: 'VPN protokol yang paling aman adalah?',
            options: ['PPTP', 'L2TP', 'OpenVPN', 'IPSec'],
            correct: 2
        },
        {
            question: 'Database server yang open source adalah?',
            options: ['Oracle', 'MS SQL', 'MySQL', 'DB2'],
            correct: 2
        },
        {
            question: 'IDS adalah singkatan dari?',
            options: [
                'Internet Data Service',
                'Intrusion Detection System',
                'Integrated Domain System',
                'International DNS Server'
            ],
            correct: 1
        },
        {
            question: 'Metode enkripsi yang paling kuat untuk WiFi adalah?',
            options: ['WEP', 'WPA', 'WPA2', 'Open'],
            correct: 2
        },
        {
            question: 'Load balancing di MikroTik menggunakan?',
            options: ['Simple Queue', 'Mangle', 'PCC', 'Hotspot'],
            correct: 2
        },
        {
            question: 'Tool untuk monitoring jaringan yang populer adalah?',
            options: ['Notepad', 'Wireshark', 'Paint', 'Calculator'],
            correct: 1
        }
    ]
};

// Quiz state
let currentClass = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let currentQuestions = [];

// DOM elements
const quizSelection = document.getElementById('quizSelection');
const quizInterface = document.getElementById('quizInterface');
const quizResult = document.getElementById('quizResult');

const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const quizOptions = document.getElementById('quizOptions');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const resultScore = document.getElementById('resultScore');
const resultMessage = document.getElementById('resultMessage');
const resultDetails = document.getElementById('resultDetails');

// Event listeners
document.querySelectorAll('.quiz-card').forEach(card => {
    card.addEventListener('click', function () {
        const classNumber = this.dataset.class;
        startQuiz(classNumber);
    });
});

document.getElementById('backToSelection').addEventListener('click', showSelection);
document.getElementById('backToSelectionFromResult').addEventListener('click', showSelection);
document.getElementById('retryBtn').addEventListener('click', retryQuiz);
prevBtn.addEventListener('click', previousQuestion);
nextBtn.addEventListener('click', nextQuestion);

// Functions
function startQuiz(classNumber) {
    currentClass = classNumber;
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData[classNumber].length).fill(null);
    currentQuestions = quizData[classNumber];

    quizSelection.style.display = 'none';
    quizInterface.classList.add('active');
    quizResult.classList.remove('active');

    showQuestion();
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    // Update question number and text
    questionNumber.textContent = `Pertanyaan ${currentQuestionIndex + 1}`;
    questionText.textContent = question.question;

    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${currentQuestions.length}`;

    // Render options
    const letters = ['A', 'B', 'C', 'D'];
    quizOptions.innerHTML = question.options.map((option, index) => `
    <div class="quiz-option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" data-index="${index}">
      <span class="option-letter">${letters[index]}</span>
      <span>${option}</span>
    </div>
  `).join('');

    // Add click listeners to options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            selectOption(index);
        });
    });

    // Update navigation buttons
    prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';

    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.innerHTML = `
      Selesai
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    } else {
        nextBtn.innerHTML = `
      Berikutnya
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    `;
    }
}

function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;

    // Update UI
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // Finish quiz
        showResult();
    }
}

function showResult() {
    // Calculate score
    let correctCount = 0;
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / currentQuestions.length) * 100);

    // Update result UI
    resultScore.textContent = `${percentage}%`;
    resultDetails.textContent = `Kamu menjawab ${correctCount} dari ${currentQuestions.length} pertanyaan dengan benar`;

    // Set message based on score
    if (percentage >= 80) {
        resultMessage.textContent = 'Luar Biasa! 🎉';
    } else if (percentage >= 60) {
        resultMessage.textContent = 'Bagus! 👍';
    } else if (percentage >= 40) {
        resultMessage.textContent = 'Cukup Baik';
    } else {
        resultMessage.textContent = 'Tetap Semangat! 💪';
    }

    // Show result screen
    quizInterface.classList.remove('active');
    quizResult.classList.add('active');
}

function retryQuiz() {
    startQuiz(currentClass);
}

function showSelection() {
    quizSelection.style.display = 'block';
    quizInterface.classList.remove('active');
    quizResult.classList.remove('active');

    currentClass = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    currentQuestions = [];
}
