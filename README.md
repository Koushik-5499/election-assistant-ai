# 🚀 Election Process Assistant (AI-Powered)

An intelligent, dynamic web-based assistant designed to simplify the election process for users. This project helps citizens understand voting eligibility, required documents, polling booth locations, and live election results through an interactive AI chatbot interface.

---

## 🧠 Project Overview

The Election Process Assistant solves a real-world problem — lack of awareness about elections.

Instead of static content, this system provides:
- Conversational guidance  
- Context-aware responses  
- Interactive user experience  

---

## ✨ Key Features

### 🤖 Smart Chatbot
- Context-aware conversation flow  
- Handles follow-up questions  
- Intent-based responses  

### 🗳️ Eligibility Checker
- Checks if user is eligible to vote  
- Guides first-time voters  

### 📄 Required Documents
- Displays required and optional documents  
- Clean structured output  

### 📍 Polling Booth Finder
- Uses browser geolocation  
- Shows nearest booth with Google Maps  

### 📊 Live Election Results
- Simulated real-time results  
- Includes official ECI results link  

### 🌐 Multi-language Support
- English  
- Hindi  
- Tamil  

### 🎤 Voice Input
- Speech-to-text using Web Speech API  

### 🧹 Clear Chat
- Instantly resets conversation  

### 🎨 Modern UI
- Glassmorphism design  
- Responsive layout  
- Smooth animations  

---

## 🏗️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **AI Logic:** Prompt-based + rule-based NLP  
- **Storage:** Firebase (Mock)  

### APIs Used:
- Geolocation API  
- Google Maps Embed  
- Web Speech API  

---

## 📁 Project Structure
election-assistant/
│
├── index.html
├── style.css
├── script.js
├── translations.js
├── firebase-config.js
└── README.md

---

## ⚙️ How It Works

1. User enters query or clicks quick action  
2. System detects intent using pattern matching  
3. Maintains conversation context (age, state, voter status)  
4. Generates structured response  
5. Logs user query (Firebase mock)  

---

## 🧪 Sample Inputs & Outputs

| Input | Output |
|------|--------|
| Am I eligible to vote? | Asks age → checks eligibility |
| What documents do I need? | Shows required documents |
| Where is my polling booth? | Shows map + booth |
| Show live results | Displays results + official link |

---

## 🔐 Security & Limitations

- No real voter database access (privacy reasons)  
- EPIC/Voter ID lookup is not implemented  
- Live results are simulated  
- Firebase is mock (for demo only)  

---

## 🚀 Deployment

### 🌐 Live Demo  
https://election-assistant-ai.vercel.app/

### 💻 GitHub Repository  
https://github.com/Koushik-5499/election-assistant-ai.git  

---

## 📈 Future Improvements

- Real-time election API integration  
- Advanced AI/NLP (intent detection)  
- Firebase Firestore analytics  
- User personalization  
- PWA (offline support)  
- Accessibility enhancements  

---

## 🏆 Built For

PromptWars (Google Antigravity)

---

## 👨‍💻 Author

**Koushik**  
CSE Student – Rathinam Technical Campus  

---

## 💡 Final Note

This project demonstrates how AI + web technologies can simplify complex government processes and make them accessible to everyone.

**"Every vote counts — and every voter should understand the process."** 🗳️
