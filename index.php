<?php
/**
 * itspattern — Health Operating System
 * Converted from index.html for server-side PHP hosting
 */
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://accounts.google.com; style-src 'self' 'unsafe-inline' data: https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;");
header("X-Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data:;");
header("Access-Control-Allow-Origin: *");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$selected_og_image = 'og-image.png';
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth h-full w-full overflow-hidden fixed">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=0">
    <meta name="theme-color" content="#f8f9fa" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="itspattern">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="itspattern">
    <meta name="color-scheme" content="light dark">
    <meta name="format-detection" content="telephone=no">
    <link rel="manifest" href="manifest.json">
        <link rel="icon" type="image/png" href="favicon-cropped.png">
    <link rel="apple-touch-icon" href="favicon-cropped.png">
    <meta property="og:image" content="https://itspattern.lunaticmarbles.com/<?= $selected_og_image ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:title" content="itspattern | Your Personal AI Health & Diet Coach">
    <meta property="og:description" content="Unlock your true potential. Get real-time AI guidance on your macros, workouts, and daily habits. Start your transformation today!">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="itspattern | Your Personal AI Health & Diet Coach">
    <meta name="twitter:description" content="Unlock your true potential. Get real-time AI guidance on your macros, workouts, and daily habits. Start your transformation today!">
    <meta name="twitter:image" content="https://itspattern.lunaticmarbles.com/<?= $selected_og_image ?>">
    <title>itspattern — Your Health Operating System</title>
    <link rel="stylesheet" href="tailwind-v52.css?v=70">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js"></script>
    <link rel="stylesheet" href="styles-v57.css?v=71">
    <style>
        @media (max-width: 380px) {
            #google-fit-badge { --badge-scale: 0.75; }
            .fuel-mesh .flex-1 p.text-2xl { font-size: 1.25rem; }
            .fuel-mesh .flex-1 .text-sm { font-size: 0.75rem; }
            .fuel-mesh svg { width: 60px; height: 60px; }
            #fuel-ring-percent { font-size: 1rem; }
            .fuel-mesh { padding: 1rem !important; }
            .fuel-mesh .pr-10 { padding-right: 4rem; }
            .fuel-mesh .grid-cols-3 p.text-sm { font-size: 0.875rem; }
            .fuel-mesh .grid-cols-3 p.text-\[9px\] { font-size: 8px; }
        }
        @media (min-width: 421px) {
            #google-fit-badge { --badge-scale: 1; }
            .fuel-mesh .pr-10 { padding-right: 6rem; }
        }

        /* ===== AI REDESIGN CSS STYLE DEFINITIONS ===== */
        :root {
            --app-vh: 100vh;
            --app-kb: 0px;
        }

        .ai-chat-container {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: 0;
            overflow: hidden;
            position: relative;
            font-size: 0.875rem;
        }
        .ai-shell {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            position: relative;
            background: #f8f9fa;
        }
        :root.dark .ai-shell {
            background: #0a0a0f;
        }

        /* ===== Premium Header (Glassmorphism) ===== */
        .ai-header {
            position: absolute;
            top: 0; left: 0; right: 0;
            padding: 14px 16px calc(14px + env(safe-area-inset-top, 0px));
            padding-top: max(14px, env(safe-area-inset-top, 0px));
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 20;
            pointer-events: none;
            background: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom: none !important;
        }
        :root.dark .ai-header {
            background: none !important;
        }

        .ai-brand,
        .ai-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: auto;
            background: rgba(255, 255, 255, 0.75);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 18px -6px rgba(0, 0, 0, 0.1);
        }
        :root.dark .ai-brand,
        :root.dark .ai-actions {
            background: rgba(20, 20, 28, 0.65);
            border-color: rgba(255, 255, 255, 0.06);
        }

        .ai-brand {
            padding: 6px 14px 6px 6px;
            border-radius: 999px;
        }
        .ai-brand img {
            width: 28px; height: 28px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 1px solid rgba(255,255,255,0.4);
        }
        .ai-brand .brand-text { line-height: 1; }
        .ai-brand .brand-title {
            font-weight: 700;
            font-size: 0.8rem;
            color: #111827;
        }
        :root.dark .ai-brand .brand-title { color: #fff; }
        .ai-brand .brand-status {
            display: none !important;
        }
        .ai-brand .brand-status .dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 0 rgba(16,185,129,0.5);
            animation: aiPulse 1.8s infinite;
        }
        @keyframes aiPulse {
            0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
            70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
            100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }

        .ai-actions { padding: 6px; border-radius: 999px; }
        .ai-icon-btn {
            width: 30px; height: 30px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: #fff;
            color: #6b7280;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            transition: color .2s, transform .2s, background .2s;
            cursor: pointer;
        }
        .ai-icon-btn:active { transform: scale(0.92); }
        .ai-icon-btn.danger:hover { color: #f87171; background: #fef2f2; }
        :root.dark .ai-icon-btn.danger:hover { background: rgba(127,29,29,0.2); }
        .ai-icon-btn.close:hover { color: #111827; }
        :root.dark .ai-icon-btn { background: #1e1e24; color: #9ca3af; }
        :root.dark .ai-icon-btn.close:hover { color: #fff; }

        /* ===== Messages Area ===== */
        .ai-messages {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            padding: 88px 16px 140px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .ai-messages::-webkit-scrollbar { display: none; }
        .ai-messages { scrollbar-width: none; }

        /* Message bubbles */
        .ai-msg { display: flex; max-width: 100%; animation: msgIn .3s cubic-bezier(.2,.8,.2,1); }
        @keyframes msgIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .ai-msg.user { justify-content: flex-end; }
        .ai-msg.bot { justify-content: flex-start; }

        .ai-bubble {
            max-width: 82%;
            padding: 11px 15px;
            font-size: 13px;
            line-height: 1.55;
            border-radius: 20px;
            word-wrap: break-word;
        }
        .ai-bubble.user {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 14px -4px rgba(79,70,229,0.4);
        }
        .ai-bubble.bot {
            background: #fff;
            color: #1f2937;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06);
            border: 1px solid rgba(0,0,0,0.04);
        }
        :root.dark .ai-bubble.bot {
            background: #111118;
            color: #e5e7eb;
            border-color: rgba(255,255,255,0.04);
            box-shadow: none;
        }

        .ai-avatar {
            width: 28px; height: 28px; border-radius: 50%;
            object-fit: cover; margin-right: 8px; align-self: flex-start;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.2);
        }

        /* Typing indicator animation */
        .ai-typing { display: flex; gap: 4.5px; align-items: center; padding: 4px 2px; }
        .ai-typing span {
            width: 6.5px; height: 6.5px; border-radius: 50%;
            background: #9ca3af;
            animation: typBounce 1.4s infinite ease-in-out both;
        }
        .ai-typing span:nth-child(1) { animation-delay: -0.32s; }
        .ai-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* ===== Input Area ===== */
        .ai-input-zone {
            position: relative;
            flex-shrink: 0;
            padding: 8px 16px max(12px, env(safe-area-inset-bottom, 0px));
            background: transparent;
            border-top: none;
            width: 100%;
            z-index: 10;
        }
        :root.dark .ai-input-zone {
            background: transparent;
            border-top-color: transparent;
        }

        .ai-suggestions {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
        }
        .ai-suggestions::-webkit-scrollbar { display: none; }
        .ai-chip {
            white-space: nowrap;
            flex-shrink: 0;
            font-size: 11px;
            font-weight: 600;
            padding: 7px 13px;
            border-radius: 999px;
            background: #fff;
            color: #4f46e5;
            border: 1px solid rgba(99,102,241,0.15);
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            cursor: pointer;
            transition: background .2s, transform .15s;
        }
        .ai-chip:active { transform: scale(0.95); }
        .ai-chip:hover { background: #f5f7ff; }
        :root.dark .ai-chip {
            background: #111118; color: #a5b4fc;
            border-color: rgba(99,102,241,0.2);
        }
        :root.dark .ai-chip:hover { background: #161622; }

        .ai-input-wrap {
            position: relative;
            display: flex;
            align-items: center;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 9999px;
            overflow: hidden;
            mask-image: linear-gradient(to right, black, black);
            -webkit-mask-image: linear-gradient(to right, black, black);
            box-shadow: 0 2px 10px -2px rgba(0,0,0,0.04);
            transition: border-color .2s, box-shadow .2s;
        }
        .ai-input-wrap:focus-within {
            border-color: #818cf8;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        :root.dark .ai-input-wrap {
            background: #111118; border-color: #27272f;
        }
        .ai-input {
            flex: 1;
            background: transparent !important;
            border: none;
            outline: none;
            padding: 13px 8px 13px 18px;
            font-size: 14px;
            color: #111827;
        }
        .ai-input::placeholder { color: #9ca3af; }
        :root.dark .ai-input { color: #fff; }

        .ai-send-btn {
            width: 36px; height: 36px;
            margin-right: 5px;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            border: none;
            box-shadow: 0 3px 10px -2px rgba(79,70,229,0.4);
            transition: transform .15s, opacity .2s;
            cursor: pointer;
        }
        .ai-send-btn:active { transform: scale(0.9); }
        .ai-send-btn:disabled { opacity: 0.4; cursor: default; }

        /* ===== Flowing 3D Gradient ===== */
        .flowing-gradient-bg {
            background: linear-gradient(-45deg, #ffffff, #e0e7ff, #ede9fe, #ffffff);
            background-size: 400% 400%;
            animation: gradientFlow 15s ease infinite;
        }
        html.dark .flowing-gradient-bg {
            background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a);
            background-size: 400% 400%;
        }
        @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(to right, #4f46e5, #9333ea);
        }
    </style>
</head>
<body class="bg-[#f8f9fa] dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 h-full w-full overflow-hidden fixed flex flex-col antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
<!-- Skip to main content for screen readers -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-indigo-500 focus:text-white focus:px-6 focus:py-4 focus:rounded-xl focus:font-bold focus:text-sm focus:shadow-xl">Skip to main content</a>

<!-- ===== LANDING / AUTHENTICATION PAGE ===== -->
<?php include 'onboarding.php'; ?>
<div class="app-container flex-1 flex flex-col min-h-0 w-full sm:max-w-md mx-auto h-full overflow-hidden relative shadow-none sm:shadow-2xl dark:shadow-none border-x-0 sm:border-x border-gray-200 dark:border-gray-800/50 bg-[#f8f9fa] dark:bg-[#0a0a0f] transition-colors duration-300 hidden">

<!-- ===== HEADER: Identity Bar ===== -->
<header class="flex justify-between items-center px-5 py-4 bg-white/90 dark:bg-[#111118]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800/50 shadow-sm" role="banner">
        <div class="flex items-center gap-3">
            <div class="relative cursor-pointer" onclick="switchTab('settings')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')switchTab('settings')">
                <div class="w-12 h-12 rounded-full bg-gray-900 dark:bg-indigo-600 flex items-center justify-center text-white font-bold text-sm relative overflow-hidden" aria-label="User avatar" style="min-width:48px;min-height:48px">
                    <span id="header-avatar-letter">M</span>
                    <img id="header-avatar-img" class="w-full h-full object-cover hidden" src="" alt="Profile">
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white" aria-hidden="true"></div>
            </div>
            <div class="leading-tight">
                <span class="text-2xl logo-text text-gray-900 dark:text-white cursor-pointer" onclick="switchTab('home')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')switchTab('home')">itspattern</span>
                <div class="flex items-center gap-1.5 mt-0.5" id="header-level-badge">
                    <span class="text-[9px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-md border border-indigo-400/30">Lv.1</span>
                    <span class="text-[9px] text-gray-400">Beginner</span>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="switchTab('inventory')" class="bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all spring-btn flex items-center gap-1.5 shadow-sm" aria-label="Open inventory">
                <i class="fa-solid fa-box text-[10px]"></i> <span class="header-inventory-text">Inventory</span>
            </button>
            <button onclick="switchTab('notifications')" class="relative w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors spring-btn" aria-label="View notifications" style="min-width:48px;min-height:48px">
                <i class="fa-regular fa-bell text-sm"></i>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" id="notif-dot" aria-hidden="true"></span>
            </button>
        </div>
    </header>

    <main class="flex-1 px-4 pt-4 pb-28 overflow-y-auto" id="main-content" role="main" style="-webkit-overflow-scrolling: touch;">

        <!-- ===== SCREEN: HOME ===== -->
        <div id="screen-home" class="screen-transition space-y-4">

            <!-- Greeting + Date + Google Fit Badges -->
            <div class="flex justify-between items-center w-full float-in" style="animation-delay: 0.05s">
                <div>
                    <p class="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase" id="home-greeting">Good Morning</p>
                    <p class="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight" id="home-date-label">Thursday, June 12</p>
                </div>
            </div>

            <!-- Fuel Budget Ring Card -->
            <!-- Fuel Cards Container -->
            <div class="space-y-4 float-in">
                <!-- Fuel Budget Card -->
                <div class="fuel-mesh p-6 flex flex-col justify-between relative overflow-hidden" style="animation-delay: 0.1s; border-radius: 28px; min-height: 180px;">
                    <div class="absolute bottom-5 left-6 text-white/35 text-xs font-mono font-semibold tracking-widest z-10 pointer-events-none select-none">//</div>
                    
                    <!-- Upper Row: Progress Ring and Kcal Budget -->
                    <div class="flex items-center gap-5 z-10 w-full relative">
                        <div class="relative flex-shrink-0">
                            <svg width="80" height="80" viewBox="0 0 100 100" class="-rotate-90">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1b4b" stroke-width="8" stroke-opacity="0.7"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" id="fuel-ring" stroke-dasharray="263.89" stroke-dashoffset="224.31" class="ring-progress" style="filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-xl font-black tracking-tight text-white drop-shadow-md" id="fuel-ring-percent">15%</span>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 pr-10">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fa-solid fa-fire text-white/90 text-[10px]"></i>
                                <p class="text-[10px] font-bold text-white/90 uppercase tracking-[0.12em]">Fuel Budget</p>
                            </div>
                            <p class="text-2xl font-black text-white tracking-tight leading-none mb-2">
                                <span id="fuel-current">320</span><span class="text-sm font-medium text-white/70"> / <span id="fuel-goal-display">2200</span> kcal</span>
                            </p>
                            
                            <!-- Consumed Cost -->
                            <div class="flex items-center gap-1">
                                <p class="text-[8px] font-bold text-white/60 uppercase tracking-widest">Consumed:</p>
                                <p class="text-[10px] font-black text-emerald-300" id="consumed-cost-display">₹0.00</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lower Row: Macros Row -->
                    <div class="grid grid-cols-3 gap-1 mt-4 pt-4 border-t border-white/20 z-10 w-full relative">
                        <div class="flex flex-col items-center text-center">
                            <p class="text-[9px] font-semibold text-white/90 uppercase tracking-wide leading-tight mb-0.5">Muscle Builder</p>
                            <p class="text-[7px] text-indigo-200/70 uppercase tracking-widest mb-1">(Protein)</p>
                            <p class="text-sm font-black text-white drop-shadow-sm"><span id="p-curr">25</span><span class="text-[9px] text-white/70 ml-0.5">g</span></p>
                        </div>
                        <div class="flex flex-col items-center text-center">
                            <p class="text-[9px] font-semibold text-amber-100 uppercase tracking-wide leading-tight mb-0.5">Energy Source</p>
                            <p class="text-[7px] text-amber-200/50 uppercase tracking-widest mb-1">(Carbs)</p>
                            <p class="text-sm font-black text-amber-300 drop-shadow-sm"><span id="c-curr">30</span><span class="text-[9px] text-amber-200/70 ml-0.5">g</span></p>
                        </div>
                        <div class="flex flex-col items-center text-center">
                            <p class="text-[9px] font-semibold text-sky-100 uppercase tracking-wide leading-tight mb-0.5">Essential Fuel</p>
                            <p class="text-[7px] text-sky-200/50 uppercase tracking-widest mb-1">(Fat)</p>
                            <p class="text-sm font-black text-sky-300 drop-shadow-sm"><span id="f-curr">12</span><span class="text-[9px] text-sky-200/70 ml-0.5">g</span></p>
                        </div>
                    </div>
                </div>

                <!-- Google Fit Card -->
                <div class="fuel-mesh p-6 flex flex-col justify-between relative overflow-hidden" id="google-fit-badge" style="animation-delay: 0.12s; border-radius: 28px; min-height: 150px;">
                    <div class="absolute bottom-5 left-6 text-white/35 text-xs font-mono font-semibold tracking-widest z-10 pointer-events-none select-none">//</div>
                    
                    <div class="flex items-center justify-between z-10 w-full relative">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 flex items-center justify-center">
                                <svg style="width:1.5rem; height:1.5rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
                                    <path fill="#EA4335" d="M100.6 261.4l19.3 19.3 41.6-41.5-19.1-19.3-8.7-8.7c-7-7-10.7-16-10.7-25.9 0-8.6 2.9-16.4 7.9-22.5 6.8-8.6 17.2-14.1 28.8-14.1 9.9 0 19 3.9 26.1 10.9l8.6 8.2 19.3 19.4 41.8-41.5-19.4-19.3-8.7-8.4c-17.4-17.3-41.3-28-67.7-28C106.8 90 64 132.8 64 185.4c0 13.1 2.6 25.6 7.5 37.1s11.8 21.7 20.6 30.3l8.6 8.6"></path>
                                    <path fill="#FBBC04" d="m255.5 228.8-41.8-41.6-93.8 93.5 41.6 41.6z"></path>
                                    <path fill="#34A853" d="m255.3 414-93.8-91.7 41.7-41.5 52.1 52 93.8-93.6 41.8 41.5Z"></path>
                                    <path fill="#4285F4" d="M418.7 252.8c19.4-19.5 30.6-49.3 27.5-79.4-4.6-45.7-42.5-80-88.5-83.1-29-1.9-55.6 8.9-74.3 27.7l-69.7 69.2 41.5 41.5 69.7-69.3c8.4-8.3 20.1-12.1 32.1-10.2 15.6 2.4 28.2 15.2 30.3 30.8 1.7 11.7-2.2 23-10.5 31.3l-27.7 27.9 41.8 41.5 27.7-27.9Z"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-white/90 uppercase tracking-[0.12em]">Google Fit Activity</p>
                                <p class="text-xl font-black text-white tracking-tight leading-tight mt-0.5">Real-time sync</p>
                            </div>
                        </div>
                        <button onclick="fetchGoogleFitData()" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all spring-btn" id="gfit-resync-btn" title="Resync Google Fit">
                            <i class="fa-solid fa-rotate" id="gfit-resync-icon"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-3 gap-1 mt-4 pt-4 border-t border-white/20 z-10 w-full relative">
                        <div class="flex flex-col items-center text-center">
                            <i class="fa-solid fa-person-walking text-white/85 text-[10px] mb-1"></i>
                            <p class="text-[9px] font-semibold text-white/90 uppercase tracking-wide mb-0.5">Distance</p>
                            <p class="text-sm font-black text-white"><span id="fit-walk-val">0.0</span><span class="text-[9px] text-white/70 ml-0.5">km</span></p>
                        </div>
                        <div class="flex flex-col items-center text-center">
                            <i class="fa-solid fa-fire text-white/85 text-[10px] mb-1"></i>
                            <p class="text-[9px] font-semibold text-white/90 uppercase tracking-wide mb-0.5">Calories</p>
                            <p class="text-sm font-black text-white"><span id="fit-burned-val">0</span><span class="text-[9px] text-white/70 ml-0.5">kcal</span></p>
                        </div>
                        <div class="flex flex-col items-center text-center">
                            <i class="fa-solid fa-calculator text-white/85 text-[10px] mb-1"></i>
                            <p class="text-[9px] font-semibold text-white/90 uppercase tracking-wide mb-0.5">Deficit</p>
                            <p class="text-sm font-black text-white" id="fit-deficit-val">...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Daily Schedule Checkmarks -->
            <div id="home-schedule-card" class="glass-card p-4 float-in hidden" style="animation-delay: 0.13s">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-regular fa-calendar-check text-indigo-500 text-[10px]"></i>
                        <span class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Today's Schedule</span>
                    </div>
                    <button onclick="toggleDailyScheduleModal(true)" class="text-[9px] font-semibold text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/30 px-2 py-1 rounded-lg transition-all spring-btn flex items-center gap-1">
                        <i class="fa-solid fa-plus text-[7px]"></i> Add
                    </button>
                </div>
                <div id="home-schedule-list" class="flex flex-wrap gap-2 mb-3"></div>
                <div id="schedule-meal-plan" class="text-[10px] text-gray-500 dark:text-gray-400 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg p-2.5 border border-indigo-100 dark:border-indigo-800/30 leading-relaxed hidden"></div>
            </div>

            <!-- Streak + XP Row -->
            <div class="grid grid-cols-2 gap-3 float-in" style="animation-delay: 0.15s">
                <div class="glass-card p-4 flex items-center gap-3 card-hover cursor-pointer" onclick="viewStreakDetails()">
                    <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center streak-flame">
                        <i class="fa-solid fa-fire text-orange-500 text-lg"></i>
                    </div>
                    <div>
                        <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Streak</p>
                        <p class="text-lg font-black text-gray-900 dark:text-white" id="streak-count">0 <span class="text-xs font-normal text-gray-400 dark:text-gray-500">days</span></p>
                        <p class="text-[8px] text-gray-400 dark:text-gray-500" id="streak-label">Start your journey</p>
                    </div>
                </div>
                <div class="glass-card p-4 flex items-center gap-3 card-hover">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <i class="fa-solid fa-bolt text-indigo-500 text-lg"></i>
                    </div>
                    <div>
                        <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">XP Earned</p>
                        <p class="text-lg font-black text-gray-900 dark:text-white" id="xp-total">0 <span class="text-xs font-normal text-gray-400 dark:text-gray-500">XP</span></p>
                        <div class="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div class="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-700" id="xp-bar" style="width:0%"></div></div>
                    </div>
                </div>
            </div>

            <!-- Daily Insight Card -->
            <div class="glass-card p-4 float-in ring-glow" style="animation-delay: 0.2s">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="fa-solid fa-lightbulb text-amber-500 text-sm"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Today's Insight</p>
                        <p class="text-xs leading-relaxed text-gray-600 dark:text-gray-300" id="daily-insight-text">Loading your personalized insight...</p>
                        <button class="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 mt-2 transition-colors" onclick="switchTab('ai')">Ask Coach <i class="fa-solid fa-arrow-right text-[8px] ml-1"></i></button>
                    </div>
                </div>
            </div>

            <!-- Daily Challenge Card -->
            <div class="glass-card p-4 float-in" style="animation-delay: 0.25s" id="daily-challenge-card">
                <div class="flex items-center justify-between">
                    <div class="flex items-start gap-3 flex-1">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i class="fa-solid fa-bullseye text-indigo-500 text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Daily Challenge</p>
                            <p class="text-xs leading-relaxed text-gray-600 dark:text-gray-300" id="daily-challenge-text">Drink 2 liters of water today</p>
                            <p class="text-[10px] font-bold text-indigo-500 mt-1.5" id="daily-challenge-xp">+10 XP</p>
                        </div>
                    </div>
                    <button onclick="completeDailyChallenge()" id="challenge-complete-btn" class="flex-shrink-0 w-10 h-10 rounded-full border-2 border-indigo-300 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all spring-btn">
                        <i class="fa-solid fa-check text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Recent Fuel Log Preview -->
            <div class="float-in" style="animation-delay: 0.3s">
                <div class="flex justify-between items-center mb-2.5">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Fuel Log</p>
                    <button onclick="switchTab('tasks')" class="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View All <i class="fa-solid fa-arrow-right text-[8px] ml-1"></i></button>
                </div>
                <div id="home-fuel-log-preview" class="space-y-2"></div>
            </div>

        </div>

        <!-- ===== SCREEN: FUEL LOG (TASKS) ===== -->
        <div id="screen-tasks" class="screen-transition hidden space-y-4">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold tracking-tight dark:text-white">Fuel Log</h2>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">Every entry builds your journey</p>
                </div>
                <button onclick="toggleAddTaskModal(true)" class="bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all spring-btn">
                    <i class="fa-solid fa-plus text-[10px]"></i> Log Fuel
                </button>
            </div>
            <!-- AI Sparkle Hint -->
            <div class="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl p-3 flex gap-2.5 items-start">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-500 text-xs mt-0.5 animate-pulse"></i>
                <p class="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                    <strong>AI Hint</strong>: Tap the <strong class="text-indigo-600 dark:text-indigo-400 font-bold">AI</strong> button on any meal to tell the coach your specific scenario (e.g. leftover, bloating). It will adjust the macros dynamically!
                </p>
            </div>
            <div class="bg-gray-100 p-1 rounded-xl border border-gray-200 flex gap-1">
                <button onclick="filterTasks('all')" id="filter-all" class="flex-1 py-2 rounded-lg text-xs font-bold text-center bg-white transition-all text-gray-700">All</button>
                <button onclick="filterTasks('active')" id="filter-active" class="flex-1 py-2 rounded-lg text-xs font-bold text-center text-gray-400 transition-all">Planned</button>
                <button onclick="filterTasks('completed')" id="filter-completed" class="flex-1 py-2 rounded-lg text-xs font-bold text-center text-gray-400 transition-all">Logged</button>
            </div>
            <div id="tasks-list-full" class="space-y-2 max-h-[420px] overflow-y-auto pr-1"></div>
        </div>

        <!-- ===== SCREEN: AI COACH ===== -->
        <div id="screen-ai" class="screen-transition hidden flex-col h-full -mx-4 -mt-4 w-[calc(100%+32px)] overflow-hidden bg-[#f8f9fa] dark:bg-[#0a0a0f]" style="display:none; touch-action:manipulation;">
            <div id="ai-chat-container" class="flex-1 flex flex-col min-h-0 w-full h-full overflow-hidden text-sm relative"></div>
        </div>


        <!-- ===== SCREEN: PROGRESS ===== -->
        <div id="screen-stats" class="screen-transition hidden space-y-4">
            <div>
                              <div class="flex justify-between items-center mb-2 w-full">
                  <h2 class="text-lg font-bold tracking-tight dark:text-white">Your Journey</h2>
                  <button onclick="toggleNutrientsModal(true)" class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-[10px] font-bold spring-btn flex items-center gap-1 shadow-sm">
                      <i class="fa-solid fa-vial"></i> Nutrients
                  </button>
              </div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Progress over perfection</p>
            </div>

            <!-- Level Card -->
            <div class="glass-card p-5 text-center space-y-3 card-hover">
                <div class="w-14 h-14 rounded-full level-badge flex items-center justify-center mx-auto">
                    <span class="text-indigo-500 font-black text-lg" id="level-number">1</span>
                </div>
                <div>
                    <h3 class="font-bold text-sm text-gray-900 dark:text-white" id="level-title">Beginner</h3>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5" id="level-next">50 XP to Consistency Builder</p>
                    <div class="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-700" id="level-xp-bar" style="width:0%"></div>
                    </div>
                    <p class="text-[9px] text-gray-400 mt-1" id="level-xp-text">0 / 50 XP</p>
                </div>
            </div>

            <!-- Achievements -->
            <div class="glass-card p-4 space-y-3">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Milestones Unlocked</p>
                <div id="achievements-grid" class="grid grid-cols-2 gap-2"></div>
            </div>

            <!-- Weekly Overview -->
            <div class="glass-card p-4">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Weekly Fuel Budget Progress</p>
                <div class="h-40 flex flex-col justify-end">
                    <div class="flex justify-between items-end h-full gap-2 pt-2" id="progress-bar-chart"></div>
                    <div class="flex justify-between text-[9px] text-gray-400 mt-2 font-bold px-1">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                </div>
            </div>

            <!-- BMI / BMR History Card -->
            <div class="glass-card p-4">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metrics History</p>
                    <div class="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
                        <button onclick="toggleMetricsHistoryTab('bmi')" id="btn-metrics-bmi" class="px-2.5 py-1 rounded-md text-[9px] font-bold transition-all bg-white dark:bg-gray-900 text-indigo-500 dark:text-white shadow-sm">BMI</button>
                        <button onclick="toggleMetricsHistoryTab('bmr')" id="btn-metrics-bmr" class="px-2.5 py-1 rounded-md text-[9px] font-bold transition-all text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">BMR</button>
                    </div>
                </div>
                <div id="metrics-history-chart-container" class="h-32 flex flex-col justify-center relative">
                    <!-- Dynamic SVG will be injected here -->
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
                <div class="glass-card p-4">
                    <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Total Fuel Entries</p>
                    <p class="text-xl font-extrabold text-gray-900 dark:text-white mt-1" id="stat-total-tasks">0</p>
                </div>
                <div class="glass-card p-4">
                    <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Avg Daily Fuel</p>
                    <p class="text-xl font-extrabold text-gray-600 dark:text-gray-300 mt-1" id="stat-completion-rate">0 kcal</p>
                </div>
                <div class="glass-card p-4">
                    <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Current Streak</p>
                    <p class="text-xl font-extrabold text-gray-600 dark:text-gray-300 mt-1" id="stat-streak">0 days</p>
                </div>
                <div class="glass-card p-4">
                    <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Member Since</p>
                    <p class="text-xl font-extrabold text-gray-900 dark:text-white mt-1" id="stat-join-date">Today</p>
                </div>
            </div>
        </div>

        <!-- ===== SCREEN: COMMUNITY ===== -->
        <div id="screen-more" class="screen-transition hidden space-y-4">
            <div>
                <h2 class="text-lg font-bold tracking-tight dark:text-white">Community</h2>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">You're part of something bigger</p>
            </div>
            <!-- AI Sparkle Hint -->
            <div class="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl p-3 flex gap-2.5 items-start">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-500 text-xs mt-0.5"></i>
                <p class="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                    <strong>AI Hint</strong>: Consistency pays off! Logging meals keeps your daily streak alive and helps you rise on the Leaderboard. Unlock exclusive badges as you log.
                </p>
            </div>

            <!-- Leaderboard Widget -->
            <div class="glass-card p-4 space-y-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <i class="fa-solid fa-trophy text-amber-500 text-sm"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leaderboard</p>
                        </div>
                    </div>
                    <button onclick="fetchLeaderboard()" class="text-[9px] font-semibold text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg transition-all spring-btn flex items-center gap-1"><i class="fa-solid fa-arrows-rotate text-[7px]"></i> Refresh</button>
                </div>
                <div id="leaderboard-list" class="max-h-[280px] overflow-y-auto">
                    <p class="text-[10px] text-gray-400 text-center py-4">Tap refresh to load leaderboard</p>
                </div>
            </div>

            <!-- Personal Badges -->
            <div class="glass-card p-4 space-y-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <i class="fa-solid fa-medal text-indigo-500 text-sm"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Badges</p>
                        </div>
                    </div>
                    <button onclick="fetchBadges()" class="text-[9px] font-semibold text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg transition-all spring-btn flex items-center gap-1"><i class="fa-solid fa-arrows-rotate text-[7px]"></i> Refresh</button>
                </div>
                <div id="badges-list" class="space-y-2">
                    <p class="text-[10px] text-gray-400 text-center py-4">Tap refresh to load your badges</p>
                </div>
            </div>

            <!-- Transformation Stories -->
            <div class="glass-card p-5 space-y-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <i class="fa-solid fa-people-group text-indigo-500"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm dark:text-white">Transformation Stories</h3>
                        <p class="text-[10px] text-gray-400">Real journeys from real members</p>
                    </div>
                </div>
                <div class="h-px bg-white/[0.04]"></div>
                <div class="space-y-3">
                    <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p class="text-[11px] italic text-gray-500">"90 days with itspattern. Down 8kg. My relationship with food has completely changed."</p>
                        <p class="text-[9px] font-bold text-gray-400 mt-2">— Anonymous Member, 90 Day Titan</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p class="text-[11px] italic text-gray-500">"The AI coach called me out on my late-night snacking pattern. Game changer."</p>
                        <p class="text-[9px] font-bold text-gray-400 mt-2">— Anonymous Member, 60 Day Warrior</p>
                    </div>
                </div>
            </div>

            <div class="glass-card p-4 space-y-3">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">About itspattern</p>
                <p class="text-xs leading-relaxed text-gray-500">A science-driven health companion platform. We combine AI intelligence with behavioral science to help you build lasting habits. No fads. No guilt. Just progress.</p>
                <div class="flex gap-4 text-xs font-semibold text-indigo-500">
                    
                </div>
            </div>
        </div>

        <!-- ===== SCREEN: INVENTORY ===== -->
        <div id="screen-inventory" class="screen-transition hidden space-y-4">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold tracking-tight dark:text-white">Your Pantry</h2>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">Quick-log from your grocery stock</p>
                </div>
                <button onclick="toggleAddInventoryModal(true)" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all spring-btn">
                    <i class="fa-solid fa-plus text-[9px]"></i> Add Item
                </button>
            </div>
            <!-- AI Sparkle Hint -->
            <div class="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl p-3 flex gap-2.5 items-start">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-500 text-xs mt-0.5"></i>
                <p class="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                    <strong>AI Hint</strong>: Keep your Pantry stocked with staples. During chat, the AI Coach will reference these items to build a custom meal plan matching your budget.
                </p>
            </div>
            <div class="space-y-2.5 max-h-[440px] overflow-y-auto pr-1" id="inventory-list">
                <!-- Dynamically rendered -->
            </div>
        </div>

        <!-- ===== SCREEN: SETTINGS ===== -->
        <div id="screen-settings" class="screen-transition hidden space-y-4">
            <div>
                <h2 class="text-lg font-bold tracking-tight dark:text-white">Your Identity</h2>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Personalize your health OS</p>
            </div>
            <!-- AI Sparkle Hint -->
            <div class="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl p-3 flex gap-2.5 items-start">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-500 text-xs mt-0.5"></i>
                <p class="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                    <strong>AI Hint</strong>: Choose a Journey Type to fine-tune your coach recommendations. Athlete mode ups your proteins, while Vegetarian/Vegan restricts meat suggestions.
                </p>
            </div>

            <div class="glass-card p-5 space-y-4">
                <div class="flex items-center gap-4 pb-4 border-b border-white/[0.04]">
                    <div class="w-12 h-12 rounded-full bg-gray-900 dark:bg-indigo-600 flex items-center justify-center text-white font-bold text-lg relative overflow-hidden">
                        <span id="settings-avatar-letter">M</span>
                        <img id="settings-avatar-img" class="w-full h-full object-cover hidden" src="" alt="Profile">
                    </div>
                    <div class="flex-1">
                        <span id="member-name-display" class="block text-sm font-bold text-gray-900 dark:text-white">Member</span>
                        <p class="text-[9px] text-gray-400 mt-1">Member since <span id="member-since-display">Today</span></p>
                    </div>
                </div>

                <div class="flex justify-between items-center bg-gray-50/50 dark:bg-black/35 p-4 rounded-2xl">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                            <i class="fa-solid fa-heart-pulse text-white dark:text-gray-900"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-gray-900 dark:text-white">Health Assessment</p>
                            <p class="text-[10px] text-gray-400 dark:text-gray-500">BMI, BMR & body metrics</p>
                        </div>
                    </div>
                    <button onclick="toggleHealthAssessmentModal(true)" class="bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl px-4 py-2.5 text-[10px] font-bold transition-all spring-btn">Start</button>
                </div>

                <div class="space-y-2">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Your Journey Type</p>
                    <div class="grid grid-cols-3 gap-1.5" id="persona-selector">
                        <button onclick="setPersona('athlete')" id="persona-athlete" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Athlete</button>
                        <button onclick="setPersona('professional')" id="persona-professional" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Professional</button>
                        <button onclick="setPersona('student')" id="persona-student" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Student</button>
                        <button onclick="setPersona('parent')" id="persona-parent" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Parent</button>
                        <button onclick="setPersona('vegetarian')" id="persona-vegetarian" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Vegetarian</button>
                        <button onclick="setPersona('vegan')" id="persona-vegan" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Vegan</button>
                        <button onclick="setPersona('flexitarian')" id="persona-flexitarian" class="py-2.5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">Flexitarian</button>
                    </div>
                </div>

                <div class="space-y-2 pt-2">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Dietary Identity</p>
                    <div class="flex flex-wrap gap-1.5" id="diet-tags"></div>
                </div>

                <div class="pt-4 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">App Settings</p>
                    <div class="flex justify-between items-center py-2">
                        <div>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                            <p class="text-[10px] text-gray-400 dark:text-gray-500">Switch to dark theme</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" id="toggle-darkmode" onchange="toggleDarkMode()">
                            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                    </div>
                </div>

                <button onclick="logoutUser()" id="logout-btn" class="w-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-3 rounded-xl transition-all mt-4 spring-btn flex items-center justify-center gap-2 shadow-sm">
                    <i class="fa-solid fa-right-from-bracket text-[10px]"></i> Sign Out
                </button>
                <button onclick="resetApp()" class="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold py-2.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-trash-can text-[10px]"></i> Reset All Data
                </button>
            </div>
        </div>

        <!-- ===== SCREEN: NOTIFICATIONS ===== -->
        <div id="screen-notifications" class="screen-transition hidden space-y-4">
            <div>
                <h2 class="text-lg font-bold tracking-tight dark:text-white">Updates</h2>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">System alerts and milestones</p>
            </div>
            <div class="space-y-2.5">
                <div class="glass-card p-4 flex gap-3 items-start">
                    <div class="p-2 rounded-lg bg-indigo-100 text-indigo-500 flex-shrink-0"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div>
                        <h4 class="font-bold text-xs text-gray-900 dark:text-white">Fuel Budget Gap Detected</h4>
                        <p class="text-[10px] text-gray-400 mt-1">You're 500 kcal under your target. Consider a protein-rich snack.</p>
                        <span class="text-[8px] text-gray-400 font-semibold block mt-1.5">10 mins ago</span>
                    </div>
                </div>
                <div class="glass-card p-4 flex gap-3 items-start">
                    <div class="p-2 rounded-lg bg-emerald-100 text-emerald-500 flex-shrink-0"><i class="fa-regular fa-calendar-check"></i></div>
                    <div>
                        <h4 class="font-bold text-xs text-gray-900 dark:text-white">Tomorrow's Meal Plan Ready</h4>
                        <p class="text-[10px] text-gray-400 mt-1">Your AI coach has prepared your meal plan for tomorrow. Review it to see if you need to make any changes or grocery runs.</p>
                        <button onclick="switchTab('tasks')" class="text-[9px] font-bold text-emerald-500 hover:text-emerald-600 mt-2">View Plan</button>
                    </div>
                </div>
            </div>
        </div>
        </div>

    </main>

    <!-- ===== BOTTOM NAVIGATION ===== -->
    <nav id="main-nav" class="bg-black/95 backdrop-blur-xl fixed bottom-0 left-0 right-0 mx-auto w-full sm:max-w-md rounded-t-3xl z-40 border-t border-gray-800 pb-safe hidden">
        <div class="flex justify-around items-center h-20 relative px-2">
            <button onclick="switchTab('home')" id="nav-home" class="flex flex-col items-center justify-center w-16 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200">
                <i class="fa-solid fa-house text-lg mb-1"></i>
                <span class="text-[9px] font-bold tracking-wider">Home</span>
            </button>
            <button onclick="switchTab('tasks')" id="nav-tasks" class="flex flex-col items-center justify-center w-16 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200">
                <i class="fa-solid fa-bowl-food text-lg mb-1"></i>
                <span class="text-[9px] font-bold tracking-wider">Fuel</span>
            </button>
            <button onclick="switchTab('ai')" id="nav-ai" class="w-[68px] h-[68px] shrink-0 min-w-[68px] min-h-[68px] aspect-square bg-black border-3 border-blue-500/30 rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer text-white overflow-hidden" style="width: 68px; height: 68px;">
                <img src="logo.png" alt="AI" class="w-full h-full object-cover rounded-full" style="transform: scale(1.15);">
            </button>
            <button onclick="switchTab('stats')" id="nav-stats" class="flex flex-col items-center justify-center w-16 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200">
                <i class="fa-solid fa-chart-line text-lg mb-1"></i>
                <span class="text-[9px] font-bold tracking-wider">Progress</span>
            </button>
            <button onclick="switchTab('more')" id="nav-more" class="flex flex-col items-center justify-center w-16 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200">
                <i class="fa-solid fa-users text-lg mb-1"></i>
                <span class="text-[9px] font-bold tracking-wider">Community</span>
            </button>
        </div>
        <div id="footer-credit" class="text-center text-[8px] text-gray-500 pb-1 mt-1 font-medium tracking-widest uppercase">Developed and Created by <span class="font-extrabold text-gray-800 dark:text-white">AJAY KEVAT</span></div>
    </nav>

    <!-- ===== ADD FUEL MODAL ===== -->
    <div id="add-task-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4" role="dialog" aria-modal="true" aria-label="Log fuel entry">
        <div class="glass-card-raised w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-base dark:text-white">Log Fuel Entry</h3>
                <button onclick="toggleAddTaskModal(false)" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal" style="min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="space-y-3 text-xs">
                <div>
                    <label class="text-[10px] font-bold text-gray-500 block">Food Name</label>
                    <input type="text" id="modal-task-title" list="fuel-datalist" oninput="autocompleteFood(this.value, 'fuel-datalist'); debounceFoodMacros(this.value, 'fuel')" placeholder="e.g. Scrambled Eggs &amp; Toast" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-400 mt-1 text-gray-900 placeholder-gray-400">
                    <datalist id="fuel-datalist"></datalist>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-500 block">Time</label>
                    <input type="text" id="modal-task-time" placeholder="08:30 AM" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-400 mt-1 text-gray-900 placeholder-gray-400">
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2">
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Fuel (kcal)</label><input type="number" id="modal-task-cal" placeholder="300" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Muscle (g)</label><input type="number" id="modal-task-p" placeholder="25" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Energy (g)</label><input type="number" id="modal-task-c" placeholder="30" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Essential (g)</label><input type="number" id="modal-task-f" placeholder="8" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                </div>
            </div>
            <div class="flex gap-2 pt-2">
                <button onclick="toggleAddTaskModal(false)" class="flex-1 border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold transition-all text-gray-600">Cancel</button>
                <button onclick="saveNewTask()" class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all spring-btn">Log Entry</button>
            </div>
            <button onclick="toggleAddTaskModal(false); toggleResearchModal(true, document.getElementById('modal-task-title').value || 'Food item', 'fuel')" class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 rounded-xl text-[10px] transition-all spring-btn flex items-center justify-center gap-1.5 mt-1">
                <i class="fa-solid fa-microscope text-[9px]"></i> 🔬 Deep Research
            </button>
        </div>
    </div>

    <!-- ===== CELEBRATION OVERLAY ===== -->
    <div id="celebration-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center hidden p-6">
        <div class="text-center space-y-4 max-w-xs animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center mx-auto animate-[celebratePulse_2s_ease-in-out_infinite]">
                <i class="fa-solid fa-trophy text-2xl text-white"></i>
            </div>
            <h2 class="text-xl font-black" id="celebration-title">Milestone Reached!</h2>
            <p class="text-sm text-gray-400 leading-relaxed" id="celebration-message"></p>
            <button onclick="dismissCelebration()" class="bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all spring-btn mt-4">Continue</button>
        </div>
    </div>

    <!-- ===== ADD INVENTORY ITEM MODAL ===== -->
    <div id="add-inventory-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
        <div class="glass-card-raised w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-base dark:text-white">Add to Pantry</h3>
                <button onclick="toggleAddInventoryModal(false)" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            
            <!-- Link & Scan Options -->
            <div class="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100/50 dark:border-indigo-800/20 space-y-2.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>AI Assistant Import</span>
                </div>
                
                <!-- Import URL -->
                <div class="flex gap-2">
                    <input type="text" id="inv-link" placeholder="Paste product link (Amazon, shop, etc.)" class="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-[10px] outline-none focus:border-indigo-400 text-gray-900 dark:text-white placeholder-gray-400">
                    <button onclick="extractLinkDetails()" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1">
                        <i class="fa-solid fa-link"></i> Import
                    </button>
                </div>
                
                <!-- Scan Label -->
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[9px] text-gray-400 leading-normal">Or upload ingredient list / label photo:</span>
                    <button onclick="document.getElementById('inv-scan-file').click()" class="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1.5">
                        <i class="fa-solid fa-camera"></i> Scan Photo
                    </button>
                    <input type="file" accept="image/*" id="inv-scan-file" class="hidden" onchange="scanIngredientsLabel(this)">
                </div>

                <!-- Status indicator -->
                <div id="inv-ai-status" class="text-[9px] text-indigo-500 dark:text-indigo-400 hidden animate-pulse font-medium"></div>
            </div>

            <div class="space-y-3 text-xs">
                <div>
                    <label class="text-[10px] font-bold text-gray-500 block">Item Name</label>
                    <input type="text" id="inv-name" list="inv-name-datalist" oninput="autocompleteFood(this.value, 'inv-name-datalist'); debounceFoodMacros(this.value, 'inventory')" placeholder="e.g. Chicken Breast" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-400 mt-1 text-gray-900 placeholder-gray-400">
                    <datalist id="inv-name-datalist"></datalist>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-500 block">Amount (remaining)</label>
                    <input type="text" id="inv-amount" placeholder="e.g. 500g, 2 cups, 3 servings" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-400 mt-1 text-gray-900 placeholder-gray-400">
                </div>
                <div class="text-[10px] font-bold text-gray-500 block">Per Serving Macros</div>
                <div class="grid grid-cols-4 gap-2">
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Serving</label><input type="text" id="inv-serving" placeholder="e.g. 100g, 1 scoop" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Fuel</label><input type="number" id="inv-cal" placeholder="120" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Muscle</label><input type="number" id="inv-p" placeholder="24" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Energy</label><input type="number" id="inv-c" placeholder="2" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                    <div><label class="text-[8px] font-bold text-gray-400 block mb-1">Essential</label><input type="number" id="inv-f" placeholder="1.5" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center text-xs outline-none text-gray-900"></div>
                </div>
            </div>
            <div class="flex gap-2 pt-2">
                <button onclick="toggleAddInventoryModal(false)" class="flex-1 border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold transition-all text-gray-600">Cancel</button>
                <button id="btn-save-inventory" onclick="saveInventoryItem()" class="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all spring-btn">Add to Pantry</button>
            </div>
            <button onclick="toggleAddInventoryModal(false); toggleResearchModal(true, document.getElementById('inv-name').value || 'Product', 'pantry')" class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 rounded-xl text-[10px] transition-all spring-btn flex items-center justify-center gap-1.5 mt-1">
                <i class="fa-solid fa-microscope text-[9px]"></i> 🔬 Deep Research
            </button>
        </div>
    </div>

    <!-- ===== LOG INVENTORY MODAL ===== -->
    <div id="log-inventory-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
        <div class="glass-card-raised w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-base dark:text-white">Log Portion</h3>
                <button onclick="toggleLogInventoryModal(false)" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="space-y-3 text-xs">
                <div>
                    <p id="log-inv-name-display" class="font-bold text-sm text-gray-900 dark:text-white"></p>
                    <p id="log-inv-remain-display" class="text-[10px] text-gray-500"></p>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-500 block">Portion Size Consumed (grams)</label>
                    <input type="number" id="log-inv-portion" placeholder="e.g. 150" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-400 mt-1 text-gray-900 placeholder-gray-400" oninput="previewLogMacros()">
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div class="text-center"><span class="block text-[8px] font-bold text-gray-400 uppercase">kcal</span><span id="log-preview-cal" class="font-bold text-[10px] text-gray-900">0</span></div>
                    <div class="text-center"><span class="block text-[8px] font-bold text-gray-400 uppercase">Pro</span><span id="log-preview-p" class="font-bold text-[10px] text-indigo-500">0g</span></div>
                    <div class="text-center"><span class="block text-[8px] font-bold text-gray-400 uppercase">Carb</span><span id="log-preview-c" class="font-bold text-[10px] text-amber-500">0g</span></div>
                    <div class="text-center"><span class="block text-[8px] font-bold text-gray-400 uppercase">Fat</span><span id="log-preview-f" class="font-bold text-[10px] text-rose-500">0g</span></div>
                </div>
            </div>
            <button id="btn-confirm-log" onclick="confirmLogInventory()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all spring-btn text-xs mt-2 flex items-center justify-center gap-2">
                <i class="fa-solid fa-utensils"></i> Log & Deduct
            </button>
        </div>
    </div>

<!-- ===== DEEP RESEARCH MODAL ===== -->
    <div id="research-modal" class="fixed inset-0 bg-black/70 backdrop-blur-md z-[55] flex items-center justify-center hidden p-4">
        <div class="glass-card-raised w-full max-w-sm rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <i class="fa-solid fa-microscope text-white text-sm"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm dark:text-white">Deep Research</h3>
                        <p class="text-[8px] font-bold text-purple-500 uppercase tracking-wider">Multi-Agent Analysis</p>
                    </div>
                </div>
                <button onclick="toggleResearchModal(false)" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-xl p-2.5">
                <p class="text-[9px] text-purple-600 font-semibold">Researching: <span id="research-item-name" class="font-bold">Item</span></p>
            </div>
            <input type="hidden" id="research-context" value="pantry">
            <div class="flex gap-2">
                <input type="text" id="research-input" placeholder="Enter product or food to research..." class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-purple-400 text-gray-900 placeholder-gray-400">
                <button onclick="runDeepResearch()" class="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all spring-btn flex-shrink-0 flex items-center gap-1">
                    <i class="fa-solid fa-flask text-[9px]"></i> Research
                </button>
            </div>
            <div id="research-results" class="text-xs"></div>
        </div>
    </div>

    <!-- ===== DAILY SCHEDULE MODAL ===== -->
    <div id="daily-schedule-modal" class="fixed inset-0 z-50 hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity opacity-0">
        <div id="daily-schedule-modal-content" class="bg-white dark:bg-[#111118] rounded-t-3xl p-6 shadow-2xl transform translate-y-full transition-transform duration-300">
            <div class="flex justify-between items-center mb-5">
                <div>
                    <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Daily Schedule</h2>
                    <p class="text-xs text-gray-500 mt-1">Manage your routines</p>
                </div>
                <button onclick="toggleDailyScheduleModal(false)" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center gap-1.5 flex-wrap">
                    <input type="text" id="schedule-input" placeholder="Name (e.g. Office, Gym)..." class="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400 text-gray-900 dark:text-white placeholder-gray-400" onkeydown="if(event.key==='Enter') addSchedule()">
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                    <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1.5">
                        <label class="text-[9px] font-bold text-gray-400 uppercase">In</label>
                        <input type="time" id="schedule-in" value="09:00" class="bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300 w-[65px]">
                    </div>
                    <select id="schedule-duration" class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400 text-gray-700 dark:text-gray-300" onchange="autoCalcOutTime()">
                        <option value="custom">Custom</option>
                        <option value="2">2 hrs</option>
                        <option value="4" selected>4 hrs</option>
                        <option value="6">6 hrs</option>
                        <option value="8">8 hrs</option>
                    </select>
                    <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1.5">
                        <label class="text-[9px] font-bold text-gray-400 uppercase">Out</label>
                        <input type="time" id="schedule-out" value="17:00" class="bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300 w-[65px]">
                    </div>
                    <button onclick="addSchedule()" class="bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all spring-btn flex-shrink-0">Add</button>
                </div>
                <div id="schedule-list" class="space-y-1.5 max-h-[300px] overflow-y-auto"></div>
            </div>
        </div>
    </div>

    <!-- ===== HEALTH ASSESSMENT MODAL ===== -->
    <div id="health-assessment-modal" class="fixed inset-0 z-50 hidden flex flex-col bg-white dark:bg-[#0a0a0f] transition-opacity opacity-0">
        <div class="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div>
                <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Health Assessment</h2>
            </div>
            <button onclick="toggleHealthAssessmentModal(false)" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-6">
            <p class="text-sm text-gray-500 dark:text-gray-400">Complete your body metrics so your AI Coach can calculate your BMI, BMR, and perfectly tailor your daily fuel budget.</p>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Age</label>
                    <input type="number" id="assess-age" placeholder="e.g. 28" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 text-gray-900 dark:text-white" oninput="calculateBodyMetrics()">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gender</label>
                    <select id="assess-gender" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 text-gray-900 dark:text-white" onchange="calculateBodyMetrics()">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Weight (kg)</label>
                    <input type="number" id="assess-weight" placeholder="e.g. 70" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 text-gray-900 dark:text-white" oninput="calculateBodyMetrics()">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Height (cm)</label>
                    <input type="number" id="assess-height" placeholder="e.g. 175" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 text-gray-900 dark:text-white" oninput="calculateBodyMetrics()">
                </div>
            </div>

            <!-- Live Metrics Result -->
            <div id="assess-metrics-card" class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-5 hidden transition-all duration-300 my-8 mx-2 shadow-sm">
                <div class="grid grid-cols-2 gap-4 divide-x divide-indigo-200 dark:divide-indigo-800">
                    <div class="text-center">
                        <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Your BMI</p>
                        <p class="text-3xl font-black text-indigo-600 dark:text-indigo-400" id="assess-bmi-val">--</p>
                        <p class="text-[9px] text-indigo-500 dark:text-indigo-300 mt-1 font-bold" id="assess-bmi-label">--</p>
                    </div>
                    <div class="text-center">
                        <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Your BMR</p>
                        <p class="text-3xl font-black text-indigo-600 dark:text-indigo-400"><span id="assess-bmr-val">--</span></p>
                        <p class="text-[9px] text-indigo-500 dark:text-indigo-300 mt-1 font-bold">kcal/day</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="p-5 border-t border-gray-200 dark:border-gray-800 pb-safe bg-white dark:bg-[#0a0a0f] space-y-2">
            <button onclick="saveHealthAssessment()" id="save-assessment-btn" class="w-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 font-bold py-3.5 px-4 rounded-xl transition-all spring-btn shadow-sm" disabled>
                <i class="fa-solid fa-check mr-2"></i> Save Metrics & Sync
            </button>
            <button onclick="toggleHealthAssessmentModal(false); startAssessment()" class="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-all spring-btn shadow-sm flex items-center justify-center gap-2">
                <i class="fa-solid fa-clipboard-list text-gray-400"></i> Take Full Assessment
            </button>
        </div>
    </div>

    <script src="app-v56.js?v=85" defer></script>
    <script src="onboarding.js?v=76" defer></script>



    </div>


    <!-- ===== LEGAL MODAL ===== -->
    <div id="legal-modal" class="fixed inset-0 z-[60] hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity opacity-0">
        <div id="legal-modal-content" class="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl transform translate-y-full transition-transform duration-300 max-h-[85vh] flex flex-col">
            <div class="flex justify-between items-center mb-5 shrink-0">
                <h3 class="text-xl font-black text-gray-900 dark:text-white tracking-tight" id="legal-title">Legal</h3>
                <button onclick="closeLegalModal()" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors spring-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="legal-body" class="overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-4 pr-2">
            </div>
            <div class="shrink-0 pt-4 mt-auto">
                <button onclick="closeLegalModal()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-all spring-btn shadow-md shadow-indigo-500/20">I Understand</button>
            </div>
            <div class="pb-safe mt-4"></div>
        </div>
    </div>


    <!-- ===== FEEDBACK MODAL ===== -->
    <div id="feedback-modal" class="fixed inset-0 z-[70] hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity opacity-0">
        <div id="feedback-modal-content" class="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl transform translate-y-full transition-transform duration-300">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-black text-gray-900 dark:text-white">Send Feedback</h3>
                <button onclick="toggleFeedbackModal(false)" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-colors spring-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <textarea id="feedback-text" rows="4" placeholder="Your suggestion, idea, or bug report..." class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 resize-none"></textarea>
            <div id="feedback-success" class="hidden text-green-500 text-xs font-bold mt-2 text-center"></div>
            <button onclick="submitFeedback()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-md spring-btn">Send to AI Coach</button>
            <div class="pb-safe mt-4"></div>
        </div>
    </div>


    <!-- Early Adopter Welcome Modal -->
    <div id="ajay-welcome-modal" class="fixed inset-0 z-[80] hidden flex flex-col justify-center items-center bg-black/80 backdrop-blur-md transition-opacity opacity-0 px-6">
        <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl transform scale-95 transition-transform duration-300 relative text-center border border-indigo-100 dark:border-indigo-900/30">
            <div class="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                <i class="fa-solid fa-crown text-3xl text-white"></i>
            </div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Welcome, Pioneer!</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Thank you for being an early user of Itspattern. You are part of an exclusive group helping us shape the future of health operating systems.
            </p>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest">- Ajay Kevat</p>
            <button onclick="closeAjayWelcome()" class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl shadow-xl transition-all spring-btn">
                Let's Begin
            </button>
        </div>
    </div>

    <!-- Detailed Nutrients Modal -->
    <div id="nutrients-modal" class="fixed inset-0 z-[75] hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity opacity-0">
        <div class="bg-white dark:bg-slate-900 w-full rounded-t-[32px] p-6 shadow-2xl transform translate-y-full transition-transform duration-300 relative border-t border-gray-100 dark:border-slate-800">
            <div class="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white mb-6">Micro-Nutrients <span class="text-sm font-medium text-gray-400">(Today)</span></h2>
            
            <div class="grid grid-cols-2 gap-3 mb-6" id="nutrients-grid">
                <!-- Injected via JS -->
            </div>
            <button onclick="toggleNutrientsModal(false)" class="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl transition-colors spring-btn">Close</button>
        </div>
    </div>

    <!-- Admin Offer Modal -->
    <div id="admin-offer-modal" class="fixed inset-0 z-[100] hidden flex flex-col justify-center items-center bg-black/80 backdrop-blur-md transition-opacity opacity-0 px-6">
        <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl transform scale-95 transition-transform duration-300 relative text-center border border-purple-100 dark:border-purple-900/30 overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none"></div>
            <div class="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                <i class="fa-solid fa-gift text-2xl text-white"></i>
            </div>
            <h2 id="admin-offer-title" class="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Special Offer</h2>
            <p id="admin-offer-message" class="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">You have a new offer.</p>
            <button onclick="acceptAdminOffer()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 transition-all spring-btn mb-3">
                Claim Now
            </button>
            <button onclick="dismissAdminOffer()" class="w-full bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold py-2 rounded-xl transition-colors text-xs">
                Maybe Later
            </button>
        </div>
    </div>

</body>
</html>
