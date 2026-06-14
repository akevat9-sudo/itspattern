// =============================================================================
//  ITS_PATTERN — HEALTH OPERATING SYSTEM ENGINE
// =============================================================================

const API_BASE = window.location.hostname === '' || window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '/api.php';




// ── Core State ────────────────────────────────────────────────────────────────
let targets = { calories: 2200, protein: 160, carbs: 220, fat: 70 };

let tasks = [];
let activeFilter = 'all';
let taskChatHistories = {};
let inventoryItems = [];
let schedules = [];
let scheduleTodayChecks = {};

// Member Profile
let memberProfile = {
    name: '',
    phone: '',
    persona: null,
    dietTags: [],
    joinDate: null,
    level: 1,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    achievements: [],
    challengeCompletedToday: false,
    favoriteFoods: [],
    allergies: [],
    metricsHistory: [],
    hasPaidOnboarding: false,
    hasCompletedAssessment: false,
    promoExpiresDate: null,
    analytics: {
        totalTimeSpentSecs: 0,
        daysUsed: [],
        clickCounts: {}
    }
};

// Daily state
let dailyState = {
    date: null,
    insight: null,
    challenge: null,
    challengeDone: false
};

// Assessment & Coach
let assessmentSession = { session_id: null, user_id: null, current_question: null, step: 1, is_complete: false, loading: false, report: null };

// XP & Level config
const LEVELS = [
    { level: 1, title: 'Beginner', xpRequired: 0 },
    { level: 5, title: 'Consistency Builder', xpRequired: 200 },
    { level: 10, title: 'Muscle Explorer', xpRequired: 500 },
    { level: 25, title: 'Metabolic Warrior', xpRequired: 1200 },
    { level: 50, title: 'Transformation Titan', xpRequired: 2500 },
    { level: 100, title: 'Legend', xpRequired: 5000 }
];

const ACHIEVEMENTS = [
    { id: 'first_log', title: 'First Fuel', desc: 'Logged your first meal', icon: 'fa-utensils', xp: 10 },
    { id: '7day', title: '7 Day Warrior', desc: '7 day streak', icon: 'fa-fire', xp: 50 },
    { id: '30day', title: '30 Day Titan', desc: '30 day streak', icon: 'fa-fire-flame-curved', xp: 150 },
    { id: '90day', title: '90 Day Legend', desc: '90 day streak', icon: 'fa-crown', xp: 400 },
    { id: '100meals', title: 'Century Club', desc: '100 fuel entries logged', icon: 'fa-chart-simple', xp: 100 },
    { id: 'protein_hit', title: 'Muscle Builder', desc: 'Hit protein target 5 days in a row', icon: 'fa-dumbbell', xp: 75 },
    { id: 'assessment', title: 'Self Aware', desc: 'Completed health assessment', icon: 'fa-brain', xp: 30 },
    { id: 'coach_chat', title: 'Coach Call', desc: 'Chatted with AI Coach', icon: 'fa-comments', xp: 15 },
];

const DAILY_INSIGHTS = [
    "Protein timing matters less than consistency. Focus on hitting your daily target.",
    "Sleep quality directly impacts your body's ability to build muscle and recover.",
    "Drinking water before meals can naturally help with portion awareness.",
    "The best diet is the one you can sustain. Consistency beats intensity every time.",
    "Your body adapts over weeks, not days. Trust the process.",
    "Fiber is your gut's best friend. Aim for diverse plant foods daily.",
    "Stress increases cortisol, which can slow progress. Breathe deeply today.",
    "Strength training plus adequate protein equals the most efficient body recomposition.",
    "Meal timing flexibility is a real advantage — don't stress about exact clock times.",
    "Your metabolism isn't broken. It's adaptive. Give it good signals consistently.",
    "Processed foods aren't evil — but whole foods make hitting targets easier.",
    "Tracking for awareness, not obsession. Knowledge empowers better choices.",
];

const DAILY_CHALLENGES = [
    { text: 'Drink 2 liters of water today', xp: 10 },
    { text: 'Hit your Muscle Builder target today', xp: 15 },
    { text: 'Go for a 15-minute walk', xp: 10 },
    { text: 'Eat at least 3 different vegetables', xp: 10 },
    { text: 'No screens during one meal today', xp: 10 },
    { text: 'Log everything you eat today — no exceptions', xp: 15 },
    { text: 'Get 7+ hours of sleep tonight', xp: 12 },
    { text: 'Try a new protein source today', xp: 10 },
    { text: 'Stretch for 5 minutes', xp: 8 },
    { text: 'Read one article about nutrition science', xp: 10 },
];

const defaultChartData = [
    { day: 'M', completed: 50 }, { day: 'T', completed: 70 }, { day: 'W', completed: 85 },
    { day: 'T', completed: 65 }, { day: 'F', completed: 55 }, { day: 'S', completed: 35 }, { day: 'S', completed: 20 }
];

// ── Initialization ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    loadMemberProfile();
    loadTargets();
    loadTasks();
    loadTaskChatHistories();
    loadInventory();
    loadSchedules();
    loadDarkMode();
    loadAssessmentState();
    initDailyState();
    refreshAllUI();
    applyInitialViewState();
    setTimeout(checkShriPopups, 2000); // Check sweet popups after a short delay
    setInterval(checkStreakMidnight, 60000); // Check every minute for day change
    document.getElementById('modal-task-time').value = formatTime(new Date());

    // Register Service Worker for PWA support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    }

    // -- Analytics Tracking --
    let lastFocusTime = Date.now();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            lastFocusTime = Date.now();
            trackAnalyticsEvent('app_opened');
        } else {
            if (memberProfile.isLoggedIn) {
                const sessionDurationSecs = Math.floor((Date.now() - lastFocusTime) / 1000);
                memberProfile.analytics.totalTimeSpentSecs += sessionDurationSecs;
                
                const today = todayString();
                if (!memberProfile.analytics.daysUsed.includes(today)) {
                    memberProfile.analytics.daysUsed.push(today);
                }
                saveMemberProfile();
            }
        }
    });
});

function trackAnalyticsEvent(eventName) {
    if (!memberProfile) return;
    if (!memberProfile.analytics) memberProfile.analytics = { totalTimeSpentSecs: 0, daysUsed: [], clickCounts: {} };
    if (!memberProfile.analytics.clickCounts) memberProfile.analytics.clickCounts = {};
    
    if (!memberProfile.analytics.clickCounts[eventName]) {
        memberProfile.analytics.clickCounts[eventName] = 0;
    }
    memberProfile.analytics.clickCounts[eventName]++;
    
    // Periodically save
    if (memberProfile.analytics.clickCounts[eventName] % 5 === 0) {
        saveMemberProfile();
    }
}

function loadMemberProfile() {
    const stored = localStorage.getItem('itspattern_member_v2');
    if (stored) {
        memberProfile = { ...memberProfile, ...JSON.parse(stored) };
    }
    if (!Array.isArray(memberProfile.achievements)) {
        memberProfile.achievements = [];
    }
    if (!Array.isArray(memberProfile.metricsHistory)) {
        memberProfile.metricsHistory = [];
    }
    if (!memberProfile.analytics) {
        memberProfile.analytics = { totalTimeSpentSecs: 0, daysUsed: [], clickCounts: {} };
    } else {
        if (!memberProfile.analytics.clickCounts) memberProfile.analytics.clickCounts = {};
        if (!memberProfile.analytics.daysUsed) memberProfile.analytics.daysUsed = [];
        if (!memberProfile.analytics.totalTimeSpentSecs) memberProfile.analytics.totalTimeSpentSecs = 0;
    }
    if (!memberProfile.joinDate) {
        memberProfile.joinDate = new Date().toISOString();
        saveMemberProfile();
    }
    if (!memberProfile.lastActiveDate) {
        memberProfile.lastActiveDate = todayString();
        saveMemberProfile();
    }
    checkStreakMidnight();
    updateMemberUI();
}

function saveMemberProfile() {
    localStorage.setItem('itspattern_member_v2', JSON.stringify(memberProfile));
    if (typeof syncToFirestore === 'function') syncToFirestore('profile', memberProfile);
}

function todayString() {
    return new Date().toISOString().split('T')[0];
}

function saveMemberName() {
    const input = document.getElementById('member-name-input');
    if (input) {
        memberProfile.name = input.value.trim() || 'Member';
        saveMemberProfile();
        updateMemberUI();
    }
}

function setPersona(type) {
    memberProfile.persona = type;
    saveMemberProfile();
    updateMemberUI();
}

function updatePersonaUI(type) {
    // Update persona selector UI
    document.querySelectorAll('#persona-selector button').forEach(b => {
        b.classList.remove('border-indigo-400', 'text-indigo-500', 'bg-indigo-50');
        b.classList.add('border-gray-200', 'text-gray-500');
    });
    const activeBtn = document.getElementById(`persona-${type}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-gray-200', 'text-gray-500');
        activeBtn.classList.add('border-indigo-400', 'text-indigo-500', 'bg-indigo-50');
    }
}

// ── Streak System ─────────────────────────────────────────────────────────────
function checkStreakMidnight() {
    const today = todayString();
    if (memberProfile.lastActiveDate === today) return;

    const lastDate = new Date(memberProfile.lastActiveDate + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        memberProfile.streak += 1;
        memberProfile.lastActiveDate = today;
        saveMemberProfile();
        checkStreakAchievements();
        maybeCelebrateStreak();
    } else if (diffDays > 1) {
        memberProfile.streak = 1;
        memberProfile.lastActiveDate = today;
        saveMemberProfile();
    }

    memberProfile.lastActiveDate = today;
    memberProfile.challengeCompletedToday = false;
    dailyState.challengeDone = false;
    dailyState.date = today;
    saveDailyState();
    saveMemberProfile();
    updateStreakUI();
    updateHomeUI();
}

function checkStreakAchievements() {
    if (memberProfile.streak === 7 && !memberProfile.achievements.includes('7day')) {
        awardAchievement('7day');
    }
    if (memberProfile.streak === 30 && !memberProfile.achievements.includes('30day')) {
        awardAchievement('30day');
    }
    if (memberProfile.streak === 90 && !memberProfile.achievements.includes('90day')) {
        awardAchievement('90day');
    }
}

// ── XP & Level System ─────────────────────────────────────────────────────────
function addXP(amount) {
    memberProfile.xp += amount;
    const oldLevel = memberProfile.level;

    // Calculate level based on XP thresholds
    let newLevel = 1;
    for (const tier of LEVELS) {
        if (memberProfile.xp >= tier.xpRequired) {
            newLevel = tier.level;
        }
    }
    memberProfile.level = newLevel;
    saveMemberProfile();
    updateLevelUI();

    if (newLevel > oldLevel) {
        celebrateLevelUp(oldLevel, newLevel);
    }
}

function getLevelTitle(level) {
    let title = 'Beginner';
    for (const tier of LEVELS) {
        if (level >= tier.level) title = tier.title;
    }
    return title;
}

function getNextLevelXP(level) {
    let nextXP = 5000;
    for (const tier of LEVELS) {
        if (tier.level > level) {
            nextXP = tier.xpRequired;
            break;
        }
    }
    return nextXP;
}

function getLevelProgress(level, xp) {
    let currentTierXP = 0;
    let nextTierXP = 5000;
    for (let i = 0; i < LEVELS.length; i++) {
        if (level >= LEVELS[i].level) {
            currentTierXP = LEVELS[i].xpRequired;
            nextTierXP = LEVELS[i + 1] ? LEVELS[i + 1].xpRequired : 5000;
        }
    }
    const progress = ((xp - currentTierXP) / (nextTierXP - currentTierXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
}

// ── Achievements ──────────────────────────────────────────────────────────────
function awardAchievement(id) {
    if (memberProfile.achievements.includes(id)) return;
    memberProfile.achievements.push(id);
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) addXP(ach.xp);
    saveMemberProfile();
    renderAchievements();

    const achData = ACHIEVEMENTS.find(a => a.id === id);
    if (achData) {
        showCelebration(achData.title, achData.desc);
    }
}

function maybeCelebrateStreak() {
    const milestones = [
        { days: 7, title: '7 Day Warrior', msg: 'A full week of consistency. You are building the foundation of a transformational habit.' },
        { days: 30, title: '30 Day Titan', msg: 'One month. Only 15% of members reach this milestone. You are becoming unstoppable.' },
        { days: 60, title: '60 Day Warrior', msg: 'Two months. Your identity is shifting. You are no longer "trying" — you are doing.' },
        { days: 90, title: '90 Day Legend', msg: 'Three months. Only 3% of members reach this milestone. You have transformed.' },
        { days: 180, title: 'Half-Year Hero', msg: 'Six months. This is no longer a phase. This is who you are.' },
        { days: 365, title: '1 Year Icon', msg: 'An entire year. You have redefined your relationship with health. Legend status confirmed.' }
    ];

    for (const m of milestones) {
        if (memberProfile.streak === m.days) {
            showCelebration(m.title, m.msg);
            return;
        }
    }
}

// ── Daily State ───────────────────────────────────────────────────────────────
function initDailyState() {
    const stored = localStorage.getItem('itspattern_daily_v2');
    const today = todayString();

    if (stored) {
        dailyState = JSON.parse(stored);
    }

    if (dailyState.date !== today) {
        // New day — generate fresh daily content
        dailyState.date = today;
        dailyState.insight = DAILY_INSIGHTS[Math.floor(Math.random() * DAILY_INSIGHTS.length)];
        dailyState.challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
        dailyState.challengeDone = false;
        memberProfile.challengeCompletedToday = false;
        saveDailyState();
        saveMemberProfile();
    }
}

function saveDailyState() {
    localStorage.setItem('itspattern_daily_v2', JSON.stringify(dailyState));
    if (typeof syncToFirestore === 'function') syncToFirestore('dailyState', dailyState);
}

function completeDailyChallenge() {
    if (dailyState.challengeDone || memberProfile.challengeCompletedToday) return;

    dailyState.challengeDone = true;
    memberProfile.challengeCompletedToday = true;
    saveDailyState();
    saveMemberProfile();

    const xpEarned = dailyState.challenge ? dailyState.challenge.xp : 10;
    addXP(xpEarned);

    // Server Metrics Snapshot — daily challenge completed
    fireAnalyticsSnapshot('challenge_complete', { challenge: dailyState.challenge?.text, xp: xpEarned });

    // Mark as completed
    const btn = document.getElementById('challenge-complete-btn');
    if (btn) {
        btn.classList.add('bg-indigo-500', 'border-indigo-500', 'text-white');
        btn.classList.remove('border-indigo-300', 'text-indigo-500', 'hover:bg-indigo-500', 'hover:text-white');
        btn.innerHTML = '<i class="fa-solid fa-check text-sm"></i>';
    }
    const card = document.getElementById('daily-challenge-card');
    if (card) card.style.opacity = '0.6';

    showCelebration('Challenge Complete!', `You earned +${xpEarned} XP. Every step counts.`);
}

// ── Celebration System ────────────────────────────────────────────────────────
function showCelebration(title, message) {
    document.getElementById('celebration-title').textContent = title;
    document.getElementById('celebration-message').textContent = message;
    document.getElementById('celebration-overlay').classList.remove('hidden');
}

function dismissCelebration() {
    document.getElementById('celebration-overlay').classList.add('hidden');
    updateHomeUI();
}

function celebrateLevelUp(oldLevel, newLevel) {
    const newTitle = getLevelTitle(newLevel);
    showCelebration(
        `Level ${newLevel} Reached!`,
        `You've evolved from Level ${oldLevel} to ${newTitle}. Your commitment is showing real results.`
    );
}

function applyInitialViewState() {
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.querySelector('.app-container');
    const assessmentOverlay = document.getElementById('assessment-overlay');
    const mainNav = document.getElementById('main-nav') || document.querySelector('nav');
    
    // Defensive: if critical elements are missing, show whatever we can
    if (!landingPage && !appContainer && !assessmentOverlay) return;

    if (!memberProfile.isLoggedIn) {
        // Not logged in: show landing page, hide everything else
        if (landingPage) landingPage.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
        if (assessmentOverlay) {
            assessmentOverlay.classList.add('hidden');
            assessmentOverlay.classList.remove('flex');
        }
        if (mainNav) mainNav.classList.add('hidden');
    } else {
        // Logged in: hide landing page, show nav
        if (landingPage) landingPage.classList.add('hidden');
        if (mainNav) mainNav.classList.remove('hidden');
        
        const isFullyFree = typeof isUserFullyFree === 'function' ? isUserFullyFree(memberProfile.email) : ['akevat9@gmail.com', 'shriparnanath@gmail.com'].includes(memberProfile.email);
        const hasPromoAccess = typeof hasUserPromoAccess === 'function' ? hasUserPromoAccess(memberProfile) : (memberProfile.promoExpiresDate && new Date(memberProfile.promoExpiresDate) > new Date());
        const isFree = isFullyFree || hasPromoAccess;
        const isAssessmentComplete = memberProfile.hasCompletedAssessment;

        if (!isAssessmentComplete) {
            if (appContainer) appContainer.classList.add('hidden');
            if (assessmentOverlay) {
                assessmentOverlay.classList.remove('hidden');
                assessmentOverlay.classList.add('flex');
            }
            if (typeof loadAssessmentState === 'function') loadAssessmentState();
        } else if (memberProfile.hasPaidOnboarding === false && !isFree) {
            if (appContainer) appContainer.classList.add('hidden');
            if (assessmentOverlay) {
                assessmentOverlay.classList.remove('hidden');
                assessmentOverlay.classList.add('flex');
            }
            if (typeof loadAssessmentState === 'function') loadAssessmentState();
        } else {
            if (appContainer) appContainer.classList.remove('hidden');
            if (assessmentOverlay) {
                assessmentOverlay.classList.add('hidden');
                assessmentOverlay.classList.remove('flex');
            }
        }
    }
}

// ── UI Update Helpers ─────────────────────────────────────────────────────────
function refreshAllUI() {
    updateMemberUI();
    updateStreakUI();
    updateLevelUI();
    updateHomeUI();
    updateNutritionalCard();
    renderTasks();
    renderCharts();
    renderAchievements();
    initAssessment();
}

function updateMemberUI() {
    const name = memberProfile.name || 'Member';
    const firstLetter = name.charAt(0).toUpperCase();

    // Header Avatar
    const headerLetter = document.getElementById('header-avatar-letter');
    const headerImg = document.getElementById('header-avatar-img');
    if (memberProfile.photoURL && headerImg) {
        headerImg.src = memberProfile.photoURL;
        headerImg.classList.remove('hidden');
        if (headerLetter) headerLetter.classList.add('hidden');
    } else {
        if (headerLetter) {
            headerLetter.textContent = firstLetter;
            headerLetter.classList.remove('hidden');
        }
        if (headerImg) headerImg.classList.add('hidden');
    }

    // Settings Avatar
    const settingsLetter = document.getElementById('settings-avatar-letter');
    const settingsImg = document.getElementById('settings-avatar-img');
    if (memberProfile.photoURL && settingsImg) {
        settingsImg.src = memberProfile.photoURL;
        settingsImg.classList.remove('hidden');
        if (settingsLetter) settingsLetter.classList.add('hidden');
    } else {
        if (settingsLetter) {
            settingsLetter.textContent = firstLetter;
            settingsLetter.classList.remove('hidden');
        }
        if (settingsImg) settingsImg.classList.add('hidden');
    }

    const nameDisplay = document.getElementById('member-name-display');
    if (nameDisplay) nameDisplay.textContent = name;
    
    const nameInput = document.getElementById('member-name-input');
    if (nameInput && !nameInput.value) nameInput.value = name;

    const sinceEl = document.getElementById('member-since-display');
    if (sinceEl && memberProfile.joinDate) {
        const d = new Date(memberProfile.joinDate);
        sinceEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const statJoin = document.getElementById('stat-join-date');
    if (statJoin && memberProfile.joinDate) {
        const d = new Date(memberProfile.joinDate);
        statJoin.textContent = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Set persona active in settings
    if (memberProfile.persona) {
        updatePersonaUI(memberProfile.persona);
    }
}

function updateStreakUI() {
    document.getElementById('streak-count').textContent = memberProfile.streak;
    const labelEl = document.getElementById('streak-label');
    if (memberProfile.streak >= 90) labelEl.textContent = 'Legend status';
    else if (memberProfile.streak >= 30) labelEl.textContent = 'Titan mode';
    else if (memberProfile.streak >= 7) labelEl.textContent = 'Building momentum';
    else if (memberProfile.streak > 0) labelEl.textContent = 'Keep going';
    else labelEl.textContent = 'Start your journey';

    document.getElementById('stat-streak').textContent = `${memberProfile.streak} days`;
}

function updateLevelUI() {
    const levelTitle = getLevelTitle(memberProfile.level);
    document.getElementById('level-number').textContent = memberProfile.level;
    document.getElementById('level-title').textContent = levelTitle;
    document.getElementById('xp-total').textContent = memberProfile.xp;

    const nextLevel = getNextLevelXP(memberProfile.level);
    const progress = getLevelProgress(memberProfile.level, memberProfile.xp);

    document.getElementById('xp-bar').style.width = `${progress}%`;
    document.getElementById('level-xp-bar').style.width = `${progress}%`;
    document.getElementById('level-xp-text').textContent = `${memberProfile.xp} / ${nextLevel} XP`;
    document.getElementById('level-next').textContent = `${nextLevel - memberProfile.xp} XP to ${getLevelTitle(getNextLevelNumber(memberProfile.level))}`;

    // Header badge
    document.getElementById('header-level-badge').innerHTML = `
        <span class="text-[9px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-md border border-indigo-400/30">Lv.${memberProfile.level}</span>
        <span class="text-[9px] text-gray-400">${levelTitle}</span>
    `;
}

function getNextLevelNumber(level) {
    let next = 100;
    for (const tier of LEVELS) {
        if (tier.level > level) { next = tier.level; break; }
    }
    return next;
}

function updateHomeUI() {
    // Greeting
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    const name = memberProfile.name || 'Member';
    document.getElementById('home-greeting').textContent = `${greeting}, ${name}`;

    // Date
    const now = new Date();
    document.getElementById('home-date-label').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Daily insight
    document.getElementById('daily-insight-text').textContent = dailyState.insight || DAILY_INSIGHTS[0];

    // Daily challenge
    if (dailyState.challenge) {
        document.getElementById('daily-challenge-text').textContent = dailyState.challenge.text;
        document.getElementById('daily-challenge-xp').textContent = `+${dailyState.challenge.xp} XP`;
    }

    // Reset challenge button if new day
    if (!dailyState.challengeDone && !memberProfile.challengeCompletedToday) {
        const btn = document.getElementById('challenge-complete-btn');
        if (btn) {
            btn.classList.remove('bg-indigo-500', 'border-indigo-500', 'text-white');
            btn.classList.add('border-indigo-300', 'text-indigo-500', 'hover:bg-indigo-500', 'hover:text-white');
            btn.innerHTML = '<i class="fa-solid fa-check text-sm"></i>';
        }
        const card = document.getElementById('daily-challenge-card');
        if (card) card.style.opacity = '1';
    } else {
        const btn = document.getElementById('challenge-complete-btn');
        if (btn) {
            btn.classList.add('bg-indigo-500', 'border-indigo-500', 'text-white');
            btn.classList.remove('border-indigo-300', 'text-indigo-500', 'hover:bg-indigo-500', 'hover:text-white');
            btn.innerHTML = '<i class="fa-solid fa-check text-sm"></i>';
        }
        const card = document.getElementById('daily-challenge-card');
        if (card) card.style.opacity = '0.6';
    }
    renderHomeSchedule();
}

function loadTaskChatHistories() {
    try { taskChatHistories = JSON.parse(localStorage.getItem('itspattern_task_chats') || '{}'); } catch(e) { taskChatHistories = {}; }
}
function saveTaskChatHistories() {
    localStorage.setItem('itspattern_task_chats', JSON.stringify(taskChatHistories));
}

// ── Tasks / Fuel Log ──────────────────────────────────────────────────────────
function loadTasks() {
    const stored = localStorage.getItem('itspattern_tasks_v3');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        tasks = [
            { id: 1, title: "Scrambled Eggs & Toast", time: "08:30 AM", createdTimestamp: Date.now() - 7200000, completed: true, comment: "", calories: 320, protein: 25, carbs: 30, fat: 12 },
            { id: 2, title: "Grilled Chicken & Rice", time: "01:00 PM", createdTimestamp: Date.now() - 3600000, completed: false, comment: "", calories: 550, protein: 45, carbs: 55, fat: 14 }
        ];
        saveTasks();
    }
}

function saveTasks() { 
    localStorage.setItem('itspattern_tasks_v3', JSON.stringify(tasks)); 
    if (typeof syncToFirestore === 'function') syncToFirestore('tasks', tasks);
}

function updateNutritionalCard() {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    tasks.forEach(t => {
        if (t.completed) {
            totalCal += Number(t.calories || 0);
            totalP += Number(t.protein || 0);
            totalC += Number(t.carbs || 0);
            totalF += Number(t.fat || 0);
        }
    });

    document.getElementById('fuel-current').textContent = totalCal;
    document.getElementById('p-curr').textContent = totalP;
    document.getElementById('c-curr').textContent = totalC;
    document.getElementById('f-curr').textContent = totalF;
    document.getElementById('fuel-goal-display').textContent = targets.calories;

    const pct = Math.min((totalCal / targets.calories) * 100, 100);
    document.getElementById('fuel-ring-percent').textContent = `${Math.round(pct)}%`;

    const circumference = 263.89;
    const offset = circumference - (pct / 100) * circumference;
    document.getElementById('fuel-ring').style.strokeDashoffset = offset;

    const deficitEl = document.getElementById('fit-deficit-val');
    if (deficitEl) {
        const burned = window.lastFitBurned || 0;
        if (burned === 0) {
            deficitEl.textContent = '...';
            deficitEl.className = 'text-gray-300';
        } else {
            const diff = totalCal - burned;
            if (diff < 0) {
                deficitEl.textContent = `${diff} kcal`;
                deficitEl.className = 'text-emerald-400 drop-shadow-sm';
            } else {
                deficitEl.textContent = `+${diff} kcal`;
                deficitEl.className = 'text-rose-400 drop-shadow-sm';
            }
        }
    }
}

function renderTasks() {
    const fullList = document.getElementById('tasks-list-full');
    const homePreview = document.getElementById('home-fuel-log-preview');
    if (!fullList) return;

    let filtered = tasks;
    if (activeFilter === 'active') filtered = tasks.filter(t => !t.completed);
    else if (activeFilter === 'completed') filtered = tasks.filter(t => t.completed);

    fullList.innerHTML = '';
    if (filtered.length === 0) {
        fullList.innerHTML = `<div class="text-center py-10 text-gray-400"><i class="fa-regular fa-folder-open text-xl mb-2 block"></i><p class="text-xs">No entries yet. Start logging.</p></div>`;
    } else {
        filtered.forEach(t => fullList.appendChild(createTaskEl(t, 'full')));
    }

    if (homePreview) {
        homePreview.innerHTML = '';
        const previewTasks = tasks.slice(0, 2);
        if (previewTasks.length === 0) {
            homePreview.innerHTML = `<div class="glass-card p-4 text-center text-[10px] text-gray-400">No fuel entries yet. <button onclick="switchTab('tasks')" class="text-indigo-500 font-bold hover:underline">Log your first meal</button></div>`;
        } else {
            previewTasks.forEach(t => homePreview.appendChild(createTaskEl(t, 'home')));
        }
    }

    updateNutritionalCard();

    // Achievement check: first log
    if (tasks.length >= 1 && !memberProfile.achievements.includes('first_log')) {
        awardAchievement('first_log');
    }
    if (tasks.length >= 100 && !memberProfile.achievements.includes('100meals')) {
        awardAchievement('100meals');
    }
}

function createTaskEl(task, viewType) {
    const div = document.createElement('div');
    div.className = 'glass-card p-3.5 card-hover relative';
    div.id = `task-card-${task.id}`;
    const completedClass = task.completed ? 'line-through text-gray-400' : 'text-gray-900';
    const checkedAttr = task.completed ? 'checked' : '';

    const msgs = taskChatHistories[task.id] || [];
    const chatBubbles = msgs.map(m =>
        `<div class="task-chat-bubble ${m.role} mb-1.5">${m.content}</div>`
    ).join('');

    div.innerHTML = `
        <div class="flex items-start gap-2.5 pr-20">
            ${task.aiModified ? '<div class="absolute top-3 left-3 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>' : ''}
            <input type="checkbox" onchange="toggleTask(${task.id})" class="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer rounded" ${checkedAttr}>
            <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                    <h3 class="font-semibold text-xs ${completedClass}">${task.title}</h3>
                    ${viewType === 'full' ? `<button onclick="deleteTask(${task.id})" class="text-gray-400 hover:text-red-400 transition-colors text-[10px] flex-shrink-0"><i class="fa-regular fa-trash-can"></i></button>` : ''}
                </div>
                <div class="flex items-center flex-wrap gap-1.5 text-[9px] text-gray-400 mt-0.5">
                    <span>${task.time}</span>
                    <span>•</span>
                    <span id="task-epoch-${task.id}">${getRelativeTime(task.createdTimestamp || Date.now())}</span>
                    <button onclick="setTaskJustNow(${task.id})" class="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[9px] font-semibold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all spring-btn">just now</button>
                    <button onclick="editTaskTime(${task.id})" class="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[9px] font-semibold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all spring-btn">edit time</button>
                    <button onclick="toggleTaskChat(${task.id})" class="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[9px] font-semibold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all spring-btn flex items-center gap-0.5"><i class="fa-regular fa-comment-dots text-[7px]"></i> AI</button>
                </div>
            </div>
            <div class="absolute right-3 top-3 text-right flex flex-col items-end">
                <span class="text-[10px] font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">${task.calories} kcal</span>
                <span class="text-[7px] text-gray-400 mt-1 font-bold">${task.protein}g P | ${task.carbs}g C | ${task.fat}g F</span>
                ${task.aiModified ? '<span class="text-[7px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded mt-0.5 border border-green-200">AI Adjusted</span>' : ''}
            </div>
        </div>
        <div id="task-chat-${task.id}" class="task-chat-area mt-1">
            <div class="pt-2 border-t border-gray-100 space-y-1 max-h-[220px] overflow-y-auto pr-1" id="task-chat-msgs-${task.id}">
                ${chatBubbles}
            </div>
            <div class="flex items-center gap-1.5 mt-1.5">
                <input type="text" id="task-chat-input-${task.id}" placeholder="Describe your scenario..." class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-indigo-400 text-gray-900 placeholder-gray-400" onkeydown="if(event.key==='Enter') sendTaskChatMessage(${task.id})">
                <button onclick="sendTaskChatMessage(${task.id})" class="bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all spring-btn flex-shrink-0"><i class="fa-solid fa-arrow-up text-[8px]"></i></button>
            </div>
        </div>
    `;
    return div;
}

function setTaskJustNow(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.createdTimestamp = Date.now();
    saveTasks();
    const el = document.getElementById(`task-epoch-${id}`);
    if (el) el.textContent = getRelativeTime(task.createdTimestamp);
}

function editTaskTime(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newTime = prompt('Enter new time (e.g. 02:30 PM):', task.time);
    if (newTime && newTime.trim()) {
        task.time = newTime.trim();
        saveTasks();
        renderTasks();
    }
}

function toggleTaskChat(id) {
    const area = document.getElementById(`task-chat-${id}`);
    if (!area) return;
    area.classList.toggle('open');
    if (area.classList.contains('open')) {
        setTimeout(() => {
            const input = document.getElementById(`task-chat-input-${id}`);
            if (input) input.focus();
            const msgsContainer = document.getElementById(`task-chat-msgs-${id}`);
            if (msgsContainer) msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }, 100);
    }
}

async function sendTaskChatMessage(taskId) {
    const input = document.getElementById(`task-chat-input-${taskId}`);
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    if (!taskChatHistories[taskId]) taskChatHistories[taskId] = [];
    taskChatHistories[taskId].push({ role: 'user', content: msg });
    saveTaskChatHistories();
    renderTaskChat(taskId);

    try {
        const task = tasks.find(t => t.id === taskId);
        const taskContext = task ? `Current meal: "${task.title}", ${task.calories} kcal, ${task.protein}g protein, ${task.carbs}g carbs, ${task.fat}g fat.` : '';
        const contextMsg = `[CONTEXT] ${taskContext} User scenario: ${msg}. If you need more details before adjusting, ask a follow-up question. If you can adjust, respond with [EDIT_MEAL: { "title": "...", "calories": N, "protein": N, "carbs": N, "fat": N }]`;

        const r = await fetch(`${API_BASE}/coach`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: contextMsg, history: [] })
        });
        if (!r.ok) throw new Error('Failed');
        const data = await r.json();
        let reply = data.reply || 'Adjusted based on your scenario!';

        const editMatch = reply.match(/\[EDIT_MEAL:\s*({.*?})\]/i);
        if (editMatch && task) {
            try {
                const ed = JSON.parse(editMatch[1]);
                reply = reply.replace(editMatch[0], '').trim() || 'Meal adjusted!';
                if (ed.title) task.title = ed.title;
                if (ed.calories) task.calories = parseInt(ed.calories);
                if (ed.protein) task.protein = parseInt(ed.protein);
                if (ed.carbs !== undefined) task.carbs = parseInt(ed.carbs);
                else task.carbs = Math.round((parseInt(ed.calories || task.calories) * 0.4) / 4);
                if (ed.fat !== undefined) task.fat = parseInt(ed.fat);
                else task.fat = Math.round((parseInt(ed.calories || task.calories) * 0.25) / 9);
                if (ed.time) task.time = ed.time;
                task.aiModified = true;
                saveTasks();
                renderTasks();
                updateNutritionalCard();
                renderCharts();
            } catch (e) { console.error('Edit meal parse error:', e); }
        }

        // Also handle LOG actions (add new tasks)
        const logMatch = reply.match(/\[LOG:\s*({.*?})\]/i);
        if (logMatch) {
            try {
                const logData = JSON.parse(logMatch[1]);
                reply = reply.replace(logMatch[0], '').trim();
                tasks.unshift({
                    id: Date.now(), title: `AI: ${logData.name}`, time: formatTime(new Date()),
                    createdTimestamp: Date.now(), completed: true, comment: '',
                    calories: parseInt(logData.calories || 0), protein: parseInt(logData.protein || 0),
                    carbs: logData.carbs ? parseInt(logData.carbs) : Math.round((parseInt(logData.calories || 0) * 0.4) / 4),
                    fat: logData.fat ? parseInt(logData.fat) : Math.round((parseInt(logData.calories || 0) * 0.3) / 9)
                });
                saveTasks();
                renderTasks();
                renderCharts();
            } catch (e) { console.error('Log parse error:', e); }
        }

        // Task Chat Target Recalibration — parse [TARGETS: ...] from task chat
        const targetMatch = reply.match(/\[TARGETS:\s*({.*?})\]/i);
        if (targetMatch) {
            try {
                const td = JSON.parse(targetMatch[1]);
                reply = reply.replace(targetMatch[0], '').trim();
                const cal = parseInt(td.calories || targets.calories);
                const p = parseInt(td.protein || targets.protein);
                const f = td.fat ? parseInt(td.fat) : Math.round((cal * 0.25) / 9);
                const c = td.carbs ? parseInt(td.carbs) : Math.round((cal - (p * 4) - (f * 9)) / 4);
                Object.assign(targets, { calories: cal, protein: p, carbs: c, fat: f });
                saveTargets();
                updateNutritionalCard();
                renderCharts();
            } catch (e) { console.error('Task chat target parse error:', e); }
        }

        if (!reply) reply = 'Meal adjusted based on your scenario!';
        taskChatHistories[taskId].push({ role: 'assistant', content: reply });
        saveTaskChatHistories();
        renderTaskChat(taskId);

    } catch (err) {
        taskChatHistories[taskId].push({ role: 'assistant', content: 'AI unavailable. Using smart defaults based on your input.' });
        saveTaskChatHistories();
        renderTaskChat(taskId);
        // Fallback: simple local logic
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const ml = msg.toLowerCase();
            if (ml.includes('more protein') || ml.includes('increase protein') || ml.includes('add protein')) {
                task.protein = Math.min(task.protein + 15, 80);
                task.calories += 60;
            }
            if (ml.includes('less carbs') || ml.includes('low carb') || ml.includes('reduce carb')) {
                task.carbs = Math.max(task.carbs - 15, 5);
                task.calories = Math.max(task.calories - 60, 50);
            }
            if (ml.includes('more calories') || ml.includes('bigger') || ml.includes('larger')) {
                task.calories += 150;
                task.protein = Math.round(task.protein * 1.2);
                task.carbs = Math.round(task.carbs * 1.2);
                task.fat = Math.round(task.fat * 1.2);
            }
            if (ml.includes('light') || ml.includes('small') || ml.includes('less calories')) {
                task.calories = Math.max(task.calories - 100, 50);
                task.protein = Math.max(task.protein - 5, 5);
                task.carbs = Math.max(task.carbs - 8, 3);
                task.fat = Math.max(task.fat - 3, 1);
            }
            task.aiModified = true;
            saveTasks();
            renderTasks();
            updateNutritionalCard();
            renderCharts();
        }
    }
}

function renderTaskChat(taskId) {
    const container = document.getElementById(`task-chat-msgs-${taskId}`);
    if (!container) return;
    const msgs = taskChatHistories[taskId] || [];
    container.innerHTML = msgs.map(m =>
        `<div class="task-chat-bubble ${m.role} mb-1.5">${m.content}</div>`
    ).join('');
    container.scrollTop = container.scrollHeight;
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.createdTimestamp = Date.now();
    saveTasks();
    renderTasks();
    renderCharts();

    if (task.completed) {
        addXP(5); // XP for logging
        // Server Metrics Snapshot — meal logged
        fireAnalyticsSnapshot('meal_logged', { title: task.title, calories: task.calories, protein: task.protein });
    }
}

function deleteTask(id) {
    const removed = tasks.find(t => t.id === id);
    tasks = tasks.filter(t => t.id !== id);
    delete taskChatHistories[id];
    saveTaskChatHistories();
    saveTasks();
    renderTasks();
    renderCharts();
    // Server Metrics Snapshot — meal deleted
    if (removed) fireAnalyticsSnapshot('meal_deleted', { title: removed.title, calories: removed.calories });
}

function filterTasks(filter) {
    activeFilter = filter;
    ['all', 'active', 'completed'].forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (!btn) return;
        if (f === filter) {
            btn.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-center bg-white transition-all text-gray-900 shadow-sm';
        } else {
            btn.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-center text-gray-400 transition-all';
        }
    });
    renderTasks();
}

function toggleAddTaskModal(show) {
    document.getElementById('add-task-modal').classList.toggle('hidden', !show);
    if (show) {
        document.getElementById('modal-task-time').value = formatTime(new Date());
        setTimeout(() => document.getElementById('modal-task-title').focus(), 100);
    }
}

function saveNewTask() {
    trackAnalyticsEvent('save_new_task');
    const title = document.getElementById('modal-task-title').value.trim();
    const timeVal = document.getElementById('modal-task-time').value.trim() || 'Just now';
    const cal = parseInt(document.getElementById('modal-task-cal').value) || 0;
    const p = parseInt(document.getElementById('modal-task-p').value) || 0;
    const c = parseInt(document.getElementById('modal-task-c').value) || 0;
    const f = parseInt(document.getElementById('modal-task-f').value) || 0;
    if (!title) return;

    const newTask = { id: Date.now(), title, time: timeVal, createdTimestamp: Date.now(), completed: true, comment: '', calories: cal, protein: p, carbs: c, fat: f };
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    renderCharts();
    addXP(5);

    document.getElementById('modal-task-title').value = '';
    document.getElementById('modal-task-cal').value = '';
    document.getElementById('modal-task-p').value = '';
    document.getElementById('modal-task-c').value = '';
    document.getElementById('modal-task-f').value = '';
    toggleAddTaskModal(false);
}

function logInventoryItem(name, cals, protein, carbs, fat) {
    trackAnalyticsEvent('log_inventory_item');
    cals = Math.round(Number(cals));
    tasks.unshift({
        id: Date.now(), title: name, time: formatTime(new Date()),
        createdTimestamp: Date.now(), completed: true,
        comment: 'Logged from pantry.', calories: cals, protein, carbs, fat
    });
    saveTasks();
    renderTasks();
    renderCharts();
    addXP(5);
    switchTab('home');
}

// ── Inventory Management ──────────────────────────────────────────────────────
function loadInventory() {
    const stored = localStorage.getItem('itspattern_inventory_v1');
    if (stored) {
        inventoryItems = JSON.parse(stored);
    } else {
        inventoryItems = [
            { id: 1, name: 'Gold Standard Whey', amount: '1.2 kg remaining', serving: 'Scoop', cal: 120, p: 24, c: 2, f: 1.5 },
            { id: 2, name: 'Grilled Salmon', amount: '4 servings remaining', serving: 'Serv', cal: 280, p: 34, c: 0, f: 15 },
            { id: 3, name: 'Rolled Oats', amount: '2.5 kg remaining', serving: '40g', cal: 150, p: 5, c: 27, f: 3 },
            { id: 4, name: 'Chicken Breast', amount: '6 servings remaining', serving: '150g', cal: 250, p: 46, c: 0, f: 5 },
            { id: 5, name: 'Bananas', amount: '5 remaining', serving: '1 medium', cal: 105, p: 1, c: 27, f: 0.4 }
        ];
        saveInventory();
    }
}
function saveInventory() { 
    localStorage.setItem('itspattern_inventory_v1', JSON.stringify(inventoryItems)); 
    if (typeof syncToFirestore === 'function') syncToFirestore('inventory', inventoryItems);
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    if (inventoryItems.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400"><i class="fa-solid fa-basket-shopping text-xl mb-2 block"></i><p class="text-xs">Your pantry is empty. Add your groceries!</p></div>`;
        return;
    }
    list.innerHTML = inventoryItems.map(item => `
        <div class="glass-card p-4 flex justify-between items-center gap-2">
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm">${item.name}</h3>
                <p class="text-[10px] text-gray-400 mt-0.5">${item.amount}</p>
                <p class="text-[9px] text-indigo-500 font-semibold mt-1">${item.serving}: ${item.cal} kcal | ${item.p}g P | ${item.c}g C | ${item.f}g F</p>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
                <button onclick="logInventoryItem('${item.name.replace(/'/g, "\\'")}',${item.cal},${item.p},${item.c},${item.f})" class="bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all spring-btn">Log</button>
                <button onclick="deleteInventoryItem(${item.id})" class="text-gray-400 hover:text-red-400 transition-colors text-[10px]"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        </div>
    `).join('');
}

function deleteInventoryItem(id) {
    if (!confirm('Remove this item from your pantry?')) return;
    inventoryItems = inventoryItems.filter(i => i.id !== id);
    saveInventory();
    renderInventory();
}

function toggleAddInventoryModal(show) {
    document.getElementById('add-inventory-modal').classList.toggle('hidden', !show);
    if (show) {
        document.getElementById('inv-name').value = '';
        if(document.getElementById('inv-amount')) document.getElementById('inv-amount').value = '';
        if(document.getElementById('inv-serving')) document.getElementById('inv-serving').value = '';
        if(document.getElementById('inv-cal')) document.getElementById('inv-cal').value = '';
        if(document.getElementById('inv-p')) document.getElementById('inv-p').value = '';
        if(document.getElementById('inv-c')) document.getElementById('inv-c').value = '';
        if(document.getElementById('inv-f')) document.getElementById('inv-f').value = '';
        
        const statusEl = document.getElementById('inv-ai-status');
        if (statusEl) {
            statusEl.classList.add('hidden');
            statusEl.textContent = '';
        }
        setTimeout(() => document.getElementById('inv-name').focus(), 100);
    }
}

function toggleLogInventoryModal(show, id = null) {
    document.getElementById('log-inventory-modal').classList.toggle('hidden', !show);
    if (show && id) {
        activeLogItemId = id;
        const item = inventoryItems.find(i => i.id === id);
        if (item) {
            document.getElementById('log-inv-name-display').textContent = item.name;
            document.getElementById('log-inv-remain-display').textContent = item.amount + ' remaining';
            document.getElementById('log-inv-portion').value = '';
            document.getElementById('log-preview-cal').textContent = '0';
            document.getElementById('log-preview-p').textContent = '0g';
            document.getElementById('log-preview-c').textContent = '0g';
            document.getElementById('log-preview-f').textContent = '0g';
            setTimeout(() => document.getElementById('log-inv-portion').focus(), 100);
        }
    }
}

function previewLogMacros() {
    const item = inventoryItems.find(i => i.id === activeLogItemId);
    if (!item) return;
    const portionStr = document.getElementById('log-inv-portion').value;
    const portion = parseFloat(portionStr);
    if (!portion || isNaN(portion)) {
        document.getElementById('log-preview-cal').textContent = '0';
        document.getElementById('log-preview-p').textContent = '0g';
        document.getElementById('log-preview-c').textContent = '0g';
        document.getElementById('log-preview-f').textContent = '0g';
        return;
    }
    const baseAmt = item.serving === '1 piece' ? 1 : 100;
    const ratio = portion / baseAmt;
    document.getElementById('log-preview-cal').textContent = Math.round(item.cal * ratio);
    document.getElementById('log-preview-p').textContent = Math.round(item.p * ratio) + 'g';
    document.getElementById('log-preview-c').textContent = Math.round(item.c * ratio) + 'g';
    document.getElementById('log-preview-f').textContent = Math.round(item.f * ratio) + 'g';
}

function confirmLogInventory() {
    const item = inventoryItems.find(i => i.id === activeLogItemId);
    if (!item) return;
    const portionStr = document.getElementById('log-inv-portion').value;
    const portion = parseFloat(portionStr);
    if (!portion || isNaN(portion)) {
        alert('Please enter a valid portion size.');
        return;
    }
    
    const baseAmt = item.serving === '1 piece' ? 1 : 100;
    const ratio = portion / baseAmt;
    
    const cal = Math.round(item.cal * ratio);
    const p = Math.round(item.p * ratio);
    const c = Math.round(item.c * ratio);
    const f = Math.round(item.f * ratio);
    
    item.amount -= portion;
    if (item.amount <= 0) {
        inventoryItems = inventoryItems.filter(i => i.id !== activeLogItemId);
    }
    
    saveInventory();
    renderInventory();
    
    toggleLogInventoryModal(false);
    
    if (typeof logInventoryItem === 'function') {
        logInventoryItem(item.name, cal, p, c, f);
    }
}

// ==========================================
// NEW MODALS & BMI/BMR LOGIC
// ==========================================
function toggleDailyScheduleModal(show) {
    const modal = document.getElementById('daily-schedule-modal');
    const content = document.getElementById('daily-schedule-modal-content');
    if (show) {
        modal.classList.remove('hidden');
        // trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        content.classList.remove('translate-y-full');
        setTimeout(() => document.getElementById('schedule-input').focus(), 300);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('translate-y-full');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function toggleHealthAssessmentModal(show) {
    const modal = document.getElementById('health-assessment-modal');
    if (show) {
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        // Pre-fill if exists
        if (memberProfile.metrics) {
            document.getElementById('assess-age').value = memberProfile.metrics.age || '';
            document.getElementById('assess-gender').value = memberProfile.metrics.gender || 'male';
            document.getElementById('assess-weight').value = memberProfile.metrics.weight || '';
            document.getElementById('assess-height').value = memberProfile.metrics.height || '';
            calculateBodyMetrics();
        }
    } else {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function calculateBodyMetrics() {
    const age = parseFloat(document.getElementById('assess-age').value);
    const gender = document.getElementById('assess-gender').value;
    const weight = parseFloat(document.getElementById('assess-weight').value);
    const height = parseFloat(document.getElementById('assess-height').value);
    
    const btn = document.getElementById('save-assessment-btn');
    const card = document.getElementById('assess-metrics-card');

    if (!age || !weight || !height) {
        btn.disabled = true;
        card.classList.add('hidden');
        return;
    }
    
    // BMI = weight(kg) / height(m)^2
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }
    
    document.getElementById('assess-bmi-val').textContent = bmi.toFixed(1);
    let bmiLabel = '';
    if (bmi < 18.5) bmiLabel = 'Underweight';
    else if (bmi < 25) bmiLabel = 'Normal weight';
    else if (bmi < 30) bmiLabel = 'Overweight';
    else bmiLabel = 'Obese';
    document.getElementById('assess-bmi-label').textContent = bmiLabel;
    
    document.getElementById('assess-bmr-val').textContent = Math.round(bmr);
    
    card.classList.remove('hidden');
    btn.disabled = false;
}

function saveHealthAssessment() {
    trackAnalyticsEvent('save_health_assessment');
    const btn = document.getElementById('save-assessment-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
    btn.disabled = true;
    
    const metrics = {
        age: parseFloat(document.getElementById('assess-age').value),
        gender: document.getElementById('assess-gender').value,
        weight: parseFloat(document.getElementById('assess-weight').value),
        height: parseFloat(document.getElementById('assess-height').value),
        bmi: parseFloat(document.getElementById('assess-bmi-val').textContent),
        bmr: parseInt(document.getElementById('assess-bmr-val').textContent)
    };
    
    memberProfile.metrics = metrics;
    
    // Log to metrics history
    if (!Array.isArray(memberProfile.metricsHistory)) {
        memberProfile.metricsHistory = [];
    }
    const today = todayString();
    const existingIdx = memberProfile.metricsHistory.findIndex(h => h.date === today);
    if (existingIdx !== -1) {
        memberProfile.metricsHistory[existingIdx] = { date: today, ...metrics };
    } else {
        memberProfile.metricsHistory.push({ date: today, ...metrics });
    }
    // Cap at last 10 logs
    if (memberProfile.metricsHistory.length > 10) {
        memberProfile.metricsHistory.shift();
    }
    
    // Update daily fuel budget based on BMR + basic activity factor (1.2) for now
    const maintainCalories = Math.round(metrics.bmr * 1.2);
    // Assuming the user wants to hit their BMR or modify targets
    targets.cal = maintainCalories;
    targets.p = Math.round((maintainCalories * 0.3) / 4); // 30% protein
    targets.c = Math.round((maintainCalories * 0.4) / 4); // 40% carbs
    targets.f = Math.round((maintainCalories * 0.3) / 9); // 30% fat
    
    saveMemberProfile();
    saveTargets();
    updateNutritionalCard();
    
    if (memberProfile.isLoggedIn) {
        syncToFirestore('profile', memberProfile);
        syncToFirestore('targets', targets);
    }
    
    // Re-render charts
    if (typeof renderMetricsHistoryChart === 'function') {
        renderMetricsHistoryChart();
    }
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        toggleHealthAssessmentModal(false);
    }, 600);
}

let activeLogItemId = null;

function saveInventoryItem() {
    const name = document.getElementById('inv-name').value.trim();
    const amount = document.getElementById('inv-amount').value.trim() || 'In stock';
    const serving = document.getElementById('inv-serving').value.trim() || 'Serv';
    const cal = parseFloat(document.getElementById('inv-cal').value) || 0;
    const p = parseFloat(document.getElementById('inv-p').value) || 0;
    const c = parseFloat(document.getElementById('inv-c').value) || 0;
    const f = parseFloat(document.getElementById('inv-f').value) || 0;
    if (!name) return;

    const statusEl = document.getElementById('inv-ai-status');
    if (statusEl) {
        statusEl.classList.add('hidden');
        statusEl.textContent = '';
    }

    inventoryItems.unshift({ id: Date.now(), name, amount, serving, cal, p, c, f });
    saveInventory();
    renderInventory();
    toggleAddInventoryModal(false);
    if (typeof fireAnalyticsSnapshot === 'function') {
        fireAnalyticsSnapshot('pantry_created', { name, cal, protein: p });
    }
}


// ── Schedule System ────────────────────────────────────────────────────────────
function loadSchedules() {
    try {
        const stored = localStorage.getItem('itspattern_schedules_v2');
        if (stored) {
            const parsed = JSON.parse(stored);
            schedules = Array.isArray(parsed) ? parsed : [];
            console.log('Schedules loaded from storage:', schedules.length);
        } else {
            schedules = [
                { id: 1, text: 'Gym', inTime: '07:00', outTime: '08:00', durationType: 'custom' },
                { id: 2, text: 'Office', inTime: '09:00', outTime: '17:00', durationType: '8' }
            ];
            saveSchedules();
            console.log('Default schedules created:', schedules.length);
        }
    } catch(e) { console.error('loadSchedules error:', e); schedules = []; }
    try {
        const checksStored = localStorage.getItem('itspattern_schedule_checks_' + todayString());
        if (checksStored) scheduleTodayChecks = JSON.parse(checksStored);
        else scheduleTodayChecks = {};
    } catch(e) { scheduleTodayChecks = {}; }
    // Clean up old auto-generated meals from previous days
    try {
        const today = todayString();
        if (Array.isArray(tasks)) {
            tasks = tasks.filter(t => !(t.autoMeal && t.autoDate !== today));
            saveTasks();
        }
    } catch(e) { console.error('Schedule cleanup error:', e); }
}
function saveSchedules() { 
    localStorage.setItem('itspattern_schedules_v2', JSON.stringify(schedules)); 
    if (typeof syncToFirestore === 'function') syncToFirestore('schedules', schedules);
}
function saveScheduleChecks() { localStorage.setItem('itspattern_schedule_checks_' + todayString(), JSON.stringify(scheduleTodayChecks)); }

function addSchedule() {
    const input = document.getElementById('schedule-input');
    const inInput = document.getElementById('schedule-in');
    const outInput = document.getElementById('schedule-out');
    const durSelect = document.getElementById('schedule-duration');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const inTime = inInput ? inInput.value : '09:00';
    let outTime = outInput ? outInput.value : '17:00';
    const durationType = durSelect ? durSelect.value : 'custom';
    if (durationType !== 'custom') {
        outTime = calcOutTime(inTime, parseInt(durationType));
    }
    input.value = '';
    schedules.unshift({ id: Date.now(), text, inTime, outTime, durationType });
    saveSchedules();
    renderScheduleList();
    renderHomeSchedule();
}

function calcOutTime(inTime, hrs) {
    const [h, m] = inTime.split(':').map(Number);
    const totalMin = h * 60 + m + hrs * 60;
    const newH = Math.floor(totalMin / 60) % 24;
    const newM = totalMin % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function autoCalcOutTime() {
    const inInput = document.getElementById('schedule-in');
    const outInput = document.getElementById('schedule-out');
    const durSelect = document.getElementById('schedule-duration');
    if (!inInput || !outInput || !durSelect) return;
    const duration = durSelect.value;
    if (duration === 'custom') return;
    outInput.value = calcOutTime(inInput.value, parseInt(duration));
}

function deleteSchedule(id) {
    schedules = schedules.filter(s => s.id !== id);
    delete scheduleTodayChecks[id];
    saveSchedules();
    saveScheduleChecks();
    renderScheduleList();
    renderHomeSchedule();
}

function toggleScheduleCheck(id) {
    scheduleTodayChecks[id] = !scheduleTodayChecks[id];
    saveScheduleChecks();
    generateAIMealTasks();
    renderHomeSchedule();
}

function generateAIMealTasks() {
    const checkedSchedules = schedules.filter(s => scheduleTodayChecks[s.id]);
    const today = todayString();

    // Remove old auto-generated meal tasks from today
    tasks = tasks.filter(t => !(t.autoMeal && t.autoDate === today));

    if (checkedSchedules.length === 0) {
        saveTasks();
        renderTasks();
        renderCharts();
        updateNutritionalCard();
        return;
    }

    const times = checkedSchedules.map(s => s.inTime || '09:00').sort();
    const labels = checkedSchedules.map(s => s.text.toLowerCase());
    const hasMorning = times.some(t => t < '12:00');
    const hasAfternoon = times.some(t => t >= '12:00' && t < '17:00');
    const hasEvening = times.some(t => t >= '17:00');
    const hasWalk = labels.some(l => l.includes('walk') || l.includes('run') || l.includes('gym') || l.includes('exercise') || l.includes('cardio'));
    const hasStretch = labels.some(l => l.includes('stretch') || l.includes('yoga') || l.includes('meditate'));
    const hasStrength = labels.some(l => l.includes('strength') || l.includes('lift') || l.includes('weights') || l.includes('muscle'));
    const hasWater = labels.some(l => l.includes('water') || l.includes('drink') || l.includes('hydrate'));

    const meals = [];
    const now = Date.now();
    let mealId = now;
    const baseDate = new Date();

    function setTime(h, m) { const d = new Date(baseDate); d.setHours(h, m, 0, 0); return d; }

    // Generate contextual meals based on schedule
    if (hasMorning) {
        if (hasWalk) {
            const preTime = setTime(6, 30);
            const postTime = setTime(8, 0);
            meals.push({ id: mealId++, title: 'Pre-Walk Fuel: Banana & Almond Butter', time: formatTime(preTime), createdTimestamp: preTime.getTime(), completed: true, comment: 'Light pre-activity fuel', calories: 210, protein: 7, carbs: 32, fat: 9, autoMeal: true, autoDate: today });
            meals.push({ id: mealId++, title: 'Post-Walk Breakfast: Eggs & Avocado Toast', time: formatTime(postTime), createdTimestamp: postTime.getTime(), completed: true, comment: 'Recovery meal after morning activity', calories: 420, protein: 28, carbs: 30, fat: 22, autoMeal: true, autoDate: today });
        } else {
            const bfTime = setTime(7, 30);
            meals.push({ id: mealId++, title: 'Balanced Breakfast: Greek Yogurt & Granola', time: formatTime(bfTime), createdTimestamp: bfTime.getTime(), completed: true, comment: 'Morning fuel to start the day', calories: 380, protein: 25, carbs: 45, fat: 12, autoMeal: true, autoDate: today });
        }
    }

    if (hasAfternoon || (hasMorning && !hasEvening)) {
        const lunchTime = setTime(12, 30);
        meals.push({ id: mealId++, title: 'Power Lunch: Grilled Chicken & Quinoa Bowl', time: formatTime(lunchTime), createdTimestamp: lunchTime.getTime(), completed: false, comment: 'Sustained energy for afternoon', calories: 520, protein: 42, carbs: 55, fat: 14, autoMeal: true, autoDate: today });
    }

    if (hasEvening) {
        let dinnerTime, dinnerTitle, dinnerComment, dinnerCal, dinnerP, dinnerC, dinnerF;
        if (hasStretch) {
            dinnerTime = setTime(19, 0); dinnerTitle = 'Light Dinner: Salmon & Steamed Veggies'; dinnerComment = 'Easy-to-digest evening meal'; dinnerCal = 380; dinnerP = 35; dinnerC = 20; dinnerF = 18;
        } else if (hasStrength) {
            dinnerTime = setTime(19, 30); dinnerTitle = 'Protein Dinner: Steak & Sweet Potato'; dinnerComment = 'Muscle repair & recovery'; dinnerCal = 580; dinnerP = 48; dinnerC = 45; dinnerF = 20;
        } else {
            dinnerTime = setTime(19, 0); dinnerTitle = 'Balanced Dinner: Stir-fried Tofu & Brown Rice'; dinnerComment = 'Complete nutrition for evening'; dinnerCal = 420; dinnerP = 28; dinnerC = 50; dinnerF = 14;
        }
        meals.push({ id: mealId++, title: dinnerTitle, time: formatTime(dinnerTime), createdTimestamp: dinnerTime.getTime(), completed: false, comment: dinnerComment, calories: dinnerCal, protein: dinnerP, carbs: dinnerC, fat: dinnerF, autoMeal: true, autoDate: today });
    }

    // Hydration note on first meal
    if (hasWater && meals.length > 0) {
        meals[0].comment += ' 💧 Hydrate throughout the day';
    }

    // Extra snack for busy schedules
    if (checkedSchedules.length >= 3) {
        const snackTime = setTime(15, 0);
        meals.push({ id: mealId++, title: 'Afternoon Snack: Protein Shake & Apple', time: formatTime(snackTime), createdTimestamp: snackTime.getTime(), completed: false, comment: 'Midday fuel to maintain energy', calories: 250, protein: 30, carbs: 28, fat: 4, autoMeal: true, autoDate: today });
    }

    if (meals.length > 0) {
        tasks = [...meals, ...tasks];
        saveTasks();
        renderTasks();
        renderCharts();
        updateNutritionalCard();
    }
}

function renderScheduleList() {
    const list = document.getElementById('schedule-list');
    if (!list) return;
    if (schedules.length === 0) {
        list.innerHTML = '<p class="text-[10px] text-gray-400 text-center py-2">No schedule items yet.</p>';
        return;
    }
    list.innerHTML = schedules.map(s =>
        `<div class="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
            <div class="flex items-center gap-2 min-w-0">
                <span class="text-[9px] font-mono text-gray-400 font-semibold flex-shrink-0">${s.inTime || '09:00'} – ${s.outTime || '17:00'}</span>
                <span class="text-[10px] text-gray-700 font-medium truncate">${s.text}</span>
                ${s.durationType && s.durationType !== 'custom' ? `<span class="text-[7px] text-indigo-500 font-bold bg-indigo-50 px-1 py-0.5 rounded">${s.durationType}h</span>` : ''}
            </div>
            <button onclick="deleteSchedule(${s.id})" class="text-gray-400 hover:text-red-400 transition-colors text-[9px] flex-shrink-0"><i class="fa-regular fa-trash-can"></i></button>
        </div>`
    ).join('');
}

function renderHomeSchedule() {
    const card = document.getElementById('home-schedule-card');
    const list = document.getElementById('home-schedule-list');
    const plan = document.getElementById('schedule-meal-plan');
    if (!card || !list) { console.warn('Schedule card/list not found'); return; }
    
    card.classList.remove('hidden'); // Keep visible for hint card
    if (!Array.isArray(schedules) || schedules.length === 0) {
        list.innerHTML = `
            <div class="text-[10px] text-gray-500 py-1.5 leading-relaxed w-full">
                💡 <strong>Custom AI Meal Plans</strong>: Add your daily commitments (like Office, Gym, or Walk) in Settings to let the coach generate a personalized daily fuel schedule.
            </div>
        `;
        plan.classList.add('hidden');
        return;
    }
    
    list.innerHTML = `<div class="grid grid-cols-2 gap-2 w-full">` + schedules.map(s => {
        const active = scheduleTodayChecks[s.id] ? 'active' : '';
        return `<button onclick="toggleScheduleCheck(${s.id})" class="schedule-btn ${active} flex flex-col items-center w-full justify-center px-1 py-3 min-h-[60px]">
            <span class="schedule-btn-text">${s.text}</span>
            <div class="flex items-center gap-1 text-[9px] font-bold mt-1 opacity-80" onclick="event.stopPropagation()">
                <input type="time" value="${s.inTime || '09:00'}" class="bg-transparent border-none text-[9px] tracking-tighter font-extrabold focus:outline-none w-auto min-w-[42px] p-0 text-center text-current cursor-pointer" onchange="updateScheduleTime(${s.id}, 'in', this.value)">
                <span>–</span>
                <input type="time" value="${s.outTime || '17:00'}" class="bg-transparent border-none text-[9px] tracking-tighter font-extrabold focus:outline-none w-auto min-w-[42px] p-0 text-center text-current cursor-pointer" onchange="updateScheduleTime(${s.id}, 'out', this.value)">
            </div>
        </button>`;
    }).join('') + `</div>`;

    // Generate AI meal plan comment based on checked schedules
    const checkedSchedules = schedules.filter(s => scheduleTodayChecks[s.id]);
    const totalChecked = checkedSchedules.length;
    if (totalChecked > 0) {
        const times = checkedSchedules.map(s => s.inTime || '09:00').sort();
        const labels = checkedSchedules.map(s => s.text.toLowerCase());
        let comment = '';

        const hasMorning = times.some(t => t < '12:00');
        const hasAfternoon = times.some(t => t >= '12:00' && t < '17:00');
        const hasEvening = times.some(t => t >= '17:00');
        const hasWalk = labels.some(l => l.includes('walk') || l.includes('run') || l.includes('exercise'));
        const hasMeal = labels.some(l => l.includes('eat') || l.includes('meal') || l.includes('breakfast') || l.includes('lunch') || l.includes('dinner'));
        const hasWater = labels.some(l => l.includes('water') || l.includes('drink'));
        const hasStretch = labels.some(l => l.includes('stretch') || l.includes('yoga') || l.includes('meditate'));

        if (hasMorning && hasWalk) comment = 'With your morning activity planned, start with a light pre-fuel snack like a banana or toast 30 min before. Follow with a protein-rich breakfast within 2 hours for optimal recovery.';
        else if (hasMorning && !hasMeal) comment = 'You have morning tasks lined up. A balanced breakfast with protein and complex carbs will keep your energy steady through the morning.';
        else if (hasAfternoon && hasWalk) comment = 'Movement in your afternoon window is great. Time a small protein snack 1 hour before to fuel your session, then a solid lunch afterward.';
        else if (hasEvening && hasStretch) comment = 'Evening wind-down routine detected. Keep dinner light but protein-rich — think grilled fish or tofu with steamed veggies.';
        else if (hasWater && hasWalk) comment = 'Hydration and movement are a powerful combo. Aim for 500ml water 1 hour before activity and sip through your session.';
        else if (hasMorning) comment = 'Your morning is structured — front-load your nutrition with a substantial breakfast to support the day ahead. Include 30g+ protein.';
        else if (totalChecked >= 3) comment = `With ${totalChecked} items on your schedule today, structure your meals around your busiest windows. Keep a protein-rich snack handy between activities.`;
        else if (totalChecked === 1 && hasWater) comment = 'Staying hydrated is foundational. Aim to spread 2-3L of water across your waking hours. Pair each glass with a small step toward your nutrition goals.';
        else comment = `You have ${totalChecked} task${totalChecked > 1 ? 's' : ''} planned. Align your meals around your commitments — eat a balanced meal 2-3 hours before active windows.`;

        plan.textContent = '🧠 ' + comment;
        plan.classList.remove('hidden');
    } else {
        plan.classList.add('hidden');
    }
}

function updateScheduleTime(id, field, value) {
    const s = schedules.find(item => item.id === id);
    if (!s) return;
    if (field === 'in') s.inTime = value;
    if (field === 'out') s.outTime = value;
    saveSchedules();
    generateAIMealTasks();
    renderScheduleList();
    renderHomeSchedule();
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('itspattern_darkmode', isDark ? 'dark' : 'light');
    applyDarkModeCSS(isDark);
}

function loadDarkMode() {
    const pref = localStorage.getItem('itspattern_darkmode');
    const isDark = pref === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
    applyDarkModeCSS(isDark);
    const toggle = document.getElementById('toggle-darkmode');
    if (toggle) toggle.checked = isDark;
}

function applyDarkModeCSS(isDark) {
    const root = document.documentElement;
    if (isDark) {
        root.style.setProperty('--bg-deep', '#000000');
        root.style.setProperty('--bg-surface', '#121212');
        root.style.setProperty('--bg-raised', '#161616');
        root.style.setProperty('--bg-overlay', '#1c1c1c');
        root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.06)');
        root.style.setProperty('--border-medium', 'rgba(255, 255, 255, 0.12)');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#eceef2');
        root.style.setProperty('--ring-track', 'rgba(255, 255, 255, 0.08)');
    } else {
        root.style.setProperty('--bg-deep', '#f3f4f6');
        root.style.setProperty('--bg-surface', '#ffffff');
        root.style.setProperty('--bg-raised', '#ffffff');
        root.style.setProperty('--bg-overlay', '#f3f4f6');
        root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.04)');
        root.style.setProperty('--border-medium', 'rgba(0, 0, 0, 0.08)');
        root.style.setProperty('--text-primary', '#000000');
        root.style.setProperty('--text-secondary', '#2d3748');
        root.style.setProperty('--ring-track', 'rgba(0, 0, 0, 0.08)');
    }
}

function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getRelativeTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Charts ────────────────────────────────────────────────────────────────────
function renderCharts() {
    let totalToday = 0;
    tasks.forEach(t => { if (t.completed) totalToday += Number(t.calories || 0); });
    const pct = Math.min(Math.round((totalToday / targets.calories) * 100), 100);

    const charts = ['progress-bar-chart'];
    charts.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        defaultChartData.forEach((d, i) => {
            const val = i === 2 ? pct : d.completed;
            el.appendChild(createBarEl(d.day, val, i === 2));
        });
    });

    document.getElementById('stat-total-tasks').textContent = tasks.length;
    document.getElementById('stat-completion-rate').textContent = `${totalToday} kcal`;
    
    // Render the BMI/BMR history graph
    renderMetricsHistoryChart();
}

let currentMetricsTab = 'bmi';

function toggleMetricsHistoryTab(type) {
    currentMetricsTab = type;
    const bmiBtn = document.getElementById('btn-metrics-bmi');
    const bmrBtn = document.getElementById('btn-metrics-bmr');
    if (bmiBtn && bmrBtn) {
        if (type === 'bmi') {
            bmiBtn.className = "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all bg-white dark:bg-gray-900 text-indigo-500 dark:text-white shadow-sm";
            bmrBtn.className = "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";
        } else {
            bmrBtn.className = "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all bg-white dark:bg-gray-900 text-indigo-500 dark:text-white shadow-sm";
            bmiBtn.className = "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";
        }
    }
    renderMetricsHistoryChart();
}

function renderMetricsHistoryChart() {
    const container = document.getElementById('metrics-history-chart-container');
    if (!container) return;
    
    // Add default initial history point from current metrics if history is empty
    if (!Array.isArray(memberProfile.metricsHistory) || memberProfile.metricsHistory.length === 0) {
        if (memberProfile.metrics && memberProfile.metrics.bmi) {
            memberProfile.metricsHistory = [{
                date: todayString(),
                age: memberProfile.metrics.age,
                gender: memberProfile.metrics.gender,
                weight: memberProfile.metrics.weight,
                height: memberProfile.metrics.height,
                bmi: memberProfile.metrics.bmi,
                bmr: memberProfile.metrics.bmr
            }];
            saveMemberProfile();
        }
    }
    
    const history = memberProfile.metricsHistory || [];
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-6">
                <i class="fa-solid fa-chart-line text-gray-400 dark:text-gray-600 text-xl mb-1.5 opacity-60"></i>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No Metrics History</p>
                <p class="text-[9px] text-gray-500 mt-0.5">Complete your Health Assessment to track BMI & BMR</p>
                <button onclick="switchTab('settings'); toggleHealthAssessmentModal(true);" class="mt-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-3 py-1 rounded-lg transition-all">Start Assessment</button>
            </div>
        `;
        return;
    }
    
    const isBmr = currentMetricsTab === 'bmr';
    const values = history.map(h => isBmr ? h.bmr : h.bmi);
    const dates = history.map(h => {
        try {
            const parts = h.date.split('-');
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const d = new Date(parts[0], parts[1]-1, parts[2]);
            return `${monthNames[d.getMonth()]} ${d.getDate()}`;
        } catch(e) {
            return h.date;
        }
    });
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    let minLimit = minVal;
    let maxLimit = maxVal;
    if (minLimit === maxLimit) {
        minLimit = isBmr ? Math.max(0, minLimit - 200) : Math.max(0, minLimit - 2);
        maxLimit = isBmr ? maxLimit + 200 : maxLimit + 2;
    } else {
        const padding = (maxLimit - minLimit) * 0.15;
        minLimit = Math.max(0, minLimit - padding);
        maxLimit = maxLimit + padding;
    }
    
    const svgWidth = container.clientWidth || 320;
    const svgHeight = 110;
    
    let points = [];
    const N = history.length;
    for (let i = 0; i < N; i++) {
        const x = N > 1 ? 30 + (i / (N - 1)) * (svgWidth - 60) : svgWidth / 2;
        const y = 85 - ((values[i] - minLimit) / (maxLimit - minLimit)) * 60;
        points.push({ x, y, val: values[i], date: dates[i] });
    }
    
    let pathD = "";
    let areaD = "";
    if (N > 0) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        areaD = `M ${points[0].x} 90 L ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < N; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
            areaD += ` L ${points[i].x} ${points[i].y}`;
        }
        areaD += ` L ${points[N-1].x} 90 Z`;
    }
    
    let svgContent = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#ff6b00" stop-opacity="0.0"/>
                </linearGradient>
            </defs>
            <!-- Grid Lines -->
            <line x1="20" y1="90" x2="${svgWidth - 20}" y2="90" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            <line x1="20" y1="55" x2="${svgWidth - 20}" y2="55" stroke="rgba(255,255,255,0.02)" stroke-dasharray="2,2" stroke-width="1"/>
            <line x1="20" y1="20" x2="${svgWidth - 20}" y2="20" stroke="rgba(255,255,255,0.02)" stroke-dasharray="2,2" stroke-width="1"/>
    `;
    
    if (N > 1) {
        svgContent += `<path d="${areaD}" fill="url(#chart-grad)" />`;
        svgContent += `<path d="${pathD}" fill="none" stroke="#ff6b00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
    }
    
    points.forEach((p, idx) => {
        svgContent += `
            <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#181920" stroke="#ff6b00" stroke-width="2.5" />
        `;
        
        if (N <= 5 || idx === 0 || idx === N - 1) {
            svgContent += `
                <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="#ffffff" class="text-[8px] font-black select-none">${isBmr ? Math.round(p.val) : p.val.toFixed(1)}</text>
            `;
        }
        
        if (N <= 5 || idx === 0 || idx === N - 1 || idx === Math.floor(N/2)) {
            svgContent += `
                <text x="${p.x}" y="103" text-anchor="middle" fill="rgba(255,255,255,0.4)" class="text-[7px] font-semibold select-none">${p.date}</text>
            `;
        }
    });
    
    svgContent += `</svg>`;
    container.innerHTML = svgContent;
}

function createBarEl(day, percent, isToday) {
    const bar = document.createElement('div');
    bar.className = 'flex-1 flex flex-col justify-end items-center h-full relative group';
    bar.innerHTML = `
        <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">${percent}%</span>
        <div class="w-full ${isToday ? 'bg-gradient-to-t from-white to-white' : 'bg-white/[0.08]'} rounded-t-md hover:opacity-80 transition-all duration-500" style="height:${Math.max(percent, 6)}%"></div>
    `;
    return bar;
}

// ── Achievements UI ───────────────────────────────────────────────────────────
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (memberProfile.achievements.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center py-4 text-[10px] text-gray-400">No milestones yet. Keep going!</div>`;
        return;
    }

    memberProfile.achievements.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (!ach) return;
        grid.innerHTML += `
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid ${ach.icon} text-indigo-500 text-[10px]"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-[10px] font-bold truncate text-gray-900">${ach.title}</p>
                    <p class="text-[8px] text-gray-400">${ach.desc}</p>
                </div>
            </div>
        `;
    });
}

// ── Tab Switching ─────────────────────────────────────────────────────────────
function switchTab(tabId) {
    if ((tabId === 'ai' || tabId === 'settings') && !memberProfile.isLoggedIn) {
        showAuthModal(tabId);
        return;
    }
    // Update hash to trigger navigation & browser history
    if (window.location.hash !== '#' + tabId) {
        history.pushState(null, '', '#' + tabId);
    }
    // Call the internal display directly for instantaneous execution
    switchTabInternal(tabId);
}

function switchTabInternal(tabId) {
    trackAnalyticsEvent('switch_tab_' + tabId);
    localStorage.setItem('itspattern_active_tab', tabId);
    const screens = ['home', 'tasks', 'ai', 'stats', 'more', 'inventory', 'settings', 'notifications'];
    screens.forEach(s => {
        const scr = document.getElementById(`screen-${s}`);
        const nav = document.getElementById(`nav-${s}`);
        if (!scr) return;

        if (s === tabId) {
            scr.classList.remove('hidden');
            if (s === 'ai') {
                const isDark = document.documentElement.classList.contains('dark');
                scr.style.background = isDark ? '#0a0a0f' : '#f8f9fa';
                scr.style.display = 'flex';
                if (window.visualViewport) {
                    document.documentElement.style.setProperty('--app-vh', `${window.visualViewport.height}px`);
                } else {
                    document.documentElement.style.setProperty('--app-vh', `${window.innerHeight}px`);
                }
            } else {
                scr.style.display = 'block';
            }
            setTimeout(() => { scr.style.opacity = '1'; scr.style.transform = 'translateY(0)'; }, 30);
        } else {
            scr.classList.add('hidden');
            scr.style.opacity = '0';
            scr.style.transform = 'translateY(8px)';
            scr.style.display = 'none';
        }

        if (nav) {
            const isAi = s === 'ai';
            const baseNav = nav;
            if (s === tabId) {
                if (isAi) {
                    baseNav.className = 'w-[68px] h-[68px] bg-black border-3 border-blue-400 rounded-full flex items-center justify-center absolute -top-7 left-1/2 transform -translate-x-1/2 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105 transition-all text-white z-50 cursor-pointer overflow-hidden';
                    baseNav.style.display = 'none';
                } else {
                    baseNav.className = 'flex flex-col items-center justify-center w-16 text-indigo-500 transition-colors duration-200 cursor-pointer nav-active-glow';
                    baseNav.style.display = '';
                }
            } else {
                if (isAi) {
                    baseNav.className = 'w-[68px] h-[68px] bg-black border-3 border-gray-700 rounded-full flex items-center justify-center absolute -top-7 left-1/2 transform -translate-x-1/2 shadow-[0_0_20px_rgba(59,130,246,0.2)] text-gray-400 z-50 spring-btn cursor-pointer overflow-hidden';
                    baseNav.style.display = 'flex';
                } else {
                    baseNav.className = 'flex flex-col items-center justify-center w-16 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer';
                    baseNav.style.display = '';
                }
            }
        }
    });

    if (tabId === 'home') updateHomeUI();
    if (tabId === 'tasks') renderTasks();
    if (tabId === 'ai') startCoachChat();
    if (tabId === 'stats') { renderCharts(); renderAchievements(); updateLevelUI(); }
    if (tabId === 'inventory') renderInventory();
    if (tabId === 'more') { fetchLeaderboard(); fetchBadges(); }
    if (tabId === 'settings') { updateMemberUI(); renderScheduleList(); applyDarkModeCSS(document.documentElement.classList.contains('dark')); }

    // Lock body scroll for AI chat screen to prevent iOS bounce and background scrolling
    if (tabId === 'ai') {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.documentElement.style.height = '100%';
    } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.height = '';
        const email = memberProfile.email ? memberProfile.email.toLowerCase() : '';
        const footerStr = email === 'shriparnanath@gmail.com' ? "It's a love from AJAY KEVAT" : "Created and Developed by AJAY KEVAT";
        el.innerHTML = `<span class="text-xs text-gray-500 font-bold opacity-60">itspattern 1.2</span><br><span class="text-[9px] text-gray-400 mt-1 block">${footerStr}</span>`;
    }
}

function viewStreakDetails() {
    switchTab('stats');
}

// ── Assessment Funnel ─────────────────────────────────────────────────────────
function clearCoachChat() {
    if (confirm('Clear chat history?')) {
        localStorage.removeItem('itspattern_coach_chat_history');
        startCoachChat();
    }
}

// ── Coach Chat ────────────────────────────────────────────────────────────────
function startCoachChat() {
    const c = document.getElementById('ai-chat-container');
    if (!c) return;
    localStorage.setItem('itspattern_coach_in_chat', 'true');

    const stored = localStorage.getItem('itspattern_coach_chat_history');
    if (stored) {
        coachChatHistory = JSON.parse(stored);
    } else {
        coachChatHistory = [{ role: 'assistant', content: `I provide **evidence-based** nutrition and fat loss guidance, tailored to your needs.

**Here's how I can help:**
- **Science-backed advice**: Cite metabolic studies, no fads.
- **Budget-friendly options**: Suggest affordable Indian foods (dal, soya chunks, eggs, paneer).
- **Direct but empathetic**: No sugarcoating, just actionable steps.
- **Logging support**: Track meals/calories if you ask (e.g. "Log 2 eggs").
- **Target adjustments**: Update diet goals (e.g. "Set protein to 150g").

*Example: "Need a high-protein breakfast under ₹50?" → I'll suggest soya chunks bhurji (20g protein/100g) with veggies.*

Ask me anything—let's crush your goals! 💪` }];
        localStorage.setItem('itspattern_coach_chat_history', JSON.stringify(coachChatHistory));
    }
    if (!memberProfile.achievements.includes('coach_chat')) awardAchievement('coach_chat');
    renderCoachChat();
}

function renderCoachChat(isTyping) {
    const c = document.getElementById('ai-chat-container');
    if (!c) return;

    const logo = 'assets/logo-lunaticmarble.png';

    // ---- Message rendering ----
    const messagesHtml = coachChatHistory.map(msg => {
        const formatted = formatAIMsg(msg.content);
        if (msg.role === 'user') {
            return `
                <div class="ai-msg user">
                    <div class="ai-bubble user">${formatted}</div>
                </div>`;
        }
        if (msg.role === 'system') {
            return `
                <div class="text-[10px] text-gray-400 self-center text-center max-w-[90%] font-medium tracking-wide uppercase my-2">${formatted}</div>`;
        }
        return `
            <div class="ai-msg bot">
                <img src="${logo}" class="ai-avatar" alt="LunaticMarble Logo">
                <div class="ai-bubble bot">
                    ${formatted}
                </div>
            </div>`;
    }).join('');

    // ---- Typing indicator ----
    const typingHtml = isTyping ? `
        <div class="ai-msg bot">
            <img src="${logo}" class="ai-avatar animate-pulse" alt="LunaticMarble Logo">
            <div class="ai-bubble bot">
                <div class="ai-typing"><span></span><span></span><span></span></div>
            </div>
        </div>` : '';

    // ---- Empty / welcome state ----
    const welcomeHtml = (coachChatHistory.length === 0 && !isTyping) ? `
        <div class="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 my-auto">
            <i class="fa-solid fa-brain text-4xl text-indigo-500 mb-2"></i>
            <h2 class="text-xl font-medium text-gray-900 dark:text-white tracking-tight">How can I help today?</h2>
        </div>` : '';

    // ---- Contextual suggestion chips ----
    const suggestionsHtml = getContextualSuggestions().map(s => `
        <button onclick="handleQuickAction('${s.key}')" class="ai-chip whitespace-nowrap flex items-center gap-1.5"><i class="${s.icon} text-gray-400"></i> ${s.label}</button>
    `).join('');

    if (!document.querySelector('.ai-shell')) {
        c.innerHTML = `
            <div class="ai-shell">
                <!-- Header -->
                <header class="ai-header">
                    <div class="ai-brand">
                        <img src="${logo}" alt="LunaticMarble Logo">
                        <div class="brand-text">
                            <div class="brand-title">LunaticMarble</div>
                            <div class="brand-status"><span class="dot"></span>Online</div>
                        </div>
                    </div>
                    <div class="ai-actions">
                        <button class="ai-icon-btn danger" onclick="clearCoachChat()" aria-label="Reset chat">
                            <i class="fa-solid fa-arrow-rotate-left text-xs"></i>
                        </button>
                        <button class="ai-icon-btn close" onclick="switchTab('home')" aria-label="Close">
                            <i class="fa-solid fa-times text-sm"></i>
                        </button>
                    </div>
                </header>

                <!-- Messages Area -->
                <div id="chat-messages" class="ai-messages">
                    ${welcomeHtml}
                    ${messagesHtml}
                    ${typingHtml}
                </div>

                <!-- Input Area -->
                <div class="ai-input-zone">
                    <div class="ai-suggestions">
                        ${suggestionsHtml}
                    </div>
                    <div class="ai-input-wrap">
                        <input type="text" id="chat-input"
                            class="ai-input"
                            placeholder="Ask anything..."
                            autocomplete="off"
                            onkeydown="if(event.key==='Enter'){ event.preventDefault(); sendCoachMessage(); }">
                        <button class="ai-send-btn" onmousedown="event.preventDefault();" onclick="sendCoachMessage()" aria-label="Send">
                            <i class="fa-solid fa-arrow-up text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        const mb = document.getElementById('chat-messages');
        if (mb) mb.innerHTML = `${welcomeHtml}${messagesHtml}${typingHtml}`;
        
        const sg = document.querySelector('.ai-suggestions');
        if (sg) sg.innerHTML = suggestionsHtml;
    }

    setTimeout(() => {
        const mb = document.getElementById('chat-messages');
        if (mb) mb.scrollTop = mb.scrollHeight;
    }, 10);
}

async function sendCoachMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    coachChatHistory.push({ role: 'user', content: msg });
    localStorage.setItem('itspattern_coach_chat_history', JSON.stringify(coachChatHistory));
    renderCoachChat(true);

    try {
        const apiHistory = coachChatHistory.slice(0, -1).filter(m => m.role !== 'system');
        const headers = { 'Content-Type': 'application/json' };
        if (memberProfile.isLoggedIn && window.firebase && firebase.auth().currentUser) {
            try {
                headers['Authorization'] = 'Bearer ' + await firebase.auth().currentUser.getIdToken();
            } catch(e) {}
        }
        const r = await fetch(`${API_BASE}/coach`, {
            method: 'POST', headers: headers,
            body: JSON.stringify({ message: msg, history: apiHistory.slice(-10) })
        });
        if (!r.ok) throw new Error('Failed');
        const data = await r.json();
        let reply = data.reply || 'I need a moment. Please try again.';

        // Parse LOG actions
        const logMatch = reply.match(/\[LOG:\s*({.*?})\]/i);
        if (logMatch) {
            try {
                const logData = JSON.parse(logMatch[1]);
                reply = reply.replace(logMatch[0], '').trim();
                tasks.unshift({
                    id: Date.now(), title: `Coach: ${logData.name}`, time: formatTime(new Date()),
                    createdTimestamp: Date.now(), completed: true, comment: 'Logged by AI Coach.',
                    calories: parseInt(logData.calories || 0), protein: parseInt(logData.protein || 0),
                    carbs: logData.carbs ? parseInt(logData.carbs) : Math.round((parseInt(logData.calories || 0) * 0.4) / 4),
                    fat: logData.fat ? parseInt(logData.fat) : Math.round((parseInt(logData.calories || 0) * 0.3) / 9)
                });
                saveTasks();
                renderTasks();
                renderCharts();
                coachChatHistory.push({ role: 'system', content: `Logged "${logData.name}" — ${logData.calories} kcal` });
            } catch (e) { console.error('Log parse error:', e); }
        }

        // Parse TARGET updates
        const targetMatch = reply.match(/\[TARGETS:\s*({.*?})\]/i);
        if (targetMatch) {
            try {
                const td = JSON.parse(targetMatch[1]);
                reply = reply.replace(targetMatch[0], '').trim();
                const cal = parseInt(td.calories || targets.calories);
                const p = parseInt(td.protein || targets.protein);
                const f = td.fat ? parseInt(td.fat) : Math.round((cal * 0.25) / 9);
                const c = td.carbs ? parseInt(td.carbs) : Math.round((cal - (p * 4) - (f * 9)) / 4);
                Object.assign(targets, { calories: cal, protein: p, carbs: c, fat: f });
                saveTargets();
                updateNutritionalCard();
                renderCharts();
                coachChatHistory.push({ role: 'system', content: `Targets updated: ${cal} kcal, ${p}g protein` });
            } catch (e) { console.error('Target parse error:', e); }
        }

        // Parse ADD_TASK actions
        const addTaskMatch = reply.match(/\[ADD_TASK:\s*({.*?})\]/i);
        if (addTaskMatch) {
            try {
                const td = JSON.parse(addTaskMatch[1]);
                reply = reply.replace(addTaskMatch[0], '').trim();
                tasks.unshift({
                    id: Date.now(), title: td.title || 'Coach Task', time: td.time || formatTime(new Date()),
                    createdTimestamp: Date.now(), completed: td.completed !== false,
                    comment: td.comment || 'Added by AI Coach.', calories: parseInt(td.calories || 0),
                    protein: parseInt(td.protein || 0), carbs: parseInt(td.carbs || 0), fat: parseInt(td.fat || 0)
                });
                saveTasks(); renderTasks(); renderCharts(); updateNutritionalCard();
                coachChatHistory.push({ role: 'system', content: `Task added: "${td.title}"` });
            } catch(e) { console.error('Add task parse error:', e); }
        }

        // Parse DELETE_TASK actions
        const delTaskMatch = reply.match(/\[DELETE_TASK:\s*(\d+)\]/i);
        if (delTaskMatch) {
            const delId = parseInt(delTaskMatch[1]);
            reply = reply.replace(delTaskMatch[0], '').trim();
            const removed = tasks.findIndex(t => t.id === delId || t.title?.includes(delTaskMatch[1]));
            if (removed !== -1) {
                const t = tasks.splice(removed, 1)[0];
                saveTasks(); renderTasks(); renderCharts(); updateNutritionalCard();
                coachChatHistory.push({ role: 'system', content: `Task removed: "${t.title}"` });
            }
        }

        // Parse ADD_SCHEDULE actions
        const addSchedMatch = reply.match(/\[ADD_SCHEDULE:\s*({.*?})\]/i);
        if (addSchedMatch) {
            try {
                const sd = JSON.parse(addSchedMatch[1]);
                reply = reply.replace(addSchedMatch[0], '').trim();
                schedules.unshift({ id: Date.now(), text: sd.text || sd.name, inTime: sd.inTime || '09:00', outTime: sd.outTime || '17:00', durationType: sd.durationType || 'custom' });
                saveSchedules(); renderScheduleList(); renderHomeSchedule();
                coachChatHistory.push({ role: 'system', content: `Schedule added: "${sd.text || sd.name}" (${sd.inTime || '09:00'}–${sd.outTime || '17:00'})` });
            } catch(e) { console.error('Add schedule parse error:', e); }
        }

        // Parse DELETE_SCHEDULE actions
        const delSchedMatch = reply.match(/\[DELETE_SCHEDULE:\s*(\d+)\]/i);
        if (delSchedMatch) {
            const delId = parseInt(delSchedMatch[1]);
            reply = reply.replace(delSchedMatch[0], '').trim();
            const idx = schedules.findIndex(s => s.id === delId);
            if (idx !== -1) {
                const s = schedules.splice(idx, 1)[0];
                saveSchedules(); renderScheduleList(); renderHomeSchedule();
                coachChatHistory.push({ role: 'system', content: `Schedule removed: "${s.text}"` });
            }
        }

        // Parse CLEAR_MEALS action
        if (/\[CLEAR_MEALS\]/i.test(reply)) {
            reply = reply.replace(/\[CLEAR_MEALS\]/gi, '').trim();
            const today = todayString();
            tasks = tasks.filter(t => !(t.autoMeal && t.autoDate === today));
            saveTasks(); renderTasks(); renderCharts(); updateNutritionalCard();
            coachChatHistory.push({ role: 'system', content: 'Auto-generated meals cleared for today.' });
        }

        coachChatHistory.push({ role: 'assistant', content: reply });
        localStorage.setItem('itspattern_coach_chat_history', JSON.stringify(coachChatHistory));
        renderCoachChat(false);
    } catch (err) {
        console.error('Coach fetch error:', err);
        coachChatHistory.push({ role: 'assistant', content: '⚠️ Unable to connect. Make sure the backend server is running (`python main_orch.py serve`) and try again.' });
        localStorage.setItem('itspattern_coach_chat_history', JSON.stringify(coachChatHistory));
        renderCoachChat(false);
    }
}

function formatAIMsg(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?:^|\s)\*([^\s\*].*?[^\s\*]?)\*(?=\s|$)/g, ' <em>$1</em>')
        .replace(/^- (.+)$/gm, '<span class="block text-[11px] leading-relaxed">• $1</span>')
        .replace(/^\d+\. (.+)$/gm, '<span class="block text-[11px] leading-relaxed"><span class="font-bold text-indigo-500">$&</span></span>')
        .replace(/\n{2,}/g, '</p><p class="mt-2">')
        .replace(/\n/g, '<br>');
}

function getContextualSuggestions() {
    const lastMsg = [...coachChatHistory].reverse().find(m => m.role === 'assistant');
    const text = (lastMsg?.content || '').toLowerCase();
    const defaults = [
        { key: 'meal', icon: 'fa-solid fa-bowl-food', label: 'Replace My Meal', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
        { key: 'budget', icon: 'fa-solid fa-indian-rupee-sign', label: 'Budget Meal Plan', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
        { key: 'protein', icon: 'fa-solid fa-dumbbell', label: 'High Protein Ideas', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
        { key: 'analyze', icon: 'fa-solid fa-chart-simple', label: 'Analyze My Log', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
        { key: 'fatloss', icon: 'fa-solid fa-fire', label: 'Fat Loss Tips', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
    ];

    if (!lastMsg || coachChatHistory.length <= 1) return defaults;

    if (text.includes('breakfast') || text.includes('meal plan') || text.includes('diet plan')) {
        return [
            { key: 'breakfast', icon: 'fa-solid fa-sun', label: 'Log This Breakfast', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'lunch', icon: 'fa-solid fa-cloud-sun', label: 'Suggest Next Meal', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'snack', icon: 'fa-solid fa-apple-whole', label: 'Healthy Snacks', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'budget', icon: 'fa-solid fa-indian-rupee-sign', label: 'Cheaper Swap', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'protein', icon: 'fa-solid fa-dumbbell', label: 'Add More Protein', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
        ];
    }
    if (text.includes('protein') || text.includes('muscle') || text.includes('gym')) {
        return [
            { key: 'protein_meal', icon: 'fa-solid fa-egg', label: 'High Protein Meal', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'post_workout', icon: 'fa-solid fa-bolt', label: 'Post-Workout Fuel', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'protein_source', icon: 'fa-solid fa-seedling', label: 'Budget Protein Sources', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'meal', icon: 'fa-solid fa-bowl-food', label: 'Replace My Dinner', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'analyze', icon: 'fa-solid fa-chart-simple', label: 'Analyze Protein Intake', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
        ];
    }
    if (text.includes('fat loss') || text.includes('weight') || text.includes('calorie') || text.includes('caloric deficit')) {
        return [
            { key: 'deficit', icon: 'fa-solid fa-fire', label: 'Caloric Deficit Plan', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'meal', icon: 'fa-solid fa-bowl-food', label: 'Low-Cal Meal Swap', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'protein', icon: 'fa-solid fa-dumbbell', label: 'Protein for Fat Loss', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'cardio', icon: 'fa-solid fa-heart-pulse', label: 'Exercise Pairing', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'analyze', icon: 'fa-solid fa-chart-simple', label: 'Check My Calories', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
        ];
    }
    if (text.includes('budget') || text.includes('₹') || text.includes('rs') || text.includes('rupee') || text.includes('affordable')) {
        return [
            { key: 'budget_breakfast', icon: 'fa-solid fa-sun', label: 'Budget Breakfast', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'budget_lunch', icon: 'fa-solid fa-bag-shopping', label: 'Budget Lunch Box', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'budget_protein', icon: 'fa-solid fa-seedling', label: 'Cheapest Protein', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'meal', icon: 'fa-solid fa-bowl-food', label: 'Replace With Cheaper', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'analyze', icon: 'fa-solid fa-chart-simple', label: 'Check My Spending', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
        ];
    }
    if (text.includes('schedule') || text.includes('office') || text.includes('gym')) {
        return [
            { key: 'timing', icon: 'fa-solid fa-clock', label: 'Best Meal Timing', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'pre_gym', icon: 'fa-solid fa-bolt', label: 'Pre-Gym Fuel', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'post_gym', icon: 'fa-solid fa-dumbbell', label: 'Post-Gym Recovery', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'office_meal', icon: 'fa-solid fa-briefcase', label: 'Office Lunch Ideas', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' },
            { key: 'analyze', icon: 'fa-solid fa-chart-simple', label: 'Analyze My Log', color: 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white' }
        ];
    }

    return defaults;
}

function handleQuickAction(type) {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const prompts = {
        meal: 'Replace my last logged meal with a budget-friendly Indian alternative that has similar macros',
        budget: 'Suggest a complete 1-day meal plan under ₹200 with Indian foods (dal, soya, eggs, paneer, roti, rice) — 1800 kcal, 120g protein',
        protein: 'Give me 5 high-protein Indian breakfast options under ₹50 each with exact macros',
        analyze: 'Analyze my recent fuel log and tell me which meals I should replace with healthier Indian alternatives',
        fatloss: 'Give me 3 evidence-based fat loss tips tailored to an Indian diet — include specific food swaps',
        breakfast: 'Log the breakfast you suggested for me: 350 kcal, 20g protein',
        lunch: 'What should I eat for lunch to stay on track with today\'s plan?',
        snack: 'Suggest 3 healthy Indian snacks under 150 kcal each',
        protein_meal: 'Give me a complete high-protein Indian meal with exact macros',
        post_workout: 'What should I eat post-workout for best recovery? Suggest an Indian option',
        protein_source: 'List the cheapest protein sources in India per gram of protein',
        deficit: 'Design a 1800 kcal fat loss day using only Indian foods',
        cardio: 'What\'s the best exercise to pair with my current diet for fat loss?',
        budget_breakfast: 'Suggest a high-protein breakfast under ₹30 using Indian ingredients',
        budget_lunch: 'Give me a lunch box meal under ₹50 with 25g+ protein',
        budget_protein: 'What\'s the cheapest source of protein available in India?',
        timing: 'Based on my Gym and Office schedule, when should I eat each meal?',
        pre_gym: 'What should I eat 1 hour before my gym session? Indian options',
        post_gym: 'Best post-workout meal for muscle recovery using Indian ingredients',
        office_meal: 'Suggest 5 office lunch ideas that are easy to carry and healthy'
    };
    input.value = prompts[type] || '';
    input.focus();
}

function showLoading(msg) {
    const c = document.getElementById('assessment-container');
    if (!c) return;
    c.innerHTML = `<div class="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-4"><div class="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin"></div><p class="text-gray-400 text-xs font-semibold">${msg}</p></div>`;
}

function showError(msg) {
    const c = document.getElementById('assessment-container');
    if (!c) return;
    c.innerHTML = `<div class="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-4"><div class="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><i class="fa-solid fa-triangle-exclamation"></i></div><p class="text-red-500 text-xs font-bold">${msg}</p><button onclick="renderWelcome()" class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all text-gray-600">Back</button></div>`;
}

// ── Settings / Reset ──────────────────────────────────────────────────────────
function loadTargets() {
    const stored = localStorage.getItem('itspattern_targets_v3');
    if (stored) Object.assign(targets, JSON.parse(stored));
}

function saveTargets() {
    localStorage.setItem('itspattern_targets_v3', JSON.stringify(targets));
    if (typeof syncToFirestore === 'function') syncToFirestore('targets', targets);
}

// ── Logout ────────────────────────────────────────────────────────────────
async function logoutUser() {
    if (!confirm('Sign out of your account?')) return;
    try {
        if (window.firebase && firebase.auth().currentUser) {
            await firebase.auth().signOut();
        }
    } catch(e) { console.error('Sign out error:', e); }
    memberProfile.isLoggedIn = false;
    memberProfile.email = '';
    memberProfile.photoURL = '';
    saveMemberProfile();
    switchTab('home');
    updateHomeUI();
    location.reload();
}

function resetApp() {
    if (confirm('Reset all data? This cannot be undone.')) {
        localStorage.removeItem('itspattern_tasks_v3');
        localStorage.removeItem('itspattern_targets_v3');
        localStorage.removeItem('itspattern_assessment_session');
        localStorage.removeItem('itspattern_assessment_report');
        localStorage.removeItem('itspattern_coach_in_chat');
        localStorage.removeItem('itspattern_coach_chat_history');
        localStorage.removeItem('itspattern_member_v2');
        localStorage.removeItem('itspattern_daily_v2');
        localStorage.removeItem('itspattern_task_chats');
        localStorage.removeItem('itspattern_inventory_v1');
        localStorage.removeItem('itspattern_schedules_v2');
        localStorage.removeItem('itspattern_darkmode');
        // Clear all schedule check data
        Object.keys(localStorage).filter(k => k.startsWith('itspattern_schedule_checks_')).forEach(k => localStorage.removeItem(k));
        location.reload();
    }
}

// =============================================================================
//  SERVER METRICS SNAPSHOTS — fire-and-forget analytics
// =============================================================================
function fireAnalyticsSnapshot(event, payload = {}) {
    try {
        fetch(`${API_BASE}/analytics/snapshot`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event,
                external_user_id: getExternalUserId(),
                timestamp: new Date().toISOString(),
                ...payload
            })
        }).catch(() => {}); // fire-and-forget
    } catch (e) { /* silent */ }
}

// =============================================================================
//  COMMUNITY PORTAL — Leaderboard & Badges
// =============================================================================
async function fetchLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-4"><div class="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin mx-auto"></div><p class="text-[9px] text-gray-400 mt-2">Loading leaderboard...</p></div>';
    try {
        const r = await fetch(`${API_BASE}/community/leaderboard`);
        if (!r.ok) throw new Error('Failed');
        const data = await r.json();
        const leaders = data.leaderboard || data || [];
        if (leaders.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-gray-400 text-center py-4">No leaderboard data yet. Be the first!</p>';
            return;
        }
        container.innerHTML = leaders.slice(0, 10).map((u, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            const rankColor = i < 3 ? 'text-indigo-600 font-black' : 'text-gray-500 font-bold';
            return `<div class="flex items-center gap-3 py-2 ${i < leaders.length - 1 ? 'border-b border-gray-100' : ''}">
                <span class="text-sm w-8 text-center ${rankColor}">${medal}</span>
                <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-[10px] flex-shrink-0">${(u.name || 'M').charAt(0).toUpperCase()}</div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-gray-900 truncate">${u.name || 'Anonymous'}</p>
                    <p class="text-[8px] text-gray-400">${u.period || ''} • ${u.contributions || u.xp || 0} contributions</p>
                </div>
                <span class="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">${u.xp || u.score || 0} XP</span>
            </div>`;
        }).join('') + `</div>`;
    } catch (e) {
        container.innerHTML = '<p class="text-[10px] text-gray-400 text-center py-4">Leaderboard unavailable. Connect to backend.</p>';
    }
}

async function fetchBadges() {
    const container = document.getElementById('badges-list');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-4"><div class="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin mx-auto"></div><p class="text-[9px] text-gray-400 mt-2">Loading badges...</p></div>';
    try {
        const userId = getExternalUserId();
        const r = await fetch(`${API_BASE}/community/badges/${userId}`);
        if (!r.ok) throw new Error('Failed');
        const data = await r.json();
        const badges = data.badges || data || [];
        if (badges.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-gray-400 text-center py-4">No badges earned yet. Keep going!</p>';
            return;
        }
        const badgeIcons = { 'Muscle Explorer': 'fa-dumbbell', 'Transformation Titan': 'fa-crown', 'Consistency Builder': 'fa-fire', 'Legend': 'fa-star', 'Self Aware': 'fa-brain' };
        container.innerHTML = badges.map(b => {
            const icon = badgeIcons[b.title] || badgeIcons[b.name] || 'fa-award';
            return `<div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid ${icon} text-indigo-500 text-sm"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-[11px] font-bold text-gray-900 truncate">${b.title || b.name}</p>
                    <p class="text-[8px] text-gray-400">${b.desc || b.description || 'Awarded by backend'}</p>
                </div>
            </div>`;
        }).join('') + `</div>`;
    } catch (e) {
        container.innerHTML = '<p class="text-[10px] text-gray-400 text-center py-4">Badges unavailable. Connect to backend.</p>';
    }
}

// =============================================================================
//  AI DEEP RESEARCH — Multi-Agent Research System
// =============================================================================
let researchModalOpen = false;

function toggleResearchModal(show, itemName = '', context = 'pantry') {
    researchModalOpen = show;
    const modal = document.getElementById('research-modal');
    if (!modal) return;
    modal.classList.toggle('hidden', !show);
    if (show) {
        document.getElementById('research-item-name').textContent = itemName;
        document.getElementById('research-results').innerHTML = '';
        document.getElementById('research-input').value = itemName;
        document.getElementById('research-context').value = context;
        setTimeout(() => document.getElementById('research-input').focus(), 100);
    }
}

async function runDeepResearch() {
    const input = document.getElementById('research-input');
    const resultsDiv = document.getElementById('research-results');
    const query = input?.value?.trim();
    if (!query || !resultsDiv) return;

    resultsDiv.innerHTML = `
        <div class="text-center py-6 space-y-3">
            <div class="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin mx-auto"></div>
            <p class="text-[10px] text-gray-400 font-semibold">Activating DeepResearchAgent...</p>
            <p class="text-[8px] text-gray-300">Multi-agent review in progress</p>
        </div>`;

    try {
        const r = await fetch(`${API_BASE}/research/research`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entity_name: query, entity_type: 'topic', external_user_id: getExternalUserId() })
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        const confidence = data.confidence_score ?? data.confidence ?? 0;
        const audit = data.audit_score ?? data.constitutional_score ?? 0;
        const decision = data.review_decision || data.decision || 'Pending';
        const claims = data.claims || data.evidence || data.findings || [];
        const summary = data.summary || data.result || 'Research complete.';

        const decisionColor = decision.toLowerCase().includes('approve') ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
            : decision.toLowerCase().includes('reject') ? 'text-red-600 bg-red-50 border-red-200'
            : 'text-amber-600 bg-amber-50 border-amber-200';
        const decisionIcon = decision.toLowerCase().includes('approve') ? 'fa-circle-check'
            : decision.toLowerCase().includes('reject') ? 'fa-circle-xmark' : 'fa-circle-question';

        resultsDiv.innerHTML = `
            <div class="space-y-3">
                <!-- Confidence Score -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[9px] font-bold text-gray-400 uppercase">Confidence Score</span>
                        <span class="text-xs font-black text-indigo-600">${Math.round(confidence * 100)}%</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-700" style="width:${confidence * 100}%"></div>
                    </div>
                </div>
                <!-- Audit Score -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[9px] font-bold text-gray-400 uppercase">Constitutional Audit</span>
                        <span class="text-xs font-black text-emerald-600">${Math.round(audit * 100)}%</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style="width:${audit * 100}%"></div>
                    </div>
                </div>
                <!-- Decision Badge -->
                <div class="flex items-center gap-2">
                    <span class="text-[9px] font-bold text-gray-400 uppercase">Multi-Agent Review:</span>
                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border ${decisionColor} flex items-center gap-1">
                        <i class="fa-solid ${decisionIcon} text-[8px]"></i> ${decision}
                    </span>
                </div>
                <!-- Summary -->
                <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                    <p class="text-[9px] font-bold text-indigo-600 uppercase mb-1">Research Summary</p>
                    <p class="text-[10px] text-gray-600 leading-relaxed">${summary}</p>
                </div>
                <!-- Evidence / Claims -->
                ${claims.length > 0 ? `
                <div class="space-y-1.5">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Scientific Evidence</p>
                    ${claims.map(c => `<div class="flex items-start gap-1.5 text-[10px] text-gray-500">
                        <i class="fa-solid fa-flask text-indigo-400 mt-0.5 text-[8px] flex-shrink-0"></i>
                        <span>${typeof c === 'string' ? c : c.claim || c.text || JSON.stringify(c)}</span>
                    </div>`).join('')}
                </div>` : ''}
            </div>`;
    } catch (e) {
        resultsDiv.innerHTML = `<div class="text-center py-6">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <p class="text-[10px] text-red-500 font-bold mt-2">Research agents unavailable</p>
            <p class="text-[8px] text-gray-400 mt-1">${e.message || 'Check backend connection'}</p>
        </div>`;
    }
}

// ==========================================
// FIREBASE AUTHENTICATION & LOGIN UI
// ==========================================
// Initial observer (if user already signed in via Firebase session)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        memberProfile.isLoggedIn = true;
        memberProfile.name = user.displayName || memberProfile.name;
        memberProfile.email = user.email;
        if (user.photoURL) memberProfile.photoURL = user.photoURL;
        
        applyInitialViewState();
        
        // Custom Footer Credit
        const footerCredit = document.getElementById('footer-credit');
        if (footerCredit) {
            if (memberProfile.email === 'shriparnanath@gmail.com') {
                footerCredit.innerHTML = "It's a love from <span class='font-extrabold text-gray-800 dark:text-white'>AJAY KEVAT</span>";
            } else {
                footerCredit.innerHTML = "Developed and Created by <span class='font-extrabold text-gray-800 dark:text-white'>AJAY KEVAT</span>";
            }
        }
        
        saveMemberProfile();
        updateHomeUI();
        pullFromFirestore(user);
        
        // Request FCM Push Notifications
        try {
            if (firebase.messaging && firebase.messaging.isSupported()) {
                const messaging = firebase.messaging();
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        messaging.getToken({ vapidKey: 'BBR31KQFCr7GpbqtcgpouU4-NVw4386aX62WIbpOyK42duFhOo3I2OhKWhq99HAGwVtDLLJxva6f7twndCS_Aao' }).then((currentToken) => {
                            if (currentToken) {
                                db.collection('users').doc(user.uid).set({ fcmToken: currentToken }, { merge: true });
                            }
                        }).catch((err) => {
                            console.log('An error occurred while retrieving token. ', err);
                        });
                    }
                });
            }
        } catch (e) { console.warn("Messaging setup error", e); }
    } else {
        memberProfile.isLoggedIn = false;
        applyInitialViewState();
    }
});


// ==========================================
// LEGAL & AUTO-INVENTORY LOGIC
// ==========================================
function openLegalModal(type) {
    const title = type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
    document.getElementById('legal-title').textContent = title;
    
    const termsText = `
        <strong>1. Acceptance of Terms</strong><br>
        By accessing and using Itspattern, you accept and agree to be bound by the terms and provision of this agreement.<br><br>
        <strong>2. Provision of Services</strong><br>
        You agree and acknowledge that Itspattern is entitled to modify, improve or discontinue any of its services at its sole discretion.<br><br>
        <strong>3. AI and Medical Disclaimer</strong><br>
        The AI Coach provides information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.<br><br>
        <strong>4. Proprietary Rights</strong><br>
        You acknowledge and agree that Itspattern may contain proprietary and confidential information including trademarks, service marks and patents protected by intellectual property laws.<br><br>
        <strong>5. User Data and Privacy</strong><br>
        By using our service, you agree to our collection and use of personal data in accordance with our Privacy Policy.
    `;
    
    const privacyText = `
        <strong>1. Information Collection</strong><br>
        We collect information you provide directly to us when you create an account, update your profile, or interact with the AI Coach.<br><br>
        <strong>2. Use of Information</strong><br>
        We use the information we collect to provide, maintain, and improve our services, including to personalize the AI recommendations.<br><br>
        <strong>3. Sharing of Information</strong><br>
        We do not share your personal information with third parties except as described in this privacy policy.<br><br>
        <strong>4. Data Security</strong><br>
        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.<br><br>
        <strong>5. Contact Us</strong><br>
        If you have any questions about this Privacy Policy, please contact us.
    `;
    
    document.getElementById('legal-body').innerHTML = type === 'terms' ? termsText : privacyText;
    
    const modal = document.getElementById('legal-modal');
    const content = document.getElementById('legal-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('translate-y-full');
    }, 10);
}

function closeLegalModal() {
    const modal = document.getElementById('legal-modal');
    const content = document.getElementById('legal-modal-content');
    modal.classList.add('opacity-0');
    content.classList.add('translate-y-full');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

let foodMacroDebounce;
function old_debounce(val) {
    clearTimeout(foodMacroDebounce);
    if (!val || val.length < 3) return;
    
    const calInput = document.getElementById('inv-cal');
    calInput.placeholder = "Loading...";
    
    foodMacroDebounce = setTimeout(async () => {
        try {
            const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(val)}&search_simple=1&action=process&json=1&page_size=1`);
            const data = await res.json();
            
            if (data.products && data.products.length > 0) {
                const p = data.products[0].nutriments;
                const getNum = (val) => val ? Math.round(Number(val)) : 0;
                
                document.getElementById('inv-cal').value = getNum(p['energy-kcal_100g']);
                document.getElementById('inv-p').value = getNum(p['proteins_100g']);
                document.getElementById('inv-c').value = getNum(p['carbohydrates_100g']);
                document.getElementById('inv-f').value = getNum(p['fat_100g']);
                
                if(!document.getElementById('inv-serving').value) {
                    document.getElementById('inv-serving').value = "100g";
                }
            }
        } catch(e) {
            console.error("Macro fetch failed:", e);
        } finally {
            calInput.placeholder = "Calories";
        }
    }, 800);
}


function toggleFeedbackModal(show) {
    const modal = document.getElementById('feedback-modal');
    const content = document.getElementById('feedback-modal-content');
    if (show) {
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-success').classList.add('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('translate-y-full'); }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('translate-y-full');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

function submitFeedback() {
    const txt = document.getElementById('feedback-text').value.trim();
    if (!txt) return;
    document.getElementById('feedback-success').textContent = `Thanks ${memberProfile.name || 'there'}! The AI Coach will analyze this to improve the app.`;
    document.getElementById('feedback-success').classList.remove('hidden');
    setTimeout(() => toggleFeedbackModal(false), 2000);
}

function checkOnboarding() {
    if (memberProfile.isLoggedIn && !memberProfile.onboardingCompleted) {
        showOnboardingBubbles();
        memberProfile.onboardingCompleted = true;
        saveMemberProfile();
    }
}

function showOnboardingBubbles() {
    const container = document.createElement('div');
    container.id = 'onboarding-overlay';
    container.className = 'fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center';
    container.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm animate-bounce-slow">
            <div class="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white mb-2">Welcome to your AI Health OS</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Here's how to get started:</p>
            <ul class="text-left text-xs font-bold text-gray-700 dark:text-gray-300 space-y-3 mb-6 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl">
                <li class="flex gap-3 items-center"><i class="fa-solid fa-calendar-day text-indigo-500 w-4"></i> 1. Add your daily schedule</li>
                <li class="flex gap-3 items-center"><i class="fa-solid fa-basket-shopping text-indigo-500 w-4"></i> 2. Build your Pantry</li>
                <li class="flex gap-3 items-center"><i class="fa-solid fa-robot text-indigo-500 w-4"></i> 3. Tap the center AI button for coaching</li>
            </ul>
            <button onclick="document.getElementById('onboarding-overlay').remove()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-md spring-btn">Let's Go!</button>
        </div>
    `;
    document.body.appendChild(container);
}

// We also manually call this in handleAuthSuccess
const oldHandleAuth = handleAuthSuccess;
handleAuthSuccess = function(user) {
    oldHandleAuth(user);
    setTimeout(checkOnboarding, 500);
};

// Update debounce macros
function debounceFoodMacros(val, type = 'inventory') {
    clearTimeout(foodMacroDebounce);
    if (!val || val.length < 3) return;
    
    const calId = type === 'fuel' ? 'task-cal' : 'inv-cal';
    const pId = type === 'fuel' ? 'task-p' : 'inv-p';
    const cId = type === 'fuel' ? 'task-c' : 'inv-c';
    const fId = type === 'fuel' ? 'task-f' : 'inv-f';
    
    const calInput = document.getElementById(calId);
    if(calInput) calInput.placeholder = "Loading...";
    
    foodMacroDebounce = setTimeout(async () => {
        try {
            const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(val)}&search_simple=1&action=process&json=1&page_size=1`);
            const data = await res.json();
            
            if (data.products && data.products.length > 0) {
                const p = data.products[0].nutriments;
                const getNum = (v) => v ? Math.round(Number(v)) : 0;
                
                if(document.getElementById(calId)) document.getElementById(calId).value = getNum(p['energy-kcal_100g']);
                if(document.getElementById(pId)) document.getElementById(pId).value = getNum(p['proteins_100g']);
                if(document.getElementById(cId)) document.getElementById(cId).value = getNum(p['carbohydrates_100g']);
                if(document.getElementById(fId)) document.getElementById(fId).value = getNum(p['fat_100g']);
            }
        } catch(e) {
            console.error("Macro fetch failed:", e);
        } finally {
            if(calInput) calInput.placeholder = "Calories";
        }
    }, 800);
}


// ==========================================
// GOOGLE FIT LOGIC
// ==========================================
async function fetchGoogleFitData() {
    const token = localStorage.getItem('itspattern_gfit_token');
    if (!token) {
        return reconnectGoogleFit();
    }
    
    const walkEl = document.getElementById('fit-walk-val');
    const burnEl = document.getElementById('fit-burned-val');
    const syncIcon = document.getElementById('gfit-resync-icon');
    
    if (walkEl) walkEl.textContent = "...";
    if (burnEl) burnEl.textContent = "...";
    if (syncIcon) syncIcon.classList.add('fa-spin');
    
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfDay = now.getTime();
        
        const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aggregateBy: [
                    { dataTypeName: 'com.google.calories.expended' },
                    { dataTypeName: 'com.google.distance.delta' }
                ],
                bucketByTime: { durationMillis: endOfDay - startOfDay },
                startTimeMillis: startOfDay,
                endTimeMillis: endOfDay
            })
        });
        
        if (!res.ok) {
            console.warn("Google Fit API returned", res.status);
            if (res.status === 401) {
                // Token expired or invalid, prompt to reconnect
                if (syncIcon) syncIcon.classList.remove('fa-spin');
                return reconnectGoogleFit();
            }
            throw new Error('Fit API Error');
        }
        
        const data = await res.json();
        if (data.bucket && data.bucket.length > 0) {
            const bucket = data.bucket[0];
            let cals = 0;
            let dist = 0;
            
            bucket.dataset.forEach(ds => {
                if (ds.dataSourceId.includes('calories.expended') && ds.point && ds.point.length > 0) {
                    cals = ds.point[0].value[0].fpVal || 0;
                }
                if (ds.dataSourceId.includes('distance.delta') && ds.point && ds.point.length > 0) {
                    dist = ds.point[0].value[0].fpVal || 0;
                }
            });
            
            if (walkEl) walkEl.textContent = (dist / 1000).toFixed(1);
            if (burnEl) burnEl.textContent = Math.round(cals);
            window.lastFitBurned = Math.round(cals);
            if (typeof updateNutritionalCard === 'function') updateNutritionalCard();
        } else {
            if (walkEl) walkEl.textContent = "0.0";
            if (burnEl) burnEl.textContent = "0";
        }
    } catch(e) {
        console.error("Google Fit Error:", e);
        if (walkEl) walkEl.textContent = "0.0";
        if (burnEl) burnEl.textContent = "0";
    } finally {
        if (syncIcon) syncIcon.classList.remove('fa-spin');
    }
}


// ==========================================
// FEATURE: EARLY USERS & CURRENCY & NUTRIENTS
// ==========================================

function getLocalCurrencySymbol() {
    const locale = navigator.language || 'en-US';
    if (locale.toLowerCase().includes('in')) return '₹';
    if (locale.toLowerCase().includes('gb')) return '£';
    if (locale.toLowerCase().includes('eu') || locale.toLowerCase().includes('fr') || locale.toLowerCase().includes('de') || locale.toLowerCase().includes('it')) return '€';
    if (locale.toLowerCase().includes('jp')) return '¥';
    return '$';
}

const CURRENCY_SYMBOL = getLocalCurrencySymbol();

document.addEventListener("DOMContentLoaded", () => {
    const symEl = document.getElementById('currency-symbol-label');
    if (symEl) symEl.textContent = CURRENCY_SYMBOL;

    // Premium Haptics for interactive elements
    document.querySelectorAll('.spring-btn, .schedule-btn, .card-hover').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.vibrate) {
                navigator.vibrate(10); // Light crisp haptic tap
            }
        });
    });

    // Setup Visual Viewport resize handler to prevent keyboard layout fluctuations in AI Coach Chat
    if (window.visualViewport) {
        const handleViewportChange = () => {
            const screenAi = document.getElementById('screen-ai');
            if (screenAi && screenAi.style.display !== 'none') {
                const viewportHeight = window.visualViewport.height;
                document.documentElement.style.setProperty('--app-vh', `${viewportHeight}px`);
                const mb = document.getElementById('chat-messages');
                if (mb) mb.scrollTop = mb.scrollHeight;
            }
        };

        window.visualViewport.addEventListener('resize', handleViewportChange);
        
        handleViewportChange();
    }

    // Listen for URL hash changes and history popstate to support browser Back button navigation
    const handleHistoryNav = () => {
        const tabId = window.location.hash.substring(1) || 'home';
        const screens = ['home', 'tasks', 'ai', 'stats', 'more', 'inventory', 'settings', 'notifications'];
        if (screens.includes(tabId)) {
            switchTabInternal(tabId);
        }
    };
    window.addEventListener('hashchange', handleHistoryNav);
    window.addEventListener('popstate', handleHistoryNav);

    // Restore active tab from hash or localStorage on page load/refresh without adding dummy history state
    const initialTab = window.location.hash.substring(1) || localStorage.getItem('itspattern_active_tab') || 'home';
    if (window.location.hash !== '#' + initialTab) {
        history.replaceState(null, '', '#' + initialTab);
    }
    switchTabInternal(initialTab);
});

function toggleAjayWelcome(show) {
    const modal = document.getElementById('ajay-welcome-modal');
    const content = modal.querySelector('div');
    if (show) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function closeAjayWelcome() {
    toggleAjayWelcome(false);
    memberProfile.earlyAdopterSeen = true;
    saveProfile();
    // Continue original onboarding
    setTimeout(() => {
        showOnboardingBubbles();
    }, 400);
}

function toggleNutrientsModal(show) {
    const modal = document.getElementById('nutrients-modal');
    const content = modal.querySelector('div');
    if (show) {
        renderNutrientsGrid();
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('translate-y-full');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('translate-y-full');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function renderNutrientsGrid() {
    const grid = document.getElementById('nutrients-grid');
    if (!grid) return;
    
    // Calculate total today
    const today = new Date().toISOString().split('T')[0];
    let vitC = 0, iron = 0, calcium = 0, sodium = 0;
    
    fuelLog.filter(f => f.date === today).forEach(f => {
        vitC += f.vitC || 0;
        iron += f.iron || 0;
        calcium += f.calcium || 0;
        sodium += f.sodium || 0;
    });
    
    grid.innerHTML = `
        <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Vitamin C</p>
            <p class="text-sm font-black text-gray-900 dark:text-white">${vitC.toFixed(1)} mg</p>
        </div>
        <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Iron</p>
            <p class="text-sm font-black text-gray-900 dark:text-white">${iron.toFixed(1)} mg</p>
        </div>
        <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Calcium</p>
            <p class="text-sm font-black text-gray-900 dark:text-white">${calcium.toFixed(1)} mg</p>
        </div>
        <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Sodium</p>
            <p class="text-sm font-black text-gray-900 dark:text-white">${sodium.toFixed(1)} mg</p>
        </div>
    `;
}


// ==========================================
// PANTRY AUTOCOMPLETE, URL IMPORT, AND VISION SCAN
// ==========================================
let autocompleteDebounce = null;
window.autocompleteFood = function(val, datalistId) {
    clearTimeout(autocompleteDebounce);
    if (!val || val.length < 2) return;
    
    autocompleteDebounce = setTimeout(async () => {
        try {
            const res = await fetch(`${API_BASE}/food/suggest?query=${encodeURIComponent(val)}`);
            if (res.ok) {
                const data = await res.json();
                const datalist = document.getElementById(datalistId);
                if (datalist) {
                    datalist.innerHTML = '';
                    (data.suggestions || []).forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item;
                        datalist.appendChild(opt);
                    });
                }
            }
        } catch (e) {
            console.error("Autocomplete fetch failed:", e);
        }
    }, 300);
};

window.extractLinkDetails = async function() {
    const linkInput = document.getElementById('inv-link');
    const url = linkInput.value.trim();
    if (!url) {
        alert("Please paste a product URL first.");
        return;
    }
    
    const statusEl = document.getElementById('inv-ai-status');
    statusEl.textContent = "Analyzing webpage details with AI...";
    statusEl.classList.remove('hidden', 'text-red-500', 'text-green-500');
    statusEl.classList.add('text-indigo-500');
    
    try {
        const res = await fetch(`${API_BASE}/food/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Failed to scrape link");
        }
        
        const data = await res.json();
        
        if (data.name) {
            document.getElementById('inv-name').value = data.name;
        }
        if (data.serving_size) {
            document.getElementById('inv-serving').value = data.serving_size;
        }
        if (data.calories !== undefined) {
            document.getElementById('inv-cal').value = Math.round(data.calories);
        }
        if (data.protein !== undefined) {
            document.getElementById('inv-p').value = Math.round(data.protein);
        }
        if (data.carbs !== undefined) {
            document.getElementById('inv-c').value = Math.round(data.carbs);
        }
        if (data.fat !== undefined) {
            document.getElementById('inv-f').value = Math.round(data.fat);
        }
        
        statusEl.textContent = `Imported: ${data.name || 'Product'} (${Math.round(data.calories || 0)} kcal, ${Math.round(data.protein || 0)}g Protein). Click 'Add to Pantry' to save.`;
        statusEl.classList.remove('text-indigo-500');
        statusEl.classList.add('text-green-500');
        linkInput.value = '';
    } catch (e) {
        console.error("Link extraction failed:", e);
        statusEl.textContent = `Error: ${e.message || "Failed to extract details."}`;
        statusEl.classList.remove('text-indigo-500');
        statusEl.classList.add('text-red-500');
    }
};

window.scanIngredientsLabel = async function(input) {
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const statusEl = document.getElementById('inv-ai-status');
    statusEl.textContent = "Scanning label photo with AI Vision...";
    statusEl.classList.remove('hidden', 'text-red-500', 'text-green-500');
    statusEl.classList.add('text-indigo-500');
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Image = e.target.result;
        
        try {
            const res = await fetch(`${API_BASE}/food/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: base64Image })
            });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to scan image");
            }
            
            const data = await res.json();
            
            if (data.name) {
                document.getElementById('inv-name').value = data.name;
            }
            if (data.serving_size) {
                document.getElementById('inv-serving').value = data.serving_size;
            }
            if (data.calories !== undefined) {
                document.getElementById('inv-cal').value = Math.round(data.calories);
            }
            if (data.protein !== undefined) {
                document.getElementById('inv-p').value = Math.round(data.protein);
            }
            if (data.carbs !== undefined) {
                document.getElementById('inv-c').value = Math.round(data.carbs);
            }
            if (data.fat !== undefined) {
                document.getElementById('inv-f').value = Math.round(data.fat);
            }
            
            statusEl.textContent = `Scanned: ${data.name || 'Product'} (${Math.round(data.calories || 0)} kcal, ${Math.round(data.protein || 0)}g Protein). Click 'Add to Pantry' to save.`;
            statusEl.classList.remove('text-indigo-500');
            statusEl.classList.add('text-green-500');
        } catch (err) {
            console.error("Image scan failed:", err);
            statusEl.textContent = `Error: ${err.message || "Failed to analyze image."}`;
            statusEl.classList.remove('text-indigo-500');
            statusEl.classList.add('text-red-500');
        }
    };
    reader.readAsDataURL(file);
    input.value = '';
};


