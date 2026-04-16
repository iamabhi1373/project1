function buildLocalFallbackResponse(currentQuestion) {
  const q = String(currentQuestion || "").trim();
  if (!q) return "Please type a question and try again.";

  return [
    "I can’t reach Gemini right now, but here’s a helpful starting point:",
    "",
    `Your question: "${q}"`,
    "",
    "Try this:",
    "1) Identify what you’re given.",
    "2) Identify what you need to find.",
    "3) Break the solution into 2-3 small steps.",
    "4) Work through one example slowly, then generalize.",
    "",
    "If you share what part feels confusing (definitions, formulas, or steps), I can tailor the explanation."
  ].join("\n");
}

async function generateGeminiResponse(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey || apiKey === "your_gemini_key") {
    throw new Error("GEMINI_API_KEY missing/placeholder");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini generation failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("");

  if (!text) {
    throw new Error("Gemini generation response missing text");
  }

  return text;
}

async function generateResponse({ prompt, currentQuestion }) {
  try {
    return await generateGeminiResponse(prompt);
  } catch (error) {
    console.warn("Gemini response failed; using local fallback:", error.message || error);
    return buildLocalFallbackResponse(currentQuestion);
  }
}

module.exports = {
  generateResponse,
};

