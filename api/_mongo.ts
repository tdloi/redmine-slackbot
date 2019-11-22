import url from 'url';
import { MongoClient, Db } from 'mongodb';
// Create cached connection variable
let cachedDb = null;

// A function for connecting to MongoDB,
// taking a single paramater of the connection string
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Select the database through the connection,
  // using the database path of the connection string
  // Cache the database connection and return the connection
  cachedDb = client.db(url.parse(uri).pathname.substr(1));
  return cachedDb;
}
