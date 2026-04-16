function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPersonalizedPrompt(userMemories, currentQuestion) {
  let weakSubjects = [];
  let preferredLanguage = "English";

  (userMemories || []).forEach((memory) => {
    if (typeof memory.quiz_score === "number" && memory.quiz_score < 50) {
      if (memory.subject) weakSubjects.push(memory.subject);
    }

    if (memory.language) preferredLanguage = memory.language;
  });

  weakSubjects = [...new Set(weakSubjects)];

  return `
  You are a helpful educational tutor.

  Student Preferred Language: ${preferredLanguage}
  Weak Subjects: ${weakSubjects.join(", ")}

  Current Student Question:
  ${currentQuestion}

  Explain in simple language.
  Give short examples.
  If the topic is weak for the student, explain more carefully.
  `;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function appendMessage(role, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function setError(message) {
  const errorBox = document.getElementById("errorBox");
  if (!message) {
    errorBox.style.display = "none";
    errorBox.textContent = "";
    return;
  }
  errorBox.style.display = "block";
  errorBox.textContent = message;
}

function renderMemories(memories) {
  const wrap = document.getElementById("memories");
  wrap.innerHTML = "";

  if (!memories || memories.length === 0) {
    wrap.textContent = "No memories found for this student/question yet.";
    return;
  }

  memories.forEach((m) => {
    const item = document.createElement("div");
    item.className = "memory-item";
    item.innerHTML = `
      <div><b>Student:</b> ${escapeHtml(m.student_id || "")}</div>
      <div><b>Message:</b> ${escapeHtml(m.message || "")}</div>
      <div><b>Subject:</b> ${escapeHtml(m.subject || "")}</div>
      <div><b>Topic:</b> ${escapeHtml(m.topic || "")}</div>
    `;
    wrap.appendChild(item);
  });
}

async function handleSend() {
  setError("");
  const studentId = document.getElementById("studentId").value.trim();
  const messageInput = document.getElementById("messageInput");
  const text = messageInput.value.trim();

  if (!studentId) return setError("Student ID is required.");
  if (!text) return setError("Message is required.");

  appendMessage("user", text);
  messageInput.value = "";

  const sendBtn = document.getElementById("sendBtn");
  sendBtn.disabled = true;

  try {
    // 1) Retrieve memories
    const retrieve = await postJson("/api/memory/retrieve-memory", {
      student_id: studentId,
      query: text,
    });

    renderMemories(retrieve.memories);

    // 2) Personalized prompt
    const prompt = buildPersonalizedPrompt(retrieve.memories, text);

    // 3) Generate assistant response
    const llmRes = await fetch("/api/llm/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, currentQuestion: text }),
    });

    const llmData = await llmRes.json();
    if (!llmRes.ok || !llmData.success) {
      throw new Error(llmData.error || `LLM request failed (${llmRes.status})`);
    }

    const responseText = llmData.responseText;
    appendMessage("assistant", responseText);

    // 4) Save interaction
    await postJson("/api/memory/save-memory", {
      student_id: studentId,
      message: text,
    });

    await postJson("/api/memory/save-memory", {
      student_id: studentId,
      message: responseText,
      language: "English",
    });
  } catch (error) {
    setError(error.message || String(error));
  } finally {
    sendBtn.disabled = false;
  }
}

function setupSpeechRecognition() {
  const micBtn = document.getElementById("micBtn");
  const micStatus = document.getElementById("micStatus");
  const input = document.getElementById("messageInput");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micStatus.textContent = "SpeechRecognition not supported in this browser.";
    micBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    micStatus.textContent = "Listening...";
  };

  recognition.onerror = (event) => {
    micStatus.textContent = `Mic error: ${event.error || "unknown"}`;
  };

  recognition.onend = () => {
    micStatus.textContent = "";
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
  };

  micBtn.addEventListener("click", () => {
    recognition.start();
  });
}

function setupUi() {
  setupVapiWidgetIfConfigured();

  document.getElementById("sendBtn").addEventListener("click", handleSend);
  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("chat").innerHTML = "";
    document.getElementById("memories").innerHTML = "";
    setError("");
  });

  // Enter to send (when textarea focused)
  document.getElementById("messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  });

  setupSpeechRecognition();
}

setupUi();

function setupVapiWidgetIfConfigured() {
  // Optional Vapi integration.
  // Set values in the browser console/localStorage:
  //   localStorage.setItem("vapiPublicKey","...");
  //   localStorage.setItem("vapiAssistantId","...");
  const publicKey = localStorage.getItem("vapiPublicKey");
  const assistantId = localStorage.getItem("vapiAssistantId");
  if (!publicKey || !assistantId) return;

  const existing = document.querySelector("vapi-widget");
  if (existing) return;

  const widget = document.createElement("vapi-widget");
  widget.setAttribute("public-key", publicKey);
  widget.setAttribute("assistant-id", assistantId);
  widget.setAttribute("mode", "voice");
  widget.setAttribute("theme", "light");
  widget.setAttribute("size", "compact");
  widget.setAttribute("position", "bottom-right");
  widget.style.zIndex = "9999";
  document.body.appendChild(widget);
}

