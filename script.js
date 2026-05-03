// ===== Election Process Assistant — Main Logic =====

(function () {
    'use strict';

    // ----- DOM References -----
    const chatArea = document.getElementById('chat-area');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const welcomeCard = document.getElementById('welcome-card');
    const userInput = document.getElementById('user-input');
    const btnSend = document.getElementById('btn-send');
    const btnVoice = document.getElementById('btn-voice');
    const btnLocation = document.getElementById('btn-location');
    const btnTheme = document.getElementById('btn-theme');
    const floatingChips = document.getElementById('floating-chips');
    const voiceModal = document.getElementById('voice-modal');
    const voiceStop = document.getElementById('voice-stop');
    const btnClear = document.getElementById('btn-clear');
    const langSelector = document.getElementById('lang-selector');

    // ----- State -----
    let chatContext = { step: null, age: null, state: null, isFirstTime: null };
    let messageCount = 0;

    // ----- Init -----
    function init() {
        bindEvents();
        initLang();
        userInput.focus();
    }

    // ----- Event Bindings -----
    function bindEvents() {
        btnSend.addEventListener('click', handleSend);
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Quick action chips (welcome + floating)
        document.querySelectorAll('[data-action]').forEach((btn) => {
            btn.addEventListener('click', () => handleAction(btn.dataset.action));
        });

        // Header buttons
        btnLocation.addEventListener('click', () => handleAction('location'));
        btnTheme.addEventListener('click', toggleTheme);
        btnVoice.addEventListener('click', startVoice);
        if (btnClear) btnClear.addEventListener('click', clearChat);

        // Modals
        voiceStop.addEventListener('click', stopVoice);
        voiceModal.addEventListener('click', (e) => {
            if (e.target === voiceModal) stopVoice();
        });

        // Language
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                localStorage.setItem('appLang', e.target.value);
                updateUILanguage();
            });
        }



        // Show floating chips after scroll
        chatArea.addEventListener('scroll', () => {
            if (chatArea.scrollTop > 200 && messageCount > 0) {
                floatingChips.classList.remove('hidden');
            } else {
                floatingChips.classList.add('hidden');
            }
        });
    }

    // ----- Handle Send -----
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;
        userInput.value = '';
        addUserMessage(text);

        if (window.MockFirebase) {
            MockFirebase.logQuery(text, 'User Input', chatContext);
        }

        if (chatContext.step === 'age') {
            processAge(text);
            return;
        } else if (chatContext.step === 'firstTime') {
            processFirstTime(text);
            return;
        } else if (chatContext.step === 'state') {
            processState(text);
            return;
        }

        processInput(text);
    }

    // ----- Handle Quick Action -----
    function handleAction(action) {
        hideWelcome();
        const labels = {
            eligibility: t('chip_eligibility'),
            steps: t('chip_steps'),
            documents: t('chip_documents'),
            timeline: t('chip_timeline'),
            faq: t('chip_faq'),
            location: t('chip_location'),
            results: t('chip_results'),
        };
        addUserMessage(labels[action] || action);
        switch (action) {
            case 'eligibility': showEligibilityPrompt(); break;
            case 'steps': showVotingSteps(); break;
            case 'documents': showDocuments(); break;
            case 'timeline': showTimeline(); break;
            case 'faq': showFAQ(); break;
            case 'location': showLocation(); break;
            case 'results': showLiveResults(); break;
        }
    }

    // ----- NLP-like Input Processing -----
    // Levenshtein distance for fuzzy matching
    function getEditDistance(a, b) {
        if(a.length == 0) return b.length; 
        if(b.length == 0) return a.length; 

        var matrix = [];
        for(var i = 0; i <= b.length; i++) matrix[i] = [i];
        for(var j = 0; j <= a.length; j++) matrix[0][j] = j;

        for(var i = 1; i <= b.length; i++) {
            for(var j = 1; j <= a.length; j++) {
                if(b.charAt(i-1) == a.charAt(j-1)) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function processInput(text) {
        const lower = text.toLowerCase();
        const words = lower.split(/\s+/);

        const patterns = [
            { id: 'eligible', keys: ['eligible', 'eligibility', 'can i vote', 'am i eligible', 'age', 'old enough'], action: () => showEligibilityPrompt() },
            { id: 'step', keys: ['step', 'how to vote', 'voting process', 'procedure', 'cast vote', 'how do i vote', 'steps to vote'], action: () => showVotingSteps() },
            { id: 'document', keys: ['document', 'id card', 'voter id', 'aadhaar', 'aadhar', 'passport', 'paper', 'what do i need'], action: () => showDocuments() },
            { id: 'timeline', keys: ['timeline', 'schedule', 'when', 'date', 'election date'], action: () => showTimeline() },
            { id: 'result', keys: ['result', 'who won', 'counting', 'winner', 'live results', 'election results', 'lead'], action: () => showLiveResults() },
            { id: 'faq', keys: ['faq', 'question', 'help', 'common', 'how to register', 'lost', 'lose voter'], action: () => showFAQ() },
            { id: 'booth', keys: ['booth', 'location', 'where', 'polling', 'nearest', 'near me'], action: () => showLocation() },
            { id: 'hello', keys: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste'], action: () => showGreeting() },
            { id: 'thank', keys: ['thank', 'thanks', 'thank you', 'thx'], action: () => showThanks() },
            { id: 'evm', keys: ['evm', 'machine', 'electronic'], action: () => showEVMInfo() },
            { id: 'register', keys: ['register', 'registration', 'enroll', 'sign up'], action: () => showRegistration() },
        ];

        let bestMatch = null;
        let lowestDist = Infinity;

        for (const p of patterns) {
            // Exact match
            if (p.keys.some((k) => lower.includes(k))) {
                if (window.MockFirebase) MockFirebase.logQuery(text, 'Matched: ' + p.id, chatContext);
                chatContext.lastIntent = p.id;
                p.action();
                return;
            }

            // Fuzzy match (for single words in input)
            for (const word of words) {
                if (word.length < 4) continue; // Don't fuzzy match short words
                for (const key of p.keys) {
                    if (key.includes(' ')) continue; // Only fuzzy match single word keys against single input words
                    const dist = getEditDistance(word, key);
                    if (dist <= 2 && dist < lowestDist) { // Allow up to 2 typos
                        lowestDist = dist;
                        bestMatch = p;
                    }
                }
            }
        }

        if (bestMatch) {
            if (window.MockFirebase) MockFirebase.logQuery(text, 'Fuzzy Matched: ' + bestMatch.id, chatContext);
            chatContext.lastIntent = bestMatch.id;
            
            // Add a small "Did you mean?" transition
            addBotMessage(`<p style="font-size:0.85rem; color:var(--text-muted);"><em>I think you're asking about <strong>${bestMatch.id}</strong>. Here you go:</em></p>`, 400);
            setTimeout(() => bestMatch.action(), 600);
            return;
        }


        if (window.MockFirebase) MockFirebase.logQuery(text, 'Unmatched / Fallback', chatContext);
        showFallback(text);
    }

    // ----- Message Helpers -----
    function addUserMessage(text) {
        hideWelcome();
        messageCount++;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const msg = createMessageEl('user', `<p>${escapeHtml(text)}</p>`, time);
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function addBotMessage(html, customDelay = 0) {
        showTyping();
        // Dynamic delay based on text length (simulating typing speed), clamped between 600ms and 2000ms
        const baseDelay = customDelay || Math.min(Math.max(html.length * 10, 600), 2000);
        
        setTimeout(() => {
            hideTyping();
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const msg = createMessageEl('bot', html, time);
            messagesContainer.appendChild(msg);
            scrollToBottom();
            bindFAQToggles();
            
            // Generate contextual recommendations based on current step or last intent
            appendRecommendations();
        }, baseDelay);
    }

    function createMessageEl(type, html, time) {
        const wrapper = document.createElement('div');
        wrapper.className = `message ${type}`;
        const icon = type === 'bot' ? 'smart_toy' : 'person';
        wrapper.innerHTML = `
            <div class="msg-avatar"><span class="material-icons-round">${icon}</span></div>
            <div class="msg-bubble">
                ${html}
                <div class="msg-time" style="font-size: 0.65rem; opacity: 0.6; text-align: right; margin-top: 4px;">${time}</div>
            </div>
        `;
        return wrapper;
    }

    function hideWelcome() {
        if (welcomeCard) welcomeCard.style.display = 'none';
    }

    function showTyping() { 
        typingIndicator.classList.remove('hidden'); 
        messagesContainer.appendChild(typingIndicator); // move to bottom
        scrollToBottom(); 
    }
    function hideTyping() { typingIndicator.classList.add('hidden'); }

    function clearChat() {
        // Remove all messages
        messagesContainer.innerHTML = '';
        messageCount = 0;
        chatContext = { step: null, age: null, state: null, isFirstTime: null };

        // Hide floating chips
        floatingChips.classList.add('hidden');

        // Show welcome card
        if (welcomeCard) {
            welcomeCard.style.display = 'block';
            welcomeCard.classList.remove('fade-in');
            // Trigger reflow to restart animation
            void welcomeCard.offsetWidth;
            welcomeCard.classList.add('fade-in');
        }

        // Add default bot message
        addBotMessage(t('bot_hello'));
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ----- Response Modules -----
    
    function appendRecommendations() {
        // Remove old recs
        const oldRecs = document.querySelectorAll('.inline-recs');
        oldRecs.forEach(el => el.remove());

        if (chatContext.step === 'age' || chatContext.step === 'firstTime' || chatContext.step === 'state') return; // Don't interrupt flow
        if (messageCount < 2) return;

        let recs = [];
        if (chatContext.lastIntent === 'eligible' || chatContext.lastIntent === 'age') {
            recs = [{lbl: t('chip_documents'), act: 'documents'}, {lbl: t('chip_steps'), act: 'steps'}];
        } else if (chatContext.lastIntent === 'document') {
            recs = [{lbl: t('chip_steps'), act: 'steps'}, {lbl: t('chip_location'), act: 'location'}];
        } else if (chatContext.lastIntent === 'step') {
            recs = [{lbl: t('chip_location'), act: 'location'}, {lbl: t('chip_timeline'), act: 'timeline'}];
        } else {
            recs = [{lbl: t('chip_faq'), act: 'faq'}, {lbl: t('chip_results'), act: 'results'}];
        }

        const recWrapper = document.createElement('div');
        recWrapper.className = 'inline-recs';
        recWrapper.style.display = 'flex';
        recWrapper.style.gap = '8px';
        recWrapper.style.marginTop = '10px';
        recWrapper.style.flexWrap = 'wrap';

        recs.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'mini-chip';
            btn.style.fontSize = '0.75rem';
            btn.textContent = r.lbl;
            btn.addEventListener('click', () => handleAction(r.act));
            recWrapper.appendChild(btn);
        });

        // Append to last bot bubble
        const bubbles = messagesContainer.querySelectorAll('.message.bot .msg-bubble');
        if (bubbles.length > 0) {
            bubbles[bubbles.length - 1].appendChild(recWrapper);
            scrollToBottom();
        }
    }

    // Eligibility
    function showEligibilityPrompt() {
        chatContext.step = 'age';
        addBotMessage(`
            <h3><span class="material-icons-round">verified_user</span> Voting Eligibility Check</h3>
            <p>I can quickly check if you're eligible to vote! 🗳️</p>
            <p style="margin-top:8px;">To get started, please <strong>enter your current age</strong> below.</p>
        `);
    }

    function processAge(text) {
        const age = parseInt(text.replace(/[^0-9]/g, ''));
        if (isNaN(age) || age <= 0 || age > 150) {
            addBotMessage(`<p>Hmm, that doesn't seem like a valid age. Could you please just type a number like <strong>21</strong> or <strong>17</strong>?</p>`);
            chatContext.step = 'age';
            return;
        }

        if (age >= 18) {
            chatContext.age = age;
            chatContext.step = 'firstTime';
            addBotMessage(`
                <div class="eligibility-result eligible">
                    <div class="result-icon"><span class="material-icons-round">check_circle</span></div>
                    <h4 class="highlight">🎉 You Are Eligible to Vote!</h4>
                    <p>At <strong>${age} years old</strong>, you meet the minimum voting age requirement of 18 years set by the Election Commission.</p>
                </div>
                <p style="margin-top:10px;">Are you a <strong>first-time voter</strong> or have you voted before? (Type 'yes' or 'no')</p>
            `);
        } else {
            chatContext.step = null;
            const yearsLeft = 18 - age;
            addBotMessage(`
                <div class="eligibility-result not-eligible">
                    <div class="result-icon"><span class="material-icons-round">cancel</span></div>
                    <h4 class="warn">Not Eligible Yet</h4>
                    <p>At <strong>${age} years old</strong>, you need to wait <strong>${yearsLeft} more year${yearsLeft > 1 ? 's' : ''}</strong> to be eligible. The minimum voting age in India is 18 years.</p>
                </div>
                <p style="margin-top:10px;">Don't worry! You can start learning about the election process now. You can view the <strong>election timeline</strong> to understand how it works.</p>
            `);
        }
    }

    function processFirstTime(text) {
        const lower = text.toLowerCase();
        if (lower.includes('yes') || lower.includes('first')) {
            chatContext.isFirstTime = true;
            chatContext.step = 'state';
            addBotMessage(`<p>Welcome to the democratic process! 🎉 Since it's your first time, you'll need to register using <strong>Form 6</strong> on the ECI portal.</p><p style="margin-top:8px;">Which <strong>State or Union Territory</strong> are you from? I can provide local info.</p>`);
        } else if (lower.includes('no') || lower.includes('before')) {
            chatContext.isFirstTime = false;
            chatContext.step = 'state';
            addBotMessage(`<p>Great to have an experienced voter! 🗳️ You can check your name on the electoral roll to ensure your details are active.</p><p style="margin-top:8px;">Which <strong>State or Union Territory</strong> are you currently voting in?</p>`);
        } else {
            addBotMessage(`<p>I didn't quite catch that. Are you voting for the <strong>first time</strong>? (Please say Yes or No)</p>`);
        }
    }

    function processState(text) {
        chatContext.state = text;
        chatContext.step = null;
        addBotMessage(`<p>Got it. For <strong>${text}</strong>, you can use the official Chief Electoral Officer (CEO) website of your state for targeted services.</p>
        <p style="margin-top:8px;">What else can I help you with today? You can ask about <strong>documents</strong>, <strong>live results</strong>, or the <strong>nearest polling booth</strong>.</p>`);
    }

    // Voting Steps
    function showVotingSteps() {
        addBotMessage(`
            <h3><span class="material-icons-round">format_list_numbered</span> Step-by-Step Voting Guide</h3>
            <p>Here's the complete voting process made simple:</p>
            <div class="steps-grid">
                <div class="step-item">
                    <div class="step-num">1</div>
                    <div class="step-text">
                        <strong>Register as a Voter</strong>
                        <span>Apply online at the Election Commission portal or visit your nearest voter registration centre.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">2</div>
                    <div class="step-text">
                        <strong>Verify Your Voter ID</strong>
                        <span>Check your name in the electoral roll and ensure your Voter ID (EPIC) card details are correct.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">3</div>
                    <div class="step-text">
                        <strong>Visit the Polling Booth</strong>
                        <span>Go to your assigned polling station on voting day. Carry your Voter ID or approved photo ID.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">4</div>
                    <div class="step-text">
                        <strong>Identity Verification</strong>
                        <span>Officials will verify your identity, mark your finger with indelible ink, and issue a ballot slip.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">5</div>
                    <div class="step-text">
                        <strong>Cast Your Vote via EVM</strong>
                        <span>Enter the booth, press the button next to your chosen candidate on the Electronic Voting Machine.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">6</div>
                    <div class="step-text">
                        <strong>VVPAT Confirmation</strong>
                        <span>Check the VVPAT slip to confirm your vote was recorded correctly. You're done! 🎉</span>
                    </div>
                </div>
            </div>
        `);
    }

    // Documents
    function showDocuments() {
        addBotMessage(`
            <h3><span class="material-icons-round">description</span> Required Documents</h3>
            <p>Keep these documents ready for a smooth voting experience:</p>
            <div class="doc-grid">
                <div class="doc-item">
                    <div class="doc-icon required"><span class="material-icons-round">badge</span></div>
                    <div class="doc-info">
                        <strong>Voter ID (EPIC Card)</strong>
                        <span>Your primary identity proof for voting. Issued by the Election Commission.</span>
                    </div>
                    <span class="doc-badge req">Required</span>
                </div>
                <div class="doc-item">
                    <div class="doc-icon required"><span class="material-icons-round">fingerprint</span></div>
                    <div class="doc-info">
                        <strong>Aadhaar Card</strong>
                        <span>12-digit unique ID. Used for voter registration linking and identity verification.</span>
                    </div>
                    <span class="doc-badge req">Required</span>
                </div>
                <div class="doc-item">
                    <div class="doc-icon optional"><span class="material-icons-round">travel_explore</span></div>
                    <div class="doc-info">
                        <strong>Passport</strong>
                        <span>Can be used as alternate photo ID proof at the polling booth.</span>
                    </div>
                    <span class="doc-badge opt">Optional</span>
                </div>
                <div class="doc-item">
                    <div class="doc-icon optional"><span class="material-icons-round">directions_car</span></div>
                    <div class="doc-info">
                        <strong>Driving License</strong>
                        <span>Another accepted government-issued photo ID for voter verification.</span>
                    </div>
                    <span class="doc-badge opt">Optional</span>
                </div>
            </div>
            <p style="margin-top:10px;"><span class="info-tag"><span class="material-icons-round" style="font-size:14px">info</span> Carry at least one photo ID proof</span></p>
        `);
    }

    // Timeline
    function showTimeline() {
        addBotMessage(`
            <h3><span class="material-icons-round">timeline</span> Election Timeline</h3>
            <p>Here's a simplified view of the election phases:</p>
            <div class="timeline-visual">
                <div class="timeline-item">
                    <div class="timeline-dot t1">1</div>
                    <div class="timeline-content">
                        <h4>📋 Voter Registration</h4>
                        <p>New voter enrollment, revision of electoral rolls, and verification of voter details.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot t2">2</div>
                    <div class="timeline-content">
                        <h4>📢 Campaigning Period</h4>
                        <p>Political parties campaign, candidates file nominations, and the Model Code of Conduct is enforced.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot t3">3</div>
                    <div class="timeline-content">
                        <h4>🗳️ Voting Day</h4>
                        <p>Citizens cast their votes at assigned polling stations. Voting hours typically run from 7 AM to 6 PM.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot t4">4</div>
                    <div class="timeline-content">
                        <h4>📊 Result Day</h4>
                        <p>Votes are counted, results declared, and the winning candidates are announced officially.</p>
                    </div>
                </div>
            </div>
        `);
    }

    // FAQ
    function showFAQ() {
        addBotMessage(`
            <h3><span class="material-icons-round">quiz</span> Frequently Asked Questions</h3>
            <div class="faq-list">
                <div class="faq-item" data-faq>
                    <div class="faq-q">
                        <span class="material-icons-round">expand_more</span>
                        How do I register as a voter?
                    </div>
                    <div class="faq-a">
                        You can register online at <strong>voters.eci.gov.in</strong> using Form 6, or visit your nearest Electoral Registration Office with your ID proof and address proof. You must be at least 18 years old on the qualifying date.
                    </div>
                </div>
                <div class="faq-item" data-faq>
                    <div class="faq-q">
                        <span class="material-icons-round">expand_more</span>
                        What if I lose my Voter ID?
                    </div>
                    <div class="faq-a">
                        Don't worry! You can apply for a duplicate Voter ID online or at your local ERO office. You can also use other approved photo IDs like Aadhaar, Passport, or Driving License at the polling booth.
                    </div>
                </div>
                <div class="faq-item" data-faq>
                    <div class="faq-q">
                        <span class="material-icons-round">expand_more</span>
                        Can I vote without Aadhaar?
                    </div>
                    <div class="faq-a">
                        <strong>Yes!</strong> Aadhaar is not mandatory for voting. Your Voter ID (EPIC) is the primary document. However, linking Aadhaar with your voter ID is recommended to avoid duplicate entries in the electoral roll.
                    </div>
                </div>
                <div class="faq-item" data-faq>
                    <div class="faq-q">
                        <span class="material-icons-round">expand_more</span>
                        What is NOTA?
                    </div>
                    <div class="faq-a">
                        NOTA stands for <strong>"None Of The Above"</strong>. It allows voters to officially reject all candidates. It's the last option on the EVM and ensures your right to express dissent while maintaining voter secrecy.
                    </div>
                </div>
                <div class="faq-item" data-faq>
                    <div class="faq-q">
                        <span class="material-icons-round">expand_more</span>
                        Can I change my polling station?
                    </div>
                    <div class="faq-a">
                        You can apply for a transfer by filling Form 8A if you've moved to a new address. Your polling station is assigned based on your registered address in the electoral roll.
                    </div>
                </div>
            </div>
        `);
    }

    function bindFAQToggles() {
        document.querySelectorAll('.faq-item[data-faq]').forEach((item) => {
            if (item.dataset.bound) return;
            item.dataset.bound = 'true';
            item.addEventListener('click', () => item.classList.toggle('open'));
        });
    }

    // Location
    function showLocation() {
        addBotMessage(`<p>${t('location_detecting')}</p>`);

        if (!navigator.geolocation) {
            showToast(t('location_error'), 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // Since this is a demo, simulate nearest booth calculation
                const booths = [
                    { name: 'Govt. Higher Secondary School', addr: 'Ward 12, Municipal Office Road', dist: '1.2 km' },
                    { name: 'Community Hall, Sector 5', addr: 'Near Bus Stand, Main Road', dist: '2.4 km' },
                    { name: 'Primary School, Block A', addr: 'Village Panchayat Office Lane', dist: '0.8 km' },
                ];
                const booth = booths[Math.floor(Math.random() * booths.length)];
                
                const mapIframe = `<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d19919.440419619725!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1777820732322!5m2!1sen!2sin" width="100%" height="200" style="border:0; border-radius:12px; margin-top:10px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

                addBotMessage(`
                    <h3><span class="material-icons-round">location_on</span> ${t('location_card_title')}</h3>
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; margin-top: 10px;">
                        <h4 style="margin-bottom: 4px;">${booth.name}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${booth.addr}</p>
                        <span class="info-tag"><span class="material-icons-round" style="font-size:14px">directions_walk</span> ${t('distance')}: ${booth.dist}</span>
                    </div>
                    ${mapIframe}
                    <div style="margin-top: 10px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-light); font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons-round" style="font-size:16px;">open_in_new</span> ${t('open_maps')}
                        </a>
                    </div>
                `);
                showToast("Location found!", "success");
            },
            (error) => {
                showToast(t('location_denied'), 'error');
                addBotMessage(`<p class="warn">${t('location_denied')}</p>`);
            }
        );
    }

    // Greeting
    function showGreeting() {
        addBotMessage(t('bot_hello'));
    }

    // Thanks
    function showThanks() {
        addBotMessage(`
            <p>You're welcome! 😊 Happy to help you understand the election process.</p>
            <p style="margin-top:6px;">Remember — <strong>every vote counts!</strong> 🗳️ Feel free to ask if you have more questions.</p>
        `);
    }

    // EVM Info
    function showEVMInfo() {
        addBotMessage(`
            <h3><span class="material-icons-round">touch_app</span> About EVM (Electronic Voting Machine)</h3>
            <p>The EVM is a simple electronic device used for casting votes:</p>
            <ul>
                <li><strong>Ballot Unit</strong> — Displays candidate names and party symbols with a blue button next to each</li>
                <li><strong>Control Unit</strong> — Operated by the polling officer to enable voting</li>
                <li><strong>VVPAT</strong> — Prints a paper slip showing your vote for 7 seconds, then drops into a sealed box</li>
            </ul>
            <p style="margin-top:10px;"><span class="info-tag"><span class="material-icons-round" style="font-size:14px">security</span> EVMs are standalone, tamper-proof devices with no internet connectivity</span></p>
        `);
    }

    // Registration Info
    function showRegistration() {
        addBotMessage(`
            <h3><span class="material-icons-round">app_registration</span> Voter Registration Guide</h3>
            <p>Here's how to register as a new voter:</p>
            <div class="steps-grid">
                <div class="step-item">
                    <div class="step-num">1</div>
                    <div class="step-text">
                        <strong>Visit the Portal</strong>
                        <span>Go to <strong>voters.eci.gov.in</strong> or download the Voter Helpline App.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">2</div>
                    <div class="step-text">
                        <strong>Fill Form 6</strong>
                        <span>Provide your personal details, address, and upload a recent passport-size photo.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">3</div>
                    <div class="step-text">
                        <strong>Submit ID Proof</strong>
                        <span>Attach Aadhaar, birth certificate, or other age & address proof documents.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">4</div>
                    <div class="step-text">
                        <strong>Verification</strong>
                        <span>A Booth Level Officer (BLO) may visit for physical verification of your address.</span>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">5</div>
                    <div class="step-text">
                        <strong>Receive Voter ID</strong>
                        <span>Once approved, your EPIC card will be dispatched or available for download. 🎉</span>
                    </div>
                </div>
            </div>
        `);
    }

    // Live Results
    function showLiveResults() {
        const constituencies = [
            { name: "Varanasi", leading: "NDA", trailing: "I.N.D.I.A", margin: "1,20,432" },
            { name: "Wayanad", leading: "I.N.D.I.A", trailing: "NDA", margin: "89,540" },
            { name: "Gandhinagar", leading: "NDA", trailing: "I.N.D.I.A", margin: "2,10,000" }
        ];
        
        let html = `
            <h3><span class="material-icons-round">poll</span> Simulated Live Election Results</h3>
            <p>Here are some simulated real-time updates from key constituencies:</p>
            <div style="margin: 12px 0; display: flex; flex-direction: column; gap: 8px;">`;
            
        constituencies.forEach(c => {
            html += `
                <div style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px;">
                    <strong>📍 ${c.name}</strong><br>
                    <span style="color: var(--green); font-size: 0.85rem;">Leading: ${c.leading}</span> | 
                    <span style="color: var(--red); font-size: 0.85rem;">Trailing: ${c.trailing}</span><br>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Margin: ${c.margin} votes</span>
                </div>
            `;
        });
        
        html += `</div>
            <p style="margin-top:10px;">For the official, real-time election results, vote counting status, and winners, please visit the Election Commission of India (ECI).</p>
            <div style="margin: 16px 0; text-align: center;">
                <a href="https://results.eci.gov.in/" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, var(--accent), #6366f1); color: #fff; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 0.9rem; transition: transform 0.2s; box-shadow: 0 4px 12px var(--accent-glow);">
                    <span class="material-icons-round">open_in_new</span>
                    View Live Election Results
                </a>
            </div>
            <p style="margin-top:10px;"><span class="info-tag"><span class="material-icons-round" style="font-size:14px">info</span> Links to the official ECI portal</span></p>
        `;
        addBotMessage(html);
    }

    // Fallback
    function showFallback(text) {
        addBotMessage(`
            ${t('fallback_msg')}
            <ul>
                <li>🗳️ <a href="#" onclick="document.getElementById('user-input').value='Check eligibility'; document.getElementById('btn-send').click(); return false;" style="color: var(--accent-light);">${t('chip_eligibility')}</a></li>
                <li>📋 <a href="#" onclick="document.getElementById('user-input').value='Voting steps'; document.getElementById('btn-send').click(); return false;" style="color: var(--accent-light);">${t('chip_steps')}</a></li>
                <li>📍 <a href="#" onclick="document.getElementById('user-input').value='Nearest booth'; document.getElementById('btn-send').click(); return false;" style="color: var(--accent-light);">${t('chip_location')}</a></li>
            </ul>
            <p style="margin-top:8px;">${t('you_can_also')}</p>
        `);
    }

    // ----- Voice Input -----
    function startVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.interimResults = false;

            voiceModal.classList.remove('hidden');
            btnVoice.classList.add('listening');

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                stopVoice();
                setTimeout(() => handleSend(), 300);
            };

            recognition.onerror = () => {
                stopVoice();
                addBotMessage(`<p>Sorry, I couldn't hear you clearly. Please try again or type your question instead. 🎤</p>`);
            };

            recognition.onend = () => stopVoice();
            recognition.start();
            window._recognition = recognition;
        } else {
            // Fallback simulation
            voiceModal.classList.remove('hidden');
            btnVoice.classList.add('listening');
            setTimeout(() => {
                const simQueries = ['How to vote', 'Am I eligible', 'What documents needed', 'Election timeline'];
                const q = simQueries[Math.floor(Math.random() * simQueries.length)];
                userInput.value = q;
                stopVoice();
                setTimeout(() => handleSend(), 300);
            }, 2500);
        }
    }

    function stopVoice() {
        voiceModal.classList.add('hidden');
        btnVoice.classList.remove('listening');
        if (window._recognition) {
            try { window._recognition.abort(); } catch (_) {}
            window._recognition = null;
        }
    }

    // ----- UI & Translation Helpers -----
    function initLang() {
        if (langSelector) {
            const savedLang = localStorage.getItem('appLang') || 'en';
            langSelector.value = savedLang;
            updateUILanguage();
        }
    }

    function updateUILanguage() {
        const welcomeTitle = document.querySelector('#welcome-card h2');
        if (welcomeTitle) welcomeTitle.textContent = t('welcome_title');

        const welcomeDesc = document.querySelector('#welcome-card p');
        if (welcomeDesc) welcomeDesc.textContent = t('welcome_desc');

        if (userInput) userInput.placeholder = t('placeholder');
        
        const inputHint = document.querySelector('.input-hint');
        if (inputHint) inputHint.textContent = t('hint');

        // Chips
        const chips = {
            'chip-eligibility': 'chip_eligibility',
            'chip-steps': 'chip_steps',
            'chip-documents': 'chip_documents',
            'chip-timeline': 'chip_timeline',
            'chip-results': 'chip_results',
            'chip-faq': 'chip_faq',
            'chip-location': 'chip_location'
        };
        
        for (const [id, key] of Object.entries(chips)) {
            const chip = document.getElementById(id);
            if (chip) {
                const icon = chip.innerHTML.split('</span>')[0] + '</span>';
                chip.innerHTML = icon + ' ' + t(key);
            }
        }

        const staticFaqTitle = document.querySelector('.static-faq-section h2');
        if (staticFaqTitle) staticFaqTitle.textContent = t('faq_title');
        
        const voiceText = document.querySelector('.voice-text');
        if (voiceText) voiceText.textContent = t('voice_listening');
    }

    function showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        else if (type === 'error') icon = 'error';
        
        toast.innerHTML = `<span class="material-icons-round">${icon}</span> <span>${msg}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlide 0.3s ease-in reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ----- Theme Toggle -----
    function toggleTheme() {
        const root = document.documentElement;
        const icon = btnTheme.querySelector('.material-icons-round');
        const isLight = document.body.classList.toggle('light-theme');

        if (isLight) {
            root.style.setProperty('--bg-primary', '#f0f2f5');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-input', '#e8eaed');
            root.style.setProperty('--text-primary', '#1a1d27');
            root.style.setProperty('--text-secondary', '#5f6368');
            root.style.setProperty('--text-muted', '#9aa0a6');
            root.style.setProperty('--border', 'rgba(0,0,0,0.08)');
            root.style.setProperty('--shadow', '0 8px 32px rgba(0,0,0,0.1)');
            root.style.setProperty('--bg-translucent', 'rgba(255,255,255,0.85)');
            icon.textContent = 'light_mode';
        } else {
            root.style.setProperty('--bg-primary', '#0f1117');
            root.style.setProperty('--bg-secondary', '#1a1d27');
            root.style.setProperty('--bg-card', '#222636');
            root.style.setProperty('--bg-input', '#2a2e3d');
            root.style.setProperty('--text-primary', '#eef0f6');
            root.style.setProperty('--text-secondary', '#9ca3b4');
            root.style.setProperty('--text-muted', '#6b7280');
            root.style.setProperty('--border', 'rgba(255,255,255,0.06)');
            root.style.setProperty('--shadow', '0 8px 32px rgba(0,0,0,0.4)');
            root.style.setProperty('--bg-translucent', 'rgba(26,29,39,0.85)');
            icon.textContent = 'dark_mode';
        }
    }

    // ----- Start -----
    document.addEventListener('DOMContentLoaded', init);
})();
