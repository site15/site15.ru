setIntervalRef = null;
// Chat Support System
document.addEventListener('DOMContentLoaded', function () {
  const chatButton = document.getElementById('chatSupportButton');
  const chatModal = document.getElementById('chatModal');
  const closeButton = document.getElementById('closeChatButton');
  const resetButton = document.getElementById('resetChatButton');
  const sendButton = document.getElementById('sendChatButton');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  // Get or create session ID from localStorage
  let sessionId = localStorage.getItem('chatSessionId');

  // Load existing messages for this session
  startInterval();

  // Open chat modal
  chatButton.addEventListener('click', function () {
    chatModal.classList.remove('hidden');
    chatInput.focus();
  });

  // Close chat modal
  closeButton.addEventListener('click', function () {
    chatModal.classList.add('hidden');
  });

  // Close modal when clicking outside
  chatModal.addEventListener('click', function (e) {
    if (e.target === chatModal) {
      chatModal.classList.add('hidden');
    }
  });

  // Reset chat functionality
  resetButton.addEventListener('click', function () {
    resetChat();
  });

  function startInterval() {
    if (setIntervalRef) {
      clearInterval(setIntervalRef);
    }
    setIntervalRef = setInterval(() => {
      loadChatHistory();
    }, 3000);
  }

  let prevMessages = null;

  // Load chat history from API
  async function loadChatHistory() {
    // Get or create session ID from localStorage
    let sessionId = localStorage.getItem('chatSessionId');
    try {
      const response = await fetch(
        window.location.href.includes('localhost')
          ? 'http://localhost:3000/api/landing/chat/list-messages/' + sessionId
          : 'https://site15.ru/api/landing/chat/list-messages/' + sessionId,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (JSON.stringify(data.messages) !== JSON.stringify(prevMessages)) {
          renderMessages(data.messages);
          prevMessages = data.messages;
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  // Render messages in the chat
  function renderMessages(messages) {
    chatMessages.innerHTML =
      '<div class="mb-4"><div class="bg-neo-blue text-neo-black p-3 rounded-lg neo-border inline-block max-w-xs"><p class="font-mono text-sm">Привет! 👋</p><p class="font-mono text-sm">Я ваш ассистент по сайту site15.ru</p><p class="font-mono text-sm">Чем могу помочь?</p></div></div>';

    messages.forEach((msg) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mb-4 ' + (msg.sender === 'user' ? 'flex justify-end' : '');

      const bgColor = msg.sender === 'user' ? 'bg-neo-green' : 'bg-neo-blue';
      const textColor = 'text-neo-black';

      if (msg.isProcessing) {
        messageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message || 'Обработка...'}</p>
                    ${msg.info ? `<p class="font-mono text-xs opacity-70 mt-1">${msg.info}</p>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
      } else {
        messageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message}</p>
                    ${msg.info ? `<p class="font-mono text-xs opacity-70 mt-1">${msg.info}</p>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
      }

      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Send message function
  async function sendMessage() {
    // Get or create session ID from localStorage
    let sessionId = localStorage.getItem('chatSessionId');
    const message = chatInput.value.trim();
    if (message) {
      // Add user message to UI immediately
      addUserMessage(message);

      // Clear input
      chatInput.value = '';

      try {
        // Send to API
        const response = await fetch(
          window.location.href.includes('localhost')
            ? 'http://localhost:3000/api/landing/chat/send-message'
            : 'https://site15.ru/api/landing/chat/send-message',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: sessionId,
              message: message,
              name: 'Посетитель сайта',
            }),
          },
        );

        if (response.ok) {
          const botMessage = await response.json();

          if (botMessage.sessionId) {
            localStorage.setItem('chatSessionId', botMessage.sessionId);
          }
          addBotMessage(botMessage, botMessage.isProcessing);
        } else {
          addBotMessage({ message: 'Извините, произошла ошибка. Попробуйте позже.', isProcessing: false }, false);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addBotMessage({ message: 'Извините, произошла ошибка. Попробуйте позже.', isProcessing: false }, false);
      }
    }
  }

  // Add user message to UI
  function addUserMessage(message) {
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'mb-4 flex justify-end';
    userMessageDiv.innerHTML = `
            <div class="bg-neo-green text-neo-black p-3 rounded-lg neo-border inline-block max-w-xs">
                <p class="font-mono text-sm">${message}</p>
                <p class="font-mono text-xs opacity-70 mt-1">${new Date().toLocaleTimeString()}</p>
            </div>
        `;
    chatMessages.appendChild(userMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Add bot message to UI
  /**
   * @param {{ message: string, timestamp: string, sessionId: string, sender: string }} msg
   * @param {*} isProcessing
   */
  function addBotMessage(msg, isProcessing) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'mb-4';

    const bgColor = msg.isError ? 'bg-neo-pink' : 'bg-neo-blue';
    const textColor = 'text-neo-black';

    if (isProcessing) {
      botMessageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message || 'Обработка...'}</p>
                    ${msg.info ? `<p class="font-mono text-xs opacity-70 mt-1">${msg.info}</p>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
    } else {
      botMessageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message}</p>
                    ${msg.info ? `<p class="font-mono text-xs opacity-70 mt-1">${msg.info}</p>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
    }

    chatMessages.appendChild(botMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Reset chat function
  function resetChat() {
    prevMessages = null;

    // Remove session ID from localStorage
    localStorage.removeItem('chatSessionId');

    startInterval();

    // Clear input field
    chatInput.value = '';

    localStorage.removeItem('chatSessionId');

    // Focus input field
    chatInput.focus();
  }

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
