const chatLogs = document.getElementById('chatlogs');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // prevent newline
    sendMessage();
  }
});

resetBtn.addEventListener('click', async () => {
  chatLogs.innerHTML = '';
  appendMessage("System", "🧼 Chat has been reset.");

  try {
    await fetch("http://localhost:5000/reset", { method: "POST" });
  } catch (err) {
    console.error("Reset failed:", err);
  }
});

async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage("You", userMessage);
  chatInput.value = "";

  const fullMessage = userMessage + " (Answer briefly and only what is asked.)";

  try {
    const response = await fetch("http://localhost:5000/chat", {
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

function appendMessage(sender, message) {
  const msg = document.createElement('div');
  msg.innerHTML = `<strong>${sender}:</strong> ${markdownToHTML(message)}`;
  chatLogs.appendChild(msg);
  chatLogs.scrollTop = chatLogs.scrollHeight;
}

// Enhanced simple markdown converter with list support
function markdownToHTML(text) {
  // Escape HTML tags for safety (optional, if you want raw HTML blocked)
  // text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Convert bold and italic first
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>');             // italic

  // Split into lines to handle lists and line breaks
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
      // Replace line breaks except after last line
      result += line;
      if (index !== lines.length -1) result += '<br>';
    }
  });

  if (inList) {
    result += '</ul>';
  }

  return result;
}
