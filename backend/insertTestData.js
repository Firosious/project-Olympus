const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");

    const database = client.db("ProjectOlympus"); // Replace with your DB name
    const users = database.collection("users"); // Replace with your collection name

    // Create a document to insert
    const doc = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      googleId: "1234567890"
    };

    const result = await users.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
