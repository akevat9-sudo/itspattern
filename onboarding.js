let coachChatHistory = [];
function loadAssessmentState() {
    const storedSession = localStorage.getItem('itspattern_assessment_session');
    const storedReport = localStorage.getItem('itspattern_assessment_report');

    if (storedReport) {
        assessmentSession.report = JSON.parse(storedReport);
        assessmentSession.is_complete = true;
        renderReport();
    } else if (storedSession) {
        assessmentSession = JSON.parse(storedSession);
        if (assessmentSession.is_complete) loadReport();
        else if (assessmentSession.current_question) renderQuestion();
        else renderWelcome();
    } else {
        renderWelcome();
    }
}

function getExternalUserId() {
    let extId = localStorage.getItem('itspattern_ext_user_id');
    if (!extId) { extId = 'usr_' + Math.random().toString(36).substring(2, 11); localStorage.setItem('itspattern_ext_user_id', extId); }
    return extId;
}

function initAssessment() {
    loadAssessmentState();
}

function renderWelcome() {
    const c = document.getElementById('assessment-container');
    if (!c) return;
    
    const isGF = memberProfile.email === 'shriparnanath@gmail.com';
    const greeting = isGF ? "Hi Shri, it's a love from Ajay Kevat." : "Welcome from Ajay Kevat.";

    c.innerHTML = `
        <div class="w-full max-w-md mx-auto flex flex-col justify-center animate-fade-in z-10 px-4">
            <div class="space-y-2 mb-8 text-center mt-4">
                <img src="logo.png" class="w-24 h-24 object-contain mx-auto mb-4 select-none pointer-events-none rounded-full shadow-2xl border-2 border-white/20" alt="itspattern Logo">
                <h1 class="text-[3.5rem] sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-1 leading-none py-1">itspattern</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">Your Health Operating System</p>
            </div>
            
            <div class="w-full flex-grow-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
                <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">${greeting}</h2>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mx-auto">
                    Let's customize your experience. Complete the 1-minute health assessment to unlock your personalized nutrition targets, daily habits, and AI coaching.
                </p>
                <button onclick="startAssessment()" class="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black py-4 px-4 rounded-2xl transition-all spring-btn text-sm uppercase tracking-widest shadow-lg mt-2">
                    Start Health Assessment
                </button>
            </div>
        </div>
    `;
}

function closeAssessmentOverlay() {
    const overlay = document.getElementById('assessment-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
}

async function startAssessment() {
    document.getElementById('assessment-overlay').classList.remove('hidden');
    document.getElementById('assessment-overlay').classList.add('flex');
    showLoading('Initializing your assessment...');
    try {
        const r = await fetch(`${API_BASE}/start_assessment`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ external_user_id: getExternalUserId() })
        });
        if (!r.ok) throw new Error('Failed');
        const data = await r.json();
        assessmentSession = { session_id: data.session_id, user_id: data.user_id, current_question: data.current_question, step: 1, is_complete: false, loading: false, report: null };
        saveAssessmentSession();
        renderQuestion();
    } catch (err) { showError('Connection failed. Ensure the backend is running.'); }
}

function renderQuestion() {
    const c = document.getElementById('assessment-container');
    const q = assessmentSession.current_question;
    if (!q || !c) return;
    const pct = Math.min((assessmentSession.step / 15) * 100, 95);

    c.innerHTML = `
        <div class="w-full max-w-md mx-auto flex flex-col justify-center h-full min-h-0 pb-6 pt-4 animate-fade-in z-10 px-4">
            <div class="w-full flex-grow-0 flex flex-col min-h-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-7 shadow-2xl">
                <div class="flex justify-between items-center mb-4 flex-shrink-0">
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Step ${assessmentSession.step}</span>
                    <span class="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600 font-black uppercase tracking-widest">${q.category || 'Health'}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded-full overflow-hidden mb-6 flex-shrink-0 shadow-inner p-[1.5px]">
                    <div class="bg-gradient-to-r from-blue-500 to-violet-600 h-full rounded-full transition-all duration-500 shadow-md" style="width:${pct}%"></div>
                </div>
                <h3 class="text-lg md:text-xl font-black leading-snug mb-6 text-gray-900 dark:text-white flex-shrink-0 tracking-tight">${q.text}</h3>
                <div class="space-y-3.5 overflow-y-auto pr-1 flex-1 min-h-0 pb-2">${q.options.map(opt => `
                    <button onclick="submitAnswer('${opt.id}')" class="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 p-5 rounded-2xl text-left transition-all font-bold text-sm text-gray-800 dark:text-gray-200 flex justify-between items-center group shadow-sm">
                        <span>${opt.text}</span>
                        <div class="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800 flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-chevron-right text-xs text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"></i>
                        </div>
                    </button>
                `).join('')}</div>
            </div>
            <div class="pt-6 mt-2 flex justify-center flex-shrink-0">
                <button onclick="confirmRestart()" class="text-xs font-bold text-white/70 hover:text-white flex items-center gap-2 transition-colors py-2 px-4 rounded-full hover:bg-white/10"><i class="fa-solid fa-arrow-rotate-left"></i> Restart Assessment</button>
            </div>
        </div>
    `;
}

async function submitAnswer(optionId) {
    const q = assessmentSession.current_question;
    showLoading('Analyzing your response...');
    try {
        await fetch(`${API_BASE}/submit_answer`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: assessmentSession.session_id, question_id: q.id, option_id: optionId })
        });
        const rNext = await fetch(`${API_BASE}/next_question`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: assessmentSession.session_id })
        });
        const nextData = await rNext.json();
        if (nextData.is_complete) {
            assessmentSession.is_complete = true;
            saveAssessmentSession();
            loadReport();
        } else {
            assessmentSession.current_question = nextData.question;
            assessmentSession.step = nextData.step || (assessmentSession.step + 1);
            saveAssessmentSession();
            renderQuestion();
        }
    } catch (err) { showError('Submission failed. Check connection.'); }
}

async function loadReport() {
    showLoading('Generating your personalized plan...');
    try {
        const r = await fetch(`${API_BASE}/generate_report?session_id=${assessmentSession.session_id}`);
        const data = await r.json();
        assessmentSession.report = data.report;
        localStorage.setItem('itspattern_assessment_report', JSON.stringify(data.report));
        if (!memberProfile.achievements.includes('assessment')) awardAchievement('assessment');

        // Profile Generation on Completion — secure computed profile on server
        try {
            await fetch(`${API_BASE}/generate_profile?session_id=${assessmentSession.session_id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ external_user_id: getExternalUserId(), report: data.report })
            });
            console.log('[sync] Profile generated on server');
        } catch (profileErr) { console.warn('[sync] Profile generation failed:', profileErr); }

        renderReport();
    } catch (err) { showError('Failed to load report.'); }
}

function renderReport() {
    const c = document.getElementById('assessment-container');
    const rep = assessmentSession.report;
    if (!rep || !c) return;

    const isFullyFree = isUserFullyFree(memberProfile.email);
    const hasPromoAccess = hasUserPromoAccess(memberProfile);
    const isFree = isFullyFree || hasPromoAccess;

    const badgeHtml = isFree 
        ? `<span class="text-[9px] font-black text-white bg-green-600 px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1"><i class="fa-solid fa-gift"></i> Free Trial Unlocked</span>`
        : `<span class="text-[9px] font-black text-gray-900 bg-white px-2 py-1 rounded-sm uppercase tracking-widest"><i class="fa-solid fa-lock text-gray-500 mr-1"></i> Locked</span>`;

    const blurClass = isFree ? "" : "filter blur-[5px] opacity-40 select-none pointer-events-none";

    const overlayHtml = isFree
        ? `<div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-gray-900/40 via-gray-900/10 to-transparent">
                <div class="mt-12 text-center">
                    <p class="text-sm font-bold text-white mb-1">3 Personalized Habits</p>
                    <p class="text-xs text-green-300 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center"><i class="fa-solid fa-circle-check"></i> Unlocked Free Access</p>
                </div>
           </div>`
        : `<div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
                <div class="mt-12 text-center">
                    <p class="text-sm font-bold text-white mb-1">3 Personalized Habits</p>
                    <p class="text-xs text-gray-300 font-medium">Ready for your transformation</p>
                </div>
           </div>`;

    const ctaButtonHtml = isFree
        ? `<button onclick="unlockFreeAccess()" class="relative w-full overflow-hidden rounded-2xl group shadow-xl shadow-green-500/20">
            <div class="absolute inset-0 bg-btn-explore transition-all duration-300"></div>
            <div class="relative px-6 py-4 flex items-center justify-center gap-3">
                <span class="text-sm font-black text-white uppercase tracking-widest">Explore My Blueprint & App</span>
                <i class="fa-solid fa-arrow-right text-white group-hover:translate-x-1 transition-transform"></i>
            </div>
           </button>`
        : `<button onclick="renderSpecialOffer()" class="relative w-full overflow-hidden rounded-2xl group shadow-xl shadow-blue-500/20">
            <div class="absolute inset-0 bg-btn-unlock transition-all duration-300"></div>
            <div class="relative px-6 py-4 flex items-center justify-center gap-3">
                <span class="text-sm font-black text-white uppercase tracking-widest">Unlock Blueprint & Habits</span>
                <i class="fa-solid fa-arrow-right text-white group-hover:translate-x-1 transition-transform"></i>
            </div>
           </button>`;

    c.innerHTML = `
        <div class="w-full max-w-md mx-auto flex flex-col pt-12 pb-24 animate-fade-in z-10 px-4">
            
            <div class="w-full flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200 dark:border-gray-700/50 rounded-[2rem] p-8 shadow-2xl space-y-7 relative overflow-hidden">
                <!-- Decorative background elements -->
                <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <!-- Header -->
                <div class="text-center space-y-2 relative z-10">
                    <img src="logo.png" class="w-20 h-20 object-contain mx-auto mb-1 select-none pointer-events-none rounded-full shadow-lg border-2 border-white dark:border-white/10" alt="itspattern Logo">
                    <h1 class="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 leading-none py-1 mb-0.5">itspattern</h1>
                    <h3 class="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 tracking-tight leading-tight">Your Personalized Blueprint</h3>
                    
                    <div class="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm mt-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p class="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest truncate max-w-[200px]">Persona: <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">${rep.persona || 'Optimizer'}</span></p>
                    </div>
                </div>
                
                <!-- AI Analysis -->
                <div class="relative bg-gradient-to-br from-blue-50/50 to-violet-50/50 dark:from-blue-900/10 dark:to-violet-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300 shadow-inner">
                    <i class="fa-solid fa-quote-left absolute top-4 left-4 text-blue-200 dark:text-blue-900/50 text-4xl -z-10"></i>
                    <p class="relative z-10 font-medium">${rep.current_status}</p>
                </div>
                
                <!-- 4 Metrics Grid -->
                <div class="grid grid-cols-2 gap-3 relative z-10">
                    <!-- Timeline -->
                    <div class="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group">
                        <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-clock"></i></div>
                        <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Timeline</p>
                        <p class="text-base font-black text-gray-900 dark:text-white mt-1 text-center">${rep.estimated_timeline_weeks} Weeks</p>
                    </div>
                    <!-- Obstacle -->
                    <div class="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group">
                        <div class="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-mountain"></i></div>
                        <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Key Obstacle</p>
                        <p class="text-sm font-black mt-1 text-gray-900 dark:text-white text-center leading-tight px-1 break-words">${rep.main_obstacle || 'Consistency'}</p>
                    </div>
                    <!-- Calories -->
                    <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-fire"></i></div>
                        <p class="text-[10px] font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-widest text-center">Calories</p>
                        <p class="text-lg font-black text-indigo-900 dark:text-indigo-100 mt-1 text-center">${rep.daily_calorie_target} <span class="text-xs font-bold text-indigo-500">kcal</span></p>
                    </div>
                    <!-- Protein -->
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group">
                        <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-dumbbell"></i></div>
                        <p class="text-[10px] font-bold text-purple-600/80 dark:text-purple-400/80 uppercase tracking-widest text-center">Protein</p>
                        <p class="text-lg font-black text-purple-900 dark:text-purple-100 mt-1 text-center">${rep.protein_requirement_grams} <span class="text-xs font-bold text-purple-500">g</span></p>
                    </div>
                </div>
                
                <!-- Habits section -->
                <div id="habits-preview-card" class="relative bg-gray-900 dark:bg-black rounded-2xl p-6 overflow-hidden shadow-2xl border border-gray-800 mt-2">
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-violet-600/20 opacity-50"></div>
                    
                    <div class="flex justify-between items-center mb-3 relative z-10">
                        <h4 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-star text-yellow-400"></i> Your Action Plan</h4>
                        ${badgeHtml}
                    </div>
                    
                    <div class="space-y-4 ${blurClass} relative z-10 mt-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/20"></div>
                            <div class="h-4 bg-white/20 rounded w-3/4"></div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/20"></div>
                            <div class="h-4 bg-white/20 rounded w-5/6"></div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/20"></div>
                            <div class="h-4 bg-white/20 rounded w-2/3"></div>
                        </div>
                    </div>
                    
                    <!-- Unlock Banner Overlay -->
                    ${overlayHtml}
                </div>
                
                <!-- Join the journey and CTA -->
                <div class="text-center pt-2 space-y-4 relative z-10">
                    ${ctaButtonHtml}
                    <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"><i class="fa-solid fa-shield-halved"></i> Backed by Science</p>
                </div>
            </div>
            
            <div class="flex justify-center mt-6">
                <button onclick="confirmRestart(true)" class="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors flex items-center gap-2 py-2 px-5 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent"><i class="fa-solid fa-arrow-rotate-left"></i> Start Over</button>
            </div>
        </div>
    `;
}

function applyAssessmentTargets() {
    const rep = assessmentSession.report;
    if (!rep) return;
    const cal = parseInt(rep.daily_calorie_target);
    const p = parseInt(rep.protein_requirement_grams);
    const f = Math.round((cal * 0.25) / 9);
    const c = Math.round((cal - (p * 4) - (f * 9)) / 4);
    Object.assign(targets, { calories: cal, protein: p, carbs: c, fat: f });
    saveTargets();
    updateNutritionalCard();
    renderCharts();

    // Mark onboarding as completed & paid
    memberProfile.hasPaidOnboarding = true;
    memberProfile.hasCompletedAssessment = true;
    saveMemberProfile();

    // Subscription Tunnel Integration — record conversion when targets unlocked
    try {
        fetch(`${API_BASE}/subscription_offer`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: assessmentSession.session_id,
                external_user_id: getExternalUserId(),
                plan: 'assessment_targets',
                targets: { calories: cal, protein: p, carbs: c, fat: f }
            })
        }).then(() => console.log('[sync] Subscription offer recorded'))
          .catch(e => console.warn('[sync] Subscription offer failed:', e));
    } catch (e) { console.warn('[sync] Subscription offer error:', e); }

    // Close assessment overlay
    closeAssessmentOverlay();
    
    // Switch to home
    switchTab('home');

    if (typeof applyInitialViewState === 'function') {
        applyInitialViewState();
    }
}

function renderSpecialOffer() {
    const c = document.getElementById('assessment-container');
    if (!c) return;

    let timerStr = "01d 23h 59m 59s";
    let count = 172800; // 2 days in seconds
    
    c.innerHTML = `
        <div class="w-full max-w-md mx-auto flex flex-col justify-center h-full min-h-0 pb-6 pt-4 animate-fade-in z-10 px-4">
            <!-- Back Button -->
            <div class="flex items-center mb-4 flex-shrink-0">
                <button onclick="renderReport()" class="text-xs font-bold text-white/70 hover:text-white flex items-center gap-2 transition-colors py-2 px-4 rounded-full hover:bg-white/10">
                    <i class="fa-solid fa-arrow-left"></i> Back to Blueprint
                </button>
            </div>

            <div class="w-full flex-grow-0 flex flex-col min-h-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-7 shadow-2xl space-y-6">
                <!-- Brand Header -->
                <div class="text-center space-y-2">
                    <img src="logo.png" class="w-16 h-16 object-contain mx-auto mb-1 select-none pointer-events-none rounded-full shadow-md border-2 border-white dark:border-white/10" alt="itspattern Logo">
                    <h1 class="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 leading-none py-1 mb-0.5">itspattern</h1>
                    <h3 class="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 tracking-tight">Special Launch Offer</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Unlock your personalized science-backed transformation.</p>
                </div>

                <!-- Timer & Social Proof Badge -->
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 text-center space-y-3 shadow-sm">
                    <div class="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-500">
                        <i class="fa-solid fa-clock animate-pulse text-sm"></i>
                        <span class="text-xs font-black uppercase tracking-widest">Offer Ends In:</span>
                        <span id="offer-timer" class="font-mono text-sm font-black">${timerStr}</span>
                    </div>
                    <div class="h-px bg-amber-200 dark:bg-amber-800/50 w-2/3 mx-auto"></div>
                    <div class="text-xs text-amber-700 dark:text-amber-400 font-black uppercase tracking-wide flex items-center justify-center gap-2">
                        <i class="fa-solid fa-fire text-amber-500"></i> 14,842 optimizers joined this week
                    </div>
                </div>

                <!-- Price Card -->
                <div id="price-highlight-card" class="bg-gradient-to-br from-indigo-900 to-violet-900 text-white rounded-2xl p-6 text-center relative overflow-hidden shadow-xl border border-indigo-700/50">
                    <!-- Decorative background blob -->
                    <div class="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    
                    <p class="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">Weekly Pass Access</p>
                    <div class="flex items-center justify-center gap-4">
                        <span class="text-indigo-300 line-through text-lg font-bold">₹499</span>
                        <span class="text-5xl font-black tracking-tight text-white drop-shadow-md">₹100</span>
                        <span class="text-xs font-bold text-indigo-200 mt-2">/ 7 days</span>
                    </div>
                    <p class="text-xs text-green-300 mt-4 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"><i class="fa-solid fa-shield-check"></i> 100% Money-Back Guarantee</p>
                </div>

                <!-- Refund Policy Details Card -->
                <div class="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 space-y-4">
                    <div class="flex justify-between items-center cursor-pointer select-none" onclick="toggleRefundPolicyDetails()">
                        <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                            <i class="fa-solid fa-shield-halved text-indigo-500 text-sm"></i>
                            <span class="text-sm font-black">Our Consistency Refund Policy</span>
                        </div>
                        <i id="refund-chevron" class="fa-solid fa-chevron-down text-xs text-gray-500 dark:text-gray-400 transition-transform"></i>
                    </div>
                    
                    <div id="refund-details" class="hidden text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4 animate-fade-in">
                        <p class="font-medium text-gray-800 dark:text-gray-200">To qualify for a full refund at the end of 7 days, you must meet these targets:</p>
                        <ul class="space-y-2.5 pl-2">
                            <li class="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-300">
                                <i class="fa-solid fa-circle-check text-green-500 text-sm"></i> Log food daily in your logs.
                            </li>
                            <li class="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-300">
                                <i class="fa-solid fa-circle-check text-green-500 text-sm"></i> Open & use the app daily.
                            </li>
                            <li class="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-300">
                                <i class="fa-solid fa-circle-check text-green-500 text-sm"></i> Add at least 3 items to your pantry.
                            </li>
                        </ul>
                        <p class="text-xs font-bold text-gray-500 dark:text-gray-500 pt-1">If you stay consistent and still don't feel the benefits, request a refund and get your ₹100 back.</p>
                    </div>
                </div>

                <!-- Pay CTA & Terms -->
                <div class="pt-2 space-y-3 text-center">
                    <button id="offer-pay-btn" onclick="simulatePaymentFlow()" class="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-black py-5 rounded-2xl transition-all spring-btn text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 px-4">
                        <span id="pay-btn-text">Pay ₹100 & Unlock My Plan</span>
                        <i id="pay-btn-spinner" class="fa-solid fa-circle-notch fa-spin hidden"></i>
                    </button>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-2">
                        By paying, you agree to the <button onclick="openLegalModal('terms'); event.preventDefault();" class="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">Terms of Service</button> and <span class="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer" onclick="toggleRefundPolicyDetails(); event.preventDefault();">Refund Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Start timer countdown interval
    const timerInterval = setInterval(() => {
        const timerEl = document.getElementById('offer-timer');
        if (!timerEl) {
            clearInterval(timerInterval);
            return;
        }
        count--;
        if (count <= 0) {
            clearInterval(timerInterval);
            timerEl.textContent = "Ended";
            return;
        }
        const days = Math.floor(count / 86400);
        const hours = Math.floor((count % 86400) / 3600);
        const mins = Math.floor((count % 3600) / 60);
        const secs = count % 60;
        timerEl.textContent = `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }, 1000);
}

function toggleRefundPolicyDetails() {
    const details = document.getElementById('refund-details');
    const chevron = document.getElementById('refund-chevron');
    if (details) {
        const isHidden = details.classList.contains('hidden');
        if (isHidden) {
            details.classList.remove('hidden');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
            details.classList.add('hidden');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
    }
}

function togglePayButton() {
    const cb = document.getElementById('offer-terms-checkbox');
    const btn = document.getElementById('offer-pay-btn');
    if (cb && btn) {
        btn.disabled = !cb.checked;
    }
}

function simulatePaymentFlow() {
    const payText = document.getElementById('pay-btn-text');
    const paySpinner = document.getElementById('pay-btn-spinner');
    const payBtn = document.getElementById('offer-pay-btn');
    const cb = document.getElementById('offer-terms-checkbox');
    
    if (payBtn) payBtn.disabled = true;
    if (cb) cb.disabled = true;
    if (payText) payText.textContent = "Processing Payment...";
    if (paySpinner) paySpinner.classList.remove('hidden');
    
    setTimeout(() => {
        if (paySpinner) paySpinner.classList.add('hidden');
        if (payText) payText.textContent = "Payment Successful!";
        
        setTimeout(() => {
            applyAssessmentTargets();
        }, 1500);
    }, 2500);
}

function setAuthTab(mode) {
    authMode = mode;
    const isLogin = mode === 'login';
    
    const loginTab = document.getElementById('tab-auth-login');
    const signupTab = document.getElementById('tab-auth-signup');
    
    if (loginTab && signupTab) {
        if (isLogin) {
            loginTab.className = "flex-grow py-3 rounded-xl text-xs font-black text-center bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm transition-all";
            signupTab.className = "flex-grow py-3 rounded-xl text-xs font-bold text-center text-gray-500 dark:text-gray-400 transition-all hover:text-gray-900 dark:hover:text-white";
        } else {
            signupTab.className = "flex-grow py-3 rounded-xl text-xs font-black text-center bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm transition-all";
            loginTab.className = "flex-grow py-3 rounded-xl text-xs font-bold text-center text-gray-500 dark:text-gray-400 transition-all hover:text-gray-900 dark:hover:text-white";
        }
    }
    
    const signupFields = document.getElementById('auth-signup-fields');
    if (signupFields) {
        signupFields.classList.toggle('hidden', isLogin);
    }
    
    const submitText = document.getElementById('auth-submit-text');
    if (submitText) {
        submitText.textContent = isLogin ? 'Log In' : 'Sign Up';
    }
    
    hideAuthError();
}

function saveAssessmentSession() {
    localStorage.setItem('itspattern_assessment_session', JSON.stringify(assessmentSession));
}

function confirmRestart(force) {
    if (force || confirm('Restart assessment?')) {
        localStorage.removeItem('itspattern_assessment_session');
        localStorage.removeItem('itspattern_assessment_report');
        localStorage.removeItem('itspattern_coach_in_chat');
        localStorage.removeItem('itspattern_coach_chat_history');
        assessmentSession = { session_id: null, user_id: null, current_question: null, step: 1, is_complete: false, loading: false, report: null };
        memberProfile.hasCompletedAssessment = false;
        saveMemberProfile();
        if (typeof applyInitialViewState === 'function') {
            applyInitialViewState();
        } else {
            renderWelcome();
        }
    }
}

function unlockFreeAccess() {
    if (typeof loadAssessmentState === 'function') {
        memberProfile.hasPaidOnboarding = true;
        saveMemberProfile();
        loadAssessmentState();
    }
    if (typeof applyInitialViewState === 'function') {
        applyInitialViewState();
    }
}

// ==========================================
// ADMIN TARGETED OFFERS
// ==========================================
let currentActiveOffer = null;

function displayAdminOffer(offer) {
    if (!offer) return;
    currentActiveOffer = offer;
    const modal = document.getElementById('admin-offer-modal');
    if (!modal) return;
    
    document.getElementById('admin-offer-title').textContent = offer.title || "Special Offer";
    document.getElementById('admin-offer-message').textContent = offer.message || "You have a new message.";
    
    modal.classList.remove('hidden');
    // small delay for transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        const content = modal.querySelector('div');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeAdminOfferModal() {
    const modal = document.getElementById('admin-offer-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    const content = modal.querySelector('div');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function dismissAdminOffer() {
    closeAdminOfferModal();
    markAdminOfferAsSeen();
}

function acceptAdminOffer() {
    closeAdminOfferModal();
    markAdminOfferAsSeen();
    // For now, redirect or just close. Future: apply a specific promo code.
    alert('Offer Claimed! Thank you.');
}

function markAdminOfferAsSeen() {
    if (!currentActiveOffer || !firebase.auth().currentUser) return;
    
    const uid = firebase.auth().currentUser.uid;
    
    db.collection('users').doc(uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            let offers = data.adminOffers || [];
            let updated = false;
            
            for (let i = 0; i < offers.length; i++) {
                if (offers[i].id === currentActiveOffer.id) {
                    offers[i].seen = true;
                    updated = true;
                    break;
                }
            }
            
            if (updated) {
                db.collection('users').doc(uid).set({ adminOffers: offers }, { merge: true });
            }
        }
    });
}

let authMode = 'login'; // 'login' or 'signup'
let pendingTab = null;

const firebaseConfig = {
    apiKey: "AIzaSyBWEhMPYemyAEj_ZU9G7lKBffGEhobNWKI",
    authDomain: "itspattern.firebaseapp.com",
    projectId: "itspattern",
    storageBucket: "itspattern.firebasestorage.app",
    messagingSenderId: "1065011759370",
    appId: "1:1065011759370:web:6539365900cba4c05d12f3"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
// Enable offline persistence
db.enablePersistence().catch(function(err) {
    if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
    }
});

// ==========================================
// FIRESTORE SYNC HELPER
// ==========================================
let isSyncingFromFirestore = false;

function syncToFirestore(collection, data) {
    if (isSyncingFromFirestore) return; // Prevent loop
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    db.collection('users').doc(user.uid).set({
        [collection]: data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(err => console.error('Firestore sync error:', err));
}


const isUserFullyFree = (email) => {
    return ['akevat9@gmail.com', 'shriparnanath@gmail.com'].includes(email);
};

const hasUserPromoAccess = (profile) => {
    if (!profile.promoExpiresDate) return false;
    return new Date(profile.promoExpiresDate) > new Date();
};

function unlockFreeAccess() {
    const rep = assessmentSession.report;
    if (!rep) return;
    const cal = parseInt(rep.daily_calorie_target);
    const p = parseInt(rep.protein_requirement_grams);
    const f = Math.round((cal * 0.25) / 9);
    const c = Math.round((cal - (p * 4) - (f * 9)) / 4);
    Object.assign(targets, { calories: cal, protein: p, carbs: c, fat: f });
    saveTargets();
    updateNutritionalCard();
    renderCharts();

    // Mark assessment as completed but not paid
    memberProfile.hasCompletedAssessment = true;
    saveMemberProfile();

    // Close assessment overlay
    closeAssessmentOverlay();
    
    // Switch to home
    switchTab('home');

    if (typeof applyInitialViewState === 'function') {
        applyInitialViewState();
    }
}

let firestoreUnsubscribe = null;

async function pullFromFirestore(user, phone) {
    if (!user) return;
    try {
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }
        
        firestoreUnsubscribe = db.collection('users').doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                isSyncingFromFirestore = true;
                const data = doc.data();
                
                let shouldSyncProfile = false;
                const now = new Date();
                const isBeforeTriggerDate = now < new Date('2026-06-17T00:00:00+05:30');

                if (data.profile) { 
                    memberProfile = { ...memberProfile, ...data.profile }; 
                    if (!Array.isArray(memberProfile.achievements)) memberProfile.achievements = [];
                    if (phone && memberProfile.phone !== phone) {
                        memberProfile.phone = phone;
                        shouldSyncProfile = true;
                    }
                    if (isBeforeTriggerDate && !memberProfile.promoExpiresDate && !memberProfile.hasPaidOnboarding) {
                        const expiresDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        memberProfile.promoExpiresDate = expiresDate.toISOString();
                        shouldSyncProfile = true;
                    }
                    localStorage.setItem('itspattern_member_v2', JSON.stringify(memberProfile)); 
                } else {
                    if (isBeforeTriggerDate && !memberProfile.promoExpiresDate) {
                        const expiresDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        memberProfile.promoExpiresDate = expiresDate.toISOString();
                        shouldSyncProfile = true;
                    }
                    if (phone) {
                        memberProfile.phone = phone;
                        shouldSyncProfile = true;
                    }
                    localStorage.setItem('itspattern_member_v2', JSON.stringify(memberProfile));
                }
                if (data.dailyState) { dailyState = { ...dailyState, ...data.dailyState }; localStorage.setItem('itspattern_daily_v2', JSON.stringify(dailyState)); }
                if (data.targets) { targets = { ...targets, ...data.targets }; localStorage.setItem('itspattern_targets', JSON.stringify(targets)); }
                if (data.tasks) { tasks = data.tasks; localStorage.setItem('itspattern_tasks_v3', JSON.stringify(tasks)); }
                if (data.schedules) { schedules = data.schedules; localStorage.setItem('itspattern_schedules_v2', JSON.stringify(schedules)); }
                if (data.inventory) { inventoryItems = data.inventory; localStorage.setItem('itspattern_inventory_v1', JSON.stringify(inventoryItems)); }
                if (data.settings && data.settings.darkmode) { 
                    localStorage.setItem('itspattern_darkmode', data.settings.darkmode); 
                    document.documentElement.classList.toggle('dark', data.settings.darkmode === 'dark');
                }
                
                // Admin Offers
                if (data.adminOffers && Array.isArray(data.adminOffers)) {
                    const unseenOffers = data.adminOffers.filter(o => !o.seen);
                    if (unseenOffers.length > 0) {
                        displayAdminOffer(unseenOffers[0]);
                    }
                }
                
                // Re-render UI with merged data
                if (typeof updateMemberUI === 'function') updateMemberUI();
                if (typeof renderTasks === 'function') renderTasks();
                if (typeof renderCharts === 'function') renderCharts();
                if (typeof updateNutritionalCard === 'function') updateNutritionalCard();
                if (typeof renderScheduleList === 'function') renderScheduleList();
                if (typeof renderHomeSchedule === 'function') renderHomeSchedule();
                if (typeof renderInventory === 'function') renderInventory();
                
                // Gate onboarding view state based on profile state
                if (typeof applyInitialViewState === 'function') {
                    applyInitialViewState();
                }
                
                if (shouldSyncProfile) {
                    isSyncingFromFirestore = false;
                    syncToFirestore('profile', memberProfile);
                    isSyncingFromFirestore = true;
                }
                
                setTimeout(() => { isSyncingFromFirestore = false; }, 500);
            } else {
                // First time user, sync current local state up
                memberProfile.hasPaidOnboarding = false; // Need onboarding & payment
                memberProfile.hasCompletedAssessment = false;
                if (phone) memberProfile.phone = phone;
                
                const now = new Date();
                const isBeforeTriggerDate = now < new Date('2026-06-17T00:00:00+05:30');
                if (isBeforeTriggerDate) {
                    const expiresDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    memberProfile.promoExpiresDate = expiresDate.toISOString();
                }
                
                syncToFirestore('profile', memberProfile);
                syncToFirestore('dailyState', dailyState);
                syncToFirestore('targets', targets);
                syncToFirestore('tasks', tasks);
                syncToFirestore('schedules', schedules);
                syncToFirestore('inventory', inventoryItems);
                
                // Show health assessment modal automatically for new users
                setTimeout(() => {
                    renderWelcome();
                    document.getElementById('assessment-overlay').classList.remove('hidden');
                    document.getElementById('assessment-overlay').classList.add('flex');
                }, 1000);
            }
        }, (err) => {
            console.error('Firestore snapshot error:', err);
        });
    } catch(err) {
        console.error('Error setting up Firestore listener:', err);
    }
}

// Ensure isLoggedIn is initialized
if (typeof memberProfile.isLoggedIn === 'undefined') {
    memberProfile.isLoggedIn = false;
}

function showAuthModal(targetTab) {
    pendingTab = targetTab;
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.querySelector('.app-container');
    if (landingPage) {
        landingPage.classList.remove('hidden');
    }
    if (appContainer) {
        appContainer.classList.add('hidden');
    }
}

function closeAuthModal() {
    // No-op as auth is inline on landing page
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    document.getElementById('auth-modal-title').textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
    document.getElementById('auth-signup-fields').classList.toggle('hidden', authMode === 'login');
    document.getElementById('auth-submit-text').textContent = authMode === 'login' ? 'Log In' : 'Sign Up';
    document.getElementById('auth-toggle-text').textContent = authMode === 'login' ? "Don't have an account?" : 'Already have an account?';
    document.getElementById('auth-toggle-btn').textContent = authMode === 'login' ? 'Sign Up' : 'Log In';
    hideAuthError();
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error-msg');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function hideAuthError() {
    document.getElementById('auth-error-msg').classList.add('hidden');
}

function setLoadingAuth(isLoading) {
    document.getElementById('auth-submit-btn').disabled = isLoading;
    if (isLoading) {
        document.getElementById('auth-submit-text').classList.add('hidden');
        document.getElementById('auth-submit-spinner').classList.remove('hidden');
    } else {
        document.getElementById('auth-submit-text').classList.remove('hidden');
        document.getElementById('auth-submit-spinner').classList.add('hidden');
    }
}

async function submitAuth() {
    const terms = document.getElementById('auth-terms').checked;
    if (!terms) return showAuthError('You must accept the Terms and Privacy Policy to continue.');
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const phone = document.getElementById('auth-phone').value.trim();
    if (!email || !password || !phone) return showAuthError('Please enter email, phone number, and password.');
    if (phone.length < 7 || phone.length > 15) return showAuthError('Please enter a valid phone number.');
    
    hideAuthError();
    setLoadingAuth(true);
    
    try {
        if (authMode === 'login') {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            handleAuthSuccess(userCredential.user, phone);
        } else {
            const name = document.getElementById('auth-name').value.trim();
            if (!name) return showAuthError('Please enter your full name.');
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            handleAuthSuccess(userCredential.user, phone);
        }
    } catch (err) {
        console.error(err);
        showAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
        setLoadingAuth(false);
    }
}

async function signInWithGoogle() {
    const terms = document.getElementById('auth-terms').checked;
    if (!terms) return showAuthError('You must accept the Terms and Privacy Policy to continue.');
    hideAuthError();
    const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.location.read');
    try {
        const userCredential = await firebase.auth().signInWithPopup(provider);
        if (userCredential.credential && userCredential.credential.accessToken) {
            localStorage.setItem('itspattern_gfit_token', userCredential.credential.accessToken);
        }
        handleAuthSuccess(userCredential.user);
    } catch (err) {
        console.error(err);
        if (err.code === 'auth/operation-not-supported-in-this-environment' || err.message.includes('auth/configuration-not-found') || err.code === 'auth/unauthorized-domain') {
            showAuthError('Google Sign-In is disabled. Please enable the Google provider in Firebase Console -> Authentication.');
        } else {
            showAuthError(err.message || 'Google Sign-In failed.');
        }
    }
}

function handleAuthSuccess(user, phone) {
    memberProfile.isLoggedIn = true;
    memberProfile.name = user.displayName || memberProfile.name || 'Member';
    memberProfile.email = user.email;
    if (phone) memberProfile.phone = phone;
    if (user.photoURL) memberProfile.photoURL = user.photoURL;
    saveMemberProfile();
    updateHomeUI(); // updates greeting with name
    
    closeAuthModal();
    if (pendingTab) {
        switchTab(pendingTab);
        pendingTab = null;
    }
    
    // Pull any existing data
    pullFromFirestore(user, phone);
}

