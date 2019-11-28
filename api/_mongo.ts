import url from 'url';
import { MongoClient, Db } from 'mongodb';
import { IGlobalConfig, IUserConfig } from './_interface';
import { configs } from './_settings';
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

export async function getGlobalConfig(): Promise<IGlobalConfig> {
  const db = await getDb();
  return db.collection(configs.COLLECTION).findOne({ _type: 'globalConfig' });
}

export async function getUserConfig(userId: string): Promise<IUserConfig> {
  const db = await getDb();
  return db
    .collection(configs.COLLECTION)
    .findOne({ _type: 'userConfig', userId: userId } as IUserConfig);
}

export async function setUserConfig(userId: string, payload: IUserConfig): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(configs.COLLECTION).updateOne(
    { _type: 'userConfig', userId: userId },
    { $set: payload },
    {
      upsert: true,
    }
  );
  return result.matchedCount === 1 || result.upsertedCount === 1 || result.modifiedCount === 1;
}

export async function deleteUserConfig(userId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection(configs.COLLECTION)
    .deleteOne({ _type: 'userConfig', userId: userId });
  return result.deletedCount === 1;
}

export async function getUsersConfig(): Promise<Array<IUserConfig>> {
  const db = await getDb();
  return db
    .collection(configs.COLLECTION)
    .find({ _type: 'userConfig' })
    .toArray();
}
