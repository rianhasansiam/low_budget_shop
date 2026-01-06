import { MongoClient, ServerApiVersion, Db, Document } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};






let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {


  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {



    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();

    
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {

  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;











const DB_NAME = process.env.MONGODB_DB_NAME || "lowbudget_ecommerce";

// Helper function to get database instance
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Helper function to get a specific collection
export async function getCollection<T extends Document>(collectionName: string) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}
