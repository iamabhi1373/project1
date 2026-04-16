const { v4: uuidv4 } = require("uuid");
const { generateEmbedding } = require("../services/embeddingService");
const { upsertPoint, searchByStudent } = require("../services/vectorStoreService");

async function saveMemory(req, res) {
  try {
    const {
      student_id,
      message,
      subject,
      topic,
      language,
      quiz_score,
    } = req.body;

    if (!student_id || !message) {
      return res.status(400).json({
        success: false,
        error: "student_id and message are required",
      });
    }

    const embedding = await generateEmbedding(message);

    const result = await upsertPoint({
      id: uuidv4(),
      vector: embedding,
      payload: {
        student_id,
        message,
        subject,
        topic,
        language,
        quiz_score,
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      message: "Memory stored successfully",
      store: result.store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function retrieveMemory(req, res) {
    try {
      const { student_id, query } = req.body;

      if (!student_id || !query) {
        return res.status(400).json({
          success: false,
          error: "student_id and query are required",
        });
      }
  
      const embedding = await generateEmbedding(query);
  
      const searchResult = await searchByStudent({
        vector: embedding,
        limit: 5,
        studentId: student_id,
      });
  
      res.json({
        success: true,
        memories: searchResult.results,
        store: searchResult.store,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

module.exports = {
  saveMemory,
  retrieveMemory,
};