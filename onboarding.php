<div id="landing-page" class="w-full sm:max-w-md mx-auto h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-black relative shadow-none sm:shadow-2xl dark:shadow-none border-x-0 sm:border-x border-gray-200 dark:border-gray-800/50 transition-colors duration-300 z-[50]">
    <div class="flex flex-col flex-1 justify-center py-6 sm:py-8 z-10">
        <!-- Brand Logo & Header -->
        <div class="text-center mb-8 mt-2">
            <img src="logo.png" class="w-24 h-24 object-contain mx-auto mb-4 select-none pointer-events-none rounded-full shadow-2xl border-2 border-white/20" alt="itspattern Logo">
            <h1 class="text-[3.5rem] sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 leading-none py-1">itspattern</h1>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                Your Health Operating System
            </p>
        </div>

        <!-- Custom Quote Slogan Card -->
        <div class="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/5 dark:to-violet-500/5 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl p-5 text-center mb-8 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <i class="fa-solid fa-quote-left text-indigo-500/10 absolute top-2 left-4 text-4xl"></i>
            <p class="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-300 dark:to-violet-300 leading-relaxed italic relative z-10 px-2">
                "Treat me to 1 coffee per month and I will provide you the best tool you ever needed."
            </p>
            <p class="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-2.5 relative z-10">— Ajay Kevat</p>
        </div>

        <!-- Segmented Control for Login / Signup Tab -->
        <div class="bg-gray-100 dark:bg-slate-900/80 border border-gray-200/50 dark:border-slate-800/50 p-1.5 rounded-2xl flex gap-1 mb-6 shadow-sm">
            <button onclick="setAuthTab('login')" id="tab-auth-login" class="flex-grow py-3 rounded-xl text-sm font-black text-center bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm transition-all spring-btn">Log In</button>
            <button onclick="setAuthTab('signup')" id="tab-auth-signup" class="flex-grow py-3 rounded-xl text-sm font-bold text-center text-gray-500 dark:text-gray-400 transition-all hover:text-gray-900 dark:hover:text-white spring-btn">Sign Up</button>
        </div>

        <!-- Google Sign-In Option -->
        <button onclick="signInWithGoogle()" class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-700 text-gray-800 dark:text-gray-200 font-bold py-4 px-4 rounded-2xl transition-all spring-btn shadow-sm flex items-center justify-center gap-3 text-sm">
            <svg class="w-[20px] h-[20px]" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg> 
            <span>Continue with Google</span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 py-5">
            <div class="flex-grow h-px bg-gray-200 dark:bg-slate-800"></div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">or credentials</span>
            <div class="flex-grow h-px bg-gray-200 dark:bg-slate-800"></div>
        </div>

        <!-- Error message container -->
        <div id="auth-error-msg" class="hidden mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400"></div>

        <!-- Email Form Inputs -->
        <div class="space-y-3.5">
            <div id="auth-signup-fields" class="hidden relative">
                <label for="auth-name" class="sr-only">Full Name</label>
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-user text-gray-400 dark:text-gray-500 text-sm"></i>
                </div>
                <input type="text" id="auth-name" placeholder="Full Name" class="w-full bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-11 pr-5 py-4 text-sm outline-none text-gray-900 dark:text-white transition-all backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500">
            </div>
            
            <div class="relative">
                <label for="auth-email" class="sr-only">Email Address</label>
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-envelope text-gray-400 dark:text-gray-500 text-sm"></i>
                </div>
                <input type="email" id="auth-email" placeholder="Email Address" class="w-full bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-11 pr-5 py-4 text-sm outline-none text-gray-900 dark:text-white transition-all backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500">
            </div>

            <div class="relative">
                <label for="auth-phone" class="sr-only">Phone Number</label>
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-phone text-gray-400 dark:text-gray-500 text-sm"></i>
                </div>
                <input type="tel" id="auth-phone" placeholder="Phone Number" class="w-full bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-11 pr-5 py-4 text-sm outline-none text-gray-900 dark:text-white transition-all backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500">
            </div>

            <div class="relative">
                <label for="auth-password" class="sr-only">Password</label>
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-lock text-gray-400 dark:text-gray-500 text-sm"></i>
                </div>
                <input type="password" id="auth-password" placeholder="Password" class="w-full bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-11 pr-5 py-4 text-sm outline-none text-gray-900 dark:text-white transition-all backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500">
            </div>
        </div>

        <!-- Terms Checklist -->
        <div class="flex items-start gap-3 mt-5 mb-4">
            <input type="checkbox" id="auth-terms" class="mt-0.5 w-5 h-5 text-[#ff6b00] bg-gray-100 border-gray-300 rounded focus:ring-[#ff6b00] cursor-pointer">
            <label for="auth-terms" class="text-xs leading-relaxed text-gray-500 dark:text-gray-400 select-none cursor-pointer">
                I accept the <button onclick="openLegalModal('terms'); event.preventDefault();" class="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">Terms of Service</button> and <button onclick="openLegalModal('privacy'); event.preventDefault();" class="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">Privacy Policy</button>.
            </label>
        </div>

        <!-- Action submit button -->
        <button onclick="submitAuth()" id="auth-submit-btn" class="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black py-5 px-4 rounded-2xl transition-all spring-btn shadow-lg shadow-blue-500/20 mt-2 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
            <span id="auth-submit-text">Log In</span>
            <i id="auth-submit-spinner" class="fa-solid fa-circle-notch fa-spin hidden"></i>
        </button>
    </div>

    <!-- Footer -->
    <div class="text-center py-4 z-10 border-t border-gray-200/20 dark:border-slate-800/20">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Developed and Created by <span class="font-extrabold text-gray-800 dark:text-white">AJAY KEVAT</span></span>
    </div>
</div>

    <!-- ===== ASSESSMENT WIZARD OVERLAY ===== -->
    <div id="assessment-overlay" class="fixed inset-0 z-[60] flowing-gradient-bg hidden items-center overflow-y-auto w-full max-w-full min-h-[100vh]">
        <div id="assessment-container" class="w-full max-w-md mx-auto my-auto py-8 px-4 relative flex flex-col"></div>
    </div>

