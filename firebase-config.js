// Mock Firebase Configuration for Election Assistant
// In a real production environment, include the Firebase SDK and initialize with actual credentials.

const MockFirebase = {
    isInitialized: false,
    
    init() {
        this.isInitialized = true;
        console.log("Firebase initialized for query logging.");
    },

    logQuery(query, intent, contextData) {
        if (!this.isInitialized) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            query: query,
            matchedIntent: intent,
            context: contextData
        };

        // Simulate network delay and save
        setTimeout(() => {
            console.log("📝 [Firebase Mock] Logged user query:", logEntry);
        }, 800);
    }
};

// Initialize on load
MockFirebase.init();
