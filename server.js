require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const memoryRoutes = require("./routes/memoryRoutes");
const { createCollection } = require("./services/qdrantService");
const llmRoutes = require("./routes/llmRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/memory", memoryRoutes);
app.use("/api/llm", llmRoutes);

// Serve frontend
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  createCollection();
});