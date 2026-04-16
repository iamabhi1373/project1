const express = require("express");
const router = express.Router();

const {
  saveMemory,
  retrieveMemory,
} = require("../controllers/memoryController");

router.post("/save-memory", saveMemory);
router.post("/retrieve-memory", retrieveMemory);

module.exports = router;