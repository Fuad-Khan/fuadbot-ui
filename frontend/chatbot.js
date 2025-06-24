const API_URL = "https://fuadbot-api.onrender.com"; // 🌐 Your Render backend URL

const chatLogs = document.getElementById('chatlogs');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // prevent new line
    sendMessage();
  }
});

// Reset button clears chat + backend memory
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

  const fullMessage = userMessage + " (Answer briefly and only what is asked.)";

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: fullMessage })
    });

    const data = await response.json();
    appendMessage("FuadBot", data.reply);
  } catch (err) {
    appendMessage("Error", "Something went wrong 😥");
    console.error(err);
  }
}

// Renders chat messages with markdown formatting
function appendMessage(sender, message) {
  const msg = document.createElement('div');
  msg.innerHTML = `<strong>${sender}:</strong> ${markdownToHTML(message)}`;
  chatLogs.appendChild(msg);
  chatLogs.scrollTop = chatLogs.scrollHeight;
}

// Markdown converter (bold, italic, list, line breaks)
function markdownToHTML(text) {
  // Optional: escape HTML for safety
  // text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>');             // italic

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
