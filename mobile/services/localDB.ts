/**
 * localDB.ts — SQLite offline cache via expo-sqlite
 * Stores transactions and categories locally for offline access.
 * Synced with the server whenever the app comes to the foreground.
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('smartspend.db');
  }
  return db;
}

export async function initLocalDB(): Promise<void> {
  const database = await getDB();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      notes TEXT,
      date TEXT NOT NULL,
      categoryId TEXT,
      categoryName TEXT,
      categoryIcon TEXT,
      accountId TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      type TEXT,
      userId TEXT
    );
  `);
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface LocalTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  notes?: string;
  date: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  accountId?: string;
  createdAt?: string;
}

export async function upsertTransactions(items: LocalTransaction[]): Promise<void> {
  if (!items.length) return;
  const database = await getDB();
  await database.withTransactionAsync(async () => {
    for (const t of items) {
      await database.runAsync(
        `INSERT OR REPLACE INTO transactions
          (id, type, amount, description, notes, date, categoryId, categoryName, categoryIcon, accountId, createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          t.id, t.type, t.amount,
          t.description ?? null, t.notes ?? null,
          t.date,
          t.categoryId ?? null, t.categoryName ?? null, t.categoryIcon ?? null,
          t.accountId ?? null, t.createdAt ?? null,
        ],
      );
    }
  });
}

export async function getLocalTransactions(limit = 50): Promise<LocalTransaction[]> {
  const database = await getDB();
  return database.getAllAsync<LocalTransaction>(
    'SELECT * FROM transactions ORDER BY date DESC LIMIT ?',
    [limit],
  );
}

export async function deleteLocalTransaction(id: string): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function clearLocalTransactions(): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM transactions');
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface LocalCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type?: string;
  userId?: string;
}

export async function upsertCategories(items: LocalCategory[]): Promise<void> {
  if (!items.length) return;
  const database = await getDB();
  await database.withTransactionAsync(async () => {
    for (const c of items) {
      await database.runAsync(
        `INSERT OR REPLACE INTO categories (id, name, icon, color, type, userId)
         VALUES (?,?,?,?,?,?)`,
        [c.id, c.name, c.icon ?? null, c.color ?? null, c.type ?? null, c.userId ?? null],
      );
    }
  });
}

export async function getLocalCategories(): Promise<LocalCategory[]> {
  const database = await getDB();
  return database.getAllAsync<LocalCategory>('SELECT * FROM categories ORDER BY name ASC');
}

export async function clearLocalCategories(): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM categories');
}
