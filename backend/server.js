const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Criar diretórios necessários
const uploadsDir = path.join(__dirname, 'uploads');
const romsDir = path.join(uploadsDir, 'roms');
const imagesDir = path.join(uploadsDir, 'images');
const avatarsDir = path.join(uploadsDir, 'avatars');
const screenshotsDir = path.join(uploadsDir, 'screenshots');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(romsDir);
fs.ensureDirSync(imagesDir);
fs.ensureDirSync(avatarsDir);
fs.ensureDirSync(screenshotsDir);

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'rom') {
      cb(null, romsDir);
    } else if (file.fieldname === 'image') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else if (file.fieldname === 'screenshots') {
      cb(null, screenshotsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'rom') {
      // Aceitar apenas arquivos de ROM do SNES
      const allowedExts = ['.smc', '.sfc', '.fig'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos .smc, .sfc e .fig são permitidos para ROMs'));
      }
    } else if (file.fieldname === 'image') {
      // Aceitar apenas imagens
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos'));
      }
    } else if (file.fieldname === 'avatar') {
      // Aceitar apenas imagens para avatar
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos para avatar'));
      }
    } else if (file.fieldname === 'screenshots') {
      // Aceitar apenas imagens para screenshots
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos para screenshots'));
      }
    }
  }
});

// Inicializar banco de dados
const db = new Database();

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Token de sessão necessário' });
  }

  try {
    const session = await db.getSessionByToken(sessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }
    
    req.user = session;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};

// Rotas da API

// ===== ROTAS DE USUÁRIOS =====

// GET /api/users - Listar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Buscar usuário por ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Criar novo usuário
app.post('/api/users', upload.single('avatar'), async (req, res) => {
  try {
    const { username, display_name, color_theme } = req.body;
    
    if (!username || !display_name) {
      return res.status(400).json({ error: 'Username e nome de exibição são obrigatórios' });
    }

    // Verificar se username já existe
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username já existe' });
    }

    const userData = {
      username,
      display_name,
      avatar_path: req.file ? req.file.filename : null,
      color_theme: color_theme || 'ember'
    };

    const user = await db.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Atualizar usuário
app.put('/api/users/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { username, display_name, color_theme } = req.body;
    const userId = req.params.id;

    // Buscar usuário atual
    const currentUser = await db.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se username já existe (exceto para o próprio usuário)
    if (username && username !== currentUser.username) {
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username já existe' });
      }
    }

    const userData = {
      username: username || currentUser.username,
      display_name: display_name || currentUser.display_name,
      avatar_path: req.file ? req.file.filename : currentUser.avatar_path,
      color_theme: color_theme || currentUser.color_theme
    };

    const user = await db.updateUser(userId, userData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Deletar usuário
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar avatar se existir
    if (user.avatar_path) {
      const avatarPath = path.join(avatarsDir, user.avatar_path);
      if (await fs.pathExists(avatarPath)) {
        await fs.remove(avatarPath);
      }
    }

    await db.deleteUser(req.params.id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:id/login - Fazer login do usuário
app.post('/api/users/:id/login', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar último login
    await db.updateLastLogin(user.id);

    // Criar sessão
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.createSession(user.id, sessionToken, expiresAt);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_path: user.avatar_path,
        color_theme: user.color_theme
      },
      session_token: sessionToken,
      expires_at: expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/logout - Fazer logout
app.post('/api/users/logout', async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (sessionToken) {
      await db.deleteSession(sessionToken);
    }
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me - Obter usuário atual
app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      display_name: req.user.display_name,
      avatar_path: req.user.avatar_path,
      color_theme: req.user.color_theme,
      last_login: req.user.last_login
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ROTAS DE GAMES (globais, sem dependência de usuários) =====

// GET /api/games - Listar todos os games
app.get('/api/games', async (req, res) => {
  try {
    const games = await db.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/games/:id - Buscar game por ID
app.get('/api/games/:id', async (req, res) => {
  try {
    const game = await db.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games - Criar novo game
app.post('/api/games', upload.fields([
  { name: 'rom', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'screenshots', maxCount: 3 }
]), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !req.files.rom) {
      return res.status(400).json({ error: 'Nome e ROM são obrigatórios' });
    }

    const gameData = {
      name,
      description: description || '',
      rom_path: req.files.rom[0].filename,
      image_path: req.files.image ? req.files.image[0].filename : null
    };

    const game = await db.createGame(gameData);

    // Adicionar screenshots se existirem
    if (req.files.screenshots) {
      for (const screenshot of req.files.screenshots) {
        await db.addScreenshot(game.id, screenshot.filename);
      }
    }

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/games/:id - Atualizar game
app.put('/api/games/:id', upload.fields([
  { name: 'rom', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description } = req.body;
    const gameId = req.params.id;

    // Buscar game atual
    const currentGame = await db.getGameById(gameId);
    if (!currentGame) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }

    const gameData = {
      name: name || currentGame.name,
      description: description !== undefined ? description : currentGame.description,
      rom_path: req.files.rom ? req.files.rom[0].filename : currentGame.rom_path,
      image_path: req.files.image ? req.files.image[0].filename : currentGame.image_path
    };

    const game = await db.updateGame(gameId, gameData);
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/games/:id - Deletar game
app.delete('/api/games/:id', async (req, res) => {
  try {
    const game = await db.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }

    // Deletar arquivos físicos
    if (game.rom_path) {
      const romPath = path.join(romsDir, game.rom_path);
      if (await fs.pathExists(romPath)) {
        await fs.remove(romPath);
      }
    }

    if (game.image_path) {
      const imagePath = path.join(imagesDir, game.image_path);
      if (await fs.pathExists(imagePath)) {
        await fs.remove(imagePath);
      }
    }

    await db.deleteGame(req.params.id);
    res.json({ message: 'Game deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games/:id/play - Incrementar contador de jogadas
app.post('/api/games/:id/play', async (req, res) => {
  try {
    const game = await db.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    
    await db.updatePlayCount(req.params.id);
    res.json({ message: 'Contador atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games/:id/favorite - Alternar favorito
app.post('/api/games/:id/favorite', async (req, res) => {
  try {
    const game = await db.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    
    await db.toggleFavorite(req.params.id);
    res.json({ message: 'Favorito atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/games/:id/screenshots - Buscar screenshots de um jogo
app.get('/api/games/:id/screenshots', async (req, res) => {
  try {
    const screenshots = await db.getScreenshotsByGameId(req.params.id);
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir arquivos estáticos
app.use('/uploads/roms', express.static(romsDir));
app.use('/uploads/images', express.static(imagesDir));
app.use('/uploads/avatars', express.static(avatarsDir));
app.use('/uploads/screenshots', express.static(screenshotsDir));

// Rota para servir ROMs para o EmulatorJS
app.get('/api/roms/:filename', (req, res) => {
  const romPath = path.join(romsDir, req.params.filename);
  res.sendFile(romPath);
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 50MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📁 ROMs: ${romsDir}`);
  console.log(`🖼️  Imagens: ${imagesDir}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Fechando servidor...');
  db.close();
  process.exit(0);
});
