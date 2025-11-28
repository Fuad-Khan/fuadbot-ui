// 🌐 Backend URL
// Local dev:
// const API_URL = "http://127.0.0.1:5000";
// When deploying, switch to:
const API_URL = "https://fuadbot-api.onrender.com";

const chatLogs = document.getElementById('chatlogs');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key (no Shift)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Reset button clears chat + ping backend /reset
resetBtn.addEventListener('click', async () => {
  chatLogs.innerHTML = '';
  appendMessage("System", "🧼 Chat has been reset.");

  try {
    await fetch(`${API_URL}/reset`, { method: "POST" });
  } catch (err) {
    console.error("Reset failed:", err);
  }
});

// Main send logic
async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage("You", userMessage);
  chatInput.value = "";
  chatInput.focus();

  // Typing indicator
  const loadingMsg = document.createElement('div');
  loadingMsg.classList.add('loading-msg');
  loadingMsg.innerHTML = `<strong>FuadBot:</strong> ⏳ Typing...`;
  chatLogs.appendChild(loadingMsg);
  chatLogs.scrollTop = chatLogs.scrollHeight;

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }) // backend adds “answer briefly”
    });

    const data = await response.json();
    chatLogs.removeChild(loadingMsg);

    if (response.ok && data.reply) {
      appendMessage("FuadBot", data.reply);
    } else {
      appendMessage("Error", data.detail || "Something went wrong 😥");
      console.error("Backend error:", data);
    }
  } catch (err) {
    chatLogs.removeChild(loadingMsg);
    appendMessage("Error", "Something went wrong 😥");
    console.error(err);
  }
}

// Renders chat messages with markdown formatting + clickable links
function appendMessage(sender, message) {
  const msg = document.createElement('div');
  msg.innerHTML = `<strong>${sender}:</strong> ${markdownToHTML(message)}`;
  chatLogs.appendChild(msg);
  chatLogs.scrollTop = chatLogs.scrollHeight;
}

// Markdown converter: bold, italic, links, lists, line breaks
function markdownToHTML(text) {
  // Escape HTML
  text = text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;");

  // Basic markdown
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')             // *italic*
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); // links

  // Lists + line breaks
  const lines = html.split('\n');
  let inList = false;
  let result = '';

  lines.forEach((line, index) => {
    if (line.startsWith('* ')) {
      if (!inList) {
        inList = true;
        result += '<ul>';
      }
      result += `<li>${line.slice(2).trim()}</li>`;
    } else {
      if (inList) {
        inList = false;
        result += '</ul>';
      }
      result += line;
      if (index !== lines.length - 1) result += '<br>';
    }
  });

  if (inList) result += '</ul>';
  return result;
}
