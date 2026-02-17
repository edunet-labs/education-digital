
import { showToast } from './ui.js';

export function initPdfUtils() {
    const generateFromPdfBtn = document.getElementById('generateFromPdfBtn');
    const pdfGeneratorInput = document.getElementById('pdfGeneratorInput');

    if (!generateFromPdfBtn || !pdfGeneratorInput) return;

    // Auto-Generate from PDF
    generateFromPdfBtn.addEventListener('click', () => {
        pdfGeneratorInput.click();
    });

    pdfGeneratorInput.addEventListener('change', async function () {
        if (this.files.length === 0) return;

        const file = this.files[0];
        generateFromPdfBtn.disabled = true;
        generateFromPdfBtn.innerHTML = '<span class="loading-spinner" style="width: 12px; height: 12px; border-width: 2px;"></span> Mengekstrak...';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Extract all pages text
            const allLines = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                if (textContent.items.length === 0) continue;

                // Analyze font sizes
                const fontSizes = textContent.items.map(item => item.transform[0]).filter(s => s > 0);
                const medianFontSize = calculateMedian(fontSizes);

                // Group items by lines
                const lines = groupTextByLines(textContent.items, medianFontSize);
                allLines.push(...lines);
            }

            // Build structured HTML with Paragraph Merging
            const html = buildStructuredHtml(allLines);

            // Insert into textarea
            const kontenArea = document.getElementById('konten');
            if (kontenArea) {
                kontenArea.value = html;
                showToast('Konten berhasil diekstrak dengan format rapi!', 'success');
            }

        } catch (error) {
            console.error('PDF Extraction Error:', error);
            showToast('Gagal mengekstrak PDF: ' + error.message, 'error');
        } finally {
            generateFromPdfBtn.disabled = false;
            generateFromPdfBtn.innerHTML = '<i class="bi bi-magic"></i> Auto-Generate Dari PDF';
            this.value = '';
        }
    });

    initQuizParser();
}

/**
 * Initialize Quiz PDF Parser
 */
function initQuizParser() {
    const quizPdfInput = document.getElementById('quizPdfInput');
    const quizDataInput = document.getElementById('quizData');
    const quizPreview = document.getElementById('quizPreview');
    const quizStats = document.getElementById('quizStats');
    const removeQuizBtn = document.getElementById('removeQuizBtn');
    const quizFileName = document.getElementById('quizFileName');

    if (!quizPdfInput) return;

    quizPdfInput.addEventListener('change', async function () {
        if (this.files.length === 0) return;

        const file = this.files[0];
        quizFileName.textContent = file.name;

        try {
            const quizData = await parseQuizPdf(file);

            if (quizData.length === 0) {
                throw new Error('Tidak ada soal yang ditemukan. Pastikan format PDF sesuai.');
            }

            // Success
            quizDataInput.value = JSON.stringify(quizData);
            quizPreview.style.display = 'block';
            quizStats.textContent = `${quizData.length} Soal ditemukan`;

            showToast(`Berhasil memproses ${quizData.length} soal!`, 'success');

        } catch (error) {
            console.error('Quiz Parsing Error:', error);
            showToast(error.message, 'error');

            // Reset
            quizDataInput.value = '';
            quizPreview.style.display = 'none';
            quizFileName.textContent = 'Pilih file Soal PDF...';
        } finally {
            this.value = '';
        }
    });

    if (removeQuizBtn) {
        removeQuizBtn.addEventListener('click', () => {
            quizDataInput.value = '';
            quizPreview.style.display = 'none';
            quizFileName.textContent = 'Pilih file Soal PDF...';
            showToast('Kuis dihapus', 'info');
        });
    }
}

/**
 * Parse Quiz PDF
 * Format:
 * 1. Question...
 * a. Option A
 * ...
 * e. Option E
 * Jawaban yang benar dari quiz ini : e
 */
async function parseQuizPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let allText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        allText += pageText + '\n';
    }

    // Split into lines and process
    // Note: PDF extraction often messes up lines. 
    // We'll try to split by known patterns or just process the raw stream if possible.
    // Better approach for PDF.js text: Use the y-coordinate sort we already have?

    // Let's re-use the groupTextByLines logic but slightly adapted or just use the raw text 
    // because quiz format is usually simple.
    // However, reliable extraction needs line grouping.

    const allLines = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        if (textContent.items.length === 0) continue;

        const fontSizes = textContent.items.map(item => item.transform[0]).filter(s => s > 0);
        const medianFontSize = calculateMedian(fontSizes);
        const lines = groupTextByLines(textContent.items, medianFontSize);
        allLines.push(...lines);
    }

    const questions = [];
    let currentQuestion = null;
    let currentOption = null;

    // Matches: "Jawaban nya : B. text", "Jawaban nya C. TCP", "Jawaban : B", etc.
    const answerRegex = /jawaban(?:\s*nya|\s+yang\s+benar(?:\s+dari\s+quiz\s+ini)?)?\s*:?\s*([a-e])/i;

    for (const line of allLines) {
        let text = line.text.trim();
        if (!text) continue;

        // 1. Detect Answer Key FIRST (before option check!)
        //    "Jawaban nya : B. Mengirim..." or "Jawaban nya C. TCP"
        const answerMatch = text.match(answerRegex);
        if (answerMatch && currentQuestion) {
            currentQuestion.answer = answerMatch[1].toLowerCase();
            continue;
        }

        // 2. Detect Question Start: "1. Bla bla"
        const questionMatch = text.match(/^(\d+)\.\s+(.+)/);
        if (questionMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                id: parseInt(questionMatch[1]),
                question: questionMatch[2],
                options: {},
                answer: null
            };
            continue;
        }

        // 3. Detect Option: "A. Bla bla" or "a) Bla bla"
        const optionMatch = text.match(/^([a-e])[\.\)]\s+(.+)/i);
        if (optionMatch && currentQuestion) {
            const key = optionMatch[1].toLowerCase();
            let value = optionMatch[2];

            // Check if answer is hidden inside the option line
            // e.g. "D. Menampilkan halaman web Jawaban nya : B"
            const internalAnswerMatch = value.match(answerRegex);
            if (internalAnswerMatch) {
                currentQuestion.answer = internalAnswerMatch[1].toLowerCase();
                // Remove the answer text from the option value
                const idx = value.search(answerRegex);
                if (idx !== -1) {
                    value = value.substring(0, idx).trim();
                }
            }

            currentQuestion.options[key] = value;
            continue;
        }
    }

    // Push last question
    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions;
}

/**
 * Build clean, structured HTML from extracted PDF lines.
 * Merges consecutive lines into paragraphs and uses styled components.
 */
function buildStructuredHtml(lines) {
    let html = '';
    let inList = false;
    let inNumberedList = false;
    let paragraphBuffer = [];

    // Function to flush current paragraph buffer
    const flushParagraph = () => {
        if (paragraphBuffer.length > 0) {
            const joinedText = paragraphBuffer.join(' ').replace(/\s+/g, ' ');
            html += `<p>${cleanText(joinedText)}</p>\n`;
            paragraphBuffer = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const text = line.text.trim();
        if (!text) continue;

        const lineType = classifyLine(line, text);

        // Check vertical gap to force new paragraph (if gap > 1.8x line height)
        // We compare current line's Y with previous line's Y
        if (i > 0 && lineType === 'paragraph') {
            const prevLine = lines[i - 1];
            // Note: PDF coordinate Y grows upwards, so prevLine.y is typically larger than line.y for next line
            // But strict Y comparison across pages is tricky. We only check if on same page logic (which we lost track of).
            // Robust heuristic: check if line height significantly different or gap huge.
            // Since we merged pages, let's assume raw coordinate logic holds if we didn't reset.
            // Actually, safest is to rely on 'lineType' changes or text patterns.
        }

        // Processing Logic
        if (lineType === 'paragraph') {
            // Check if previous line ended with a hyphen (soft hyphenation)
            const lastBuffer = paragraphBuffer.length > 0 ? paragraphBuffer[paragraphBuffer.length - 1] : '';
            if (lastBuffer.endsWith('-')) {
                // Determine if we should merge without space (e.g. kom- puter -> komputer)
                // Heuristic: if char before - is lowercase letter
                if (/[a-z]-$/.test(lastBuffer)) {
                    paragraphBuffer[paragraphBuffer.length - 1] = lastBuffer.slice(0, -1) + text;
                    continue;
                }
            }

            // Add to buffer
            paragraphBuffer.push(text);
        } else {
            // Not a paragraph (Heading, List, Box) -> Flush any pending paragraph
            flushParagraph();

            // Close open lists if needed (unless this is a list item of same type)
            if (lineType !== 'bullet' && inList) {
                html += '</ul>\n';
                inList = false;
            }
            if (lineType !== 'numbered' && inNumberedList) {
                html += '</ol>\n';
                inNumberedList = false;
            }

            switch (lineType) {
                case 'main-heading':
                    html += `\n<h2><i class="bi bi-bookmark-fill"></i> ${cleanText(text)}</h2>\n`;
                    break;

                case 'sub-heading':
                    html += `\n<h3>${cleanText(text)}</h3>\n`;
                    break;

                case 'bullet':
                    if (!inList) {
                        html += '<ul class="styled-list">\n';
                        inList = true;
                    }
                    html += `  <li>${cleanBullet(text)}</li>\n`;
                    break;

                case 'numbered':
                    if (!inNumberedList) {
                        html += '<ol class="styled-list">\n';
                        inNumberedList = true;
                    }
                    html += `  <li>${cleanNumbered(text)}</li>\n`;
                    break;

                case 'note':
                    html += buildInfoBox(text, 'info', 'Catatan');
                    break;

                case 'warning':
                    html += buildInfoBox(text, 'warning', 'Perhatian');
                    break;

                case 'tip':
                    html += buildInfoBox(text, 'success', 'Tips');
                    break;
            }
        }
    }

    // flushing remainder
    flushParagraph();
    if (inList) html += '</ul>\n';
    if (inNumberedList) html += '</ol>\n';

    // Cleanup
    html = html.replace(/\n{3,}/g, '\n\n').trim();
    return html;
}

function classifyLine(line, text) {
    // Check for main headings (significantly larger font)
    if (line.isMainHeading) return 'main-heading';

    // Check for numbered headings (e.g. "A. PENDAHULUAN" or "1. LATAR BELAKANG" in UPPERCASE)
    // Must be uppercase and generally short to be a heading
    if (/^([A-Z0-9]+\.|[IVX]+\.)\s+[A-Z\s\(\)\-]{3,}$/.test(text) && text.length < 100) {
        return 'sub-heading';
    }

    if (line.isSubHeading) return 'sub-heading';

    // Check for bullet list items
    if (/^[•●○◦▪▸\-\*\u2022\u2023\u25E6]\s/.test(text)) return 'bullet';

    // Check for numbered list items (1. 2. 3. or a. b. c. or 1) 2) 3))
    // But EXCLUDE things that look like headings (handled above)
    if (/^(\d+[\.\)]\s|[a-z][\.\)]\s)/i.test(text)) return 'numbered';

    if (/^(catatan|note|nb|keterangan)\s*[:\-]/i.test(text)) return 'note';
    if (/^(perhatian|peringatan|warning|awas|penting|important)\s*[:\-!]/i.test(text)) return 'warning';
    if (/^(tips?|saran|hint)\s*[:\-]/i.test(text)) return 'tip';

    return 'paragraph';
}

/**
 * Build styled info/warning/success box
 */
function buildInfoBox(text, type, title) {
    const iconMap = {
        info: 'bi-info-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        success: 'bi-lightbulb-fill'
    };

    const cleanedText = text.replace(/^(catatan|note|nb|keterangan|perhatian|peringatan|warning|awas|penting|important|tips?|saran|hint)\s*[:\-!]\s*/i, '');

    return `
<div class="${type}-box">
    <div class="${type}-box-icon">
        <i class="bi ${iconMap[type]}"></i>
    </div>
    <div class="${type}-box-content">
        <h4>${title}</h4>
        <p>${cleanedText}</p>
    </div>
</div>
`;
}

function cleanText(text) {
    return text.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
}
function cleanBullet(text) {
    return cleanText(text.replace(/^[•●○◦▪▸\-\*\u2022\u2023\u25E6]\s*/, ''));
}
function cleanNumbered(text) {
    // Keep the numbering context if it's referenced in text? No, usually we rely on <ol>
    // But for PDF extraction, sometimes it's safer to keep the number if we can't guarantee unified list.
    // However, styled-list adds its own counters. Let's strip the number.
    return cleanText(text.replace(/^(\d+[\.\)]\s*|[a-z][\.\)]\s*)/i, ''));
}

// ==========================================
// Helper Functions
// ==========================================

function calculateMedian(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function groupTextByLines(items, medianFontSize) {
    const lines = [];
    let currentLine = { y: -1, items: [] };

    // Thresholds
    const mainHeadingThreshold = medianFontSize * 1.4;
    const subHeadingThreshold = medianFontSize * 1.15;

    // Sort items
    const sorted = [...items].sort((a, b) => {
        if (Math.abs(a.transform[5] - b.transform[5]) > 3) {
            return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
    });

    sorted.forEach(item => {
        const y = item.transform[5];
        // Line break detection (gap > 4)
        if (Math.abs(y - currentLine.y) > 4) {
            if (currentLine.items.length > 0) {
                pushLine(lines, currentLine, mainHeadingThreshold, subHeadingThreshold);
            }
            currentLine = { y, items: [item] };
        } else {
            currentLine.items.push(item);
        }
    });

    if (currentLine.items.length > 0) {
        pushLine(lines, currentLine, mainHeadingThreshold, subHeadingThreshold);
    }

    return lines;
}

function pushLine(lines, currentLine, mainThreshold, subThreshold) {
    const text = currentLine.items.map(i => i.str).join(' ');
    const maxHeight = Math.max(...currentLine.items.map(i => Math.abs(i.transform[0])));
    const isBold = currentLine.items.some(i =>
        i.fontName && (i.fontName.toLowerCase().includes('bold') || i.fontName.toLowerCase().includes('black'))
    );

    const trimmed = text.trim();
    if (!trimmed || /^\d+$/.test(trimmed)) return;

    lines.push({
        text: trimmed,
        maxHeight,
        isBold,
        y: currentLine.y, // preserve Y coordinate
        isMainHeading: maxHeight >= mainThreshold,
        isSubHeading: maxHeight >= subThreshold && maxHeight < mainThreshold
    });
}
