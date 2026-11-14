import {DatabaseSync} from 'node:sqlite'


export const db = new DatabaseSync('./study.db')

db.exec(
    `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
    
    )
    `
)