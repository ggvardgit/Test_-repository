// Resources page functionality
document.addEventListener('DOMContentLoaded', () => {
    renderResources();
    setupFilters();
    setupDBQTool();
    setupSAQPractice();
    setupTimeline();
});

// Sample resources data
const RESOURCES = [
    {
        id: 1,
        title: "DBQ Annotation Tool",
        type: "tool",
        period: "all",
        skill: "dbq",
        format: "tool",
        description: "Interactive tool for annotating and scoring DBQ responses"
    },
    {
        id: 2,
        title: "SAQ Practice Set: Period 3",
        type: "practice",
        period: 3,
        skill: "saq",
        format: "practice",
        description: "10 Short Answer Questions covering Revolution and Constitution"
    },
    {
        id: 3,
        title: "LEQ Outline Generator",
        type: "tool",
        period: "all",
        skill: "leq",
        format: "tool",
        description: "Generate structured outlines for Long Essay Questions"
    },
    {
        id: 4,
        title: "Period 5 Timeline: Civil War",
        type: "timeline",
        period: 5,
        skill: "all",
        format: "timeline",
        description: "Interactive timeline of key events from 1844-1877"
    },
    {
        id: 5,
        title: "DBQ Practice: Progressive Era",
        type: "practice",
        period: 7,
        skill: "dbq",
        format: "practice",
        description: "Full DBQ with 7 documents on Progressive reforms"
    },
    {
        id: 6,
        title: "Study Guide: Period 2",
        type: "guide",
        period: 2,
        skill: "all",
        format: "guide",
        description: "Comprehensive study guide covering Colonial America themes"
    },
    {
        id: 7,
        title: "SAQ Drills: All Periods",
        type: "practice",
        period: "all",
        skill: "saq",
        format: "practice",
        description: "Timed SAQ practice covering all 8 periods"
    },
    {
        id: 8,
        title: "LEQ Practice: Period 4",
        type: "practice",
        period: 4,
        skill: "leq",
        format: "practice",
        description: "Practice LEQ on Market Revolution and its effects"
    }
];

let currentFilters = {
    period: 'all',
    skill: 'all',
    format: 'all'
};

function renderResources() {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filtered = RESOURCES.filter(resource => {
        if (currentFilters.period !== 'all' && resource.period !== currentFilters.period && resource.period !== 'all') {
            return false;
        }
        if (currentFilters.skill !== 'all' && resource.skill !== currentFilters.skill && resource.skill !== 'all') {
            return false;
        }
        if (currentFilters.format !== 'all' && resource.format !== currentFilters.format) {
            return false;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No resources match your filters.</p>';
        return;
    }
    
    filtered.forEach(resource => {
        const card = createResourceCard(resource);
        grid.appendChild(card);
    });
}

function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    
    const typeLabels = {
        tool: 'Tool',
        practice: 'Practice',
        guide: 'Guide',
        timeline: 'Timeline'
    };
    
    const skillLabels = {
        saq: 'SAQ',
        dbq: 'DBQ',
        leq: 'LEQ',
        mcq: 'MCQ',
        all: 'All Skills'
    };
    
    card.innerHTML = `
        <span class="resource-type">${typeLabels[resource.type] || resource.type}</span>
        <h3 class="resource-title">${resource.title}</h3>
        <p class="resource-description">${resource.description}</p>
        <div class="resource-meta">
            ${resource.period !== 'all' ? `<span>Period ${resource.period}</span>` : '<span>All Periods</span>'}
            <span>${skillLabels[resource.skill] || resource.skill}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        handleResourceClick(resource);
    });
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleResourceClick(resource);
        }
    });
    
    return card;
}

function handleResourceClick(resource) {
    if (!resource) {
        console.error('No resource provided to handleResourceClick');
        return;
    }
    
    // Check for timeline resources first (by format or type)
    if (resource.format === 'timeline' || resource.type === 'timeline') {
        openTimeline(resource);
        return;
    }
    
    // Check for DBQ tools
    if (resource.type === 'tool' && resource.skill === 'dbq') {
        APUSH.openModal('dbq-modal');
        return;
    }
    
    // Check for SAQ practice
    if (resource.format === 'practice' && resource.skill === 'saq') {
        openSAQPractice(resource);
        return;
    }
    
    // Check for other practice resources
    if (resource.format === 'practice') {
        alert(`Opening ${resource.title}. Practice questions for ${resource.skill.toUpperCase()} coming soon.`);
        return;
    }
    
    // Fallback for any other resources
    alert(`Opening ${resource.title}. In a full implementation, this would load the resource.`);
}

function setupFilters() {
    const periodFilter = document.getElementById('period-filter-resources');
    const skillFilter = document.getElementById('skill-filter');
    const formatFilter = document.getElementById('format-filter');
    
    if (periodFilter) {
        periodFilter.addEventListener('change', (e) => {
            currentFilters.period = e.target.value;
            renderResources();
        });
    }
    
    if (skillFilter) {
        skillFilter.addEventListener('change', (e) => {
            currentFilters.skill = e.target.value;
            renderResources();
        });
    }
    
    if (formatFilter) {
        formatFilter.addEventListener('change', (e) => {
            currentFilters.format = e.target.value;
            renderResources();
        });
    }
}

function setupDBQTool() {
    const dbqModal = document.getElementById('dbq-modal');
    if (!dbqModal) return;
    
    // DBQ Scorer functionality
    const thesisCheckbox = document.getElementById('thesis-point');
    const contextCheckbox = document.getElementById('context-point');
    const evidenceInput = document.getElementById('evidence-points');
    const analysisInput = document.getElementById('analysis-points');
    const totalScore = document.getElementById('dbq-total-score');
    
    function updateDBQScore() {
        let score = 0;
        if (thesisCheckbox && thesisCheckbox.checked) score += 1;
        if (contextCheckbox && contextCheckbox.checked) score += 1;
        if (evidenceInput) score += parseInt(evidenceInput.value) || 0;
        if (analysisInput) score += parseInt(analysisInput.value) || 0;
        if (totalScore) totalScore.textContent = score;
    }
    
    if (thesisCheckbox) thesisCheckbox.addEventListener('change', updateDBQScore);
    if (contextCheckbox) contextCheckbox.addEventListener('change', updateDBQScore);
    if (evidenceInput) evidenceInput.addEventListener('input', updateDBQScore);
    if (analysisInput) analysisInput.addEventListener('input', updateDBQScore);
    
    // Annotation buttons
    const annotationBtns = document.querySelectorAll('.annotation-btn');
    annotationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            // In full implementation, this would add annotation functionality
            alert(`Annotation tool for ${type} would open here.`);
        });
    });
}

// SAQ Practice Questions Data
const SAQ_QUESTIONS = {
    all: [
        {
            question: "Briefly explain ONE way in which the development of the Atlantic economy in the seventeenth and eighteenth centuries contributed to the development of regional identities in the British North American colonies.",
            prompt: "a) Explain ONE way in which the development of the Atlantic economy contributed to regional identities.",
            sampleAnswer: "The Atlantic economy fostered regional specialization: New England focused on shipbuilding and trade, the Middle Colonies on grain production, and the Southern Colonies on cash crops like tobacco and rice. This economic specialization created distinct regional cultures and social structures."
        },
        {
            question: "Briefly explain ONE specific historical development that represents an accomplishment of the national government under the Articles of Confederation.",
            prompt: "b) Explain ONE accomplishment of the Articles of Confederation government.",
            sampleAnswer: "The Articles of Confederation successfully established the Northwest Ordinance of 1787, which created a process for admitting new states, prohibited slavery in the Northwest Territory, and set aside land for public education."
        },
        {
            question: "Briefly explain ONE way in which the market revolution changed women's roles in society from 1800 to 1848.",
            prompt: "c) Explain ONE way the market revolution changed women's roles.",
            sampleAnswer: "The market revolution created the \"cult of domesticity,\" which idealized women as moral guardians of the home while men worked in the market economy. This separated public and private spheres, limiting women's economic participation outside the home."
        },
        {
            question: "Briefly explain ONE specific historical effect of the Civil War on the economy of the United States.",
            prompt: "d) Explain ONE economic effect of the Civil War.",
            sampleAnswer: "The Civil War accelerated industrialization in the North, as the Union needed mass-produced weapons, uniforms, and supplies. This led to increased factory production and consolidated economic power in the Northeast."
        },
        {
            question: "Briefly explain ONE way in which the Progressive Era reforms represented a response to the problems created by industrialization and urbanization.",
            prompt: "e) Explain ONE Progressive Era response to industrialization problems.",
            sampleAnswer: "Progressive reformers pushed for workplace safety regulations and labor laws, such as limiting working hours and improving factory conditions, in response to dangerous and exploitative industrial working conditions."
        }
    ],
    3: [
        {
            question: "Briefly explain ONE specific cause of the American Revolution.",
            prompt: "a) Explain ONE cause of the American Revolution.",
            sampleAnswer: "The British imposition of taxes without colonial representation, such as the Stamp Act and Townshend Acts, violated the colonists' understanding of their rights as Englishmen and led to widespread resistance."
        },
        {
            question: "Briefly explain ONE way in which the American Revolution changed political ideas about government.",
            prompt: "b) Explain ONE political idea changed by the Revolution.",
            sampleAnswer: "The Revolution popularized the concept of republicanism, emphasizing that government authority derives from the consent of the governed rather than divine right or hereditary monarchy."
        },
        {
            question: "Briefly explain ONE reason why the Articles of Confederation were replaced by the Constitution.",
            prompt: "c) Explain ONE reason for replacing the Articles of Confederation.",
            sampleAnswer: "The Articles gave the national government insufficient power to regulate commerce and tax, leading to economic chaos and inability to address issues like Shays' Rebellion, which convinced leaders a stronger central government was needed."
        }
    ]
};

let currentSAQIndex = 0;
let currentSAQSet = [];

function setupSAQPractice() {
    const prevBtn = document.getElementById('saq-prev-btn');
    const nextBtn = document.getElementById('saq-next-btn');
    const checkBtn = document.getElementById('saq-check-btn');
    const showAnswerBtn = document.getElementById('saq-show-answer-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSAQIndex > 0) {
                currentSAQIndex--;
                displaySAQQuestion();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSAQIndex < currentSAQSet.length - 1) {
                currentSAQIndex++;
                displaySAQQuestion();
            }
        });
    }

    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            checkSAQAnswer();
        });
    }

    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {
            showSAQAnswer();
        });
    }
}

function openSAQPractice(resource) {
    // Determine which question set to use
    const period = resource.period;
    
    if (period === 'all') {
        currentSAQSet = SAQ_QUESTIONS.all;
    } else if (SAQ_QUESTIONS[period]) {
        currentSAQSet = SAQ_QUESTIONS[period];
    } else {
        // Fallback to all questions if period-specific set not available
        currentSAQSet = SAQ_QUESTIONS.all;
    }

    if (!currentSAQSet || currentSAQSet.length === 0) {
        alert('No SAQ questions available for this period.');
        return;
    }

    currentSAQIndex = 0;
    displaySAQQuestion();
    APUSH.openModal('saq-modal');
}

function displaySAQQuestion() {
    const question = currentSAQSet[currentSAQIndex];
    if (!question) return;

    const questionText = document.getElementById('saq-question-text');
    const promptText = document.getElementById('saq-prompt-text');
    const answerInput = document.getElementById('saq-answer-input');
    const counter = document.getElementById('saq-question-counter');
    const prevBtn = document.getElementById('saq-prev-btn');
    const nextBtn = document.getElementById('saq-next-btn');
    const feedback = document.getElementById('saq-feedback');
    const sampleAnswer = document.getElementById('saq-sample-answer');

    if (questionText) questionText.textContent = question.question;
    if (promptText) promptText.textContent = question.prompt;
    if (answerInput) answerInput.value = '';
    if (counter) counter.textContent = `Question ${currentSAQIndex + 1} of ${currentSAQSet.length}`;
    
    if (prevBtn) prevBtn.disabled = currentSAQIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSAQIndex === currentSAQSet.length - 1;
    
    if (feedback) {
        feedback.style.display = 'none';
        feedback.innerHTML = '';
    }
    if (sampleAnswer) {
        sampleAnswer.style.display = 'none';
        sampleAnswer.innerHTML = '';
    }
}

function checkSAQAnswer() {
    const answerInput = document.getElementById('saq-answer-input');
    const feedback = document.getElementById('saq-feedback');
    
    if (!answerInput || !feedback) return;
    
    const userAnswer = answerInput.value.trim();
    
    if (userAnswer.length === 0) {
        feedback.style.display = 'block';
        feedback.className = 'saq-feedback feedback-error';
        feedback.innerHTML = '<strong>Please provide an answer before checking.</strong>';
        return;
    }
    
    // Basic feedback based on length and structure
    let feedbackText = '<strong>Review your response:</strong><br>';
    
    if (userAnswer.length < 50) {
        feedbackText += 'Response is brief. Provide 2-3 sentences with specific historical details.';
    } else if (userAnswer.length < 150) {
        feedbackText += 'Response length is adequate. Address all parts of the question with specific examples.';
    } else {
        feedbackText += 'Response is developed. SAQ responses should be concise but complete.';
    }
    
    feedback.style.display = 'block';
    feedback.className = 'saq-feedback feedback-info';
    feedback.innerHTML = feedbackText;
}

function showSAQAnswer() {
    const question = currentSAQSet[currentSAQIndex];
    const sampleAnswer = document.getElementById('saq-sample-answer');
    
    if (!question || !sampleAnswer) return;
    
    sampleAnswer.style.display = 'block';
    sampleAnswer.innerHTML = `
        <h4>Sample Answer:</h4>
        <p>${question.sampleAnswer}</p>
    `;
}

function setupTimeline() {
    // Timeline setup is handled in openTimeline function
}

function openTimeline(resource) {
    if (!resource) {
        console.error('No resource provided to openTimeline');
        return;
    }
    
    // Get period data from APUSH_DATA
    const period = parseInt(resource.period);
    
    if (isNaN(period)) {
        console.error('Invalid period:', resource.period);
        alert('Invalid period specified for timeline.');
        return;
    }
    
    // Try multiple ways to access APUSH_DATA
    let periodData = null;
    let apushData = null;
    
    // Check window.APUSH_DATA first
    if (typeof window !== 'undefined' && window.APUSH_DATA) {
        apushData = window.APUSH_DATA;
    }
    // Fallback to global APUSH_DATA
    else if (typeof APUSH_DATA !== 'undefined') {
        apushData = APUSH_DATA;
    }
    
    // Get period data
    if (apushData && apushData.periods && apushData.periods[period]) {
        periodData = apushData.periods[period];
    }
    
    if (!periodData) {
        console.error('Timeline data not found for period:', period);
        alert(`Timeline data not available for Period ${period}. Please make sure apush-data.js is loaded.`);
        return;
    }
    
    try {
        displayTimeline(periodData, resource.title);
        if (typeof APUSH !== 'undefined' && APUSH.openModal) {
            APUSH.openModal('timeline-modal');
        } else {
            console.error('APUSH.openModal is not available');
            alert('Error: Cannot open timeline modal. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error displaying timeline:', error);
        alert('An error occurred while displaying the timeline. Please check the console for details.');
    }
}

function displayTimeline(periodData, title) {
    const periodName = document.getElementById('timeline-period-name');
    const periodDates = document.getElementById('timeline-period-dates');
    const eventsContainer = document.getElementById('timeline-events');
    const modalTitle = document.getElementById('timeline-modal-title');
    
    if (!periodData || !periodData.timeline) {
        alert('No timeline data available for this period.');
        return;
    }
    
    if (modalTitle) modalTitle.textContent = title || `Period ${periodData.number}: ${periodData.name}`;
    if (periodName) periodName.textContent = periodData.name;
    if (periodDates) periodDates.textContent = periodData.dates;
    
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        
        periodData.timeline.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.setAttribute('data-index', index);
            
            eventElement.innerHTML = `
                <div class="timeline-event-marker"></div>
                <div class="timeline-event-content">
                    <div class="timeline-event-date">${event.date}</div>
                    <div class="timeline-event-title">${event.title}</div>
                    <div class="timeline-event-description">${event.description}</div>
                </div>
            `;
            
            // Add click handler for interactivity
            eventElement.addEventListener('click', () => {
                // Remove active class from all events
                document.querySelectorAll('.timeline-event').forEach(e => e.classList.remove('active'));
                // Add active class to clicked event
                eventElement.classList.add('active');
            });
            
            eventsContainer.appendChild(eventElement);
        });
    }
}
