import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../server/data/lifekline.db'));

// 导入文章
function importArticles() {
  const articlesPath = path.join(__dirname, 'generated-articles.json');
  if (!fs.existsSync(articlesPath)) {
    console.log('未找到 generated-articles.json，请先运行 generate-content.js');
    return;
  }

  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO knowledge_articles
    (id, slug, title, category, level, tags, summary, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of articles) {
    stmt.run(
      a.id,
      a.slug,
      a.title,
      a.category,
      a.level || 1,
      JSON.stringify(a.tags || []),
      a.summary,
      a.content,
      a.createdAt || new Date().toISOString()
    );
    console.log(`导入: ${a.title}`);
  }

  console.log(`\n共导入 ${articles.length} 篇文章`);
}

importArticles();
