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
    const locationModal = document.getElementById('location-modal');
    const voiceModal = document.getElementById('voice-modal');
    const modalClose = document.getElementById('modal-close');
    const voiceStop = document.getElementById('voice-stop');
    const btnClear = document.getElementById('btn-clear');

    // ----- State -----
    let waitingForAge = false;
    let messageCount = 0;

    // ----- Init -----
    function init() {
        bindEvents();
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
        modalClose.addEventListener('click', closeLocationModal);
        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) closeLocationModal();
        });
        voiceStop.addEventListener('click', stopVoice);
        voiceModal.addEventListener('click', (e) => {
            if (e.target === voiceModal) stopVoice();
        });

        // Directions
        document.getElementById('btn-directions').addEventListener('click', () => {
            window.open('https://www.google.com/maps/search/polling+booth+near+me', '_blank');
        });

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

        if (waitingForAge) {
            waitingForAge = false;
            processAge(text);
            return;
        }

        processInput(text);
    }

    // ----- Handle Quick Action -----
    function handleAction(action) {
        hideWelcome();
        const labels = {
            eligibility: 'Check Eligibility',
            steps: 'Voting Steps',
            documents: 'Required Documents',
            timeline: 'Election Timeline',
            faq: 'FAQs',
            location: 'Find Nearest Booth',
            results: 'Live Results',
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
    function processInput(text) {
        const lower = text.toLowerCase();

        const patterns = [
            { keys: ['eligible', 'eligibility', 'can i vote', 'am i eligible', 'age', 'old enough'], action: () => showEligibilityPrompt() },
            { keys: ['step', 'how to vote', 'voting process', 'procedure', 'cast vote', 'how do i vote', 'steps to vote'], action: () => showVotingSteps() },
            { keys: ['document', 'id card', 'voter id', 'aadhaar', 'aadhar', 'passport', 'paper', 'what do i need'], action: () => showDocuments() },
            { keys: ['timeline', 'schedule', 'when', 'date', 'election date'], action: () => showTimeline() },
            { keys: ['result', 'who won', 'counting', 'winner', 'live results', 'election results', 'lead'], action: () => showLiveResults() },
            { keys: ['faq', 'question', 'help', 'common', 'how to register', 'lost', 'lose voter'], action: () => showFAQ() },
            { keys: ['booth', 'location', 'where', 'polling', 'nearest', 'near me'], action: () => showLocation() },
            { keys: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste'], action: () => showGreeting() },
            { keys: ['thank', 'thanks', 'thank you', 'thx'], action: () => showThanks() },
            { keys: ['evm', 'machine', 'electronic'], action: () => showEVMInfo() },
            { keys: ['register', 'registration', 'enroll', 'sign up'], action: () => showRegistration() },
        ];

        for (const p of patterns) {
            if (p.keys.some((k) => lower.includes(k))) {
                p.action();
                return;
            }
        }

        showFallback();
    }

    // ----- Message Helpers -----
    function addUserMessage(text) {
        hideWelcome();
        messageCount++;
        const msg = createMessageEl('user', `<p>${escapeHtml(text)}</p>`);
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function addBotMessage(html) {
        showTyping();
        const delay = 600 + Math.random() * 600;
        setTimeout(() => {
            hideTyping();
            const msg = createMessageEl('bot', html);
            messagesContainer.appendChild(msg);
            scrollToBottom();
            bindFAQToggles();
        }, delay);
    }

    function createMessageEl(type, html) {
        const wrapper = document.createElement('div');
        wrapper.className = `message ${type}`;
        const icon = type === 'bot' ? 'smart_toy' : 'person';
        wrapper.innerHTML = `
            <div class="msg-avatar"><span class="material-icons-round">${icon}</span></div>
            <div class="msg-bubble">${html}</div>
        `;
        return wrapper;
    }

    function hideWelcome() {
        if (welcomeCard) welcomeCard.style.display = 'none';
    }

    function showTyping() { typingIndicator.classList.remove('hidden'); scrollToBottom(); }
    function hideTyping() { typingIndicator.classList.add('hidden'); }

    function clearChat() {
        // Remove all messages
        messagesContainer.innerHTML = '';
        messageCount = 0;
        waitingForAge = false;

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
        addBotMessage(`<p>Hello! I’m your Election Assistant. How can I help you today?</p>`);
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

    // Eligibility
    function showEligibilityPrompt() {
        waitingForAge = true;
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
            waitingForAge = true;
            return;
        }

        if (age >= 18) {
            addBotMessage(`
                <div class="eligibility-result eligible">
                    <div class="result-icon"><span class="material-icons-round">check_circle</span></div>
                    <h4 class="highlight">🎉 You Are Eligible to Vote!</h4>
                    <p>At <strong>${age} years old</strong>, you meet the minimum voting age requirement of 18 years set by the Election Commission.</p>
                </div>
                <p style="margin-top:10px;">To prepare for voting, I recommend checking the <strong>required documents</strong> or reviewing the <strong>voting steps</strong>.</p>
            `);
        } else {
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
        locationModal.classList.remove('hidden');
        const detecting = document.getElementById('location-detecting');
        const result = document.getElementById('location-result');
        detecting.classList.remove('hidden');
        result.classList.add('hidden');

        // Simulate location detection
        setTimeout(() => {
            const booths = [
                { name: 'Govt. Higher Secondary School', addr: 'Ward 12, Municipal Office Road', dist: '1.2 km' },
                { name: 'Community Hall, Sector 5', addr: 'Near Bus Stand, Main Road', dist: '2.4 km' },
                { name: 'Primary School, Block A', addr: 'Village Panchayat Office Lane', dist: '0.8 km' },
            ];
            const booth = booths[Math.floor(Math.random() * booths.length)];
            document.getElementById('booth-name').textContent = booth.name;
            document.getElementById('booth-address').textContent = booth.addr;
            document.getElementById('booth-distance').textContent = booth.dist;
            detecting.classList.add('hidden');
            result.classList.remove('hidden');
        }, 2000);
    }

    function closeLocationModal() {
        locationModal.classList.add('hidden');
    }

    // Greeting
    function showGreeting() {
        const greetings = [
            `<p>Hello there! 👋 I'm your Election Assistant. I can help you with:</p>
            <ul>
                <li>✅ Checking your <strong>voting eligibility</strong></li>
                <li>📄 Listing <strong>required documents</strong></li>
                <li>📋 Explaining the <strong>voting process</strong></li>
                <li>📅 Showing the <strong>election timeline</strong></li>
                <li>📍 Finding your <strong>nearest polling booth</strong></li>
            </ul>
            <p style="margin-top:8px;">Just type your question or tap a quick action below!</p>`,
        ];
        addBotMessage(greetings[0]);
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
        addBotMessage(`
            <h3><span class="material-icons-round">poll</span> Live Election Results</h3>
            <p>You can check the official, real-time election results, vote counting status, and winners directly from the Election Commission of India (ECI).</p>
            <div style="margin: 16px 0; text-align: center;">
                <a href="https://results.eci.gov.in/" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, var(--accent), #6366f1); color: #fff; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 0.9rem; transition: transform 0.2s; box-shadow: 0 4px 12px var(--accent-glow);">
                    <span class="material-icons-round">open_in_new</span>
                    View Live Election Results
                </a>
            </div>
            <p style="margin-top:10px;"><span class="info-tag"><span class="material-icons-round" style="font-size:14px">info</span> Links to the official ECI portal</span></p>
        `);
    }

    // Fallback
    function showFallback() {
        addBotMessage(`
            <p>I'm not exactly sure what you mean by that. 🤔 Could you clarify?</p>
            <p style="margin-top:8px;">Here are some things I can help you with:</p>
            <ul>
                <li>🗳️ <strong>"Check eligibility"</strong> — Find out if you can vote</li>
                <li>📋 <strong>"Voting steps"</strong> — Learn the voting process</li>
                <li>📄 <strong>"Documents"</strong> — See required documents</li>
                <li>📊 <strong>"Results"</strong> — Check live election results</li>
                <li>📍 <strong>"Nearest booth"</strong> — Find polling station</li>
            </ul>
            <p style="margin-top:8px;">You can type one of the keywords above or use the quick action buttons.</p>
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
