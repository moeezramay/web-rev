import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'sprintboard';  

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (global._mongoClientPromise) {
    clientPromise = global._mongoClientPromise;
  } else {
    global._mongoClientPromise = client.connect();
    clientPromise = global._mongoClientPromise;
  }
} else {
  clientPromise = client.connect();
}

// Test the MongoDB connection
async function testConnection() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}

testConnection();  // Call test connection when app starts

export default clientPromise;
