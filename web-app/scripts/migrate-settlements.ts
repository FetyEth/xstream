// Manual migration script to create Settlement table
import { prisma } from '../lib/prisma';

async function migrate() {
  try {
    console.log('🔄 Creating Settlement table and adding User fields...');
    
    // This will use Prisma to execute raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS settlements (
        id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        status TEXT DEFAULT 'PENDING',
        tx_hash TEXT,
        error_message TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    // Add new fields to users table
    await prisma.$executeRaw`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS auto_withdraw_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS auto_withdraw_threshold DECIMAL(18, 8) DEFAULT 50
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Settlements table created');
    console.log('📊 User auto-withdraw fields added');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('⚠️  Tables already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
