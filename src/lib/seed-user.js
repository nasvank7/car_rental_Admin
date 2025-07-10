
import { openDb } from '../lib/database.js'; 
import { hashPassword } from '../lib/auth.js'; 

async function insertInitialUser() {
  const db = await openDb();

  const username = 'admin';
  const plainPassword = 'admin123';
  const hashedPassword = await hashPassword(plainPassword);

  try {
    await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    console.log('User inserted successfully');
  } catch (error) {
    console.error('Error inserting user:', error.message);
  } finally {
    await db.close();
  }
}

insertInitialUser();