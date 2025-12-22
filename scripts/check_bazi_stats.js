import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../server/data/lifekline.db');

console.log(`Checking database at: ${DB_PATH}`);

try {
  const db = new Database(DB_PATH, { readonly: true });

  // Check user_inputs table
  const inputCount = db.prepare('SELECT COUNT(*) as count FROM user_inputs').get().count;
  const uniqueInputUsers = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_inputs WHERE user_id IS NOT NULL').get().count;
  
  // Check valid inputs (with at least year pillar)
  const validInputs = db.prepare('SELECT COUNT(*) as count FROM user_inputs WHERE year_pillar IS NOT NULL').get().count;

  // Check anonymous users (distinct IPs where user_id is null)
  const anonymousUsers = db.prepare('SELECT COUNT(DISTINCT ip_address) as count FROM user_inputs WHERE user_id IS NULL').get().count;

  // Check user_profiles table
  let profileCount = 0;
  let uniqueProfileUsers = 0;
  try {
      // user_profiles might not exist if migration hasn't run, handle gracefully
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'").get();
      if (tableExists) {
          profileCount = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get().count;
          uniqueProfileUsers = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_profiles').get().count;
      }
  } catch (e) {
      console.log('user_profiles table check failed:', e.message);
  }

  // Check celebrity_cases table
  let celebrityCount = 0;
  try {
       const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='celebrity_cases'").get();
       if (tableExists) {
           celebrityCount = db.prepare('SELECT COUNT(*) as count FROM celebrity_cases').get().count;
       }
  } catch (e) {
      console.log('celebrity_cases table check failed:', e.message);
  }

  console.log('\n=== BaZi Data Statistics ===');
  console.log(`Anonymous Users (Distinct IPs): ${anonymousUsers}`);
  console.log(`Total Estimated Users: ${uniqueInputUsers + anonymousUsers}`);
  console.log(`Total User Inputs Records: ${inputCount}`);
  console.log(`Valid User Inputs (with pillars): ${validInputs}`);
  console.log(`Unique Users with Inputs: ${uniqueInputUsers}`);
  
  if (profileCount > 0) {
      console.log(`Total User Profiles: ${profileCount}`);
      console.log(`Unique Users with Profiles: ${uniqueProfileUsers}`);
  }

  if (celebrityCount > 0) {
      console.log(`Celebrity Cases: ${celebrityCount}`);
  }

  // Sample some data to verify
  if (inputCount > 0) {
      console.log('\n=== Sample Input Data (Latest 3) ===');
      const samples = db.prepare(`
          SELECT id, user_id, gender, birth_year, year_pillar, month_pillar, day_pillar, hour_pillar, created_at 
          FROM user_inputs 
          ORDER BY created_at DESC 
          LIMIT 3
      `).all();
      console.table(samples);
  }

} catch (error) {
  console.error('Error querying database:', error);
}
