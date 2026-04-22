import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../db.json');

// Default data structure
const defaultData = {
  users: [],
  messages: [],
};

let db = null;

export const getDB = async () => {
  if (!db) {
    db = new Low(new JSONFile(dbPath), defaultData);
    await db.read();
    db.data ||= defaultData;
  }
  return db;
};

export const connectDB = async () => {
  try {
    await getDB();
    console.log(`✓ Local database connected: ${dbPath}`);
  } catch (error) {
    console.error('✗ Database error:', error);
    throw error;
  }
};

export default { connectDB, getDB };
