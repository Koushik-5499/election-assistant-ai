# Election Process Assistant

A smart, dynamic, and production-level AI-powered web application to guide users through the election process, check eligibility, locate polling booths, and view live election results.

## Features
- **Context-Aware Chatbot:** Asks for user details (age, state, first-time voter status) and gives personalized guidance.
- **Live Election Results:** Simulates dynamic constituency-level live result fetching.
- **Google Services Integration:** Includes a Google Maps embed for polling booths and a Google Translate widget for multi-language support.
- **Voice Interaction:** Web Speech API for voice queries.
- **Responsive & Accessible UI:** Modern glassmorphism design with accessibility features (ARIA labels, keyboard navigation).
- **Clear Chat:** Instant reset of the conversation state.

## Testing the Application

### Sample Inputs and Expected Outputs

| User Input | Expected Bot Output |
| :--- | :--- |
| **"Am I eligible to vote?"** | Bot asks for age. If age >= 18, it asks if the user is a first-time voter and provides personalized registration links. If < 18, it calculates years left until eligibility. |
| **"Where is my polling booth?"** | Opens the location modal which simulates geolocation and displays a Google Map of the nearest polling station. |
| **"Show me live results"** | Bot initiates a simulated fetch of real-time constituency results, displaying a styled data card with leading candidates, and a link to the official ECI portal. |
| **"What documents do I need?"** | Provides a structured list of required (Voter ID, Aadhaar) and optional (Passport, Driving License) documents. |
| **"xyz123"** (Unknown query) | Bot triggers the "Did you mean?" fallback, suggesting closely related topics like "Check eligibility" or "Voting steps". |
| **[Clicking Clear Chat icon]** | Instantly wipes the conversation history, resets context, and shows the initial greeting. |

## Structure
- `index.html` - Semantic structure, modals, Google Translate element, and Map iframe.
- `style.css` - CSS variables, responsive design, dark/light theme toggling, animations.
- `script.js` - Context-aware NLP logic, UI interactions, and simulated API fetchers.
- `firebase-config.js` - Mock configuration for storing query logs.

## Setup
Simply serve the directory using a local web server (e.g., `npx http-server`) and open `index.html`.
