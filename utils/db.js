// utils/db.js
// Uses expo-sqlite when available, otherwise falls back to AsyncStorage.
// API: initDB(), addScore(username, score), getTopScores(limit, distinctBest),
//      getUserBest(username), clearScores()
// Exports: { initDB, addScore, getTopScores, getUserBest, clearScores, dbBackend }

import AsyncStorage from '@react-native-async-storage/async-storage';

let SQLite = null;
try {
  // require so bundlers on web don't fail at parse time
  // (web may not have expo-sqlite)
  // eslint-disable-next-line global-require
  SQLite = require('expo-sqlite');
} catch (e) {
  SQLite = null;
}

const USE_SQLITE = !!(SQLite && typeof SQLite.openDatabase === 'function');

let initDB;
let addScore;
let getTopScores;
let getUserBest;
let clearScores;

if (USE_SQLITE) {
  // ---------- SQLite implementation ----------
  const db = SQLite.openDatabase('tapdash.db');

  function executeSql(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, err) => {
            console.error('SQL error:', err);
            reject(err);
            return false;
          }
        );
      });
    });
  }

  initDB = async () => {
    await executeSql(
      `CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );`
    );
  };

  addScore = async (username, score) => {
    const ts = Date.now();
    await executeSql(
      `INSERT INTO scores (username, score, created_at) VALUES (?, ?, ?);`,
      [username, score, ts]
    );
  };

  getTopScores = async (limit = 20, distinctBest = true) => {
    if (distinctBest) {
      const res = await executeSql(
        `SELECT username, MAX(score) as bestScore
         FROM scores
         GROUP BY username
         ORDER BY bestScore DESC
         LIMIT ?;`,
        [limit]
      );
      const rows = res.rows;
      const out = [];
      for (let i = 0; i < rows.length; i++) out.push(rows.item(i));
      return out;
    } else {
      const res = await executeSql(
        `SELECT username, score, created_at
         FROM scores
         ORDER BY score DESC
         LIMIT ?;`,
        [limit]
      );
      const rows = res.rows;
      const out = [];
      for (let i = 0; i < rows.length; i++) out.push(rows.item(i));
      return out;
    }
  };

  getUserBest = async (username) => {
    const res = await executeSql(
      `SELECT MAX(score) as bestScore FROM scores WHERE username = ?;`,
      [username]
    );
    const rows = res.rows;
    if (rows.length > 0) {
      const val = rows.item(0).bestScore;
      return val != null ? val : 0;
    }
    return 0;
  };

  clearScores = async () => {
    await executeSql(`DELETE FROM scores;`);
  };
} else {
  // ---------- AsyncStorage fallback ----------
  const KEY = 'tapdash_scores_v1';

  async function readAll() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.log('AsyncStorage readAll error', e);
      return [];
    }
  }

  async function writeAll(list) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      console.log('AsyncStorage writeAll error', e);
    }
  }

  initDB = async () => {
    const exists = await AsyncStorage.getItem(KEY);
    if (!exists) await AsyncStorage.setItem(KEY, JSON.stringify([]));
  };

  addScore = async (username, score) => {
    const list = await readAll();
    list.push({ id: Date.now(), username, score, created_at: Date.now() });
    await writeAll(list);
  };

  getTopScores = async (limit = 20, distinctBest = true) => {
    const list = await readAll();
    if (distinctBest) {
      const map = {};
      for (const r of list) {
        const u = r.username || 'anon';
        if (!map[u] || r.score > map[u]) map[u] = r.score;
      }
      const arr = Object.keys(map).map(username => ({ username, bestScore: map[username] }));
      arr.sort((a, b) => b.bestScore - a.bestScore);
      return arr.slice(0, limit);
    } else {
      const sorted = [...list].sort((a, b) => b.score - a.score);
      return sorted.slice(0, limit);
    }
  };

  getUserBest = async (username) => {
    const list = await readAll();
    const userScores = list.filter(r => r.username === username);
    if (userScores.length === 0) return 0;
    return Math.max(...userScores.map(r => r.score));
  };

  clearScores = async () => {
    await AsyncStorage.removeItem(KEY);
  };
}

// Export everything at top-level (static)
const dbBackend = USE_SQLITE ? 'sqlite' : 'asyncstorage';

export {
  initDB,
  addScore,
  getTopScores,
  getUserBest,
  clearScores,
  dbBackend,
};
