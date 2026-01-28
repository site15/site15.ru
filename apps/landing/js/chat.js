setIntervalRef = null;

/**
 * Array of dialog message prompts with their results and metadata
 * @type {Array<{
 *   prompt: string,
 *   result: string,
 *   duration: number,
 *   info: string
 * }>}
 */
globalMessages = [];
// Chat Support System
document.addEventListener('DOMContentLoaded', function () {
  const chatButton = document.getElementById('chatSupportButton');
  const chatModal = document.getElementById('chatModal');
  const closeButton = document.getElementById('closeChatButton');
  const resetButton = document.getElementById('resetChatButton');
  const sendButton = document.getElementById('sendChatButton');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  // Message Info Modal elements
  const msgInfoModal = document.getElementById('msgInfoModal');
  const closeMsgInfoModal = document.getElementById('closeMsgInfoModal');
  const msgInfoContent = document.getElementById('msgInfoContent');

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

  // Handle clicks on msg-info elements
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('msg-info')) {
      const msgId = e.target.getAttribute('data-msg-id');
      if (msgId) {
        showMsgInfoModal(msgId);
      }
    }
  });

  // Show message info modal
  function showMsgInfoModal(msgId) {
    // First try to find the message in globalMessages
    let messageData = null;
    globalMessages.forEach((msg) => {
      if (msg.id === msgId && msg.prompts) {
        messageData = msg.prompts;
      }
    });

    // If not found in globalMessages, use the msgId directly
    if (!messageData) {
      messageData = msgId;
    }

    try {
      // Try to parse as JSON
      let dataArray;
      if (typeof messageData === 'string') {
        dataArray = JSON.parse(messageData);
      } else {
        dataArray = messageData;
      }

      if (Array.isArray(dataArray) && dataArray.length > 0) {
        // Calculate total duration
        let totalDurationMs = 0;
        dataArray.forEach((item) => {
          if (item.duration && typeof item.duration === 'number') {
            totalDurationMs += item.duration;
          }
        });
        const totalDurationSec = (totalDurationMs / 1000).toFixed(2);

        // Update modal header with total duration
        const modalHeader = msgInfoModal.querySelector('.bg-neo-black h3');
        if (modalHeader) {
          modalHeader.innerHTML = `Информация о сообщении <span class="text-neo-pink font-normal">(${totalDurationMs.toFixed(0)} ms / ${totalDurationSec} sec)</span>`;
        }

        // Render as table
        let tableHtml = `
          <table class="min-w-full border-collapse neo-border text-left">
            <thead>
              <tr class="bg-neo-black text-white">
                <th class="border neo-border px-4 py-2">Duration (ms)</th>
                <th class="border neo-border px-4 py-2">Model</th>
                <th class="border neo-border px-4 py-2">Prompt</th>
                <th class="border neo-border px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
        `;

        dataArray.forEach((item, index) => {
          const prompt = item.prompt ? item.prompt.split('"').join('&quot;') : 'N/A';
          const result = item.result
            ? (typeof item.result === 'string' ? item.result : JSON.stringify(item.result, null, 2))
                .split('"')
                .join('&quot;')
            : 'N/A';
          tableHtml += `
            <tr>
              <td class="border neo-border px-4 py-2 font-mono">${item.duration ? item.duration.toFixed(2) : 'N/A'}</td>
              <td class="border neo-border px-4 py-2 font-mono">${item.info || 'N/A'}</td>
              <td class="border neo-border px-4 py-2 font-mono max-w-xs truncate" title="${prompt}">${prompt}</td>
              <td class="border neo-border px-4 py-2 font-mono max-w-xs truncate" title="${result}">${result}</td>
            </tr>
          `;
        });

        tableHtml += `
            </tbody>
          </table>
          <div id="detailView" class="hidden">
            <h4 class="font-bold text-lg mb-4 border-b-2 border-neo-blue" style="margin-top: -50px;">Детали выбранной записи</h4>
            <div id="detailContent" class="grid grid-cols-1 gap-2" style="margin-top: -50px;">
              <!-- Detail rows will be inserted here -->
            </div>
          </div>
        `;

        msgInfoContent.innerHTML = tableHtml;

        // Add click handlers for table rows
        setTimeout(() => {
          const tableRows = msgInfoContent.querySelectorAll('tbody tr');
          tableRows.forEach((row) => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', function () {
              // Remove highlight from all rows
              tableRows.forEach((r) => r.classList.remove('bg-neo-blue', 'text-white'));

              // Highlight clicked row
              this.classList.add('bg-neo-blue', 'text-white');

              // Get data from clicked row
              const cells = this.querySelectorAll('td');
              const detailData = [
                { label: 'Duration (ms)', value: cells[0].textContent },
                { label: 'Model', value: cells[1].textContent },
                { label: 'Result', value: cells[3].textContent },
                { label: 'Prompt', value: cells[2].textContent },
              ];

              // Display detail view
              showDetailView(detailData);
            });
          });
        }, 0);
      } else {
        // Reset header for non-array data
        const modalHeader = msgInfoModal.querySelector('.bg-neo-black h3');
        if (modalHeader) {
          modalHeader.innerHTML = 'Информация о сообщении';
        }
        // If not an array or empty, show as plain text
        msgInfoContent.textContent =
          typeof messageData === 'string' ? messageData : JSON.stringify(messageData, null, 2);
      }
    } catch (e) {
      console.log(e);
      // Reset header on error
      const modalHeader = msgInfoModal.querySelector('.bg-neo-black h3');
      if (modalHeader) {
        modalHeader.innerHTML = 'Информация о сообщении';
      }
      // If parsing fails, show as plain text
      msgInfoContent.textContent = typeof messageData === 'string' ? messageData : JSON.stringify(messageData, null, 2);
    }

    msgInfoModal.classList.remove('hidden');
  }

  // Show detail view for selected row
  function showDetailView(detailData) {
    const detailView = document.getElementById('detailView');
    const detailContent = document.getElementById('detailContent');

    if (detailView && detailContent) {
      let detailHtml = '';
      detailData.forEach((item) => {
        detailHtml += `
          <div class="grid grid-cols-12 gap-2 items-start">
            <div class="col-span-3 font-bold bg-neo-black text-white p-2 neo-border">${item.label}</div>
            <div class="col-span-9 bg-white p-2 neo-border font-mono whitespace-pre-wrap" style="min-height: fit-content;">${item.value}</div>
          </div>
        `;
      });

      detailContent.innerHTML = detailHtml;
      detailView.classList.remove('hidden');

      // Scroll to detail view
      setTimeout(() => {
        detailView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  // Close message info modal
  closeMsgInfoModal.addEventListener('click', function () {
    // Reset header when closing modal
    const modalHeader = msgInfoModal.querySelector('.bg-neo-black h3');
    if (modalHeader) {
      modalHeader.innerHTML = 'Информация о сообщении';
    }
    msgInfoModal.classList.add('hidden');
  });

  // Close message info modal when clicking outside
  msgInfoModal.addEventListener('click', function (e) {
    if (e.target === msgInfoModal) {
      // Reset header when closing modal
      const modalHeader = msgInfoModal.querySelector('.bg-neo-black h3');
      if (modalHeader) {
        modalHeader.innerHTML = 'Информация о сообщении';
      }
      msgInfoModal.classList.add('hidden');
    }
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
    globalMessages = messages;
    chatMessages.innerHTML =
      '<div class="mb-4"><div class="bg-neo-blue text-neo-black p-3 rounded-lg neo-border inline-block max-w-xs"><p class="font-mono text-sm">Привет! 👋</p><p class="font-mono text-sm">Я ваш ассистент по сайту site15.ru</p><p class="font-mono text-sm">Чем могу помочь?</p></div></div>';

    messages.forEach((msg) => {
      if (msg.info === 'null/null:null') {
        msg.info = '';
      }
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mb-4 ' + (msg.sender === 'user' ? 'flex justify-end' : '');

      const bgColor = msg.sender === 'user' ? 'bg-neo-green' : 'bg-neo-blue';
      const textColor = 'text-neo-black';

      if (msg.isProcessing) {
        messageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message || 'Обработка...'}</p>
                    ${msg.info ? `<a class="cursor-pointer font-mono text-xs opacity-70 mt-1 msg-info" data-msg-id="${msg.id}">${msg.info}</a>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
      } else {
        messageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message}</p>
                    ${msg.info ? `<a class="cursor-pointer font-mono text-xs opacity-70 mt-1 msg-info" data-msg-id="${msg.id}">${msg.info}</a>` : ''}
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

        const result = await response.json();

        if (response.ok) {
          if (result.sessionId) {
            localStorage.setItem('chatSessionId', result.sessionId);
          }
          addBotMessage(result, result.isProcessing);
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
    if (msg.info === 'null/null:null') {
      msg.info = '';
    }
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'mb-4';

    const bgColor = msg.isError ? 'bg-neo-pink' : 'bg-neo-blue';
    const textColor = 'text-neo-black';

    if (isProcessing) {
      botMessageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message || 'Обработка...'}</p>
                    ${msg.info ? `<a class="cursor-pointer font-mono text-xs opacity-70 mt-1 msg-info" data-msg-id="${msg.id}">${msg.info}</a>` : ''}
                    <p class="font-mono text-xs opacity-70 mt-1">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
                </div>
            `;
    } else {
      botMessageDiv.innerHTML = `
                <div class="${bgColor} ${textColor} p-3 rounded-lg neo-border inline-block max-w-xs">
                    <p class="font-mono text-sm">${msg.message}</p>
                    ${msg.info ? `<a class="cursor-pointer font-mono text-xs opacity-70 mt-1 msg-info" data-msg-id="${msg.id}">${msg.info}</a>` : ''}
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
