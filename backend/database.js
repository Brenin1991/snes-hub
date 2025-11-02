const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Tabela de usuários
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          avatar_path TEXT,
          color_theme TEXT DEFAULT 'ember',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          is_active BOOLEAN DEFAULT 1
        )
      `);

      // Tabela de games (global, sem dependência de usuários)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS games (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          rom_path TEXT NOT NULL,
          image_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          play_count INTEGER DEFAULT 0,
          last_played DATETIME,
          is_favorite BOOLEAN DEFAULT 0
        )
      `);

      // Tabela de screenshots dos jogos
      this.db.run(`
        CREATE TABLE IF NOT EXISTS game_screenshots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
        )
      `);

      // Tabela de configurações por usuário
      this.db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          key TEXT NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(user_id, key)
        )
      `);

      // Tabela de configurações globais
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de sessões ativas
      this.db.run(`
        CREATE TABLE IF NOT EXISTS active_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          session_token TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);
    });
  }

  // Users CRUD
  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM users WHERE is_active = 1 ORDER BY display_name", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE id = ? AND is_active = 1", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE username = ? AND is_active = 1", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createUser(user) {
    return new Promise((resolve, reject) => {
      const { username, display_name, avatar_path, color_theme } = user;
      this.db.run(
        "INSERT INTO users (username, display_name, avatar_path, color_theme) VALUES (?, ?, ?, ?)",
        [username, display_name, avatar_path || null, color_theme || 'ember'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...user });
        }
      );
    });
  }

  updateUser(id, user) {
    return new Promise((resolve, reject) => {
      const { username, display_name, avatar_path, color_theme } = user;
      this.db.run(
        "UPDATE users SET username = ?, display_name = ?, avatar_path = ?, color_theme = ? WHERE id = ?",
        [username, display_name, avatar_path, color_theme, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...user });
        }
      );
    });
  }

  deleteUser(id) {
    return new Promise((resolve, reject) => {
      this.db.run("UPDATE users SET is_active = 0 WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  updateLastLogin(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes });
        }
      );
    });
  }

  // Sessions
  createSession(userId, sessionToken, expiresAt) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO active_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)",
        [userId, sessionToken, expiresAt],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, user_id: userId, session_token: sessionToken });
        }
      );
    });
  }

  getSessionByToken(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT s.*, u.* FROM active_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1",
        [sessionToken],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  deleteSession(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM active_sessions WHERE session_token = ?", [sessionToken], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  deleteExpiredSessions() {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM active_sessions WHERE expires_at <= CURRENT_TIMESTAMP", function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  // User Settings
  getUserSetting(userId, key) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT value FROM user_settings WHERE user_id = ? AND key = ?", [userId, key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  }

  setUserSetting(userId, key, value) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT OR REPLACE INTO user_settings (user_id, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        [userId, key, value],
        function(err) {
          if (err) reject(err);
          else resolve({ user_id: userId, key, value });
        }
      );
    });
  }

  // Games CRUD (atualizado para incluir user_id)
  getAllGames() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM games ORDER BY name";
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getGameById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM games WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createGame(game) {
    return new Promise((resolve, reject) => {
      const { name, description, rom_path, image_path } = game;
      this.db.run(
        "INSERT INTO games (name, description, rom_path, image_path) VALUES (?, ?, ?, ?)",
        [name, description, rom_path, image_path],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...game });
        }
      );
    });
  }

  updateGame(id, game) {
    return new Promise((resolve, reject) => {
      const { name, description, rom_path, image_path } = game;
      this.db.run(
        "UPDATE games SET name = ?, description = ?, rom_path = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, description, rom_path, image_path, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...game });
        }
      );
    });
  }

  deleteGame(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM games WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  updatePlayCount(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE games SET play_count = play_count + 1, last_played = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes });
        }
      );
    });
  }

  toggleFavorite(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE games SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes });
        }
      );
    });
  }

  // Screenshots CRUD
  addScreenshot(gameId, imagePath) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO game_screenshots (game_id, image_path) VALUES (?, ?)",
        [gameId, imagePath],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, game_id: gameId, image_path: imagePath });
        }
      );
    });
  }

  getScreenshotsByGameId(gameId) {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM game_screenshots WHERE game_id = ? ORDER BY created_at", [gameId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  deleteScreenshot(screenshotId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM game_screenshots WHERE id = ?", [screenshotId], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  deleteScreenshotsByGameId(gameId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM game_screenshots WHERE game_id = ?", [gameId], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  // Settings
  getSetting(key) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  }

  setSetting(key, value) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        [key, value],
        function(err) {
          if (err) reject(err);
          else resolve({ key, value });
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
