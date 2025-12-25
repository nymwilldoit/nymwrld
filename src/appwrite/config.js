import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite Configuration
export const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID || 'portfolio_db';
export const PROJECTS_COLLECTION_ID = process.env.REACT_APP_PROJECTS_COLLECTION_ID || 'projects';
export const ABOUT_COLLECTION_ID = 'about';
export const MESSAGES_COLLECTION_ID = 'messages';
export const STORAGE_BUCKET_ID = process.env.REACT_APP_STORAGE_BUCKET_ID || 'project_images';

// Initialize Appwrite Client
const client = new Client();

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
