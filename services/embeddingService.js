const EMBEDDING_DIMENSION = Number(process.env.EMBEDDING_DIMENSION || 768);

function generateLocalEmbedding(text, dimension = EMBEDDING_DIMENSION) {
  const vector = new Array(dimension).fill(0);
  const input = String(text || "");

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    const index = (code + i * 31) % dimension;
    vector[index] += (code % 97) / 97;
  }

  let norm = 0;
  for (let i = 0; i < vector.length; i += 1) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm === 0) {
    return vector;
  }

  return vector.map((value) => value / norm);
}

async function generateGeminiEmbedding(text, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini embedding failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  if (!data.embedding || !Array.isArray(data.embedding.values)) {
    throw new Error("Gemini embedding response missing embedding values");
  }

  return data.embedding.values;
}

async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_key") {
    console.warn("Gemini key missing/placeholder, using local embeddings.");
    return generateLocalEmbedding(text);
  }

  try {
    return await generateGeminiEmbedding(text, apiKey);
  } catch (error) {
    console.warn(
      "Gemini embedding failed, using local embeddings:",
      error.message || error
    );
    return generateLocalEmbedding(text);
  }
}

module.exports = {
  generateEmbedding,
};