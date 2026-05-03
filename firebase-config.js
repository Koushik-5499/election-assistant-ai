/**
 * Firebase Configuration & Analytics Layer
 * Election Process Assistant
 *
 * Integrates with Firebase Firestore for persistent query logging.
 * Falls back to localStorage when Firebase SDK is unavailable.
 */

const ElectionFirebase = (function () {
    'use strict';

    // ── Firebase project credentials ──
    const FIREBASE_CONFIG = {
        apiKey: 'AIzaSyDemoKeyForHackathon',
        authDomain: 'election-assistant-ai.firebaseapp.com',
        projectId: 'election-assistant-ai',
        storageBucket: 'election-assistant-ai.appspot.com',
        messagingSenderId: '000000000000',
        appId: '1:000000000000:web:0000000000000000'
    };

    // ── Internal state ──
    let _db = null;
    let _isFirebaseAvailable = false;
    const SESSION_ID = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
    const LOCAL_STORAGE_KEY = 'ea_query_logs';

    // ── Initialise ──
    function init() {
        try {
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                firebase.initializeApp(FIREBASE_CONFIG);
                _db = firebase.firestore();
                _isFirebaseAvailable = true;
                console.log('🔥 Firebase Firestore connected.');
            } else {
                _fallbackInit();
            }
        } catch (err) {
            console.warn('⚠️ Firebase init failed, using localStorage:', err.message);
            _fallbackInit();
        }
    }

    function _fallbackInit() {
        _isFirebaseAvailable = false;
        console.log('📦 Using localStorage for query logging (Firebase SDK not loaded).');
    }

    // ── Log a user query ──
    function logQuery(query, matchedIntent, confidence, contextData) {
        const entry = {
            timestamp: new Date().toISOString(),
            sessionId: SESSION_ID,
            query: _sanitize(query),
            intent: matchedIntent,
            confidence: confidence || 0,
            context: {
                step: contextData?.step || null,
                age: contextData?.age || null,
                state: contextData?.state || null,
                isFirstTime: contextData?.isFirstTime || null,
                language: localStorage.getItem('appLang') || 'en'
            }
        };

        if (_isFirebaseAvailable && _db) {
            _writeToFirestore(entry);
        } else {
            _writeToLocalStorage(entry);
        }
    }

    // ── Firestore write (async, non-blocking) ──
    async function _writeToFirestore(entry) {
        try {
            await _db.collection('user_queries').add(entry);
        } catch (err) {
            console.warn('Firestore write failed, saving locally:', err.message);
            _writeToLocalStorage(entry);
        }
    }

    // ── LocalStorage write ──
    function _writeToLocalStorage(entry) {
        try {
            const logs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            logs.push(entry);
            // Keep only the latest 200 entries to avoid storage overflow
            if (logs.length > 200) logs.splice(0, logs.length - 200);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
        } catch (_) {
            // Storage full or disabled — silently fail
        }
    }

    // ── Analytics helpers ──
    function getSessionId() {
        return SESSION_ID;
    }

    function getLocalLogs() {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }

    function getSessionStats() {
        const logs = getLocalLogs().filter(l => l.sessionId === SESSION_ID);
        return {
            totalQueries: logs.length,
            matchedQueries: logs.filter(l => l.intent !== 'fallback').length,
            unmatchedQueries: logs.filter(l => l.intent === 'fallback').length,
            avgConfidence: logs.length
                ? (logs.reduce((s, l) => s + (l.confidence || 0), 0) / logs.length).toFixed(2)
                : 0
        };
    }

    // ── Utility: basic sanitisation ──
    function _sanitize(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>"'&]/g, '').slice(0, 500);
    }

    // ── Public API ──
    return {
        init,
        logQuery,
        getSessionId,
        getLocalLogs,
        getSessionStats,
        get isConnected() { return _isFirebaseAvailable; }
    };
})();

// Auto-initialise on load
ElectionFirebase.init();
