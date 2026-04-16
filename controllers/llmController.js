const { generateResponse } = require("../services/generationService");

async function respond(req, res) {
  try {
    const { prompt, currentQuestion } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "prompt is required",
      });
    }

    const text = await generateResponse({ prompt, currentQuestion });

    return res.json({
      success: true,
      responseText: text,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = { respond };

