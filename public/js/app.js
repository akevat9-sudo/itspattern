/**
 * ItsPattern — Clean Light SPA
 * White cards · Blue hero · Black bottom nav · FontAwesome
 */
(function() {
  'use strict';

  const API_BASE = '/api';
  let isTransitioning = false;
  let currentRoute = 'home';

  // Assessment state
  let assessmentSessionId = null;
  let assessmentStep = 0;
  let assessmentTotalSteps = 10;
  let assessmentAnswers = {};

  //── DOM shortcuts ──
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  //══════════════════════════════════════════════════
  // SPA NAVIGATION
  //══════════════════════════════════════════════════
  function navigate(route, pushState = true) {
    if (isTransitioning) return;
    const url = new URL(route, window.location.origin);
    const path = url.pathname;
    const routeKey = path.replace('/', '') || 'home';

    isTransitioning = true;

    // Update nav
    $$('.bottom-nav-link, .nav-center-btn').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`[data-route="${routeKey}"]`).forEach(l => l.classList.add('active'));

    const content = document.getElementById('app-content');
    if (!content) return;

    content.style.opacity = '0';
    content.style.transform = 'translateY(6px)';
    content.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      switch (path) {
        case '/':
        case '/home': renderHome(); break;
        case '/progress': renderProgress(); break;
        case '/ai': renderAICoach(); break;
        case '/community': renderCommunity(); break;
        case '/more': renderMore(); break;
        case '/assessment': renderAssessment(); break;
        default: renderHome(); break;
      }

      requestAnimationFrame(() => {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });

      currentRoute = routeKey;
      isTransitioning = false;
    }, 200);

    if (pushState) window.history.pushState({}, '', path);
  }

  //══════════════════════════════════════════════════
  // HOME
  //══════════════════════════════════════════════════
  function renderHome() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <!-- Hero: AI Assistant -->
      <section class="hero-card">
        <div class="hero-content">
          <div class="hero-top">
            <i class="fa-solid fa-robot"></i>
            <span class="hero-top-label">Live Progress</span>
          </div>
          <h2 class="hero-title">Analyzing Your Nutrition Data…</h2>
          <p class="hero-subtitle">Processing your metabolic profile. You're 12% ahead of yesterday's goals.</p>
        </div>
      </section>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-pill" data-action="meal"><i class="fa-solid fa-utensils"></i> Meals</button>
        <button class="quick-pill" data-action="water"><i class="fa-solid fa-droplet"></i> Water</button>
        <button class="quick-pill" data-action="protein"><i class="fa-solid fa-dumbbell"></i> Protein</button>
        <button class="quick-pill" data-action="sleep"><i class="fa-solid fa-moon"></i> Sleep</button>
        <button class="quick-pill" data-action="coach"><i class="fa-solid fa-robot"></i> AI Coach</button>
      </div>

      <!-- Today's Schedule -->
      <div class="section-label">Today's Schedule</div>

      <div class="task-card">
        <div class="task-row">
          <input type="checkbox" class="task-checkbox" checked>
          <div class="task-info">
            <h3>Morning Nutrition Log</h3>
            <p class="task-time">Completed at 08:30 AM</p>
          </div>
        </div>
        <div class="task-comment">
          <i class="fa-regular fa-comment-dots"></i>
          <input type="text" placeholder="Add a note..." value="Logged 42g protein, all macros on track">
        </div>
      </div>

      <div class="task-card">
        <div class="task-row">
          <input type="checkbox" class="task-checkbox">
          <div class="task-info">
            <h3>Hydration Check</h3>
            <p class="task-time">Due by 12:00 PM</p>
          </div>
        </div>
        <div class="task-comment">
          <i class="fa-regular fa-comment-dots"></i>
          <input type="text" placeholder="Add a note on deviations...">
        </div>
      </div>

      <div class="task-card" style="border:1px solid #bfdbfe;background:#fafcff;">
        <div class="task-row">
          <input type="checkbox" class="task-checkbox">
          <div class="task-info">
            <h3>AI Coach Check-In</h3>
            <p class="task-time" style="color:#3B82F6;">Recommended — 5 min review</p>
          </div>
        </div>
        <button class="btn btn-blue btn-block" style="margin-top:4px;" onclick="window._navigate('/ai')">
          <i class="fa-solid fa-robot"></i> Start Check-In
        </button>
      </div>

      <!-- Weekly Analytics -->
      <div class="section-header">
        <span class="section-label" style="margin-bottom:0;">Weekly Analytics</span>
        <button class="section-action" onclick="window._navigate('/progress')">View All</button>
      </div>

      <div class="chart-card">
        <div class="chart-bars">
          <div class="chart-bar bg-gray" style="height:33%"></div>
          <div class="chart-bar bg-gray" style="height:50%"></div>
          <div class="chart-bar bg-blue" style="height:100%">
            <span class="bar-label">100%</span>
          </div>
          <div class="chart-bar bg-gray" style="height:75%"></div>
          <div class="chart-bar bg-gray" style="height:66%"></div>
        </div>
        <div class="chart-days">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
        </div>
      </div>
    `;

    // Quick action handlers
    content.querySelectorAll('.quick-pill').forEach(pill => {
      pill.addEventListener('click', function() {
        const action = this.dataset.action;
        if (action === 'coach') window._navigate('/ai');
        else showToast('Coming Soon', 'This feature is being built.');
      });
    });
  }

  //══════════════════════════════════════════════════
  // PROGRESS
  //══════════════════════════════════════════════════
  function renderProgress() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="section-label">Progress Dashboard</div>

      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa-solid fa-fire"></i></div>
          <div class="stat-value">0</div>
          <div class="stat-label">Day Streak</div>
          <div class="stat-trend up">+3 this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fa-solid fa-heart-pulse"></i></div>
          <div class="stat-value">84</div>
          <div class="stat-label">Health Score</div>
          <div class="stat-trend up">+2 pts</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber"><i class="fa-solid fa-droplet"></i></div>
          <div class="stat-value">1.8L</div>
          <div class="stat-label">Avg Water</div>
          <div class="stat-trend up">+0.3L</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rose"><i class="fa-solid fa-moon"></i></div>
          <div class="stat-value">7.2h</div>
          <div class="stat-label">Avg Sleep</div>
          <div class="stat-trend down">-0.5h</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="fa-solid fa-shoe-prints"></i></div>
          <div class="stat-value">6.2k</div>
          <div class="stat-label">Steps</div>
          <div class="stat-trend up">+1.2k</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa-solid fa-dumbbell"></i></div>
          <div class="stat-value">92g</div>
          <div class="stat-label">Protein</div>
          <div class="stat-trend up">+8g</div>
        </div>
      </div>

      <!-- Assessment CTA -->
      <div class="content-card">
        <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
          <div style="width:40px;height:40px;border-radius:12px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3B82F6;font-size:1.1rem;flex-shrink:0;">
            <i class="fa-solid fa-dna"></i>
          </div>
          <div>
            <h3 style="font-size:0.9375rem;font-weight:700;line-height:1.3;">Your Metabolic Blueprint</h3>
            <p style="font-size:0.75rem;color:#6B7280;margin-top:4px;">Complete your assessment for personalized AI coaching.</p>
          </div>
        </div>
        <button class="btn btn-primary btn-block" onclick="window._navigate('/assessment')">
          Start Free Assessment
        </button>
      </div>
    `;
  }

  //══════════════════════════════════════════════════
  // AI COACH
  //══════════════════════════════════════════════════
  function renderAICoach() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="section-label">AI Nutrition Coach</div>

      <div class="hero-card" style="margin-bottom:24px;">
        <div class="hero-content">
          <div class="hero-top">
            <i class="fa-solid fa-robot"></i>
            <span class="hero-top-label">Ask Anything</span>
          </div>
          <h2 class="hero-title">Your Personal AI Nutritionist</h2>
          <p class="hero-subtitle">Ask about diet, supplements, meal timing, or health optimization.</p>
        </div>
      </div>

      <div class="section-label" style="margin-bottom:12px;">Suggested Questions</div>

      <div class="coach-suggestions">
        <button class="coach-suggestion" onclick="askCoach('What should I eat for breakfast to maximize energy?')">
          <i class="fa-solid fa-sun"></i>
          What should I eat for breakfast?
        </button>
        <button class="coach-suggestion" onclick="askCoach('How much protein do I need daily?')">
          <i class="fa-solid fa-dumbbell"></i>
          How much protein do I need?
        </button>
        <button class="coach-suggestion" onclick="askCoach('What supplements actually work?')">
          <i class="fa-solid fa-capsules"></i>
          What supplements actually work?
        </button>
        <button class="coach-suggestion" onclick="askCoach('Best foods for better sleep?')">
          <i class="fa-solid fa-moon"></i>
          Best foods for better sleep?
        </button>
      </div>

      <div id="coachResponse" class="coach-response"></div>
    `;
  }

  async function askCoach(question) {
    const el = document.getElementById('coachResponse');
    if (!el) return;

    el.innerHTML = `
      <div class="response-card">
        <div class="user-msg"><strong>You:</strong> ${question}</div>
        <div class="ai-msg">
          <div class="ai-icon"><i class="fa-solid fa-robot"></i></div>
          <div class="ai-text"><span class="shimmer" style="display:inline-block;width:180px;height:14px;"></span></div>
        </div>
      </div>
    `;

    try {
      const res = await fetch(`${API_BASE}/orchestration/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_type: 'research', prompt: question })
      });
      const data = await res.json();
      const answer = data.response || data.result || data.message || JSON.stringify(data, null, 2);
      el.innerHTML = `
        <div class="response-card">
          <div class="user-msg"><strong>You:</strong> ${question}</div>
          <div class="ai-msg">
            <div class="ai-icon"><i class="fa-solid fa-robot"></i></div>
            <div class="ai-text">${formatAnswer(answer)}</div>
          </div>
        </div>
      `;
    } catch (e) {
      el.innerHTML = `
        <div class="response-card" style="border-color:#fecaca;">
          <div class="user-msg"><strong>You:</strong> ${question}</div>
          <div class="ai-msg">
            <div class="ai-icon" style="background:#fef2f2;color:#dc2626;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="ai-text" style="color:#dc2626;">Failed to get response. Please try again.</div>
          </div>
        </div>
      `;
    }
  }

  function formatAnswer(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\n/g, '<br>');
  }

  //══════════════════════════════════════════════════
  // COMMUNITY
  //══════════════════════════════════════════════════
  function renderCommunity() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fa-solid fa-users"></i></div>
        <h3>Community Coming Soon</h3>
        <p>Connect with others on their nutrition journey. Share insights, join challenges, and earn badges.</p>
        <button class="btn btn-primary btn-block" style="max-width:240px;margin:0 auto;" onclick="showToast('Notify Me','We will let you know when community launches!')">
          Get Notified
        </button>
      </div>
    `;
  }

  //══════════════════════════════════════════════════
  // MORE
  //══════════════════════════════════════════════════
  function renderMore() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fa-solid fa-gear"></i></div>
        <h3>Settings</h3>
        <p>Profile settings, preferences, and app information.</p>
        <div style="display:flex;flex-direction:column;gap:10px;max-width:240px;margin:0 auto;">
          <button class="btn btn-secondary btn-block" onclick="showToast('Profile','Profile settings coming soon.')">
            <i class="fa-regular fa-user"></i> Profile
          </button>
          <button class="btn btn-secondary btn-block" onclick="showToast('Notifications','Preferences coming soon.')">
            <i class="fa-regular fa-bell"></i> Notifications
          </button>
          <button class="btn btn-secondary btn-block" onclick="showToast('About','ItsPattern v${APP_VERSION}')">
            <i class="fa-regular fa-circle-info"></i> About
          </button>
        </div>
      </div>
    `;
  }

  //══════════════════════════════════════════════════
  // ASSESSMENT FLOW
  //══════════════════════════════════════════════════
  function renderAssessment() {
    assessmentStep = 0;
    assessmentSessionId = null;
    assessmentAnswers = {};
    renderAssessmentStep(1);
  }

  function renderAssessmentStep(step) {
    assessmentStep = step;
    const content = document.getElementById('app-content');

    const questions = [
      {
        title: 'What is your primary goal?',
        subtitle: 'This helps us tailor your nutrition plan.',
        options: [
          { value: 'lose_fat', label: 'Lose Fat', icon: 'fire' },
          { value: 'build_muscle', label: 'Build Muscle', icon: 'dumbbell' },
          { value: 'improve_health', label: 'Improve Health', icon: 'heart-pulse' },
          { value: 'boost_energy', label: 'Boost Energy', icon: 'bolt' },
          { value: 'better_sleep', label: 'Better Sleep', icon: 'moon' },
          { value: 'manage_stress', label: 'Manage Stress', icon: 'spa' }
        ]
      },
      {
        title: 'What is your gender?',
        subtitle: 'Used for metabolic rate calculations.',
        options: [
          { value: 'male', label: 'Male', icon: 'person' },
          { value: 'female', label: 'Female', icon: 'person-dress' },
          { value: 'other', label: 'Other', icon: 'genderless' }
        ]
      },
      {
        title: 'What is your age?',
        subtitle: 'Age affects metabolism and nutrient needs.',
        options: [
          { value: '18-24', label: '18-24 years', icon: 'seedling' },
          { value: '25-34', label: '25-34 years', icon: 'leaf' },
          { value: '35-44', label: '35-44 years', icon: 'tree' },
          { value: '45-54', label: '45-54 years', icon: 'mountain' },
          { value: '55-plus', label: '55+ years', icon: 'crown' }
        ]
      },
      {
        title: 'What is your activity level?',
        subtitle: 'How physically active are you?',
        options: [
          { value: 'sedentary', label: 'Sedentary', icon: 'chair' },
          { value: 'light', label: 'Lightly Active', icon: 'walking' },
          { value: 'moderate', label: 'Moderately Active', icon: 'person-running' },
          { value: 'very', label: 'Very Active', icon: 'person-hiking' },
          { value: 'extreme', label: 'Extremely Active', icon: 'dumbbell' }
        ]
      },
      {
        title: 'Any dietary preferences?',
        subtitle: 'We will customize your plan.',
        options: [
          { value: 'none', label: 'No Preference', icon: 'utensils' },
          { value: 'vegetarian', label: 'Vegetarian', icon: 'carrot' },
          { value: 'vegan', label: 'Vegan', icon: 'seedling' },
          { value: 'keto', label: 'Keto / Low-Carb', icon: 'egg' },
          { value: 'paleo', label: 'Paleo', icon: 'bone' },
          { value: 'mediterranean', label: 'Mediterranean', icon: 'olive' }
        ]
      },
      {
        title: 'Any health conditions?',
        subtitle: 'We will tailor recommendations.',
        options: [
          { value: 'none', label: 'None', icon: 'check' },
          { value: 'diabetes', label: 'Diabetes', icon: 'droplet' },
          { value: 'thyroid', label: 'Thyroid Issues', icon: 'butterfly' },
          { value: 'digestive', label: 'Digestive Issues', icon: 'wave' },
          { value: 'allergies', label: 'Food Allergies', icon: 'triangle-exclamation' },
          { value: 'other', label: 'Other', icon: 'stethoscope' }
        ]
      },
      {
        title: 'What is your height?',
        subtitle: 'Used for BMI and metabolic rate.',
        options: [
          { value: 'under_150', label: 'Under 150 cm', icon: 'ruler' },
          { value: '150_160', label: '150-160 cm', icon: 'ruler' },
          { value: '161_170', label: '161-170 cm', icon: 'ruler' },
          { value: '171_180', label: '171-180 cm', icon: 'ruler' },
          { value: 'over_180', label: 'Over 180 cm', icon: 'ruler' }
        ]
      },
      {
        title: 'What is your weight?',
        subtitle: 'Used for metabolic calculations.',
        options: [
          { value: 'under_50', label: 'Under 50 kg', icon: 'weight-scale' },
          { value: '50_60', label: '50-60 kg', icon: 'weight-scale' },
          { value: '61_70', label: '61-70 kg', icon: 'weight-scale' },
          { value: '71_80', label: '71-80 kg', icon: 'weight-scale' },
          { value: '81_90', label: '81-90 kg', icon: 'weight-scale' },
          { value: 'over_90', label: 'Over 90 kg', icon: 'weight-scale' }
        ]
      },
      {
        title: 'How is your sleep quality?',
        subtitle: 'Sleep is crucial for metabolic health.',
        options: [
          { value: 'excellent', label: 'Excellent', icon: 'stars' },
          { value: 'good', label: 'Good', icon: 'smile' },
          { value: 'fair', label: 'Fair', icon: 'meh' },
          { value: 'poor', label: 'Poor', icon: 'face-frown' }
        ]
      },
      {
        title: 'Stress level?',
        subtitle: 'Stress impacts nutrition and metabolism.',
        options: [
          { value: 'low', label: 'Low', icon: 'spa' },
          { value: 'moderate', label: 'Moderate', icon: 'face-smile' },
          { value: 'high', label: 'High', icon: 'face-tired' },
          { value: 'very_high', label: 'Very High', icon: 'fire' }
        ]
      }
    ];

    const q = questions[step - 1];
    if (!q) { renderAssessmentComplete(); return; }

    const selectedValue = assessmentAnswers[step] || null;
    const progress = (step / assessmentTotalSteps) * 100;

    content.innerHTML = `
      <div class="assessment-container">
        <div class="assessment-header">
          <div class="assessment-progress">
            <div class="assessment-fill" style="width:${progress}%"></div>
          </div>
          <span class="assessment-step">${step}/${assessmentTotalSteps}</span>
        </div>

        <div class="assessment-question">
          <h2>${q.title}</h2>
          <p>${q.subtitle}</p>
        </div>

        <div class="assessment-options" id="assessmentOptions">
          ${q.options.map((opt) => `
            <button class="assessment-option ${selectedValue === opt.value ? 'selected' : ''}"
                    data-value="${opt.value}"
                    onclick="window._selectOption(this, ${step})">
              <span class="option-icon"><i class="fa-solid fa-${opt.icon}"></i></span>
              <span>${opt.label}</span>
              <span class="option-radio"></span>
            </button>
          `).join('')}
        </div>

        <div class="assessment-nav">
          ${step > 1 ? `<button class="btn btn-secondary" onclick="window._assessBack(${step})">Back</button>` : ''}
          <button class="btn btn-primary" id="assessNextBtn" ${!selectedValue ? 'disabled style="opacity:0.4;"' : ''} onclick="window._assessNext(${step})">
            ${step < 10 ? 'Continue' : 'See Results'}
          </button>
        </div>
      </div>
    `;
  }

  window._selectOption = function(el, step) {
    el.closest('.assessment-options').querySelectorAll('.assessment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    assessmentAnswers[step] = el.dataset.value;
    const btn = document.getElementById('assessNextBtn');
    if (btn) { btn.removeAttribute('disabled'); btn.style.opacity = '1'; }
  };

  window._assessBack = function(step) {
    renderAssessmentStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window._assessNext = async function(step) {
    const value = assessmentAnswers[step];
    if (!value) return;

    try {
      if (!assessmentSessionId) {
        const r = await fetch(`${API_BASE}/start_assessment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const d = await r.json();
        assessmentSessionId = d.session_id;
      }
      await fetch(`${API_BASE}/submit_answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: assessmentSessionId, question_id: `q_${step}`, option_id: value })
      });
    } catch (e) { console.warn('Offline mode:', e.message); }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (step >= 10) renderAssessmentComplete();
    else renderAssessmentStep(step + 1);
  };

  function renderAssessmentComplete() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="assessment-container" style="text-align:center;padding-top:40px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🎉</div>
        <div class="assessment-question">
          <h2>Assessment Complete!</h2>
          <p>Analyzing your responses to build your personalized metabolic blueprint.</p>
        </div>
        <div style="margin:24px auto;max-width:240px;">
          <div class="assessment-progress" style="margin-bottom:8px;">
            <div class="assessment-progress"><div class="assessment-fill" style="width:100%"></div></div>
          </div>
          <p style="font-size:0.75rem;color:var(--text-muted);">Generating your profile...</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;max-width:240px;margin:0 auto;">
          <button class="btn btn-primary btn-block" onclick="window._navigate('/progress')">View My Dashboard</button>
          <button class="btn btn-secondary btn-block" onclick="window._navigate('/ai')">Talk to AI Coach</button>
        </div>
      </div>
    `;
  }

  //══════════════════════════════════════════════════
  // TOAST
  //══════════════════════════════════════════════════
  function showToast(title, message) {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span style="font-weight:600;flex-shrink:0;">${title}</span><span style="color:#6B7280;">${message}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 250); }, 3000);
  }

  //══════════════════════════════════════════════════
  // API STATUS
  //══════════════════════════════════════════════════
  async function checkBackend() {
    try {
      const r = await fetch(`${API_BASE}/health`);
      if (r.ok) console.log('[ItsPattern] Backend online');
    } catch (e) { console.warn('[ItsPattern] Backend offline'); }
  }

  //══════════════════════════════════════════════════
  // INIT
  //══════════════════════════════════════════════════
  function init() {
    window._navigate = navigate;
    window.askCoach = askCoach;

    // Nav clicks
    $$('.bottom-nav-link, .nav-center-btn').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.classList.contains('nav-center-btn')) {
          e.preventDefault();
          navigate('/ai');
          return;
        }
        e.preventDefault();
        navigate(link.getAttribute('href'));
      });
    });

    // Avatar click
    $('#avatarBtn')?.addEventListener('click', () => navigate('/more'));
    $('#bellBtn')?.addEventListener('click', () => showToast('Notifications', 'No new notifications.'));

    window.addEventListener('popstate', () => navigate(window.location.pathname, false));

    const path = window.location.pathname;
    if (path !== '/' && path !== '/home') navigate(path);
    else navigate('/home');

    checkBackend();
    console.log('[ItsPattern] App initialized.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();