const { client, COLLECTION_NAME } = require("./qdrantService");
const fs = require("fs");
const path = require("path");

const inMemoryPoints = [];
const DATA_DIR = path.join(__dirname, "..", "data");
const FALLBACK_FILE = path.join(DATA_DIR, "fallback-memory.json");

function hydrateFromDisk() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FALLBACK_FILE)) {
      fs.writeFileSync(FALLBACK_FILE, "[]", "utf8");
      return;
    }
    const raw = fs.readFileSync(FALLBACK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryPoints.push(...parsed);
    }
  } catch (error) {
    console.warn("Failed to load fallback memory from disk:", error.message);
  }
}

function persistToDisk() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(inMemoryPoints, null, 2), "utf8");
  } catch (error) {
    console.warn("Failed to persist fallback memory to disk:", error.message);
  }
}

hydrateFromDisk();

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return -1;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return -1;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function upsertPoint(point) {
  try {
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [point],
    });
    return { store: "qdrant" };
  } catch (error) {
    inMemoryPoints.push(point);
    persistToDisk();
    console.warn(
      "Qdrant unavailable, stored point in-memory:",
      error.message || error
    );
    return { store: "memory" };
  }
}

async function searchByStudent({ vector, studentId, limit = 5 }) {
  try {
    const searchResult = await client.search(COLLECTION_NAME, {
      vector,
      limit,
      filter: {
        must: [
          {
            key: "student_id",
            match: {
              value: studentId,
            },
          },
        ],
      },
    });

    return {
      store: "qdrant",
      results: searchResult.map((item) => item.payload),
    };
  } catch (error) {
    const ranked = inMemoryPoints
      .filter((point) => point.payload && point.payload.student_id === studentId)
      .map((point) => ({
        payload: point.payload,
        score: cosineSimilarity(vector, point.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.payload);

    console.warn(
      "Qdrant unavailable, served results from in-memory store:",
      error.message || error
    );

    return {
      store: "memory",
      results: ranked,
    };
  }
}

module.exports = {
  upsertPoint,
  searchByStudent,
};
