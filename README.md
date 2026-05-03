🚀 Election Process Assistant (AI-Powered)

An intelligent, dynamic web-based assistant designed to simplify the election process for users. This project helps citizens understand voting eligibility, required documents, polling booth locations, and live election results through an interactive AI chatbot interface.

🧠 Project Overview

The Election Process Assistant is built to solve a real-world problem — lack of awareness and accessibility in understanding elections.

Instead of static information, this system provides:

Conversational guidance
Context-aware responses
Real-time assistance
✨ Key Features
🤖 Smart Chatbot
Context-aware conversation flow
Understands user intent using keyword + pattern matching
Handles follow-up questions (age → eligibility → registration)
🗳️ Eligibility Checker
Checks voting eligibility based on age
Guides first-time voters with next steps
📄 Required Documents
Displays required & optional documents
Clear structured UI for easy understanding
📍 Polling Booth Finder
Uses browser geolocation
Displays nearest polling booth
Integrated Google Maps view
📊 Live Election Results
Simulated real-time results display
Direct link to official ECI results portal
🌐 Multi-language Support
English 🇬🇧
Hindi 🇮🇳
Tamil 🇮🇳
🎤 Voice Input
Speech-to-text interaction using Web Speech API
🧹 Clear Chat
Reset conversation instantly
Clears context and UI
🎨 Modern UI/UX
Glassmorphism design
Smooth animations
Fully responsive
🏗️ Tech Stack
Frontend: HTML, CSS, JavaScript
AI Logic: Prompt-based + rule-based NLP
Storage: Firebase (Mock for logging)
APIs Used:
Geolocation API
Google Maps Embed
Web Speech API
🧩 Project Structure
📁 election-assistant
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┣ 📄 script.js
 ┣ 📄 translations.js
 ┣ 📄 firebase-config.js
 ┗ 📄 README.md
⚙️ How It Works
User interacts via chat or quick action buttons
System detects intent using pattern matching
Maintains context (age, state, voter status)
Responds dynamically with structured UI
Logs user queries (Firebase mock)
🧪 Sample Use Cases
Input	Output
"Am I eligible to vote?"	Asks age → checks eligibility
"What documents do I need?"	Shows required documents
"Where is my polling booth?"	Detects location + shows map
"Live results"	Displays simulated results + official link
🔐 Security & Limitations
No personal voter data is stored
EPIC/Voter ID lookup is NOT implemented (privacy reasons)
Uses simulated data for demonstration
🚀 Deployment
🔗 Live Demo

https://election-assistant-ai.vercel.app/

💻 GitHub Repository

https://github.com/Koushik-5499/election-assistant-ai.git

📈 Future Improvements
Real-time election API integration
Advanced NLP (AI-based intent detection)
Firebase Firestore analytics
User personalization
Offline support (PWA)
Accessibility enhancements
🏆 Challenge Submission

Built for PromptWars (Google Antigravity)

Focus Areas:

Code Quality ✅
UI/UX ✅
Accessibility ✅
Google Services Integration ✅
Practical Use Case ✅
👨‍💻 Author

Koushik
CSE Student – Rathinam Technical Campus
