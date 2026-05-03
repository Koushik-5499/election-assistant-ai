/**
 * Internationalisation — Translation Dictionary
 * Election Process Assistant
 *
 * Supported: English (en), Hindi (hi), Tamil (ta)
 * All UI strings are referenced via the t() helper.
 */

const TRANSLATIONS = {
    en: {
        // Welcome
        welcome_title: 'Welcome to Election Assistant',
        welcome_desc: "I'm your smart guide to understanding elections. Ask me anything about voting eligibility, required documents, voting steps, or election timelines!",
        placeholder: 'Ask about elections, voting, eligibility…',
        hint: 'Try: "Am I eligible to vote?" or "What documents do I need?"',

        // Chips
        chip_eligibility: 'Check Eligibility',
        chip_steps: 'Voting Steps',
        chip_documents: 'Required Documents',
        chip_timeline: 'Election Timeline',
        chip_results: 'Live Results',
        chip_faq: 'FAQs',
        chip_location: 'Nearest Booth',

        // Bot
        bot_hello: '<p>Hello! I\'m your Election Assistant. How can I help you today?</p>',

        // Location
        location_detecting: 'Detecting your location…',
        location_denied: 'Location access denied. Please enable it in your browser settings.',
        location_error: 'Unable to retrieve your location.',
        location_card_title: 'Nearest Polling Booth Found',
        distance: 'Distance',
        open_maps: 'Open in Google Maps',

        // FAQ & Voice
        faq_title: 'Frequently Asked Questions',
        voice_listening: 'Listening…',

        // Fallback
        fallback_msg: '<p>I didn\'t quite catch that. 🤔</p><p style="margin-top:8px;"><strong>Did you mean…</strong></p>',
        you_can_also: 'You can also use the quick action buttons above or ask a different question.',

        // Fuzzy
        fuzzy_prefix: 'I think you\'re asking about',

        // Accessibility
        a11y_copy_success: 'Response copied to clipboard',
        a11y_speak_start: 'Reading response aloud',

        // Errors
        error_voice: 'Sorry, I couldn\'t hear you clearly. Please try again or type your question. 🎤',
        error_general: 'Something went wrong. Please try again.'
    },

    hi: {
        welcome_title: 'चुनाव सहायक में आपका स्वागत है',
        welcome_desc: 'मैं चुनाव समझने के लिए आपका स्मार्ट गाइड हूँ। मतदान योग्यता, आवश्यक दस्तावेज, मतदान प्रक्रिया या चुनाव कार्यक्रम के बारे में कुछ भी पूछें!',
        placeholder: 'चुनाव, मतदान, योग्यता के बारे में पूछें…',
        hint: 'प्रयास करें: "क्या मैं मतदान के योग्य हूँ?" या "मुझे कौन से दस्तावेज चाहिए?"',
        chip_eligibility: 'योग्यता जांचें',
        chip_steps: 'मतदान प्रक्रिया',
        chip_documents: 'आवश्यक दस्तावेज',
        chip_timeline: 'चुनाव कार्यक्रम',
        chip_results: 'लाइव परिणाम',
        chip_faq: 'सामान्य प्रश्न',
        chip_location: 'निकटतम बूथ',
        bot_hello: '<p>नमस्ते! मैं आपका चुनाव सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?</p>',
        location_detecting: 'आपका स्थान खोजा जा रहा है…',
        location_denied: 'स्थान पहुंच अस्वीकार कर दी गई। कृपया इसे अपनी ब्राउज़र सेटिंग में सक्षम करें।',
        location_error: 'आपका स्थान प्राप्त करने में असमर्थ।',
        location_card_title: 'निकटतम मतदान केंद्र मिला',
        distance: 'दूरी',
        open_maps: 'Google मानचित्र में खोलें',
        faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
        voice_listening: 'सुन रहा हूँ…',
        fallback_msg: '<p>मैं वह समझ नहीं पाया। 🤔</p><p style="margin-top:8px;"><strong>क्या आपका मतलब था…</strong></p>',
        you_can_also: 'आप त्वरित कार्रवाई बटन का भी उपयोग कर सकते हैं या एक अलग प्रश्न पूछ सकते हैं।',
        fuzzy_prefix: 'मुझे लगता है आप इसके बारे में पूछ रहे हैं',
        a11y_copy_success: 'प्रतिक्रिया क्लिपबोर्ड पर कॉपी की गई',
        a11y_speak_start: 'प्रतिक्रिया पढ़ रहा हूँ',
        error_voice: 'क्षमा करें, मैं आपको सुन नहीं पाया। कृपया पुनः प्रयास करें।',
        error_general: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
    },

    ta: {
        welcome_title: 'தேர்தல் உதவியாளருக்கு வரவேற்கிறோம்',
        welcome_desc: 'தேர்தல்களைப் புரிந்துகொள்வதற்கான உங்கள் ஸ்மார்ட் வழிகாட்டி நான். வாக்களிக்கும் தகுதி, தேவையான ஆவணங்கள், வாக்களிக்கும் படிகள் அல்லது தேர்தல் காலவரிசை பற்றி எதையும் கேளுங்கள்!',
        placeholder: 'தேர்தல், வாக்குப்பதிவு, தகுதி பற்றி கேளுங்கள்…',
        hint: 'முயற்சிக்கவும்: "நான் வாக்களிக்க தகுதியானவனா?" அல்லது "எனக்கு என்ன ஆவணங்கள் தேவை?"',
        chip_eligibility: 'தகுதியை சரிபார்க்கவும்',
        chip_steps: 'வாக்களிக்கும் படிகள்',
        chip_documents: 'தேவையான ஆவணங்கள்',
        chip_timeline: 'தேர்தல் காலவரிசை',
        chip_results: 'நேரலை முடிவுகள்',
        chip_faq: 'கேள்விகள்',
        chip_location: 'அருகிலுள்ள சாவடி',
        bot_hello: '<p>வணக்கம்! நான் உங்கள் தேர்தல் உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?</p>',
        location_detecting: 'உங்கள் இருப்பிடத்தைக் கண்டறிகிறது…',
        location_denied: 'இருப்பிட அணுகல் மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் அதை இயக்கவும்.',
        location_error: 'உங்கள் இருப்பிடத்தைப் பெற முடியவில்லை.',
        location_card_title: 'அருகிலுள்ள வாக்குச் சாவடி கண்டறியப்பட்டது',
        distance: 'தூரம்',
        open_maps: 'Google Maps இல் திறக்கவும்',
        faq_title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        voice_listening: 'கேட்கிறது…',
        fallback_msg: '<p>எனக்கு அது புரியவில்லை. 🤔</p><p style="margin-top:8px;"><strong>நீங்கள் சொல்ல வந்தது…</strong></p>',
        you_can_also: 'நீங்கள் மேலே உள்ள விரைவான செயல் பொத்தான்களைப் பயன்படுத்தலாம் அல்லது வேறு கேள்வியைக் கேட்கலாம்.',
        fuzzy_prefix: 'நீங்கள் இதைப் பற்றி கேட்கிறீர்கள் என்று நினைக்கிறேன்',
        a11y_copy_success: 'பதில் கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது',
        a11y_speak_start: 'பதிலைப் படிக்கிறது',
        error_voice: 'மன்னிக்கவும், உங்களைக் கேட்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
        error_general: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.'
    }
};

/**
 * Translation helper — returns the localised string for a key.
 * Falls back to English, then to the raw key.
 * @param {string} key
 * @returns {string}
 */
function t(key) {
    const lang = localStorage.getItem('appLang') || 'en';
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
        || TRANSLATIONS.en[key]
        || key;
}
