const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectMongoDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    await client.db(process.env.MONGO_DB_NAME).command({ ping: 1 });

    console.log("Pinged success. MongoDB successfully connected!");

    return client;
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.error("Mongo DB connection error: ", error);

    await client.close();

    process.exit(1);
  }
}

module.exports = connectMongoDB;
