import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite configuration from environment variables
const client = new Client();

client
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs from environment
export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
export const PROJECTS_COLLECTION_ID = process.env.REACT_APP_PROJECTS_COLLECTION_ID;
export const STORAGE_BUCKET_ID = process.env.REACT_APP_STORAGE_BUCKET_ID;

export default client;
