const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  checkCompatibility: false,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION;
const EMBEDDING_DIMENSION = Number(process.env.EMBEDDING_DIMENSION || 768);

async function createCollection() {
  if (!COLLECTION_NAME) {
    console.warn(
      "QDRANT_COLLECTION missing. Running with fallback vector store only."
    );
    return false;
  }

  try {
    const collections = await client.getCollections();

    const exists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: "Cosine",
        },
      });

      console.log("Qdrant collection created");
    }

    return true;
  } catch (error) {
    console.warn(
      "Qdrant unavailable at startup. Running in fallback mode:",
      error.message
    );
    return false;
  }
}

module.exports = {
  client,
  COLLECTION_NAME,
  createCollection,
};