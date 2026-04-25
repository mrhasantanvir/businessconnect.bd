import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const mysqlPrisma = new PrismaClient();
const sqliteDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new sqlite3.Database(sqliteDbPath);

const dbAll = promisify(db.all).bind(db);

async function migrate() {
  console.log('🚀 Starting Data Migration: SQLite -> MySQL');
  
  try {
    // 1. Get all tables from SQLite
    const tables: any[] = await dbAll("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'");
    
    for (const table of tables) {
      const tableName = table.name;
      console.log(`📦 Migrating table: ${tableName}...`);
      
      const rows: any[] = await dbAll(`SELECT * FROM ${tableName}`);
      
      if (rows.length === 0) {
        console.log(`ℹ️ Table ${tableName} is empty, skipping.`);
        continue;
      }

      // Using raw SQL to bypass Prisma validation for mass migration
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          return v;
        });

        const sql = `INSERT IGNORE INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${values.join(', ')})`;
        
        try {
          await mysqlPrisma.$executeRawUnsafe(sql);
        } catch (err: any) {
          console.error(`❌ Error in row of ${tableName}:`, err.message);
        }
      }
      console.log(`✅ Table ${tableName} migrated.`);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    db.close();
    await mysqlPrisma.$disconnect();
  }
}

migrate();
