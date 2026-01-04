// User Session and Authentication Management
// Supports multiple user accounts with isolated settings

const AuthManager = {
    currentUser: null,
    users: new Map(),
    
    // Initialize - load existing users and check for active session
    init() {
        if (this._initialized) {
            return; // Already initialized
        }
        
        this.loadUsers();
        this.restoreSession();
        this.applyUserSettings();
        this._initialized = true;
    },
    
    // Generate unique user ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Hash password (simple hash for demo - in production use proper hashing)
    hashPassword(password) {
        // Simple hash - in production, use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },
    
    // Create a new user account
    createAccount(email, password) {
        const emailNormalized = email.toLowerCase().trim();
        
        // Check if user already exists
        if (this.users.has(emailNormalized)) {
            throw new Error('An account with this email already exists.');
        }
        
        const userId = this.generateUserId();
        const hashedPassword = this.hashPassword(password);
        
        const user = {
            id: userId,
            email: emailNormalized,
            passwordHash: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        this.users.set(emailNormalized, user);
        this.saveUsers();
        this.createDefaultSettings(userId);
        
        return user;
    },
    
    // Authenticate user
    authenticate(email, password) {
        const emailNormalized = email.toLowerCase().trim();
        const user = this.users.get(emailNormalized);
        
        if (!user) {
            throw new Error('Incorrect email or password.');
        }
        
        const hashedPassword = this.hashPassword(password);
        if (user.passwordHash !== hashedPassword) {
            throw new Error('Incorrect email or password.');
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.users.set(emailNormalized, user);
        this.saveUsers();
        
        // Create session
        this.createSession(user);
        
        return user;
    },
    
    // Create session
    createSession(user) {
        const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.currentUser = {
            id: user.id,
            email: user.email,
            sessionToken: sessionToken,
            loginTime: new Date().toISOString()
        };
        
        // Save session to localStorage
        localStorage.setItem('apush_session', JSON.stringify(this.currentUser));
        
        // Load and apply user settings
        this.loadUserSettings(user.id);
        this.applyUserSettings();
        
        // Load user progress (creates default if none exists)
        this.loadUserProgress();
    },
    
    // Restore session from localStorage
    restoreSession() {
        try {
            const sessionData = localStorage.getItem('apush_session');
            if (sessionData) {
                this.currentUser = JSON.parse(sessionData);
                this.loadUserSettings(this.currentUser.id);
                this.applyUserSettings();
                // Restore user progress
                this.loadUserProgress();
                return true;
            }
        } catch (e) {
            console.error('Failed to restore session:', e);
            this.logout();
        }
        return false;
    },
    
    // Logout
    logout() {
        // Clear session
        localStorage.removeItem('apush_session');
        this.currentUser = null;
        
        // Reset to default settings
        this.resetToDefaults();
        
        // Clear in-memory user data
        this.clearUserData();
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    },
    
    // Clear in-memory user data (but keep saved settings and progress)
    clearUserData() {
        // Clear any user-specific cached data in memory
        // Note: Progress is kept in localStorage with user-specific keys
        // Settings are also kept with user-specific keys
    },
    
    // Get progress key for current user
    getProgressKey(userId = null) {
        const targetUserId = userId || (this.currentUser ? this.currentUser.id : null);
        if (targetUserId) {
            return `user_${targetUserId}_progress`;
        }
        return 'userProgress'; // Fallback to global key
    },
    
    // Load user progress (called on login)
    loadUserProgress() {
        if (!this.currentUser) {
            return null;
        }
        
        const progressKey = this.getProgressKey();
        try {
            const progressData = localStorage.getItem(progressKey);
            if (progressData) {
                return JSON.parse(progressData);
            }
            
            // Check for old global progress and migrate it
            const oldProgressKey = 'userProgress';
            const oldProgressData = localStorage.getItem(oldProgressKey);
            if (oldProgressData) {
                try {
                    const oldProgress = JSON.parse(oldProgressData);
                    // Migrate old progress to user-specific key
                    localStorage.setItem(progressKey, JSON.stringify(oldProgress));
                    // Optionally remove old key (commented out to preserve data)
                    // localStorage.removeItem(oldProgressKey);
                    return oldProgress;
                } catch (e) {
                    console.error('Failed to migrate old progress:', e);
                }
            }
        } catch (e) {
            console.error('Failed to load user progress:', e);
        }
        
        // Return default progress structure
        return {
            periods: {},
            skills: {},
            practiceQuestions: 0,
            studyHours: 0,
            activities: []
        };
    },
    
    // Clear progress for current user (optional - for account deletion)
    clearUserProgress(userId = null) {
        const targetUserId = userId || (this.currentUser ? this.currentUser.id : null);
        if (targetUserId) {
            const progressKey = this.getProgressKey(targetUserId);
            localStorage.removeItem(progressKey);
        }
    },
    
    // Reset UI to defaults
    resetToDefaults() {
        // Reset theme to system default
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
        
        // Reset motion preference
        document.documentElement.removeAttribute('data-reduced-motion');
        localStorage.removeItem('reducedMotion');
    },
    
    // Load users from localStorage
    loadUsers() {
        try {
            const usersData = localStorage.getItem('apush_users');
            if (usersData) {
                const usersArray = JSON.parse(usersData);
                this.users = new Map(usersArray);
            }
        } catch (e) {
            console.error('Failed to load users:', e);
            this.users = new Map();
        }
    },
    
    // Save users to localStorage
    saveUsers() {
        try {
            const usersArray = Array.from(this.users.entries());
            localStorage.setItem('apush_users', JSON.stringify(usersArray));
        } catch (e) {
            console.error('Failed to save users:', e);
        }
    },
    
    // Create default settings for a new user
    createDefaultSettings(userId) {
        const defaultSettings = {
            theme: 'light',
            reducedMotion: false,
            fontSize: 'medium',
            highContrast: false,
            saveHistory: true,
            personalizedRecommendations: true,
            lastLogin: new Date().toISOString()
        };
        
        this.saveUserSettings(userId, defaultSettings);
    },
    
    // Get settings key for a user
    getSettingsKey(userId) {
        return `user_${userId}_settings`;
    },
    
    // Load user settings
    loadUserSettings(userId) {
        try {
            const settingsKey = this.getSettingsKey(userId);
            const settingsData = localStorage.getItem(settingsKey);
            
            if (settingsData) {
                return JSON.parse(settingsData);
            } else {
                // Create default settings if none exist
                this.createDefaultSettings(userId);
                return this.loadUserSettings(userId);
            }
        } catch (e) {
            console.error('Failed to load user settings:', e);
            return null;
        }
    },
    
    // Save user settings
    saveUserSettings(userId, settings) {
        try {
            const settingsKey = this.getSettingsKey(userId);
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save user settings:', e);
        }
    },
    
    // Get current user settings
    getCurrentUserSettings() {
        if (!this.currentUser) {
            return null;
        }
        return this.loadUserSettings(this.currentUser.id);
    },
    
    // Update a setting for current user
    updateSetting(key, value) {
        if (!this.currentUser) {
            return;
        }
        
        const settings = this.loadUserSettings(this.currentUser.id);
        settings[key] = value;
        this.saveUserSettings(this.currentUser.id, settings);
        this.applyUserSettings();
    },
    
    // Apply user settings to UI
    applyUserSettings() {
        if (!this.currentUser) {
            return;
        }
        
        const settings = this.loadUserSettings(this.currentUser.id);
        if (!settings) {
            return;
        }
        
        // Apply theme
        if (settings.theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', settings.theme || 'light');
        }
        
        // Apply reduced motion
        if (settings.reducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        } else {
            document.documentElement.removeAttribute('data-reduced-motion');
        }
        
        // Apply font size
        if (settings.fontSize) {
            document.documentElement.setAttribute('data-font-size', settings.fontSize);
        }
        
        // Apply high contrast
        if (settings.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        } else {
            document.documentElement.removeAttribute('data-high-contrast');
        }
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Require authentication (redirect to login if not authenticated)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Change password
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('No user logged in.');
        }
        
        const emailNormalized = this.currentUser.email;
        const user = this.users.get(emailNormalized);
        
        if (!user) {
            throw new Error('User not found.');
        }
        
        const oldHash = this.hashPassword(oldPassword);
        if (user.passwordHash !== oldHash) {
            throw new Error('Current password is incorrect.');
        }
        
        user.passwordHash = this.hashPassword(newPassword);
        this.users.set(emailNormalized, user);
        this.saveUsers();
    },
    
    // Get user info (email, last login, etc.)
    getUserInfo() {
        if (!this.currentUser) {
            return null;
        }
        
        const emailNormalized = this.currentUser.email;
        const user = this.users.get(emailNormalized);
        const settings = this.loadUserSettings(this.currentUser.id);
        
        return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            lastLogin: user?.lastLogin || null,
            createdAt: user?.createdAt || null,
            settings: settings
        };
    }
};

// Make AuthManager available globally immediately
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
    
    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        AuthManager.init();
        
        // Update navigation based on auth state
        updateNavigation();
    });
}

// Function to update navigation (called from script.js)
function updateNavigation() {
    const isAuthenticated = AuthManager.isAuthenticated();
    const navMenus = document.querySelectorAll('.nav-menu');
    const navControls = document.querySelectorAll('.nav-controls');
    
    navMenus.forEach(menu => {
        // Remove existing auth links
        const existingAuthLinks = menu.querySelectorAll('.nav-auth-link');
        existingAuthLinks.forEach(link => link.remove());
        
        if (isAuthenticated) {
            // Add Settings link
            const settingsLi = document.createElement('li');
            settingsLi.innerHTML = '<a href="settings.html" class="nav-link nav-auth-link">Settings</a>';
            menu.appendChild(settingsLi);
            
            // Add Logout link
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = '<a href="#" class="nav-link nav-auth-link" id="logout-link">Logout</a>';
            menu.appendChild(logoutLi);
            
            // Add logout handler
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    AuthManager.logout();
                });
            }
        } else {
            // Add Login link
            const loginLi = document.createElement('li');
            loginLi.innerHTML = '<a href="login.html" class="nav-link nav-auth-link">Login</a>';
            menu.appendChild(loginLi);
        }
    });
}
