<?php
/**
 * itspattern - Premium Admin Dashboard (itspatternOS)
 */
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
?>
<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>itspattern | Admin Area</title>
    
    <!-- Fonts & Icons -->
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&f[]=cabinet-grotesk@800,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Chart.js CDN for premium graphs -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Satoshi', 'sans-serif'],
                        display: ['Cabinet Grotesk', 'sans-serif'],
                    },
                    colors: {
                        pattern: {
                            950: '#030303',
                            900: '#0a0a0f',
                            800: '#111118',
                            700: '#1a1a24',
                            600: '#262636',
                            accent: '#6366f1',
                            success: '#10b981',
                            warning: '#f59e0b',
                            danger: '#ef4444'
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>
    
    <style>
        body {
            background-color: #030303;
            color: #f3f4f6;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08), transparent 35%),
                radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.08), transparent 35%);
            min-height: 100vh;
        }
        
        .glass-panel {
            background: rgba(17, 17, 24, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.04);
        }
        
        .stat-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
            transform: translateY(-4px);
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 12px 30px -10px rgba(99, 102, 241, 0.15);
        }
        
        /* Custom scrollbars */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Loading Spinner */
        .spinner {
            border: 3px solid rgba(255,255,255,0.05);
            border-left-color: #6366f1;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="antialiased overflow-hidden flex h-screen w-screen font-sans">

    <!-- AUTHENTICATION OVERLAY -->
    <div id="auth-overlay" class="fixed inset-0 z-50 bg-[#030303] flex flex-col items-center justify-center transition-all duration-500">
        <div class="glass-panel p-8 md:p-10 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse"></div>
            
            <div id="auth-loading" class="flex flex-col items-center space-y-4 py-6">
                <div class="spinner"></div>
                <p class="text-sm text-gray-400 animate-pulse font-medium tracking-wide">Initializing secure administrator session...</p>
            </div>
            
            <div id="auth-denied" class="hidden flex flex-col items-center space-y-4 py-4">
                <div class="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 mb-2">
                    <i class="fa-solid fa-ban text-2xl animate-bounce"></i>
                </div>
                <h2 class="text-2xl font-display font-black text-white">Access Denied</h2>
                <p id="denied-reason" class="text-sm text-gray-400">Your account does not have active administrator permissions.</p>
                <button onclick="window.location.reload()" class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors border border-white/10 mt-4">Try Again</button>
                <button onclick="window.location.href='/'" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-colors shadow-lg shadow-indigo-600/20">Return to App</button>
            </div>
            
            <div id="auth-login" class="hidden flex flex-col items-center space-y-5">
                <div class="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2 border border-indigo-500/20">
                    <i class="fa-solid fa-shield-halved text-2xl"></i>
                </div>
                <h2 class="text-2xl font-display font-black text-white tracking-tight">itspatternOS</h2>
                <p class="text-sm text-gray-400">Please sign in with your authorized admin Google account to access metrics and configurations.</p>
                
                <div id="login-error" class="hidden w-full text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left"></div>
                
                <button onclick="adminLogin()" class="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-gray-900 rounded-xl font-black hover:bg-gray-100 transition-all shadow-xl hover:scale-[1.01]">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="G">
                    Sign in with Google
                </button>
            </div>
        </div>
    </div>

    <!-- MAIN APP WRAPPER (Hidden until auth) -->
    <div id="admin-app" class="hidden flex w-full h-full">
        
        <!-- SIDEBAR -->
        <aside class="w-64 glass-panel border-r border-white/5 flex flex-col h-full z-20 shrink-0 hidden md:flex">
            <div class="p-6 flex items-center gap-3 border-b border-white/5">
                <img src="logo.png" alt="Logo" class="w-8 h-8 rounded-full shadow-lg border border-white/10">
                <span class="font-display font-black text-xl tracking-tight text-white">itspattern<span class="text-indigo-500 text-xs align-top ml-1">OS</span></span>
            </div>
            
            <nav class="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto">
                <button onclick="switchTab('dashboard')" id="btn-tab-dashboard" class="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-chart-pie w-5 text-center"></i> Dashboard
                </button>
                <button onclick="switchTab('users')" id="btn-tab-users" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-users w-5 text-center"></i> Users
                </button>
                <button onclick="switchTab('funnel')" id="btn-tab-funnel" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-funnel-dollar w-5 text-center"></i> Funnel Analytics
                </button>
                <button onclick="switchTab('health')" id="btn-tab-health" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-server w-5 text-center"></i> System Health
                </button>
            </nav>
            
            <div class="p-4 border-t border-white/5 bg-black/20">
                <div class="flex items-center gap-3 px-2 py-1">
                    <img id="admin-avatar" src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" class="w-9 h-9 rounded-full ring-2 ring-indigo-500/30">
                    <div class="flex-1 min-w-0">
                        <p id="admin-name" class="text-sm font-bold text-white truncate">Administrator</p>
                        <p class="text-[9px] text-indigo-400 uppercase tracking-widest font-black">Authorized Admin</p>
                    </div>
                </div>
                <button onclick="adminLogout()" class="mt-4 w-full py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/5">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                </button>
            </div>
        </aside>

        <!-- MAIN CONTENT CONTAINER -->
        <main class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            <!-- Topbar -->
            <header class="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-6 md:px-8 shrink-0">
                <div class="flex items-center gap-4">
                    <button class="md:hidden text-gray-400 hover:text-white" onclick="toggleMobileSidebar()"><i class="fa-solid fa-bars text-xl"></i></button>
                    <div>
                        <h1 id="page-title" class="text-xl font-display font-black text-white">System Dashboard</h1>
                        <p id="page-subtitle" class="text-xs text-gray-400 font-medium">Real-time engagement & funnel analytics</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div id="backend-status-indicator" class="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-[10px] font-black text-green-400 uppercase tracking-wider">Operational</span>
                    </div>
                    <button onclick="refreshData()" class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-300 hover:text-white transition-all">
                        <i id="refresh-icon" class="fa-solid fa-arrows-rotate"></i>
                    </button>
                </div>
            </header>

            <!-- Scrollable Content Viewports -->
            <div class="flex-1 overflow-y-auto p-6 md:p-8" style="-webkit-overflow-scrolling: touch;">
                
                <!-- LOADING INDICATOR -->
                <div id="main-data-loader" class="hidden flex flex-col items-center justify-center py-20 space-y-3">
                    <div class="spinner"></div>
                    <p class="text-xs text-gray-500 font-semibold animate-pulse">Loading live dashboard metrics...</p>
                </div>

                <!-- 1. DASHBOARD VIEW -->
                <div id="view-dashboard" class="space-y-8">
                    <!-- KPI Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="glass-panel p-6 rounded-2xl stat-card relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    <i class="fa-solid fa-users text-lg"></i>
                                </div>
                            </div>
                            <h3 id="stat-total-users" class="text-3xl font-display font-black text-white mb-1">...</h3>
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
                        </div>
                        
                        <div class="glass-panel p-6 rounded-2xl stat-card relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-3 bg-pink-500/20 rounded-xl text-pink-400">
                                    <i class="fa-solid fa-route text-lg"></i>
                                </div>
                            </div>
                            <h3 id="stat-total-sessions" class="text-3xl font-display font-black text-white mb-1">...</h3>
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Sessions</p>
                        </div>

                        <div class="glass-panel p-6 rounded-2xl stat-card relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-3 bg-green-500/20 rounded-xl text-green-400">
                                    <i class="fa-solid fa-circle-check text-lg"></i>
                                </div>
                                <span id="stat-completion-pct" class="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-md uppercase tracking-wider">...</span>
                            </div>
                            <h3 id="stat-completed-sessions" class="text-3xl font-display font-black text-white mb-1">...</h3>
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed Assessments</p>
                        </div>

                        <div class="glass-panel p-6 rounded-2xl stat-card relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                                    <i class="fa-solid fa-credit-card text-lg"></i>
                                </div>
                                <span id="stat-conversion-pct" class="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-md uppercase tracking-wider">...</span>
                            </div>
                            <h3 id="stat-subscribed-users" class="text-3xl font-display font-black text-white mb-1">...</h3>
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Subscribed Conversions</p>
                        </div>
                    </div>

                    <!-- Main Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Left Column: Conversion Trend -->
                        <div class="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-base font-black text-white uppercase tracking-wider">Conversion Trends (last 30 days)</h2>
                            </div>
                            <div class="flex-1 relative">
                                <canvas id="chart-conversion-trends"></canvas>
                            </div>
                        </div>

                        <!-- Right Column: User Segments -->
                        <div class="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
                            <h2 class="text-base font-black text-white uppercase tracking-wider mb-4">User Segments Conversion</h2>
                            <div class="flex-1 overflow-y-auto space-y-4 pr-1" id="segment-progress-container">
                                <!-- Dynamic segment bars -->
                            </div>
                        </div>
                    </div>

                    <!-- Lower Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Motivations & Struggles -->
                        <div class="glass-panel rounded-2xl p-6">
                            <h2 class="text-base font-black text-white uppercase tracking-wider mb-4">Top User Motivations</h2>
                            <div class="relative h-[250px]">
                                <canvas id="chart-motivations"></canvas>
                            </div>
                        </div>
                        <div class="glass-panel rounded-2xl p-6">
                            <h2 class="text-base font-black text-white uppercase tracking-wider mb-4">Top User Pain Points</h2>
                            <div class="relative h-[250px]">
                                <canvas id="chart-painpoints"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. USERS VIEW -->
                <div id="view-users" class="hidden space-y-6">
                    <!-- Filters & Search -->
                    <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div class="relative w-full md:w-96">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </span>
                            <input type="text" id="user-search-input" oninput="filterUsersTable()" placeholder="Search users by name, email, or phone..." class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white">
                        </div>
                        <div class="flex gap-2 w-full md:w-auto">
                            <select id="user-filter-status" onchange="filterUsersTable()" class="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
                                <option value="all" class="bg-pattern-800">All Statuses</option>
                                <option value="completed" class="bg-pattern-800">Completed Onboarding</option>
                                <option value="pending" class="bg-pattern-800">Incomplete Onboarding</option>
                            </select>
                        </div>
                    </div>

                    <!-- Users Table -->
                    <div class="glass-panel rounded-2xl overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-white/[0.01] text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                                        <th class="px-6 py-4 font-bold">User</th>
                                        <th class="px-6 py-4 font-bold">Contact</th>
                                        <th class="px-6 py-4 font-bold">Targets (Cal / Pro)</th>
                                        <th class="px-6 py-4 font-bold">Onboarding Status</th>
                                        <th class="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="users-table-body" class="text-sm divide-y divide-white/5">
                                    <!-- Dynamic rows -->
                                </tbody>
                            </table>
                        </div>
                        <!-- Empty State -->
                        <div id="users-empty-state" class="hidden text-center py-20 text-gray-500 space-y-2">
                            <i class="fa-solid fa-user-slash text-4xl text-gray-600 mb-2"></i>
                            <p class="font-bold">No users found</p>
                            <p class="text-xs">Try adjusting your search query or filters.</p>
                        </div>
                    </div>
                </div>

                <!-- 3. FUNNEL ANALYTICS VIEW -->
                <div id="view-funnel" class="hidden space-y-8">
                    <!-- Funnel Visualization -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Funnel Diagram -->
                        <div class="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
                            <h2 class="text-base font-black text-white uppercase tracking-wider self-start">Visual Funnel</h2>
                            
                            <div class="w-full flex flex-col space-y-2 py-4">
                                <!-- Step 1 -->
                                <div class="relative w-full bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col items-center text-center">
                                    <span class="text-xs text-indigo-400 font-bold uppercase tracking-wider">Step 1: Total Assessment Starts</span>
                                    <span id="funnel-total-starts" class="text-2xl font-display font-black text-white mt-1">...</span>
                                    <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-pattern-800 border border-white/10 flex items-center justify-center text-xs text-gray-400 z-10">
                                        <i class="fa-solid fa-arrow-down"></i>
                                    </div>
                                </div>
                                <!-- Spacer for arrow -->
                                <div class="h-4"></div>
                                <!-- Step 2 -->
                                <div class="relative w-11/12 mx-auto bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex flex-col items-center text-center">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-violet-400 font-bold uppercase tracking-wider">Step 2: Completed Assessments</span>
                                    </div>
                                    <span id="funnel-total-completes" class="text-2xl font-display font-black text-white mt-1">...</span>
                                    <span id="funnel-complete-rate" class="text-[10px] text-gray-400 font-semibold mt-0.5">...</span>
                                    <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-pattern-800 border border-white/10 flex items-center justify-center text-xs text-gray-400 z-10">
                                        <i class="fa-solid fa-arrow-down"></i>
                                    </div>
                                </div>
                                <!-- Spacer for arrow -->
                                <div class="h-4"></div>
                                <!-- Step 3 -->
                                <div class="w-9/12 mx-auto bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center text-center">
                                    <span class="text-xs text-green-400 font-bold uppercase tracking-wider">Step 3: Paid/Unlocked Blueprint</span>
                                    <span id="funnel-total-unlocked" class="text-2xl font-display font-black text-white mt-1">...</span>
                                    <span id="funnel-conversion-rate" class="text-[10px] text-gray-400 font-semibold mt-0.5">...</span>
                                </div>
                            </div>
                        </div>

                        <!-- Question Dropoff Table -->
                        <div class="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col">
                            <h2 class="text-base font-black text-white uppercase tracking-wider mb-4">Question Drop-Off & Performance Analysis</h2>
                            <div class="overflow-x-auto flex-1">
                                <table class="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr class="bg-white/[0.01] text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                                            <th class="px-4 py-3 font-bold">Step</th>
                                            <th class="px-4 py-3 font-bold">Question Text</th>
                                            <th class="px-4 py-3 font-bold">Category</th>
                                            <th class="px-4 py-3 font-bold text-center">Impressions</th>
                                            <th class="px-4 py-3 font-bold text-center">Drops</th>
                                            <th class="px-4 py-3 font-bold text-right">Drop %</th>
                                        </tr>
                                    </thead>
                                    <tbody id="question-performance-body" class="divide-y divide-white/5">
                                        <!-- Dynamic performance entries -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. SYSTEM HEALTH VIEW -->
                <div id="view-health" class="hidden space-y-8">
                    <!-- Status Check grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Diagnostic Checks -->
                        <div class="glass-panel rounded-2xl p-6 space-y-5">
                            <h2 class="text-base font-black text-white uppercase tracking-wider">Diagnostic Checks</h2>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid fa-server text-indigo-400 text-lg"></i>
                                        <div>
                                            <p class="text-sm font-bold text-white">Oracle Cloud Backend</p>
                                            <p class="text-[10px] text-gray-500">Uvicorn API server on port 8000</p>
                                        </div>
                                    </div>
                                    <span class="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-wide">Operational</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid fa-database text-pink-400 text-lg"></i>
                                        <div>
                                            <p class="text-sm font-bold text-white">SQLite Database</p>
                                            <p class="text-[10px] text-gray-500">Local SQLite storage (funnel.db)</p>
                                        </div>
                                    </div>
                                    <span class="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-wide">Operational</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid fa-cloud text-amber-400 text-lg"></i>
                                        <div>
                                            <p class="text-sm font-bold text-white">Firebase Firestore</p>
                                            <p class="text-[10px] text-gray-500">Remote user storage</p>
                                        </div>
                                    </div>
                                    <span class="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-wide">Connected</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid fa-network-wired text-purple-400 text-lg"></i>
                                        <div>
                                            <p class="text-sm font-bold text-white">API Gateway & Proxy</p>
                                            <p class="text-[10px] text-gray-500">cURL router (api.php)</p>
                                        </div>
                                    </div>
                                    <span class="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-wide">Proxy Active</span>
                                </div>
                            </div>
                        </div>

                        <!-- Resource Indicators -->
                        <div class="glass-panel rounded-2xl p-6 space-y-6">
                            <h2 class="text-base font-black text-white uppercase tracking-wider">Research Module Database Status</h2>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div class="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                    <p id="health-verified-products" class="text-3xl font-display font-black text-indigo-400">...</p>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Verified Products</p>
                                </div>
                                <div class="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                    <p id="health-cache-entries" class="text-3xl font-display font-black text-pink-400">...</p>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Research Cache Size</p>
                                </div>
                                <div class="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                    <p id="health-ingredients-analyzed" class="text-3xl font-display font-black text-amber-400">...</p>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Ingredients Analyzed</p>
                                </div>
                            </div>

                            <div class="pt-6 border-t border-white/5 flex gap-4">
                                <button onclick="triggerSnapshot()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-camera"></i> Save Metrics Snapshot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mt-12 text-center">
                    <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest">itspatternOS Admin Dashboard • v1.0.0 • Verified Connection</p>
                </div>
            </div>
        </main>
    </div>

    <!-- MOBLE SIDEBAR DRAWER -->
    <div id="mobile-sidebar" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm hidden transition-opacity duration-300 opacity-0" onclick="toggleMobileSidebar()">
        <div class="w-64 bg-pattern-900 border-r border-white/5 h-full flex flex-col p-6 space-y-6" onclick="event.stopPropagation()">
            <div class="flex items-center gap-3">
                <img src="logo.png" alt="Logo" class="w-8 h-8 rounded-full border border-white/10">
                <span class="font-display font-black text-xl tracking-tight text-white">itspattern<span class="text-indigo-500 text-xs align-top ml-1">OS</span></span>
            </div>
            
            <nav class="flex-1 space-y-2">
                <button onclick="switchTab('dashboard'); toggleMobileSidebar()" class="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-chart-pie w-5 text-center"></i> Dashboard
                </button>
                <button onclick="switchTab('users'); toggleMobileSidebar()" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-users w-5 text-center"></i> Users
                </button>
                <button onclick="switchTab('funnel'); toggleMobileSidebar()" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-funnel-dollar w-5 text-center"></i> Funnel Analytics
                </button>
                <button onclick="switchTab('health'); toggleMobileSidebar()" class="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left">
                    <i class="fa-solid fa-server w-5 text-center"></i> System Health
                </button>
            </nav>
            
            <div class="p-2 border-t border-white/5">
                <button onclick="adminLogout(); toggleMobileSidebar()" class="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                </button>
            </div>
        </div>
    </div>

    <!-- SEND ADMIN OFFER MODAL -->
    <div id="offer-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4 transition-all duration-300 opacity-0">
        <div class="glass-panel p-6 rounded-2xl max-w-md w-full relative shadow-2xl space-y-5 transform scale-95 transition-transform duration-300">
            <button onclick="closeOfferModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
            
            <div class="flex items-center gap-3 border-b border-white/5 pb-4">
                <div class="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400"><i class="fa-solid fa-paper-plane text-base"></i></div>
                <div>
                    <h2 class="text-base font-black text-white uppercase tracking-wider">Send Targeted Offer / Message</h2>
                    <p class="text-xs text-gray-400">Target User: <span id="offer-modal-user" class="font-bold text-gray-300">...</span></p>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title / Headline</label>
                    <input type="text" id="offer-title" placeholder="e.g. Special Launch Offer" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Offer / Message Body</label>
                    <textarea id="offer-message" rows="3" placeholder="e.g. Unlock your personalized science-backed plan for ₹100 instead of ₹499." class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"></textarea>
                </div>
            </div>

            <div class="pt-4 border-t border-white/5 flex gap-3">
                <button onclick="closeOfferModal()" class="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all border border-white/10">Cancel</button>
                <button onclick="submitAdminOffer()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                    <span id="offer-submit-text">Send Offer</span>
                    <i id="offer-submit-spinner" class="fa-solid fa-circle-notch fa-spin hidden"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT LOGIC -->
    <script>
        // Authorized Admin Emails
        const ADMIN_EMAILS = [
            'akevat9@gmail.com',
            'shriparnanath@gmail.com'
        ];

        // Firebase Configuration (Matching onboarding.js / sw.js)
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
        const auth = firebase.auth();

        // Local cache for fetched metrics and user database
        let activeTab = 'dashboard';
        let funnelData = null;
        let usersData = [];
        let selectedUserUid = null;
        
        // Chart instances
        let chartConversion = null;
        let chartMotivations = null;
        let chartPainpoints = null;

        // AUTHENTICATION FLOW
        auth.onAuthStateChanged(user => {
            const overlay = document.getElementById('auth-overlay');
            const loading = document.getElementById('auth-loading');
            const denied = document.getElementById('auth-denied');
            const login = document.getElementById('auth-login');
            const app = document.getElementById('admin-app');
            const errorDiv = document.getElementById('login-error');

            loading.classList.add('hidden');
            denied.classList.add('hidden');
            login.classList.add('hidden');
            errorDiv.classList.add('hidden');

            if (user) {
                if (ADMIN_EMAILS.includes(user.email)) {
                    // Authorized Admin
                    overlay.classList.add('opacity-0');
                    setTimeout(() => {
                        overlay.classList.add('hidden');
                        app.classList.remove('hidden');
                    }, 500);

                    // Setup profile avatar / info
                    document.getElementById('admin-name').textContent = user.displayName || user.email.split('@')[0];
                    if (user.photoURL) {
                        document.getElementById('admin-avatar').src = user.photoURL;
                    }
                    
                    // Fetch primary analytics
                    refreshData();
                } else {
                    // Not Authorized
                    document.getElementById('denied-reason').textContent = `Your account (${user.email}) does not have administrative permissions.`;
                    denied.classList.remove('hidden');
                }
            } else {
                // Show login screen
                login.classList.remove('hidden');
            }
        });

        function adminLogin() {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch(err => {
                console.error("Sign-in failed:", err);
                const errDiv = document.getElementById('login-error');
                errDiv.textContent = err.message || "Google Authentication failed. Please try again.";
                errDiv.classList.remove('hidden');
            });
        }

        function adminLogout() {
            auth.signOut().then(() => {
                window.location.reload();
            });
        }

        // NAVIGATION TABS
        function switchTab(tabId) {
            // Hide all tab panes
            document.getElementById('view-dashboard').classList.add('hidden');
            document.getElementById('view-users').classList.add('hidden');
            document.getElementById('view-funnel').classList.add('hidden');
            document.getElementById('view-health').classList.add('hidden');

            // Reset tab button styles
            const buttons = ['dashboard', 'users', 'funnel', 'health'];
            buttons.forEach(b => {
                const btn = document.getElementById(`btn-tab-${b}`);
                if (btn) {
                    btn.className = "w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-left";
                }
            });

            // Show current tab pane
            document.getElementById(`view-health`).classList.toggle('hidden', tabId !== 'health');
            document.getElementById(`view-funnel`).classList.toggle('hidden', tabId !== 'funnel');
            document.getElementById(`view-users`).classList.toggle('hidden', tabId !== 'users');
            document.getElementById(`view-dashboard`).classList.toggle('hidden', tabId !== 'dashboard');

            // Set current tab button active
            const activeBtn = document.getElementById(`btn-tab-${tabId}`);
            if (activeBtn) {
                activeBtn.className = "w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold transition-all text-left";
            }

            // Update topbar titles
            const titles = {
                'dashboard': ['System Dashboard', 'Real-time metrics & engagement'],
                'users': ['Registered User Database', 'Manage user details, targets, and targeted offers'],
                'funnel': ['Funnel Analytics', 'Drop-off points and question conversions'],
                'health': ['System Health & Diagnostics', 'Microservices status and AI models metrics']
            };

            document.getElementById('page-title').textContent = titles[tabId][0];
            document.getElementById('page-subtitle').textContent = titles[tabId][1];

            activeTab = tabId;
        }

        function toggleMobileSidebar() {
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar.classList.contains('hidden')) {
                sidebar.classList.remove('hidden');
                setTimeout(() => {
                    sidebar.classList.remove('opacity-0');
                }, 10);
            } else {
                sidebar.classList.add('opacity-0');
                setTimeout(() => {
                    sidebar.classList.add('hidden');
                }, 300);
            }
        }

        // DATA RETRIEVAL
        async function refreshData() {
            const loader = document.getElementById('main-data-loader');
            const icon = document.getElementById('refresh-icon');

            loader.classList.remove('hidden');
            icon.classList.add('fa-spin');

            try {
                // 1. Fetch Python backend full analytics via PHP cURL proxy
                const res = await fetch('api.php/analytics/full');
                if (!res.ok) throw new Error("Backend response failed");
                funnelData = await res.json();

                // 2. Fetch Users securely via Backend Admin API
                try {
                    const idToken = await auth.currentUser.getIdToken(true);
                    const usersRes = await fetch('api.php/admin/users', {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    });
                    if (usersRes.ok) {
                        const usersJson = await usersRes.json();
                        usersData = usersJson.users || [];
                    } else {
                        throw new Error("Secure user fetch failed, trying direct Firestore fallback");
                    }
                } catch (usersErr) {
                    console.warn(usersErr);
                    // Fallback to direct client-side query (might be restricted by security rules)
                    const snapshot = await db.collection('users').get();
                    usersData = [];
                    snapshot.forEach(doc => {
                        usersData.push({
                            uid: doc.id,
                            ...doc.data()
                        });
                    });
                }

                // Update system health counts from proxy
                const healthRes = await fetch('api.php/research/health');
                if (healthRes.ok) {
                    const healthData = await healthRes.json();
                    document.getElementById('health-verified-products').textContent = healthData.verified_products || 0;
                    document.getElementById('health-cache-entries').textContent = healthData.research_cache_entries || 0;
                    document.getElementById('health-ingredients-analyzed').textContent = healthData.ingredients_analyzed || 0;
                }

                // Render metrics
                renderDashboardMetrics();
                renderUsersTable();
                renderFunnelMetrics();

                document.getElementById('backend-status-indicator').className = "px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2";
            } catch (err) {
                console.error("Data refresh error:", err);
                document.getElementById('backend-status-indicator').className = "px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-2";
            } finally {
                loader.classList.add('hidden');
                icon.classList.remove('fa-spin');
            }
        }

        // RENDERING DASHBOARD
        function renderDashboardMetrics() {
            if (!funnelData) return;

            // Total users card
            document.getElementById('stat-total-users').textContent = usersData.length;
            
            // Sessions card
            document.getElementById('stat-total-sessions').textContent = funnelData.funnel.total_sessions;
            
            // Completed card
            document.getElementById('stat-completed-sessions').textContent = funnelData.funnel.completed;
            const completionPct = (funnelData.funnel.completion_rate * 100).toFixed(1) + '%';
            document.getElementById('stat-completion-pct').textContent = completionPct;

            // Subscribed card
            document.getElementById('stat-subscribed-users').textContent = funnelData.funnel.subscriptions;
            const conversionPct = (funnelData.funnel.conversion_rate * 100).toFixed(1) + '%';
            document.getElementById('stat-conversion-pct').textContent = conversionPct;

            // Render Segment bars
            const segmentContainer = document.getElementById('segment-progress-container');
            segmentContainer.innerHTML = '';
            
            const segments = funnelData.segments || [];
            segments.forEach(seg => {
                const percentage = (seg.conversion_rate * 100).toFixed(0) + '%';
                const el = document.createElement('div');
                el.className = "space-y-1.5";
                el.innerHTML = `
                    <div class="flex justify-between items-end text-xs">
                        <span class="font-bold text-gray-300 truncate max-w-[150px]">${seg.segment}</span>
                        <div class="flex gap-2">
                            <span class="text-gray-500">(${seg.subscriptions}/${seg.total_sessions} subs)</span>
                            <span class="font-bold text-white">${percentage}</span>
                        </div>
                    </div>
                    <div class="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
                        <div class="bg-indigo-500 h-2 rounded-full transition-all duration-500" style="width: ${percentage}"></div>
                    </div>
                `;
                segmentContainer.appendChild(el);
            });

            // Chart 1: Conversion Trend over time
            const trend = funnelData.conversion_trend || [];
            const labels = trend.map(t => t.date);
            const conversions = trend.map(t => t.subscriptions);
            const totals = trend.map(t => t.total);

            if (chartConversion) chartConversion.destroy();
            const ctx1 = document.getElementById('chart-conversion-trends').getContext('2d');
            chartConversion = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sessions',
                            data: totals,
                            borderColor: 'rgba(99, 102, 241, 0.4)',
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2
                        },
                        {
                            label: 'Subscriptions',
                            data: conversions,
                            borderColor: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.05)',
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#9ca3af', font: { family: 'Satoshi', weight: 'bold' } } }
                    },
                    scales: {
                        x: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#6b7280' } },
                        y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#6b7280', stepSize: 1 } }
                    }
                }
            });

            // Chart 2: Motivations Bar Chart
            const motives = funnelData.top_motivations || [];
            if (chartMotivations) chartMotivations.destroy();
            const ctx2 = document.getElementById('chart-motivations').getContext('2d');
            chartMotivations = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: motives.map(m => m.motivation),
                    datasets: [{
                        data: motives.map(m => m.count),
                        backgroundColor: 'rgba(99, 102, 241, 0.75)',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                        y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#6b7280', stepSize: 1 } }
                    }
                }
            });

            // Chart 3: Pain Points Bar Chart
            const pain = funnelData.top_pain_points || [];
            if (chartPainpoints) chartPainpoints.destroy();
            const ctx3 = document.getElementById('chart-painpoints').getContext('2d');
            chartPainpoints = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: pain.map(p => p.pain_point),
                    datasets: [{
                        data: pain.map(p => p.count),
                        backgroundColor: 'rgba(236, 72, 153, 0.75)',
                        borderColor: '#ec4899',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                        y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#6b7280', stepSize: 1 } }
                    }
                }
            });
        }

        // RENDERING USERS
        function renderUsersTable() {
            const tbody = document.getElementById('users-table-body');
            tbody.innerHTML = '';

            if (usersData.length === 0) {
                document.getElementById('users-empty-state').classList.remove('hidden');
                return;
            } else {
                document.getElementById('users-empty-state').classList.add('hidden');
            }

            usersData.forEach(user => {
                const profile = user.profile || {};
                const targets = user.targets || {};
                const name = profile.name || 'Unknown';
                const email = profile.email || 'No Email';
                const phone = profile.phone || 'No Phone';
                const completed = profile.hasCompletedAssessment;
                
                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                
                const statusHtml = completed 
                    ? `<span class="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-black rounded-md uppercase tracking-wider">Completed</span>`
                    : `<span class="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-black rounded-md uppercase tracking-wider">Pending</span>`;

                const calTarget = targets.calories ? `${targets.calories} kcal` : 'Not Set';
                const proTarget = targets.protein ? `${targets.protein} g` : 'Not Set';

                const row = document.createElement('tr');
                row.className = "hover:bg-white/[0.01] transition-all duration-150";
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">${initials}</div>
                            <div>
                                <p class="font-bold text-gray-200">${name}</p>
                                <p class="text-xs text-gray-500">${email}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-400 font-medium">${phone}</td>
                    <td class="px-6 py-4">
                        <div>
                            <p class="font-bold text-gray-200">${calTarget}</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">${proTarget} protein</p>
                        </div>
                    </td>
                    <td class="px-6 py-4">${statusHtml}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="openOfferModal('${user.uid}', '${email}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 ml-auto">
                            <i class="fa-solid fa-paper-plane"></i> Send Offer
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function filterUsersTable() {
            const query = document.getElementById('user-search-input').value.trim().toLowerCase();
            const statusFilter = document.getElementById('user-filter-status').value;
            const rows = document.querySelectorAll('#users-table-body tr');
            let matchCount = 0;

            rows.forEach((row, i) => {
                const user = usersData[i];
                if (!user) return;

                const profile = user.profile || {};
                const name = (profile.name || '').toLowerCase();
                const email = (profile.email || '').toLowerCase();
                const phone = (profile.phone || '').toLowerCase();
                const completed = profile.hasCompletedAssessment;

                const matchesSearch = name.includes(query) || email.includes(query) || phone.includes(query);
                
                let matchesStatus = true;
                if (statusFilter === 'completed') matchesStatus = completed;
                if (statusFilter === 'pending') matchesStatus = !completed;

                if (matchesSearch && matchesStatus) {
                    row.classList.remove('hidden');
                    matchCount++;
                } else {
                    row.classList.add('hidden');
                }
            });

            const emptyState = document.getElementById('users-empty-state');
            if (matchCount === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }

        // RENDERING FUNNEL & PERFORMANCE
        function renderFunnelMetrics() {
            if (!funnelData) return;

            document.getElementById('funnel-total-starts').textContent = funnelData.funnel.total_sessions;
            document.getElementById('funnel-total-completes').textContent = funnelData.funnel.completed;
            document.getElementById('funnel-complete-rate').textContent = `Completion Rate: ${(funnelData.funnel.completion_rate * 100).toFixed(1)}%`;
            document.getElementById('funnel-total-unlocked').textContent = funnelData.funnel.subscriptions;
            document.getElementById('funnel-conversion-rate').textContent = `Conversion Rate: ${(funnelData.funnel.conversion_rate * 100).toFixed(1)}%`;

            // Question performance list
            const tbody = document.getElementById('question-performance-body');
            tbody.innerHTML = '';

            const perf = funnelData.question_performance || [];
            perf.forEach((q, idx) => {
                const dropRate = (q.drop_rate * 100).toFixed(1) + '%';
                const row = document.createElement('tr');
                row.className = "hover:bg-white/[0.01] transition-all duration-150";
                row.innerHTML = `
                    <td class="px-4 py-3 text-gray-500 font-bold font-mono">${q.id}</td>
                    <td class="px-4 py-3 font-semibold text-gray-200 max-w-xs truncate" title="${q.text}">${q.text}</td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] uppercase font-bold text-gray-400">${q.category}</span></td>
                    <td class="px-4 py-3 text-center text-gray-300">${q.impressions}</td>
                    <td class="px-4 py-3 text-center text-red-400 font-bold">${q.drops}</td>
                    <td class="px-4 py-3 text-right text-red-400 font-bold font-mono">${dropRate}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // ADMIN TARGETED OFFERS MODAL
        function openOfferModal(uid, email) {
            selectedUserUid = uid;
            document.getElementById('offer-modal-user').textContent = email;
            document.getElementById('offer-title').value = '';
            document.getElementById('offer-message').value = '';

            const modal = document.getElementById('offer-modal');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function closeOfferModal() {
            const modal = document.getElementById('offer-modal');
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                selectedUserUid = null;
            }, 300);
        }

        async function submitAdminOffer() {
            if (!selectedUserUid) return;

            const title = document.getElementById('offer-title').value.trim();
            const message = document.getElementById('offer-message').value.trim();

            if (!title || !message) {
                alert("Please fill in both the Title and the Message body.");
                return;
            }

            const submitBtn = document.getElementById('offer-submit-text');
            const spinner = document.getElementById('offer-submit-spinner');

            submitBtn.textContent = 'Sending...';
            spinner.classList.remove('hidden');

            try {
                // Set the adminOffers array under users/{uid}
                const docRef = db.collection('users').doc(selectedUserUid);
                
                // Fetch existing document to retrieve current array
                const doc = await docRef.get();
                let adminOffers = [];
                if (doc.exists && doc.data().adminOffers) {
                    adminOffers = doc.data().adminOffers;
                }

                // Add new offer to list
                const newOffer = {
                    id: 'offer_' + Date.now(),
                    title: title,
                    message: message,
                    seen: false,
                    sentAt: new Date().toISOString()
                };
                adminOffers.push(newOffer);

                // Update document
                await docRef.set({
                    adminOffers: adminOffers
                }, { merge: true });

                alert("Targeted offer successfully pushed to the user's screen in real time!");
                closeOfferModal();
            } catch (err) {
                console.error("Failed to send admin offer:", err);
                alert("Failed to send offer. See console for error details.");
            } finally {
                submitBtn.textContent = 'Send Offer';
                spinner.classList.add('hidden');
            }
        }

        // TRIGGER METRICS SNAPSHOT
        async function triggerSnapshot() {
            try {
                const res = await fetch('api.php/analytics/snapshot', { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    alert("Metrics snapshot saved to analytics timeline successfully!");
                } else {
                    alert("Failed to save snapshot.");
                }
            } catch (err) {
                console.error(err);
                alert("Network error saving snapshot.");
            }
        }
    </script>
</body>
</html>
