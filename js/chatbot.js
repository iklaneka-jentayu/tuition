// ====================================
// EduSmart Tuition Platform
// AI Chatbot System
// Complete with Multiple AI Integrations
// ====================================

class EduSmartChatbot {
    constructor() {
        this.messages = [];
        this.context = {};
        this.userInfo = null;
        this.isTyping = false;
        this.apiEndpoint = 'https://script.google.com/macros/s/AKfycbw9m0WkShtm2FpaqWIiB5r75nynJsYgGFtt4U_VTV9a4G49KpL_WZBxOhSMgUx2SiVJ/exec'; // Replace with your API
        this.apiKey = 'YOUR_API_KEY'; // Replace with your API key
        this.useAI = true; // Toggle between rule-based and AI responses
        
        // Initialize
        this.loadMessages();
        this.setupEventListeners();
        this.initializeUserContext();
    }
    
    // Initialize user context from session/local storage
    initializeUserContext() {
        this.userInfo = {
            isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
            userRole: sessionStorage.getItem('userRole'),
            userId: sessionStorage.getItem('userId'),
            userEmail: sessionStorage.getItem('userEmail'),
            language: localStorage.getItem('language') || 'en'
        };
        
        this.context = {
            currentPage: window.location.pathname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...this.userInfo
        };
    }
    
    // Send message to AI
    async sendToAI(message) {
        if (!this.useAI) {
            return this.getRuleBasedResponse(message);
        }
        
        try {
            // Option 1: Google Dialogflow
            return await this.sendToDialogflow(message);
        } catch (error) {
            console.error('AI service error, falling back to rule-based:', error);
            return this.getRuleBasedResponse(message);
        }
    }
    
    // Option 1: Google Dialogflow Integration
    async sendToDialogflow(message) {
        // Using Dialogflow CX or ES
        const response = await fetch('https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/123:detectIntent', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queryInput: {
                    text: {
                        text: message,
                        languageCode: this.userInfo.language
                    }
                },
                queryParams: {
                    contexts: this.buildDialogflowContexts()
                }
            })
        });
        
        const data = await response.json();
        return {
            text: data.queryResult.fulfillmentText,
            intent: data.queryResult.intent.displayName,
            confidence: data.queryResult.intentDetectionConfidence,
            suggestions: data.queryResult.fulfillmentMessages[0]?.quickReplies?.quickReplies || []
        };
    }
    
    // Option 2: OpenAI GPT Integration
    async sendToOpenAI(message) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    ...this.buildConversationHistory(),
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });
        
        const data = await response.json();
        return {
            text: data.choices[0].message.content,
            usage: data.usage
        };
    }
    
    // Option 3: Custom NLP API
    async sendToCustomNLP(message) {
        const response = await fetch(`${this.apiEndpoint}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify({
                message: message,
                context: this.context,
                sessionId: this.getSessionId(),
                language: this.userInfo.language
            })
        });
        
        return await response.json();
    }
    
    // Rule-based fallback system
    getRuleBasedResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Greetings
        if (this.matchesAny(lowerMessage, ['hi', 'hello', 'hey', 'greetings'])) {
            return {
                text: this.getTranslation('chatbot.response.greeting'),
                intent: 'greeting',
                suggestions: ['tuition packages', 'enrollment process', 'contact support']
            };
        }
        
        // Tuition Packages
        if (this.matchesAny(lowerMessage, ['package', 'price', 'fee', 'cost', 'pricing'])) {
            return {
                text: this.getTranslation('chatbot.response.packages'),
                intent: 'pricing',
                suggestions: ['Form 4 packages', 'Form 5 packages', 'Primary school']
            };
        }
        
        // Enrollment
        if (this.matchesAny(lowerMessage, ['enroll', 'register', 'sign up', 'join'])) {
            return {
                text: this.getTranslation('chatbot.response.enrollment'),
                intent: 'enrollment',
                suggestions: ['enrollment form', 'requirements', 'documents needed']
            };
        }
        
        // Payment
        if (this.matchesAny(lowerMessage, ['pay', 'payment', 'fee', 'toyibpay', 'transfer'])) {
            return {
                text: this.getTranslation('chatbot.response.payment'),
                intent: 'payment',
                suggestions: ['ToyibPay', 'installment', 'receipt']
            };
        }
        
        // Schedule
        if (this.matchesAny(lowerMessage, ['schedule', 'class', 'time', 'when', 'calendar'])) {
            return this.handleScheduleQuery();
        }
        
        // Subjects
        if (this.matchesAny(lowerMessage, ['subject', 'math', 'science', 'english'])) {
            return {
                text: this.getTranslation('chatbot.response.subjects'),
                intent: 'subjects',
                suggestions: ['Mathematics', 'Science', 'English', 'Bahasa Malaysia']
            };
        }
        
        // Contact
        if (this.matchesAny(lowerMessage, ['contact', 'phone', 'email', 'call', 'reach'])) {
            return {
                text: this.getTranslation('chatbot.response.contact'),
                intent: 'contact',
                suggestions: ['call us', 'email us', 'visit center']
            };
        }
        
        // Default response
        return {
            text: this.getTranslation('chatbot.response.default'),
            intent: 'unknown',
            suggestions: ['View packages', 'Enroll now', 'Contact support', 'FAQ']
        };
    }
    
    matchesAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    // Handle schedule-specific queries
    handleScheduleQuery() {
        if (this.userInfo.isLoggedIn && this.userInfo.userRole === 'member') {
            // Get user's schedule
            const upcomingClasses = this.getUserUpcomingClasses();
            if (upcomingClasses.length > 0) {
                return {
                    text: this.formatScheduleResponse(upcomingClasses),
                    intent: 'schedule',
                    suggestions: ['view full schedule', 'reschedule class', 'book make-up class']
                };
            }
        }
        return {
            text: this.getTranslation('chatbot.response.schedule'),
            intent: 'schedule',
            suggestions: ['check calendar', 'class timings', 'holiday schedule']
        };
    }
    
    // Get user's upcoming classes (mock data)
    getUserUpcomingClasses() {
        // This would come from your database
        return [
            { subject: 'Mathematics', date: '2024-01-20', time: '4:00 PM', type: 'online' },
            { subject: 'Science', date: '2024-01-21', time: '5:00 PM', type: 'offline' }
        ];
    }
    
    // Format schedule response
    formatScheduleResponse(classes) {
        let response = this.getTranslation('chatbot.response.upcoming') + '\n\n';
        classes.forEach((c, index) => {
            response += `${index + 1}. ${c.subject}: ${c.date} at ${c.time} (${c.type})\n`;
        });
        return response;
    }
    
    // Build system prompt for AI
    getSystemPrompt() {
        return `You are EduSmart AI Assistant, a helpful chatbot for a tuition center in Malaysia. 
                You help students and parents with:
                - Information about tuition packages and pricing
                - Enrollment process and requirements
                - Payment methods (ToyibPay, FPX, Credit Card)
                - Class schedules and calendar
                - Subject information and teachers
                - General inquiries about the tuition center
                
                Current user context: ${JSON.stringify(this.context)}
                
                Be friendly, professional, and provide accurate information. 
                If you don't know something, politely say so and offer to connect with human support.
                Respond in ${this.userInfo.language === 'ms' ? 'Bahasa Malaysia' : 
                          this.userInfo.language === 'zh' ? 'Mandarin' : 'English'}.`;
    }
    
    // Build conversation history for context
    buildConversationHistory() {
        return this.messages.slice(-5).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    }
    
    // Build Dialogflow contexts
    buildDialogflowContexts() {
        return [
            {
                name: 'user-context',
                lifespanCount: 5,
                parameters: this.context
            }
        ];
    }
    
    // Get translation
    getTranslation(key) {
        const translations = {
            en: {
                'chatbot.response.greeting': 'Hello! How can I assist you with your tuition needs today?',
                'chatbot.response.packages': 'We offer various tuition packages:\n\n📚 Form 4-5: Package A (RM180), B (RM200), C (RM250), D (RM300), E (RM150)\n📚 Form 1-3: 4 subjects (RM200), 3 subjects (RM190), 2 subjects (RM160), 1 subject (RM100)\n📚 Year 3-6: 4 subjects (RM200), 3 subjects (RM180), 2 subjects (RM140), 1 subject (RM100)',
                'chatbot.response.enrollment': 'To enroll, please visit our enrollment page or click here: [Enroll Now](/enrollment.html). You\'ll need:\n- Student IC/passport\n- Recent report card\n- Parent/guardian details',
                'chatbot.response.payment': 'We accept multiple payment methods:\n💳 ToyibPay (online banking/card)\n🏦 FPX (direct bank transfer)\n💳 Credit/Debit cards\n📱 0% installment plans available',
                'chatbot.response.schedule': 'You can view our class schedules on the [Calendar page](/calendar.html). Would you like to know about specific class timings?',
                'chatbot.response.subjects': 'We offer all secondary school subjects including Mathematics, Additional Mathematics, Science, Physics, Chemistry, Biology, English, Bahasa Malaysia, Mandarin, History, Geography, Accounting, and Economics.',
                'chatbot.response.contact': 'You can reach us at:\n📞 Phone: +603-1234 5678\n📧 Email: info@edusmart.com\n📍 Visit: Kuala Lumpur, Malaysia',
                'chatbot.response.default': 'I understand you need assistance. Could you please provide more details? You can also check our FAQ section or ask about specific topics like packages, enrollment, or schedules.',
                'chatbot.response.upcoming': 'Here are your upcoming classes:',
                'chatbot.typing': 'AI is typing...',
                'chatbot.welcome': 'Hello! I\'m your EduSmart AI assistant. How can I help you today?',
                'chatbot.placeholder': 'Type your message...',
                'chatbot.quick.packages': 'Packages',
                'chatbot.quick.enroll': 'Enrollment',
                'chatbot.quick.payment': 'Payment',
                'chatbot.quick.schedule': 'Schedule'
            },
            ms: {
                'chatbot.response.greeting': 'Assalamualaikum! Ada apa yang saya boleh bantu tentang tuisyen hari ini?',
                'chatbot.response.packages': 'Kami menawarkan pelbagai pakej tuisyen:\n\n📚 Tingkatan 4-5: Pakej A (RM180), B (RM200), C (RM250), D (RM300), E (RM150)\n📚 Tingkatan 1-3: 4 subjek (RM200), 3 subjek (RM190), 2 subjek (RM160), 1 subjek (RM100)\n📚 Tahun 3-6: 4 subjek (RM200), 3 subjek (RM180), 2 subjek (RM140), 1 subjek (RM100)',
                'chatbot.response.enrollment': 'Untuk mendaftar, sila layari halaman pendaftaran kami: [Daftar Sekarang](/enrollment.html). Anda perlukan:\n- IC/Pasport pelajar\n- Kad laporan terkini\n- Maklumat ibu bapa/penjaga',
                'chatbot.response.payment': 'Kami menerima pelbagai kaedah pembayaran:\n💳 ToyibPay (perbankan dalam talian/kad)\n🏦 FPX (pindahan bank terus)\n💳 Kad kredit/debit\n📱 Pelan ansuran 0% tersedia',
                'chatbot.response.schedule': 'Anda boleh lihat jadual kelas di [Halaman Kalendar](/calendar.html). Adakah anda ingin tahu tentang waktu kelas tertentu?',
                'chatbot.response.subjects': 'Kami menawarkan semua subjek sekolah menengah termasuk Matematik, Matematik Tambahan, Sains, Fizik, Kimia, Biologi, Bahasa Inggeris, Bahasa Malaysia, Mandarin, Sejarah, Geografi, Perakaunan, dan Ekonomi.',
                'chatbot.response.contact': 'Anda boleh hubungi kami di:\n📞 Telefon: +603-1234 5678\n📧 Email: info@edusmart.com\n📍 Kunjungi: Kuala Lumpur, Malaysia',
                'chatbot.response.default': 'Saya faham anda perlukan bantuan. Boleh berikan maklumat lanjut? Anda juga boleh semak bahagian FAQ atau tanya tentang topik seperti pakej, pendaftaran, atau jadual.',
                'chatbot.response.upcoming': 'Berikut adalah kelas anda yang akan datang:',
                'chatbot.typing': 'AI sedang menaip...',
                'chatbot.welcome': 'Assalamualaikum! Saya pembantu AI EduSmart. Ada apa yang saya boleh bantu hari ini?',
                'chatbot.placeholder': 'Taip mesej anda...',
                'chatbot.quick.packages': 'Pakej',
                'chatbot.quick.enroll': 'Pendaftaran',
                'chatbot.quick.payment': 'Pembayaran',
                'chatbot.quick.schedule': 'Jadual'
            },
            zh: {
                'chatbot.response.greeting': '您好！今天有什么可以帮助您的吗？',
                'chatbot.response.packages': '我们提供多种辅导配套：\n\n📚 中四至中五：配套 A (RM180), B (RM200), C (RM250), D (RM300), E (RM150)\n📚 中一至中三：4科 (RM200), 3科 (RM190), 2科 (RM160), 1科 (RM100)\n📚 小学三至六年级：4科 (RM200), 3科 (RM180), 2科 (RM140), 1科 (RM100)',
                'chatbot.response.enrollment': '要报名，请访问我们的报名页面：[立即报名](/enrollment.html)。需要准备：\n- 学生身份证/护照\n- 近期成绩单\n- 家长/监护人资料',
                'chatbot.response.payment': '我们接受多种付款方式：\n💳 ToyibPay（网上银行/信用卡）\n🏦 FPX（直接银行转账）\n💳 信用卡/借记卡\n📱 提供0%分期付款计划',
                'chatbot.response.schedule': '您可以在[日历页面](/calendar.html)查看课程表。想了解具体的上课时间吗？',
                'chatbot.response.subjects': '我们提供所有中学科目，包括数学、高级数学、科学、物理、化学、生物、英语、马来语、华语、历史、地理、会计和经济学。',
                'chatbot.response.contact': '您可以通过以下方式联系我们：\n📞 电话：+603-1234 5678\n📧 邮箱：info@edusmart.com\n📍 地址：马来西亚吉隆坡',
                'chatbot.response.default': '我理解您需要帮助。能否提供更多详细信息？您也可以查看常见问题解答部分，或询问有关配套、报名或课程安排的具体问题。',
                'chatbot.response.upcoming': '以下是您即将开始的课程：',
                'chatbot.typing': 'AI正在输入...',
                'chatbot.welcome': '您好！我是EduSmart AI助手。今天有什么可以帮助您的吗？',
                'chatbot.placeholder': '输入您的消息...',
                'chatbot.quick.packages': '配套',
                'chatbot.quick.enroll': '报名',
                'chatbot.quick.payment': '付款',
                'chatbot.quick.schedule': '课程表'
            }
        };
        
        return translations[this.userInfo.language]?.[key] || translations.en[key] || key;
    }
    
    // Get session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('chatbot_session');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatbot_session', sessionId);
        }
        return sessionId;
    }
    
    // Load messages from storage
    loadMessages() {
        const saved = localStorage.getItem('chatbot_messages');
        if (saved) {
            this.messages = JSON.parse(saved);
        }
    }
    
    // Save messages to storage
    saveMessages() {
        localStorage.setItem('chatbot_messages', JSON.stringify(this.messages.slice(-50))); // Keep last 50
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle language change
        document.addEventListener('languageChanged', (e) => {
            this.userInfo.language = e.detail.language;
            this.updateMessagesLanguage();
        });
    }
    
    handleResize() {
        // Adjust chatbot position on mobile
        if (window.innerWidth <= 768) {
            // Mobile adjustments if needed
        }
    }
    
    updateMessagesLanguage() {
        // Update welcome message language if chat is empty
        if (this.messages.length === 0) {
            const welcomeMsg = document.querySelector('.bot-message p');
            if (welcomeMsg) {
                welcomeMsg.textContent = this.getTranslation('chatbot.welcome');
            }
        }
    }
}

// Initialize chatbot
const chatbot = new EduSmartChatbot();

// Global functions for UI
function toggleChatbot() {
    const window = document.querySelector('.chatbot-window');
    window.classList.toggle('active');
    
    // Hide notification
    document.querySelector('.chatbot-notification').style.display = 'none';
    
    // Focus input when opened
    if (window.classList.contains('active')) {
        document.getElementById('chatbotInput').focus();
        
        // Log interaction
        logToSheet('info', 'Chatbot opened', 'Chatbot');
    }
}

function minimizeChatbot() {
    const window = document.querySelector('.chatbot-window');
    window.classList.toggle('minimized');
}

function closeChatbot() {
    document.querySelector('.chatbot-window').classList.remove('active');
}

async function sendMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Add user message to UI
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
        // Get AI response
        const response = await chatbot.sendToAI(message);
        
        // Hide typing indicator
        showTypingIndicator(false);
        
        // Add bot response to UI
        addMessage(response.text, 'bot', response.suggestions);
        
        // Log conversation
        logToSheet('info', `Chatbot interaction: ${message} -> ${response.intent}`, 'Chatbot');
        
    } catch (error) {
        showTypingIndicator(false);
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Chatbot error:', error);
    }
}

function addMessage(text, sender, suggestions = []) {
    const messagesDiv = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let suggestionsHtml = '';
    if (suggestions.length > 0) {
        suggestionsHtml = '<div class="chatbot-options">';
        suggestions.forEach(suggestion => {
            suggestionsHtml += `<button class="chatbot-option" onclick="sendQuickReply('${suggestion}')">${suggestion}</button>`;
        });
        suggestionsHtml += '</div>';
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            <p>${text.replace(/\n/g, '<br>')}</p>
            ${suggestionsHtml}
            <span class="message-time">${time}</span>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Save to history
    chatbot.messages.push({ text, sender, time });
    chatbot.saveMessages();
}

function showTypingIndicator(show) {
    const indicator = document.getElementById('chatbotTyping');
    indicator.style.display = show ? 'flex' : 'none';
    
    if (show) {
        const messagesDiv = document.getElementById('chatbotMessages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

function sendQuickReply(reply) {
    document.getElementById('chatbotInput').value = reply;
    sendMessage();
}

function clearChat() {
    if (confirm('Clear chat history?')) {
        document.getElementById('chatbotMessages').innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${chatbot.getTranslation('chatbot.welcome')}</p>
                    <span class="message-time">Just now</span>
                </div>
            </div>
        `;
        chatbot.messages = [];
        chatbot.saveMessages();
        
        logToSheet('info', 'Chat history cleared', 'Chatbot');
    }
}

// Make functions global
window.toggleChatbot = toggleChatbot;
window.minimizeChatbot = minimizeChatbot;
window.closeChatbot = closeChatbot;
window.sendMessage = sendMessage;
window.sendQuickReply = sendQuickReply;
window.clearChat = clearChat;
window.handleInputKeydown = handleInputKeydown;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add chatbot styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/chatbot.css';
    document.head.appendChild(link);
    
    // Add chatbot HTML if not present
    if (!document.querySelector('.chatbot-container')) {
        // The HTML is already included in each page
    }
    
    // Check for unread messages (demo)
    setTimeout(() => {
        document.querySelector('.chatbot-notification').style.display = 'flex';
    }, 5000);
});

