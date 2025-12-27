import { Client, Account, Databases, Storage, Query } from 'appwrite';

// Appwrite Configuration
export const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID || 'portfolio_db';
export const PROJECTS_COLLECTION_ID = process.env.REACT_APP_PROJECTS_COLLECTION_ID || 'projects';
export const ABOUT_COLLECTION_ID = 'about';
export const MESSAGES_COLLECTION_ID = 'messages';
export const STORAGE_BUCKET_ID = process.env.REACT_APP_STORAGE_BUCKET_ID || 'project_images';

// ⚠️ IMPORTANT: Set this to your main admin user ID
// Get it from: Appwrite Console → Auth → Users → Click on your user → Copy the $id
export const OWNER_USER_ID = '694da06e0037f556a82a';

// Initialize Appwrite Client
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export Query for use in other files
export { Query };

// Helper function: Get current logged-in user
export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    console.error('Not authenticated:', error);
    return null;
  }
};

// Helper function: Check if current user is the owner/super admin
export const isOwner = async () => {
  try {
    const user = await account.get();
    return user.$id === OWNER_USER_ID;
  } catch (error) {
    console.error('Error checking owner status:', error);
    return false;
  }
};

// Helper function: Check if user can edit a specific profile
export const canEditProfile = async (profileUserId) => {
  try {
    const user = await account.get();
    // Can edit if it's own profile OR if user is owner
    return user.$id === profileUserId || user.$id === OWNER_USER_ID;
  } catch (error) {
    return false;
  }
};

export default client;
