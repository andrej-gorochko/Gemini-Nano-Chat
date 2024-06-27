let currentLanguage = 'auto';
let isDarkTheme = false;
let notificationsEnabled = false;
let previousQueries = [];
let defaultPrompt = '';

document.addEventListener('DOMContentLoaded', function() {
  const submitButton = document.getElementById('submit');
  const promptInput = document.getElementById('prompt');
  const chatMessages = document.getElementById('chat-messages');
  const clearHistoryButton = document.getElementById('clear-history');
  const languageSelect = document.getElementById('language-select');
  const exportButton = document.getElementById('export-history');
  const importButton = document.getElementById('import-history');
  const importFile = document.getElementById('import-file');
  const toggleThemeButton = document.getElementById('toggle-theme');
  const toggleNotificationsButton = document.getElementById('toggle-notifications');
  const loader = document.getElementById('loader');
  const autocompleteContainer = document.getElementById('autocomplete-container');
  const autocompleteList = document.getElementById('autocomplete-list');

  // Загрузка настроек и истории чата
  chrome.storage.local.get(['chatHistory', 'language', 'theme', 'previousQueries', 'notificationsEnabled', 'defaultPrompt'], function(result) {
    if (result.chatHistory) {
      chatMessages.innerHTML = result.chatHistory;
    }
    if (result.language) {
      currentLanguage = result.language;
      languageSelect.value = currentLanguage;
    }
    if (result.theme === 'dark') {
      toggleTheme();
    }
    if (result.previousQueries) {
      previousQueries = result.previousQueries;
    }
    if (result.notificationsEnabled !== undefined) {
      notificationsEnabled = result.notificationsEnabled;
      updateNotificationButtonText();
    }
    if (result.defaultPrompt) {
      defaultPrompt = result.defaultPrompt;
    }
  });

  submitButton.addEventListener('click', sendMessage);
  promptInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  clearHistoryButton.addEventListener('click', function() {
    if (confirm("Вы уверены, что хотите очистить историю чата?")) {
      chatMessages.innerHTML = '';
      chrome.storage.local.remove('chatHistory');
    }
  });

  languageSelect.addEventListener('change', function() {
    currentLanguage = this.value;
    chrome.storage.local.set({ language: currentLanguage });
  });

  exportButton.addEventListener('click', function() {
    const chatHistory = chatMessages.innerHTML;
    const blob = new Blob([chatHistory], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.html';
    a.click();
  });

  importButton.addEventListener('click', function() {
    importFile.click();
  });

  importFile.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        chatMessages.innerHTML = e.target.result;
        chrome.storage.local.set({ chatHistory: chatMessages.innerHTML });
      };
      reader.readAsText(file, 'UTF-8');
    }
  });

  toggleThemeButton.addEventListener('click', toggleTheme);

  toggleNotificationsButton.addEventListener('click', function() {
    notificationsEnabled = !notificationsEnabled;
    chrome.storage.local.set({ notificationsEnabled: notificationsEnabled });
    updateNotificationButtonText();
  });

  document.getElementById('set-prompt').addEventListener('click', showPromptModal);
  document.getElementById('close-prompt-modal').addEventListener('click', hidePromptModal);
  document.getElementById('save-prompt').addEventListener('click', saveDefaultPrompt);
  document.getElementById('show-current-prompt').addEventListener('click', showCurrentPromptModal);
  document.getElementById('close-current-prompt-modal').addEventListener('click', hideCurrentPromptModal);
  document.getElementById('edit-current-prompt').addEventListener('click', editCurrentPrompt);

  document.getElementById('prompt-modal').addEventListener('click', function(event) {
    if (event.target === this) {
      hidePromptModal();
    }
  });

  document.getElementById('current-prompt-modal').addEventListener('click', function(event) {
    if (event.target === this) {
      hideCurrentPromptModal();
    }
  });

  promptInput.addEventListener('input', function() {
    const input = this.value.toLowerCase();
    if (input.length > 1) {
      const matches = previousQueries.filter(q => q.toLowerCase().startsWith(input));
      if (matches.length > 0) {
        showAutocomplete(matches);
      } else {
        hideAutocomplete();
      }
    } else {
      hideAutocomplete();
    }
  });
});

async function sendMessage() {
  const promptInput = document.getElementById('prompt');
  const chatMessages = document.getElementById('chat-messages');
  const loader = document.getElementById('loader');

  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const fullPrompt = defaultPrompt ? `${defaultPrompt}\n\n${prompt}` : prompt;

  addMessageToChat('user', prompt);
  promptInput.value = '';
  loader.classList.remove('hidden');

  try {
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
      addMessageToChat('bot', "Gemini Nano недоступен");
    } else {
      const session = await window.ai.createTextSession();
      const detectedLanguage = currentLanguage === 'auto' ? detectLanguage(fullPrompt) : currentLanguage;
      const result = await session.prompt(`[${detectedLanguage}] ${fullPrompt}`);
      addMessageToChat('bot', result);
      if (notificationsEnabled) {
        sendNotification("Новое сообщение от Gemini", result.substring(0, 50) + "...");
      }
    }
  } catch (error) {
    addMessageToChat('bot', 'Произошла ошибка: ' + error.message);
  } finally {
    loader.classList.add('hidden');
  }

  // Обновление списка предыдущих запросов
  previousQueries.unshift(prompt);
  previousQueries = previousQueries.slice(0, 10);
  chrome.storage.local.set({ previousQueries: previousQueries });
}

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme');
  chrome.storage.local.set({ theme: isDarkTheme ? 'dark' : 'light' });
}

function updateNotificationButtonText() {
  const toggleNotificationsButton = document.getElementById('toggle-notifications');
  toggleNotificationsButton.textContent = notificationsEnabled ? "🔔" : "🔕";
}

function addMessageToChat(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender + '-message');
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Сохранение истории чата
  chrome.storage.local.set({ chatHistory: chatMessages.innerHTML });
}

function detectLanguage(text) {
  const russianRegex = /[а-яА-Я]/;
  const japaneseRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;
  
  if (russianRegex.test(text)) return 'ru';
  if (japaneseRegex.test(text)) return 'ja';
  return 'en'; // По умолчанию английский
}

function showAutocomplete(matches) {
  const autocompleteList = document.getElementById('autocomplete-list');
  const autocompleteContainer = document.getElementById('autocomplete-container');
  autocompleteList.innerHTML = '';
  matches.forEach(match => {
    const li = document.createElement('li');
    li.textContent = match;
    li.addEventListener('click', function() {
      document.getElementById('prompt').value = this.textContent;
      hideAutocomplete();
    });
    autocompleteList.appendChild(li);
  });
  autocompleteContainer.classList.remove('hidden');
}

function hideAutocomplete() {
  document.getElementById('autocomplete-container').classList.add('hidden');
}

function sendNotification(title, message) {
  chrome.runtime.sendMessage({action: "sendNotification", title: title, message: message});
}

function showPromptModal() {
  const modal = document.getElementById('prompt-modal');
  const defaultPromptTextarea = document.getElementById('default-prompt');
  defaultPromptTextarea.value = defaultPrompt;
  modal.classList.remove('hidden');
}

function hidePromptModal() {
  const modal = document.getElementById('prompt-modal');
  modal.classList.add('hidden');
}

function saveDefaultPrompt() {
  const defaultPromptTextarea = document.getElementById('default-prompt');
  defaultPrompt = defaultPromptTextarea.value.trim();
  chrome.storage.local.set({ defaultPrompt: defaultPrompt }, function() {
    hidePromptModal();
  });
}

function showCurrentPromptModal() {
  const modal = document.getElementById('current-prompt-modal');
  const currentPromptText = document.getElementById('current-prompt-text');
  currentPromptText.textContent = defaultPrompt || 'Промпт не установлен';
  modal.classList.remove('hidden');
}

function hideCurrentPromptModal() {
  const modal = document.getElementById('current-prompt-modal');
  modal.classList.add('hidden');
}

function editCurrentPrompt() {
  hideCurrentPromptModal();
  showPromptModal();
}

// Добавьте информацию об авторстве в консоль
//console.log("Gemini Chat разработан Goroshcko.ru");